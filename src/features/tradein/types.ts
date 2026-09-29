export type TradeInApplicationStatus =
  | 'DRAFT'
  | 'ESTIMATED'
  | 'MANUAL_ASSESSMENT_REQUIRED'
  | 'SUBMITTED'
  | 'NEEDS_INFO'
  | 'UNDER_REVIEW'
  | 'APPOINTMENT_CONFIRMED'
  | 'INSPECTED'
  | 'FINAL_OFFER_READY'
  | 'ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EXPIRED';

export const TRADEIN_STATUS_LABELS: Record<TradeInApplicationStatus, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ฉบับร่าง', color: '#64748B', bg: '#F1F5F9' },
  ESTIMATED: { label: 'ประเมินราคาแล้ว', color: '#0284C7', bg: '#E0F2FE' },
  MANUAL_ASSESSMENT_REQUIRED: { label: 'รอตรวจสอบพิเศษ', color: '#D97706', bg: '#FEF3C7' },
  SUBMITTED: { label: 'ส่งคำขอแล้ว', color: '#2563EB', bg: '#DBEAFE' },
  NEEDS_INFO: { label: 'ขอข้อมูลเพิ่มเติม', color: '#EA580C', bg: '#FFEDD5' },
  UNDER_REVIEW: { label: 'กำลังตรวจสอบ', color: '#D97706', bg: '#FEF3C7' },
  APPOINTMENT_CONFIRMED: { label: 'ยืนยันนัดตรวจเครื่อง', color: '#7C3AED', bg: '#F3E8FF' },
  INSPECTED: { label: 'ตรวจสภาพแล้ว', color: '#0D9488', bg: '#CCFBF1' },
  FINAL_OFFER_READY: { label: 'รอการตอบรับข้อเสนอ', color: '#4F46E5', bg: '#EEF2FF' },
  ACCEPTED: { label: 'ลูกค้ายอมรับข้อเสนอ', color: '#16A34A', bg: '#DCFCE7' },
  PAYMENT_PENDING: { label: 'รอชำระเงิน/โอนเงิน', color: '#E11D48', bg: '#FFE4E6' },
  COMPLETED: { label: 'แลกเงินสำเร็จ', color: '#059669', bg: '#D1FAE5' },
  DECLINED: { label: 'ปฏิเสธข้อเสนอ', color: '#DC2626', bg: '#FEE2E2' },
  CANCELLED: { label: 'ยกเลิกรายการ', color: '#64748B', bg: '#F1F5F9' },
  EXPIRED: { label: 'ข้อเสนอหมดอายุ', color: '#94A3B8', bg: '#F8FAFC' },
};

