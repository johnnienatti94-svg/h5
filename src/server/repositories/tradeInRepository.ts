import 'server-only';
import crypto from 'crypto';
import type {
  TradeInCategory,
  TradeInBrand,
  TradeInModel,
  TradeInStorageOption,
  TradeInColorOption,
  TradeInMarketVariantOption,
  TradeInDeviceConfiguration,
  AssessmentTopic,
  TradeInApplication,
  TradeInApplicationStatus,
  TradeInDeviceSelection,
  CustomerConditionAnswers,
  ValuationQuoteSnapshot,
  TradeInFinalOfferSnapshot,
  TradeInInspectionDelta,
  TradeInOfferAdjustment,
  TradeInHandoverChecklist,
  TradeInPaymentRecord,
  TradeInAppointmentBooking,
  TradeInEvidenceFile,
} from '@/features/tradein/types';
import { canTransitionTradeIn } from '@/features/tradein/types';
import {
  DEV_TRADEIN_CATEGORIES,
  DEV_TRADEIN_BRANDS,
  DEV_TRADEIN_MODELS,
  DEV_TRADEIN_STORAGES,
  DEV_TRADEIN_COLORS,
  DEV_TRADEIN_MARKET_VARIANTS,
  DEV_TRADEIN_CONFIGURATIONS,
  DEV_TRADEIN_TOPICS,
  DEV_BRANCH_CAPACITIES,
  BranchSlotCapacity,
} from '@/server/fixtures/devTradeInCatalog';
import { calculateTradeInValuation } from '@/features/tradein/valuationEngine';
import { DEV_BRANCH_FIXTURES } from '@/server/fixtures/devBranches';

// ---------------------------------------------------------------------------
// In-Memory Authority Stores (with Supabase sync readiness)
// ---------------------------------------------------------------------------
const categoriesStore = new Map<string, TradeInCategory>(DEV_TRADEIN_CATEGORIES.map((c) => [c.id, { ...c }]));
const brandsStore = new Map<string, TradeInBrand>(DEV_TRADEIN_BRANDS.map((b) => [b.id, { ...b }]));
const modelsStore = new Map<string, TradeInModel>(DEV_TRADEIN_MODELS.map((m) => [m.id, { ...m }]));
const storagesStore = new Map<string, TradeInStorageOption>(DEV_TRADEIN_STORAGES.map((s) => [s.id, { ...s }]));
const colorsStore = new Map<string, TradeInColorOption>(DEV_TRADEIN_COLORS.map((c) => [c.id, { ...c }]));
const marketVariantsStore = new Map<string, TradeInMarketVariantOption>(DEV_TRADEIN_MARKET_VARIANTS.map((m) => [m.id, { ...m }]));
const configurationsStore = new Map<string, TradeInDeviceConfiguration>(DEV_TRADEIN_CONFIGURATIONS.map((c) => [c.id, { ...c }]));
const topicsStore = new Map<string, AssessmentTopic>(DEV_TRADEIN_TOPICS.map((t) => [t.id, { ...t }]));
const branchCapacitiesStore = new Map<string, BranchSlotCapacity>(DEV_BRANCH_CAPACITIES.map((b) => [b.branchId, { ...b }]));

// Application & draft persistence
const customerDraftsStore = new Map<string, any>(); // customerId -> Draft Object
const applicationsStore = new Map<string, TradeInApplication>(); // applicationId -> TradeInApplication
const idempotencyStore = new Map<string, string>(); // `${customerId}:${key}` -> applicationId

// System payout policy
let currentPayoutPercentage = 75; // 75%
let currentRoundingRule: 'ROUND_DOWN_100' | 'ROUND_NEAREST_100' | 'EXACT' = 'ROUND_DOWN_100';

