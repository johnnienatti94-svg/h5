export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFO'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPOINTMENT_SET'
  | 'COMPLETED'
  | 'CANCELLED';

export type ActorKind = 'CUSTOMER' | 'STAFF' | 'SYSTEM';

export type ConsentType = 'PRIVACY' | 'TERMS' | 'MARKETING';

export interface ConsentRecord {
  id?: number | string;
  customerId: string;
  applicationId?: string;
  consentType: ConsentType;
  documentVersion: string;
  accepted: boolean;
  ipAddress?: string;
  userAgent?: string;
  occurredAt: string;
}

export interface ApplicationEvent {
  id: string | number;
  applicationId: string;
  actorKind: ActorKind;
  actorUserId?: string | null;
  eventType:
    | 'APPLICATION_CREATED'
    | 'APPLICATION_SUBMITTED'
    | 'STATUS_CHANGED'
    | 'CUSTOMER_UPDATED_INFO'
    | 'APPOINTMENT_SCHEDULED'
    | 'CUSTOMER_CANCELLED'
    | 'STAFF_CANCELLED'
    | 'STAFF_NOTE_ADDED';
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus | null;
  customerVisible: boolean;
  message: string | null;
  reason: string | null;
  createdAt: string;
}

export interface ApplicationProductSnapshot {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  condition: 'new' | 'used';
  heroImageUrl: string;
}

export interface ApplicationVariantSnapshot {
  id: string;
  name: string;
  sku: string;
  storage: string;
  color: string;
  colorHex?: string;
  cashPriceMinor: number;
  cashPriceFormatted: string;
}

export interface ApplicationOfferSnapshot {
  id: string;
  versionNumber: number;
  downPaymentMinor: number;
  monthlyInstallmentMinor: number;
  tenorMonths: number;
  feeMinor: number;
  totalPayableMinor: number;
  downPaymentFormatted: string;
  monthlyInstallmentFormatted: string;
  totalPayableFormatted: string;
}

export interface ApplicationBranchSnapshot {
  id: string;
  slug: string;
  name: string;
  fullAddress: string;
  displayPhone: string;
  googleMapsUrl: string;
}

export interface ApplicationAppointment {
  id: string;
  branchId: string;
  branchName?: string;
  startsAt: string;
  status: 'scheduled' | 'change_requested' | 'cancelled' | 'completed';
  note?: string | null;
}

export interface ApplicationDraft {
  productId: string;
  variantId: string;
  offerVersionId: string;
  contactName: string;
  verifiedPhone: string;
  nationalId?: string;
  address?: string;
  province?: string;
  postalCode?: string;
  selectedBranchId: string;
  customerNote?: string;
  step: number;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
  lastSavedAt: string;
}

export interface PublicApplication {
  id: string;
  reference: string;
  customerId: string;
  status: ApplicationStatus;
  revision: number;
  contactName: string;
  verifiedPhone: string;
  productSnapshot: ApplicationProductSnapshot;
  variantSnapshot: ApplicationVariantSnapshot;
  offerSnapshot: ApplicationOfferSnapshot;
  branchSnapshot: ApplicationBranchSnapshot;
  termsSnapshot: {
    privacyPolicyVersion: string;
    termsVersion: string;
    acceptedAt: string;
    marketingAccepted: boolean;
  };
  customerNote: string | null;
  cancellationReason: string | null;
  appointment: ApplicationAppointment | null;
  events: ApplicationEvent[];
  submittedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitApplicationInput {
  productId: string;
  variantId: string;
  offerVersionId: string;
  contactName: string;
  verifiedPhone: string;
  selectedBranchId: string;
  customerNote?: string;
  privacyAccepted: boolean;
  privacyPolicyVersion: string;
  termsAccepted: boolean;
  marketingAccepted?: boolean;
  idempotencyKey?: string;
}

export const VALID_APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['NEEDS_INFO', 'APPROVED', 'REJECTED', 'CANCELLED'],
  NEEDS_INFO: ['SUBMITTED', 'CANCELLED'],
  APPROVED: ['APPOINTMENT_SET', 'CANCELLED'],
  APPOINTMENT_SET: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransition(current: ApplicationStatus, next: ApplicationStatus): boolean {
  return VALID_APPLICATION_TRANSITIONS[current]?.includes(next) ?? false;
}

export const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ฉบับร่าง', color: '#64748B', bg: '#F1F5F9' },
  SUBMITTED: { label: 'ส่งคำขอแล้ว', color: '#0284C7', bg: '#E0F2FE' },
  UNDER_REVIEW: { label: 'กำลังตรวจสอบ', color: '#D97706', bg: '#FEF3C7' },
  NEEDS_INFO: { label: 'ขอข้อมูลเพิ่มเติม', color: '#EA580C', bg: '#FFEDD5' },
  APPROVED: { label: 'อนุมัติแล้ว', color: '#16A34A', bg: '#DCFCE7' },
  APPOINTMENT_SET: { label: 'นัดหมายรับเครื่อง', color: '#7C3AED', bg: '#F3E8FF' },
  COMPLETED: { label: 'สำเร็จแล้ว', color: '#059669', bg: '#D1FAE5' },
  REJECTED: { label: 'ไม่ผ่านการอนุมัติ', color: '#DC2626', bg: '#FEE2E2' },
  CANCELLED: { label: 'ยกเลิกแล้ว', color: '#64748B', bg: '#F1F5F9' },
};
