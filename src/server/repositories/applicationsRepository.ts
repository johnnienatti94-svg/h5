import 'server-only';
import crypto from 'crypto';
import type {
  ApplicationDraft,
  ApplicationStatus,
  PublicApplication,
  SubmitApplicationInput,
  ActorKind,
} from '@/features/applications/types';
import type {
  StaffUser,
  StaffInternalNote,
  StaffApplicationFilter,
  StaffApplicationListResult,
} from '@/features/staff/types';

import { canTransition } from '@/features/applications/types';
import { DEV_PRODUCTS } from '@/server/fixtures/devCatalog';
import { DEV_BRANCH_FIXTURES } from '@/server/fixtures/devBranches';
import { formatBaht } from '@/features/catalog/types';

// In-memory persistent stores for development and fallback
const draftsStore = new Map<string, ApplicationDraft>();
const applicationsStore = new Map<string, PublicApplication>();
const idempotencyStore = new Map<string, string>(); // `${customerId}:${key}` -> applicationId
const internalNotesStore = new Map<string, StaffInternalNote[]>(); // applicationId -> StaffInternalNote[]


// Seed an initial demo application for customer testing
function seedInitialApplications() {
  if (applicationsStore.size > 0) return;

  const sampleProduct = DEV_PRODUCTS[0]; // iPhone 16 Pro
  const sampleVariant = sampleProduct.variants[0]; // 128GB Desert Titanium
  const sampleOffer = sampleProduct.offers[0]; // 0% 10 months
  const sampleBranch = DEV_BRANCH_FIXTURES[0]; // Central World

  const demoAppId = 'app-demo-cust-001';
  const demoCustId = 'cust-demo-001';

  const demoApplication: PublicApplication = {
    id: demoAppId,
    reference: 'APP-202609-1001',
    customerId: demoCustId,
    status: 'UNDER_REVIEW',
    revision: 1,
    contactName: 'สมชาย ใจดี',
    verifiedPhone: '0812345678',
    productSnapshot: {
      id: sampleProduct.id,
      name: sampleProduct.name,
      slug: sampleProduct.slug,
      brand: sampleProduct.brand.name,
      category: sampleProduct.category.name,
      condition: sampleVariant.condition,
      heroImageUrl: sampleProduct.images[0]?.url || '/placeholder.png',
    },
    variantSnapshot: {
      id: sampleVariant.id,
      name: sampleVariant.name,
      sku: sampleVariant.sku,
      storage: sampleVariant.storageLabel || '-',
      color: sampleVariant.colorLabel || '-',
      colorHex: sampleVariant.colorHex || undefined,
      cashPriceMinor: sampleVariant.cashPriceMinor,
      cashPriceFormatted: formatBaht(sampleVariant.cashPriceMinor),
    },
    offerSnapshot: {
      id: sampleOffer.id,
      versionNumber: 1,
      downPaymentMinor: sampleOffer.downPaymentMinor,
      monthlyInstallmentMinor: sampleOffer.installmentAmountMinor,
      tenorMonths: sampleOffer.installmentCount,
      feeMinor: sampleOffer.feesTotalMinor,
      totalPayableMinor: sampleOffer.totalPayableMinor,
      downPaymentFormatted: formatBaht(sampleOffer.downPaymentMinor),
      monthlyInstallmentFormatted: formatBaht(sampleOffer.installmentAmountMinor),
      totalPayableFormatted: formatBaht(sampleOffer.totalPayableMinor),
    },
    branchSnapshot: {
      id: sampleBranch.id,
      slug: sampleBranch.slug,
      name: sampleBranch.name,
      fullAddress: sampleBranch.fullAddress,
      displayPhone: sampleBranch.displayPhone,
      googleMapsUrl: sampleBranch.googleMapsUrl,
    },
    termsSnapshot: {
      privacyPolicyVersion: '2026-09-01',
      termsVersion: '2026-09-01',
      acceptedAt: '2026-09-24T08:00:00Z',
      marketingAccepted: true,
    },
    customerNote: 'สะดวกรับเครื่องช่วงบ่ายครับ',
    cancellationReason: null,
    appointment: null,
    events: [
      {
        id: 'evt-1',
        applicationId: demoAppId,
        actorKind: 'CUSTOMER',
        eventType: 'APPLICATION_SUBMITTED',
        fromStatus: null,
        toStatus: 'SUBMITTED',
        customerVisible: true,
        message: 'ส่งคำขอสมัครผ่อนชำระเรียบร้อยแล้ว',
        reason: null,
        createdAt: '2026-09-24T08:00:00Z',
      },
      {
        id: 'evt-2',
        applicationId: demoAppId,
        actorKind: 'STAFF',
        eventType: 'STATUS_CHANGED',
        fromStatus: 'SUBMITTED',
        toStatus: 'UNDER_REVIEW',
        customerVisible: true,
        message: 'เจ้าหน้าที่สาขาเซ็นทรัลเวิลด์เริ่มตรวจสอบเอกสารการสมัคร',
        reason: null,
        createdAt: '2026-09-24T08:30:00Z',
      },
    ],
    submittedAt: '2026-09-24T08:00:00Z',
    cancelledAt: null,
    createdAt: '2026-09-24T08:00:00Z',
    updatedAt: '2026-09-24T08:30:00Z',
  };

  applicationsStore.set(demoAppId, demoApplication);
}