// ---------------------------------------------------------------------------
// Catalog & Option Queries
// ---------------------------------------------------------------------------
export async function getTradeInCatalog() {
  return {
    categories: Array.from(categoriesStore.values()).sort((a, b) => a.displayOrder - b.displayOrder),
    brands: Array.from(brandsStore.values()).sort((a, b) => a.displayOrder - b.displayOrder),
    models: Array.from(modelsStore.values()).sort((a, b) => a.displayOrder - b.displayOrder),
    storages: Array.from(storagesStore.values()).sort((a, b) => a.displayOrder - b.displayOrder),
    colors: Array.from(colorsStore.values()).sort((a, b) => a.displayOrder - b.displayOrder),
    marketVariants: Array.from(marketVariantsStore.values()).sort((a, b) => a.displayOrder - b.displayOrder),
    configurations: Array.from(configurationsStore.values()).filter((c) => c.isActive),
    payoutPercentage: currentPayoutPercentage,
    roundingRule: currentRoundingRule,
  };
}

export async function getAssessmentTopics(modelId?: string) {
  const allTopics = Array.from(topicsStore.values());
  if (!modelId) return allTopics;

  // Filter topics or options if model-specific rules apply
  return allTopics.filter((t) => {
    if (t.applicableModelIds && t.applicableModelIds.length > 0) {
      return t.applicableModelIds.includes(modelId);
    }
    return true;
  });
}