export const VALID_TRADEIN_TRANSITIONS: Record<TradeInApplicationStatus, TradeInApplicationStatus[]> = {
  DRAFT: ['ESTIMATED', 'MANUAL_ASSESSMENT_REQUIRED', 'CANCELLED'],
  ESTIMATED: ['SUBMITTED', 'EXPIRED', 'CANCELLED'],
  MANUAL_ASSESSMENT_REQUIRED: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'APPOINTMENT_CONFIRMED', 'NEEDS_INFO', 'CANCELLED'],
  NEEDS_INFO: ['SUBMITTED', 'UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['APPOINTMENT_CONFIRMED', 'NEEDS_INFO', 'CANCELLED'],
  APPOINTMENT_CONFIRMED: ['INSPECTED', 'APPOINTMENT_CONFIRMED', 'CANCELLED'], // can reschedule
  INSPECTED: ['FINAL_OFFER_READY', 'MANUAL_ASSESSMENT_REQUIRED', 'CANCELLED'],
  FINAL_OFFER_READY: ['ACCEPTED', 'DECLINED', 'INSPECTED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: ['PAYMENT_PENDING', 'FINAL_OFFER_READY', 'CANCELLED'], // offer modification pushes back to FINAL_OFFER_READY
  PAYMENT_PENDING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: [],
  EXPIRED: ['ESTIMATED', 'MANUAL_ASSESSMENT_REQUIRED'], // can recalculate expired
};

export function canTransitionTradeIn(from: TradeInApplicationStatus, to: TradeInApplicationStatus): boolean {
  return VALID_TRADEIN_TRANSITIONS[from]?.includes(to) ?? false;
}

// ---------------------------------------------------------------------------
// 6-Field Hierarchy
// 1. Category -> 2. Brand -> 3. Model -> 4. Storage -> 5. Color -> 6. Market Variant
// ---------------------------------------------------------------------------

export interface TradeInOptionItem {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface TradeInCategory extends TradeInOptionItem {
  slug: string;
  iconName?: string;
}

export interface TradeInBrand extends TradeInOptionItem {
  slug: string;
  categoryIds: string[];
  logoUrl?: string;
}

export interface TradeInModel extends TradeInOptionItem {
  slug: string;
  categoryId: string;
  brandId: string;
  imageUrl: string;
  supportedFeatures?: {
    hasFaceId?: boolean;
    hasFingerprint?: boolean;
    hasWirelessCharging?: boolean;
  };
}

export interface TradeInStorageOption extends TradeInOptionItem {
  sizeValueGb: number;
  label: string; // e.g. "128GB", "256GB", "512GB", "1TB"
}

export interface TradeInColorOption extends TradeInOptionItem {
  label: string;
  hexCode?: string;
}

export interface TradeInMarketVariantOption extends TradeInOptionItem {
  code: string; // "TH", "LL/A", "ZP/A", "HK", "OTHER"
  label: string;
  adjustmentType?: 'NONE' | 'PERCENTAGE' | 'FIXED';
  adjustmentValue?: number;
}

export interface TradeInDeviceConfiguration {
  id: string;
  modelId: string;
  storageOptionId: string;
  colorOptionId: string;
  marketVariantOptionId: string;
  baseBuybackPriceMinor: number; // in Baht or Satang (stored as integer Baht minor 23000)
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string;
}

export interface TradeInDeviceSelection {
  categoryId: string;
  brandId: string;
  modelId: string;
  storageOptionId: string;
  colorOptionId: string;
  marketVariantOptionId: string;
  configurationId?: string;
  condition: 'USED'; // Mandatorily USED only
}

// ---------------------------------------------------------------------------
// Assessment Topics & Deduction Rules
// ---------------------------------------------------------------------------

export type AssessmentTopicId =
  | 'battery'
  | 'accessories'
  | 'warranty'
  | 'body_condition'
  | 'screen_surface'
  | 'display'
  | 'functional_issues'
  | 'repair_history'
  | 'damage_history'
  | 'account_lock'
  | 'ownership';

export type AdjustmentType =
  | 'NO_DEDUCTION'
  | 'FIXED'
  | 'PERCENTAGE'
  | 'REPAIR_DEDUCTION'
  | 'MANUAL_ASSESSMENT'
  | 'HOLD_OR_REJECT';

export interface AssessmentAnswerOption {
  id: string;
  label: string;
  description?: string;
  isExclusive?: boolean; // e.g. "No problems" or "Neither"
  requiresEvidence?: boolean;
  requiresDetails?: boolean;
  adjustmentType: AdjustmentType;
  adjustmentValue: number; // For PERCENTAGE: integer % (e.g. 5 for 5%); For FIXED/REPAIR: integer Baht
  overlapGroup?: string; // e.g. "OVERLAP_SCREEN_REPAIR" to avoid multiple deductions
  manualReviewRequired?: boolean;
  eligibilityHold?: boolean;
}

export interface AssessmentTopic {
  id: AssessmentTopicId;
  title: string;
  subtitle?: string;
  isRequired: boolean;
  isMultiSelect: boolean;
  options: AssessmentAnswerOption[];
  applicableCategoryIds?: string[];
  applicableModelIds?: string[];
}

export interface CustomerConditionAnswers {
  battery?: string;
  accessories?: string;
  warranty?: string;
  body_condition?: string;
  screen_surface?: string;
  display?: string[]; // multi or single
  functional_issues?: string[]; // multi, exclusive "no_problems"
  repair_history?: string;
  repair_details?: string;
  damage_history?: string[]; // "neither" exclusive
  account_lock?: string;
  ownership?: string;
}

// ---------------------------------------------------------------------------
// Valuation Engine Snapshots
// ---------------------------------------------------------------------------

export interface DeductionItem {
  topicId: AssessmentTopicId;
  topicTitle: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  adjustmentType: AdjustmentType;
  overlapGroup?: string;
  isOverlapped?: boolean; // if true, masked by higher priority deduction in same overlapGroup
  amountMinor: number;
  reason: string;
}

export interface ValuationQuoteSnapshot {
  quoteId: string;
  configurationId: string;
  baseBuybackPriceMinor: number;
  deductions: DeductionItem[];
  totalDeductionsMinor: number;
  estimatedDeviceValueMinor: number;
  payoutPercentage: number; // e.g. 75 for 75%
  unroundedCashOfferMinor: number;
  roundingRule: 'ROUND_DOWN_100' | 'ROUND_NEAREST_100' | 'EXACT';
  roundingAdjustmentMinor: number;
  finalCashOfferMinor: number;
  isManualAssessmentRequired: boolean;
  manualAssessmentReasons: string[];
  isEligible: boolean;
  ineligibilityReasons: string[];
  disclaimer: string; // "ราคาเบื้องต้น ขึ้นอยู่กับผลตรวจสภาพเครื่องจริง"
  validUntil: string;
  calculatedAt: string;
}

// ---------------------------------------------------------------------------
// Trade-In Application & Inspection Lifecycle
// ---------------------------------------------------------------------------

export interface TradeInEvidenceFile {
  type: 'FRONT_PHOTO' | 'BACK_PHOTO' | 'SCREEN_PHOTO' | 'STORAGE_SCREENSHOT' | 'REPAIR_EVIDENCE' | 'OTHER';
  storagePath: string;
  fileName: string;
  byteSize?: number;
  uploadedAt: string;
}

export interface TradeInInspectionDelta {
  topicId: AssessmentTopicId;
  topicTitle: string;
  declaredOptionLabel: string;
  inspectedOptionLabel: string;
  differenceType: 'MATCH' | 'UPGRADE' | 'DOWNGRADE';
  deltaDeductionMinor: number;
  staffNote?: string;
}

export interface TradeInOfferAdjustment {
  amountMinor: number; // positive or negative
  reason: string;
  adjustedByStaffId: string;
  adjustedAt: string;
}

export interface TradeInFinalOfferSnapshot extends ValuationQuoteSnapshot {
  offerRevision: number;
  inspectionDeltas: TradeInInspectionDelta[];
  manualAdjustments: TradeInOfferAdjustment[];
  adjustedByStaffId?: string;
  inspectedAt?: string;
}

export interface TradeInHandoverChecklist {
  accountLockRemovedConfirmed: boolean;
  deviceWipedConfirmed: boolean;
  physicalConditionMatchesOffer: boolean;
  physicalAgreementSigned: boolean;
  handoverCompletedByStaffId?: string;
  handoverCompletedAt?: string;
}

export interface TradeInPaymentRecord {
  method: 'BANK_TRANSFER' | 'CASH_AT_BRANCH' | 'PROMPTPAY';
  transactionReference: string;
  amountMinor: number;
  paidAt: string;
  bankName?: string;
  accountNumberMasked?: string;
  receiptNumber?: string;
  recordedByStaffId: string;
  receiptImageUrl?: string;
}

export interface TradeInAppointmentBooking {
  branchId: string;
  branchName: string;
  startsAt: string; // ISO date string
  status: 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  note?: string;
}

export interface TradeInApplicationEvent {
  id: string;
  applicationId: string;
  actorKind: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  actorId?: string;
  actorName?: string;
  eventType: string;
  fromStatus: TradeInApplicationStatus | null;
  toStatus: TradeInApplicationStatus | null;
  customerVisible: boolean;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TradeInApplication {
  id: string;
  reference: string; // e.g. TRD-202609-8801
  customerId: string;
  status: TradeInApplicationStatus;
  revision: number;
  contactName: string;
  verifiedPhone: string;
  nationalIdMasked?: string;
  address?: string;

  // Selected device info (all 6 fields)
  deviceSelection: TradeInDeviceSelection;
  deviceDisplaySummary: {
    categoryName: string;
    brandName: string;
    modelName: string;
    storageLabel: string;
    colorLabel: string;
    marketVariantLabel: string;
    imageUrl: string;
    condition: 'USED';
  };

  // Declared customer answers
  declaredAnswers: CustomerConditionAnswers;

  // Initial estimate
  quoteSnapshot: ValuationQuoteSnapshot;

  // Inspection & Final Offer (if inspected)
  inspectedAnswers?: CustomerConditionAnswers;
  finalOfferSnapshot?: TradeInFinalOfferSnapshot;
  acceptedOfferRevision?: number;
  customerDecisionAt?: string;
  customerDecision?: 'ACCEPTED' | 'DECLINED';

  // Evidence & appointment
  imeiOrSerial?: string;
  evidenceFiles: TradeInEvidenceFile[];
  appointment?: TradeInAppointmentBooking;

  // Handover and Payment
  handoverChecklist?: TradeInHandoverChecklist;
  paymentRecord?: TradeInPaymentRecord;

  // Idempotency & audit
  idempotencyKey?: string;
  events: TradeInApplicationEvent[];
  customerNote?: string;
  cancellationReason?: string;

  createdAt: string;
  updatedAt: string;
}