seedInitialApplications();

/**
 * Get active application draft for a customer.
 */
export async function getCustomerDraft(customerId: string): Promise<ApplicationDraft | null> {
  return draftsStore.get(customerId) || null;
}

/**
 * Save / update application draft for a customer.
 */
export async function saveCustomerDraft(
  customerId: string,
  partial: Partial<ApplicationDraft>
): Promise<ApplicationDraft> {
  const existing = draftsStore.get(customerId) || {
    productId: '',
    variantId: '',
    offerVersionId: '',
    contactName: '',
    verifiedPhone: '',
    selectedBranchId: '',
    step: 1,
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false,
    lastSavedAt: new Date().toISOString(),
  };

  const updated: ApplicationDraft = {
    ...existing,
    ...partial,
    lastSavedAt: new Date().toISOString(),
  };

  draftsStore.set(customerId, updated);
  return updated;
}

/**
 * Clear application draft for a customer.
 */
export async function clearCustomerDraft(customerId: string): Promise<void> {
  draftsStore.delete(customerId);
}

/**
 * Submit an application idempotently.
 */
export async function submitApplication(
  customerId: string,
  input: SubmitApplicationInput
): Promise<{
  success: boolean;
  application?: PublicApplication;
  error?: string;
  code?: string;
}> {
  // 1. Idempotency Check
  if (input.idempotencyKey) {
    const cacheKey = `${customerId}:${input.idempotencyKey}`;
    const existingId = idempotencyStore.get(cacheKey);
    if (existingId) {
      const existingApp = applicationsStore.get(existingId);
      if (existingApp) {
        return { success: true, application: existingApp };
      }
    }
  }

  // 2. Resolve Product & Variant
  let matchedProduct = DEV_PRODUCTS.find((p) => p.id === input.productId || p.slug === input.productId);
  if (!matchedProduct) {
    matchedProduct = DEV_PRODUCTS.find((p) => p.variants.some((v) => v.id === input.variantId));
  }
  if (!matchedProduct) {
    return { success: false, code: 'INVALID_PRODUCT', error: 'ไม่พบข้อมูลสินค้าที่ระบุ' };
  }

  const matchedVariant = matchedProduct.variants.find((v) => v.id === input.variantId) || matchedProduct.variants[0];
  if (!matchedVariant) {
    return { success: false, code: 'INVALID_VARIANT', error: 'ไม่พบรุ่นสินค้าที่ระบุ' };
  }

  // 3. Resolve Offer Version
  const matchedOffer =
    matchedProduct.offers.find((o) => o.id === input.offerVersionId) ||
    matchedProduct.offers[0];
  if (!matchedOffer) {
    return { success: false, code: 'INVALID_OFFER', error: 'ไม่พบแผนผ่อนชำระที่ระบุ' };
  }

  // 4. Resolve Branch
  const matchedBranch =
    DEV_BRANCH_FIXTURES.find((b) => b.id === input.selectedBranchId || b.slug === input.selectedBranchId) ||
    DEV_BRANCH_FIXTURES[0];
  if (!matchedBranch) {
    return { success: false, code: 'INVALID_BRANCH', error: 'ไม่พบสาขาที่เลือกรับสินค้า' };
  }

  // 5. Validate Required Terms
  if (!input.privacyAccepted || !input.termsAccepted) {
    return {
      success: false,
      code: 'CONSENT_REQUIRED',
      error: 'กรุณายินยอมตามข้อกำหนดและนโยบายความเป็นส่วนตัวก่อนส่งใบสมัคร',
    };
  }

  // 6. Generate Reference & Application Record
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = crypto.randomInt(1000, 9999).toString();
  const reference = `APP-${dateStr}-${randomSuffix}`;
  const applicationId = `app-${crypto.randomUUID()}`;

  const application: PublicApplication = {
    id: applicationId,
    reference,
    customerId,
    status: 'SUBMITTED',
    revision: 1,
    contactName: input.contactName.trim(),
    verifiedPhone: input.verifiedPhone.trim(),
    productSnapshot: {
      id: matchedProduct.id,
      name: matchedProduct.name,
      slug: matchedProduct.slug,
      brand: matchedProduct.brand.name,
      category: matchedProduct.category.name,
      condition: matchedVariant.condition,
      heroImageUrl: matchedProduct.images[0]?.url || '/placeholder.png',
    },
    variantSnapshot: {
      id: matchedVariant.id,
      name: matchedVariant.name,
      sku: matchedVariant.sku,
      storage: matchedVariant.storageLabel || '-',
      color: matchedVariant.colorLabel || '-',
      colorHex: matchedVariant.colorHex || undefined,
      cashPriceMinor: matchedVariant.cashPriceMinor,
      cashPriceFormatted: formatBaht(matchedVariant.cashPriceMinor),
    },
    offerSnapshot: {
      id: matchedOffer.id,
      versionNumber: 1,
      downPaymentMinor: matchedOffer.downPaymentMinor,
      monthlyInstallmentMinor: matchedOffer.installmentAmountMinor,
      tenorMonths: matchedOffer.installmentCount,
      feeMinor: matchedOffer.feesTotalMinor,
      totalPayableMinor: matchedOffer.totalPayableMinor,
      downPaymentFormatted: formatBaht(matchedOffer.downPaymentMinor),
      monthlyInstallmentFormatted: formatBaht(matchedOffer.installmentAmountMinor),
      totalPayableFormatted: formatBaht(matchedOffer.totalPayableMinor),
    },
    branchSnapshot: {
      id: matchedBranch.id,
      slug: matchedBranch.slug,
      name: matchedBranch.name,
      fullAddress: matchedBranch.fullAddress,
      displayPhone: matchedBranch.displayPhone,
      googleMapsUrl: matchedBranch.googleMapsUrl,
    },
    termsSnapshot: {
      privacyPolicyVersion: input.privacyPolicyVersion || '2026-09-01',
      termsVersion: '2026-09-01',
      acceptedAt: now.toISOString(),
      marketingAccepted: Boolean(input.marketingAccepted),
    },
    customerNote: input.customerNote?.trim() || null,
    cancellationReason: null,
    appointment: null,
    events: [
      {
        id: `evt-${crypto.randomUUID().slice(0, 8)}`,
        applicationId,
        actorKind: 'CUSTOMER',
        eventType: 'APPLICATION_SUBMITTED',
        fromStatus: null,
        toStatus: 'SUBMITTED',
        customerVisible: true,
        message: 'ส่งคำขอสมัครผ่อนชำระเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบสิทธิ์',
        reason: null,
        createdAt: now.toISOString(),
      },
    ],
    submittedAt: now.toISOString(),
    cancelledAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // Persist application & idempotency cache
  applicationsStore.set(applicationId, application);
  if (input.idempotencyKey) {
    idempotencyStore.set(`${customerId}:${input.idempotencyKey}`, applicationId);
  }

  // Clear customer's active draft
  draftsStore.delete(customerId);

  return {
    success: true,
    application,
  };
}

/**
 * List all applications belonging to a customer.
 */
export async function getCustomerApplications(customerId: string): Promise<PublicApplication[]> {
  const results: PublicApplication[] = [];
  for (const app of applicationsStore.values()) {
    if (app.customerId === customerId) {
      results.push(app);
    }
  }
  // Sort newest first
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get single application by ID with customer ownership authorization check.
 */
export async function getCustomerApplicationById(
  customerId: string,
  applicationId: string
): Promise<PublicApplication | null> {
  const app = applicationsStore.get(applicationId);
  if (!app) return null;
  // Enforce customer ownership boundary
  if (app.customerId !== customerId) return null;
  return app;
}

/**
 * Cancel an application by the customer (allowed only in SUBMITTED or UNDER_REVIEW).
 */
export async function cancelCustomerApplication(
  customerId: string,
  applicationId: string,
  reason: string
): Promise<{ success: boolean; application?: PublicApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) {
    return { success: false, error: 'ไม่พบใบสมัครที่ต้องการยกเลิก' };
  }

  if (app.customerId !== customerId) {
    return { success: false, error: 'ไม่มีสิทธิ์เข้าถึงใบสมัครนี้' };
  }

  if (!['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)) {
    return {
      success: false,
      error: 'ไม่สามารถยกเลิกได้ เนื่องจากใบสมัครอยู่ในขั้นตอนที่ไม่สามารถยกเลิกด้วยตนเองได้ กรุณาติดต่อสาขา',
    };
  }

  const now = new Date().toISOString();
  app.status = 'CANCELLED';
  app.cancelledAt = now;
  app.cancellationReason = reason.trim() || 'ลูกค้ายกเลิกคำขอผ่านหน้าเว็บไซต์';
  app.updatedAt = now;
  app.revision += 1;

  app.events.push({
    id: `evt-${crypto.randomUUID().slice(0, 8)}`,
    applicationId,
    actorKind: 'CUSTOMER',
    eventType: 'CUSTOMER_CANCELLED',
    fromStatus: 'SUBMITTED',
    toStatus: 'CANCELLED',
    customerVisible: true,
    message: 'ลูกค้ายกเลิกคำขอสมัครผ่อนชำระ',
    reason: app.cancellationReason,
    createdAt: now,
  });

  applicationsStore.set(applicationId, app);

  return { success: true, application: app };
}

/**
 * Update application status with state transition checks and audit event recording.
 */
export async function updateApplicationStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  actor: { userId?: string; kind: ActorKind },
  options?: { note?: string; reason?: string; customerVisible?: boolean }
): Promise<{ success: boolean; application?: PublicApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) {
    return { success: false, error: 'Application not found' };
  }

  if (!canTransition(app.status, toStatus)) {
    return {
      success: false,
      error: `Invalid transition from ${app.status} to ${toStatus}`,
    };
  }

  const now = new Date().toISOString();
  const fromStatus = app.status;
  app.status = toStatus;
  app.updatedAt = now;
  app.revision += 1;

  if (toStatus === 'CANCELLED') {
    app.cancelledAt = now;
    app.cancellationReason = options?.reason || null;
  }

  app.events.push({
    id: `evt-${crypto.randomUUID().slice(0, 8)}`,
    applicationId,
    actorKind: actor.kind,
    actorUserId: actor.userId,
    eventType: 'STATUS_CHANGED',
    fromStatus,
    toStatus,
    customerVisible: options?.customerVisible !== false,
    message: options?.note || `เปลี่ยนสถานะเป็น ${toStatus}`,
    reason: options?.reason || null,
    createdAt: now,
  });

  applicationsStore.set(applicationId, app);

  return { success: true, application: app };
}