export async function findConfiguration(selection: {
  modelId: string;
  storageOptionId: string;
  colorOptionId: string;
  marketVariantOptionId: string;
}): Promise<TradeInDeviceConfiguration | null> {
  for (const cfg of configurationsStore.values()) {
    if (
      cfg.modelId === selection.modelId &&
      cfg.storageOptionId === selection.storageOptionId &&
      cfg.colorOptionId === selection.colorOptionId &&
      cfg.marketVariantOptionId === selection.marketVariantOptionId
    ) {
      return cfg;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Customer Draft Management
// ---------------------------------------------------------------------------
export async function getTradeInDraft(customerId: string) {
  return customerDraftsStore.get(customerId) || null;
}

export async function saveTradeInDraft(customerId: string, draft: any) {
  const existing = customerDraftsStore.get(customerId) || {};
  const updated = {
    ...existing,
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  customerDraftsStore.set(customerId, updated);
  return updated;
}

export async function clearTradeInDraft(customerId: string) {
  customerDraftsStore.delete(customerId);
}

// ---------------------------------------------------------------------------
// Calculate Quote Server-Side
// ---------------------------------------------------------------------------
export async function calculateQuote(
  selection: TradeInDeviceSelection,
  answers: CustomerConditionAnswers
): Promise<ValuationQuoteSnapshot> {
  const config = await findConfiguration(selection);
  const topics = await getAssessmentTopics(selection.modelId);

  return calculateTradeInValuation(selection, config, answers, {
    payoutPercentage: currentPayoutPercentage,
    roundingRule: currentRoundingRule,
    topics,
  });
}

// ---------------------------------------------------------------------------
// Application Submission (Idempotent)
// ---------------------------------------------------------------------------
export interface SubmitTradeInApplicationInput {
  idempotencyKey?: string;
  contactName: string;
  verifiedPhone: string;
  nationalIdMasked?: string;
  address?: string;
  deviceSelection: TradeInDeviceSelection;
  declaredAnswers: CustomerConditionAnswers;
  quoteSnapshot: ValuationQuoteSnapshot;
  imeiOrSerial?: string;
  evidenceFiles?: TradeInEvidenceFile[];
  branchId: string;
  appointmentStartsAt: string;
  customerNote?: string;
}

export async function submitTradeInApplication(
  customerId: string,
  input: SubmitTradeInApplicationInput
): Promise<{ success: boolean; application?: TradeInApplication; error?: string }> {
  // 1. Idempotency Check
  if (input.idempotencyKey) {
    const key = `${customerId}:${input.idempotencyKey}`;
    const existingId = idempotencyStore.get(key);
    if (existingId) {
      const existingApp = applicationsStore.get(existingId);
      if (existingApp) {
        return { success: true, application: existingApp };
      }
    }
  }

  // 2. Validate Branch
  const branch = DEV_BRANCH_FIXTURES.find((b) => b.id === input.branchId) || DEV_BRANCH_FIXTURES[0];
  const branchName = branch.name;

  // 3. Resolve Display Labels for 6 Fields
  const category = categoriesStore.get(input.deviceSelection.categoryId);
  const brand = brandsStore.get(input.deviceSelection.brandId);
  const model = modelsStore.get(input.deviceSelection.modelId);
  const storage = storagesStore.get(input.deviceSelection.storageOptionId);
  const color = colorsStore.get(input.deviceSelection.colorOptionId);
  const market = marketVariantsStore.get(input.deviceSelection.marketVariantOptionId);

  const deviceDisplaySummary = {
    categoryName: category?.name || 'สมาร์ตโฟน',
    brandName: brand?.name || 'แบรนด์',
    modelName: model?.name || 'รุ่นอุปกรณ์',
    storageLabel: storage?.label || '-',
    colorLabel: color?.label || '-',
    marketVariantLabel: market?.label || 'ศูนย์ไทย (TH)',
    imageUrl: model?.imageUrl || '/placeholder.png',
    condition: 'USED' as const, // Always USED
  };

  // 4. Re-calculate server quote to prevent any client tampering
  const verifiedQuote = await calculateQuote(input.deviceSelection, input.declaredAnswers);

  const appId = `trd-app-${crypto.randomBytes(6).toString('hex')}`;
  const reference = `TRD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const initialStatus: TradeInApplicationStatus = verifiedQuote.isManualAssessmentRequired
    ? 'MANUAL_ASSESSMENT_REQUIRED'
    : 'SUBMITTED';

  const appointment: TradeInAppointmentBooking = {
    branchId: branch.id,
    branchName,
    startsAt: input.appointmentStartsAt,
    status: 'SCHEDULED',
  };

  const initialEvent = {
    id: `evt-${crypto.randomBytes(4).toString('hex')}`,
    applicationId: appId,
    actorKind: 'CUSTOMER' as const,
    eventType: 'APPLICATION_SUBMITTED',
    fromStatus: null,
    toStatus: initialStatus,
    customerVisible: true,
    message: verifiedQuote.isManualAssessmentRequired
      ? 'ส่งคำขอแล้ว อยู่ในขั้นตอนรอตรวจสอบประเมินพิเศษ'
      : `ส่งคำขอสำเร็จ นัดหมายนำเครื่องมาตรวจที่สาขา ${branchName}`,
    createdAt: new Date().toISOString(),
  };

  const application: TradeInApplication = {
    id: appId,
    reference,
    customerId,
    status: initialStatus,
    revision: 1,
    contactName: input.contactName,
    verifiedPhone: input.verifiedPhone,
    nationalIdMasked: input.nationalIdMasked,
    address: input.address,
    deviceSelection: { ...input.deviceSelection, condition: 'USED' },
    deviceDisplaySummary,
    declaredAnswers: input.declaredAnswers,
    quoteSnapshot: verifiedQuote,
    evidenceFiles: input.evidenceFiles || [],
    imeiOrSerial: input.imeiOrSerial,
    appointment,
    events: [initialEvent],
    customerNote: input.customerNote,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  applicationsStore.set(appId, application);

  if (input.idempotencyKey) {
    idempotencyStore.set(`${customerId}:${input.idempotencyKey}`, appId);
  }

  // Clear customer draft upon successful submission
  customerDraftsStore.delete(customerId);

  return { success: true, application };
}

// ---------------------------------------------------------------------------
// Customer Queries
// ---------------------------------------------------------------------------
export async function getCustomerTradeInApplications(customerId: string): Promise<TradeInApplication[]> {
  const result: TradeInApplication[] = [];
  for (const app of applicationsStore.values()) {
    if (app.customerId === customerId) {
      result.push(app);
    }
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTradeInApplicationById(
  applicationId: string,
  userOrStaff: { customerId?: string; staffId?: string; staffRole?: string; staffBranchId?: string }
): Promise<TradeInApplication | null> {
  const app = applicationsStore.get(applicationId);
  if (!app) return null;

  // Authorization check
  if (userOrStaff.customerId && app.customerId !== userOrStaff.customerId) {
    return null;
  }

  // Branch check for staff if branch-scoped
  if (userOrStaff.staffRole && userOrStaff.staffRole !== 'ADMIN' && userOrStaff.staffRole !== 'HQ') {
    if (userOrStaff.staffBranchId && app.appointment?.branchId !== userOrStaff.staffBranchId) {
      return null;
    }
  }

  return app;
}

// ---------------------------------------------------------------------------
// Customer Decision (Accept or Decline Final Offer)
// ---------------------------------------------------------------------------
export async function recordCustomerDecision(
  applicationId: string,
  customerId: string,
  decision: 'ACCEPTED' | 'DECLINED',
  expectedRevision: number
): Promise<{ success: boolean; application?: TradeInApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app || app.customerId !== customerId) {
    return { success: false, error: 'ไม่พบรายการใบสมัคร' };
  }

  if (app.status !== 'FINAL_OFFER_READY') {
    return { success: false, error: `ไม่สามารถตอบรับในสถานะปัจจุบัน (${app.status})` };
  }

  if (app.revision !== expectedRevision) {
    return {
      success: false,
      error: 'ข้อเสนอมีการปรับปรุงใหม่ กรุณาตรวจสอบและตอบรับข้อเสนอล่าสุด',
    };
  }

  const nextStatus: TradeInApplicationStatus = decision === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED';

  app.status = nextStatus;
  app.customerDecision = decision;
  app.customerDecisionAt = new Date().toISOString();
  app.acceptedOfferRevision = decision === 'ACCEPTED' ? app.revision : undefined;
  app.updatedAt = new Date().toISOString();

  app.events.push({
    id: `evt-${crypto.randomBytes(4).toString('hex')}`,
    applicationId: app.id,
    actorKind: 'CUSTOMER',
    actorId: customerId,
    eventType: decision === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED',
    fromStatus: 'FINAL_OFFER_READY',
    toStatus: nextStatus,
    customerVisible: true,
    message: decision === 'ACCEPTED' ? 'ลูกค้ายอมรับข้อเสนอราคาซื้อคืน' : 'ลูกค้าปฏิเสธข้อเสนอราคาซื้อคืน',
    createdAt: new Date().toISOString(),
  });

  return { success: true, application: app };
}

// ---------------------------------------------------------------------------
// Staff Operations: Queue, Physical Inspection, Recalculate, Handover
// ---------------------------------------------------------------------------
export async function getStaffTradeInApplications(filters?: {
  branchId?: string;
  status?: TradeInApplicationStatus;
  search?: string;
}): Promise<TradeInApplication[]> {
  let list = Array.from(applicationsStore.values());

  if (filters?.branchId && filters.branchId !== 'ALL') {
    list = list.filter((a) => a.appointment?.branchId === filters.branchId);
  }

  if (filters?.status) {
    list = list.filter((a) => a.status === filters.status);
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.reference.toLowerCase().includes(s) ||
        a.contactName.toLowerCase().includes(s) ||
        a.verifiedPhone.includes(s) ||
        a.imeiOrSerial?.toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface RecordStaffInspectionInput {
  staffUserId: string;
  inspectedAnswers: CustomerConditionAnswers;
  manualAdjustments?: TradeInOfferAdjustment[];
  staffNote?: string;
}

export async function recordStaffInspection(
  applicationId: string,
  input: RecordStaffInspectionInput
): Promise<{ success: boolean; application?: TradeInApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) return { success: false, error: 'ไม่พบรายการใบสมัคร' };

  // Recalculate quote using inspected answers
  const topics = await getAssessmentTopics(app.deviceSelection.modelId);
  const config = await findConfiguration(app.deviceSelection);

  const inspectedQuote = calculateTradeInValuation(app.deviceSelection, config, input.inspectedAnswers, {
    payoutPercentage: currentPayoutPercentage,
    roundingRule: currentRoundingRule,
    topics,
  });

  // Calculate side-by-side inspection deltas
  const deltas: TradeInInspectionDelta[] = [];
  topics.forEach((topic) => {
    const declared = app.declaredAnswers[topic.id as keyof CustomerConditionAnswers];
    const inspected = input.inspectedAnswers[topic.id as keyof CustomerConditionAnswers];

    const declaredStr = JSON.stringify(declared || '');
    const inspectedStr = JSON.stringify(inspected || '');

    if (declaredStr !== inspectedStr) {
      deltas.push({
        topicId: topic.id,
        topicTitle: topic.title,
        declaredOptionLabel: String(declared || '-'),
        inspectedOptionLabel: String(inspected || '-'),
        differenceType: 'DOWNGRADE',
        deltaDeductionMinor: 0,
      });
    }
  });

  // Apply staff manual adjustments
  const adjustments = input.manualAdjustments || [];
  const adjustmentTotal = adjustments.reduce((sum, adj) => sum + adj.amountMinor, 0);

  const adjustedCashOffer = Math.max(0, inspectedQuote.finalCashOfferMinor + adjustmentTotal);

  // If this offer was previously accepted, amending it invalidates acceptance!
  const wasAccepted = app.status === 'ACCEPTED';

  app.revision += 1;
  app.status = 'FINAL_OFFER_READY';
  app.inspectedAnswers = input.inspectedAnswers;

  const finalOffer: TradeInFinalOfferSnapshot = {
    ...inspectedQuote,
    finalCashOfferMinor: adjustedCashOffer,
    offerRevision: app.revision,
    inspectionDeltas: deltas,
    manualAdjustments: adjustments,
    adjustedByStaffId: input.staffUserId,
    inspectedAt: new Date().toISOString(),
  };

  app.finalOfferSnapshot = finalOffer;
  app.customerDecision = undefined;
  app.customerDecisionAt = undefined;
  app.acceptedOfferRevision = undefined; // Invalidate previous acceptance
  app.updatedAt = new Date().toISOString();

  app.events.push({
    id: `evt-${crypto.randomBytes(4).toString('hex')}`,
    applicationId: app.id,
    actorKind: 'STAFF',
    actorId: input.staffUserId,
    eventType: 'PHYSICAL_INSPECTION_RECORDED',
    fromStatus: wasAccepted ? 'ACCEPTED' : app.status,
    toStatus: 'FINAL_OFFER_READY',
    customerVisible: true,
    message: wasAccepted
      ? 'เจ้าหน้าที่ปรับปรุงผลการตรวจสภาพเครื่องและเสนอราคาใหม่ (ยกเลิกการตอบรับเดิม)'
      : `เจ้าหน้าที่ตรวจสภาพเครื่องแล้ว เสนอราคารับซื้อคืน ฿${finalOffer.finalCashOfferMinor.toLocaleString()} บาท`,
    createdAt: new Date().toISOString(),
  });

  return { success: true, application: app };
}

export async function recordHandoverAndPayment(
  applicationId: string,
  staffUserId: string,
  handoverChecklist: TradeInHandoverChecklist,
  paymentRecord: TradeInPaymentRecord
): Promise<{ success: boolean; application?: TradeInApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) return { success: false, error: 'ไม่พบรายการใบสมัคร' };

  if (app.status !== 'ACCEPTED' && app.status !== 'PAYMENT_PENDING') {
    return { success: false, error: 'ลูกค้าต้องยอมรับข้อเสนอราคาก่อนดำเนินการส่งมอบและชำระเงิน' };
  }

  // Validate checklist
  if (
    !handoverChecklist.accountLockRemovedConfirmed ||
    !handoverChecklist.deviceWipedConfirmed ||
    !handoverChecklist.physicalAgreementSigned
  ) {
    return { success: false, error: 'กรุณาตรวจสอบและยืนยันรายการส่งมอบเครื่องให้ครบทุกข้อ' };
  }

  // Validate payment
  if (!paymentRecord.transactionReference || paymentRecord.amountMinor <= 0) {
    return { success: false, error: 'กรุณาระบุเลขอ้างอิงการชำระเงินและยอดเงินที่ถูกต้อง' };
  }

  app.handoverChecklist = {
    ...handoverChecklist,
    handoverCompletedByStaffId: staffUserId,
    handoverCompletedAt: new Date().toISOString(),
  };

  app.paymentRecord = {
    ...paymentRecord,
    recordedByStaffId: staffUserId,
    paidAt: new Date().toISOString(),
  };

  app.status = 'COMPLETED';
  app.updatedAt = new Date().toISOString();

  app.events.push({
    id: `evt-${crypto.randomBytes(4).toString('hex')}`,
    applicationId: app.id,
    actorKind: 'STAFF',
    actorId: staffUserId,
    eventType: 'TRANSACTION_COMPLETED',
    fromStatus: 'ACCEPTED',
    toStatus: 'COMPLETED',
    customerVisible: true,
    message: `ส่งมอบเครื่องและบันทึกการโอนเงิน/ชำระเงินเรียบร้อยแล้ว (เลขอ้างอิง: ${paymentRecord.transactionReference})`,
    createdAt: new Date().toISOString(),
  });

  return { success: true, application: app };
}

export async function transitionApplicationStatus(
  applicationId: string,
  staffUserId: string,
  toStatus: TradeInApplicationStatus,
  reason?: string
): Promise<{ success: boolean; application?: TradeInApplication; error?: string }> {
  const app = applicationsStore.get(applicationId);
  if (!app) return { success: false, error: 'ไม่พบรายการใบสมัคร' };

  if (!canTransitionTradeIn(app.status, toStatus)) {
    return { success: false, error: `ไม่สามารถเปลี่ยนสถานะจาก ${app.status} ไปยัง ${toStatus} ได้` };
  }

  const fromStatus = app.status;
  app.status = toStatus;
  app.updatedAt = new Date().toISOString();

  app.events.push({
    id: `evt-${crypto.randomBytes(4).toString('hex')}`,
    applicationId: app.id,
    actorKind: 'STAFF',
    actorId: staffUserId,
    eventType: 'STATUS_TRANSITIONED',
    fromStatus,
    toStatus,
    customerVisible: true,
    message: reason || `เปลี่ยนสถานะเป็น ${toStatus}`,
    createdAt: new Date().toISOString(),
  });

  return { success: true, application: app };
}

// ---------------------------------------------------------------------------
// Admin Backoffice CRUD
// ---------------------------------------------------------------------------
export async function updateConfigurationPrice(configurationId: string, basePriceMinor: number) {
  const cfg = configurationsStore.get(configurationId);
  if (!cfg) return null;
  cfg.baseBuybackPriceMinor = basePriceMinor;
  return cfg;
}

export async function updatePayoutPolicy(payoutPct: number, rounding: 'ROUND_DOWN_100' | 'ROUND_NEAREST_100' | 'EXACT') {
  currentPayoutPercentage = payoutPct;
  currentRoundingRule = rounding;
  return { payoutPercentage: currentPayoutPercentage, roundingRule: currentRoundingRule };
}

export async function upsertAssessmentTopic(topic: AssessmentTopic) {
  topicsStore.set(topic.id, topic);
  return topic;
}

export async function upsertModel(model: TradeInModel) {
  modelsStore.set(model.id, model);
  return model;
}

export async function upsertConfiguration(cfg: TradeInDeviceConfiguration) {
  configurationsStore.set(cfg.id, cfg);
  return cfg;
}