/**
 * List applications for staff queue with branch scoping and status filtering.
 */
export async function listStaffApplications(
  staff: StaffUser,
  filter: StaffApplicationFilter = {}
): Promise<StaffApplicationListResult> {
  const isBranchScoped = staff.role === 'BRANCH_MANAGER';
  const effectiveBranchId = isBranchScoped ? staff.branchId : filter.branchId;

  const allApps = Array.from(applicationsStore.values());

  // Calculate status counts within staff's authorized scope
  const statusCounts: Record<string, number> = {
    ALL: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    NEEDS_INFO: 0,
    APPROVED: 0,
    APPOINTMENT_SET: 0,
    COMPLETED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  };

  const filtered = allApps.filter((app) => {
    // 1. Branch Scope Authorization
    if (isBranchScoped) {
      if (
        app.branchSnapshot.id !== effectiveBranchId &&
        app.branchSnapshot.slug !== effectiveBranchId
      ) {
        return false;
      }
    } else if (filter.branchId) {
      if (
        app.branchSnapshot.id !== filter.branchId &&
        app.branchSnapshot.slug !== filter.branchId
      ) {
        return false;
      }
    }

    // Accumulate total status counts within authorized branch scope
    statusCounts.ALL = (statusCounts.ALL || 0) + 1;
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

    // 2. Status Filter
    if (filter.status && filter.status !== 'ALL') {
      if (app.status !== filter.status) return false;
    }

    // 3. Search Query
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      const matchRef = app.reference.toLowerCase().includes(q);
      const matchName = app.contactName.toLowerCase().includes(q);
      const matchPhone = app.verifiedPhone.includes(q);
      if (!matchRef && !matchName && !matchPhone) return false;
    }

    return true;
  });

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = Math.max(1, filter.page || 1);
  const pageSize = Math.max(1, Math.min(100, filter.pageSize || 20));
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    applications: paginated,
    total,
    page,
    pageSize,
    totalPages,
    statusCounts,
  };
}

/**
 * Get application details for staff with branch scoping.
 */
export async function getStaffApplicationById(
  applicationId: string,
  staff: StaffUser
): Promise<{ success: boolean; application?: PublicApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) {
    return { success: false, error: 'ไม่พบใบสมัคร' };
  }

  // Enforce branch scope for Branch Manager
  if (staff.role === 'BRANCH_MANAGER') {
    if (
      app.branchSnapshot.id !== staff.branchId &&
      app.branchSnapshot.slug !== staff.branchId
    ) {
      return { success: false, error: 'ไม่มีสิทธิ์เข้าถึงใบสมัครของสาขาอื่น' };
    }
  }

  return { success: true, application: app };
}

/**
 * Add internal staff note to an application.
 */
export async function addStaffInternalNote(
  applicationId: string,
  staff: StaffUser,
  noteText: string
): Promise<{ success: boolean; note?: StaffInternalNote; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) return { success: false, error: 'ไม่พบใบสมัคร' };

  if (staff.role === 'BRANCH_MANAGER') {
    if (
      app.branchSnapshot.id !== staff.branchId &&
      app.branchSnapshot.slug !== staff.branchId
    ) {
      return { success: false, error: 'ไม่มีสิทธิ์บันทึกโน้ตในสาขาอื่น' };
    }
  }

  const newNote: StaffInternalNote = {
    id: `note-${crypto.randomUUID().slice(0, 8)}`,
    applicationId,
    staffUserId: staff.id,
    staffName: staff.name,
    note: noteText.trim(),
    createdAt: new Date().toISOString(),
  };

  const existingNotes = internalNotesStore.get(applicationId) || [];
  existingNotes.push(newNote);
  internalNotesStore.set(applicationId, existingNotes);

  // Append internal audit event
  app.events.push({
    id: `evt-${crypto.randomUUID().slice(0, 8)}`,
    applicationId,
    actorKind: 'STAFF',
    actorUserId: staff.id,
    eventType: 'STAFF_NOTE_ADDED',
    fromStatus: app.status,
    toStatus: app.status,
    customerVisible: false,
    message: `เจ้าหน้าที่ ${staff.name} บันทึกโน้ตภายใน`,
    reason: null,
    createdAt: new Date().toISOString(),
  });

  return { success: true, note: newNote };
}

/**
 * Get internal staff notes for an application.
 */
export async function getStaffInternalNotes(
  applicationId: string,
  staff: StaffUser
): Promise<StaffInternalNote[]> {
  const app = applicationsStore.get(applicationId);
  if (!app) return [];

  if (staff.role === 'BRANCH_MANAGER') {
    if (
      app.branchSnapshot.id !== staff.branchId &&
      app.branchSnapshot.slug !== staff.branchId
    ) {
      return [];
    }
  }

  return internalNotesStore.get(applicationId) || [];
}

/**
 * Schedule pickup appointment for an approved application.
 */
export async function scheduleStaffAppointment(
  applicationId: string,
  staff: StaffUser,
  startsAt: string,
  note?: string
): Promise<{ success: boolean; application?: PublicApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) return { success: false, error: 'ไม่พบใบสมัคร' };

  if (staff.role === 'BRANCH_MANAGER') {
    if (
      app.branchSnapshot.id !== staff.branchId &&
      app.branchSnapshot.slug !== staff.branchId
    ) {
      return { success: false, error: 'ไม่มีสิทธิ์จัดการนัดหมายสาขาอื่น' };
    }
  }

  if (!['APPROVED', 'APPOINTMENT_SET'].includes(app.status)) {
    return { success: false, error: 'สามารถนัดหมายได้เฉพาะใบสมัครที่ได้รับอนุมัติแล้วเท่านั้น' };
  }

  const now = new Date().toISOString();
  app.appointment = {
    id: app.appointment?.id || `apt-${crypto.randomUUID().slice(0, 8)}`,
    branchId: app.branchSnapshot.id,
    branchName: app.branchSnapshot.name,
    startsAt,
    status: 'scheduled',
    note: note?.trim() || null,
  };

  app.status = 'APPOINTMENT_SET';
  app.updatedAt = now;
  app.revision += 1;

  app.events.push({
    id: `evt-${crypto.randomUUID().slice(0, 8)}`,
    applicationId,
    actorKind: 'STAFF',
    actorUserId: staff.id,
    eventType: 'APPOINTMENT_SCHEDULED',
    fromStatus: 'APPROVED',
    toStatus: 'APPOINTMENT_SET',
    customerVisible: true,
    message: `เจ้าหน้าที่นัดหมายรับเครื่อง ณ วันที่ ${new Date(startsAt).toLocaleString('th-TH')}`,
    reason: note || null,
    createdAt: now,
  });

  applicationsStore.set(applicationId, app);

  return { success: true, application: app };
}

/**
 * Update application status by staff with branch authorization checks.
 */
export async function staffUpdateStatus(
  applicationId: string,
  staff: StaffUser,
  toStatus: ApplicationStatus,
  options?: { reason?: string; customerMessage?: string }
): Promise<{ success: boolean; application?: PublicApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) return { success: false, error: 'ไม่พบใบสมัคร' };

  // Branch Scope Check
  if (staff.role === 'BRANCH_MANAGER') {
    if (
      app.branchSnapshot.id !== staff.branchId &&
      app.branchSnapshot.slug !== staff.branchId
    ) {
      return { success: false, error: 'ไม่มีสิทธิ์เปลี่ยนแปลงสถานะใบสมัครของสาขาอื่น' };
    }
  }

  if (!canTransition(app.status, toStatus)) {
    return {
      success: false,
      error: `ไม่สามารถเปลี่ยนสถานะจาก ${app.status} ไปเป็น ${toStatus} ได้`,
    };
  }

  const now = new Date().toISOString();
  const fromStatus = app.status;
  app.status = toStatus;
  app.updatedAt = now;
  app.revision += 1;

  if (toStatus === 'CANCELLED') {
    app.cancelledAt = now;
    app.cancellationReason = options?.reason || null;
  }

  app.events.push({
    id: `evt-${crypto.randomUUID().slice(0, 8)}`,
    applicationId,
    actorKind: 'STAFF',
    actorUserId: staff.id,
    eventType: 'STATUS_CHANGED',
    fromStatus,
    toStatus,
    customerVisible: true,
    message: options?.customerMessage || `เจ้าหน้าที่เปลี่ยนสถานะเป็น ${toStatus}`,
    reason: options?.reason || null,
    createdAt: now,
  });

  applicationsStore.set(applicationId, app);

  return { success: true, application: app };
}

/**
 * Look up customer profile and history by verified phone.
 */
export async function lookupCustomerByPhone(
  phoneInput: string,
  _staff: StaffUser
): Promise<{
  success: boolean;
  customer?: { phone: string; name?: string; applications: PublicApplication[] };
  error?: string;
}> {
  const q = phoneInput.replace(/[-\s]/g, '').trim();
  if (!q) return { success: false, error: 'กรุณาระบุหมายเลขโทรศัพท์' };

  const matchedApps: PublicApplication[] = [];
  for (const app of applicationsStore.values()) {
    if (app.verifiedPhone.replace(/[-\s]/g, '').includes(q)) {
      matchedApps.push(app);
    }
  }

  if (matchedApps.length === 0) {
    return { success: false, error: 'ไม่พบข้อมูลลูกค้าสำหรับเบอร์โทรศัพท์นี้' };
  }

  matchedApps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    success: true,
    customer: {
      phone: matchedApps[0].verifiedPhone,
      name: matchedApps[0].contactName,
      applications: matchedApps,
    },
  };
}

