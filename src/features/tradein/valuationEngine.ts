import crypto from 'crypto';
import type {
  TradeInDeviceConfiguration,
  TradeInDeviceSelection,
  CustomerConditionAnswers,
  ValuationQuoteSnapshot,
  DeductionItem,
  AssessmentTopic,
  AssessmentAnswerOption,
} from './types';

export interface ValuationEngineOptions {
  payoutPercentage?: number; // e.g. 75
  roundingRule?: 'ROUND_DOWN_100' | 'ROUND_NEAREST_100' | 'EXACT';
  validityDays?: number; // default 7
  topics?: AssessmentTopic[];
}

/**
 * Server-Authoritative Valuation Engine.
 * Never trust prices or deduction calculations submitted by the browser.
 */
export function calculateTradeInValuation(
  selection: TradeInDeviceSelection,
  configuration: TradeInDeviceConfiguration | null,
  answers: CustomerConditionAnswers,
  options?: ValuationEngineOptions
): ValuationQuoteSnapshot {
  const quoteId = `QUO-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  const now = new Date();
  const validityDays = options?.validityDays ?? 7;
  const validUntil = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString();
  const topics = options?.topics || [];
  const payoutPercentage = options?.payoutPercentage ?? 75;
  const roundingRule = options?.roundingRule ?? 'ROUND_DOWN_100';

  const manualReasons: string[] = [];
  const ineligibilityReasons: string[] = [];

  // If configuration is missing or price is missing -> Route to manual assessment
  if (!configuration || configuration.baseBuybackPriceMinor <= 0 || !configuration.isActive) {
    return {
      quoteId,
      configurationId: configuration?.id || 'unconfigured',
      baseBuybackPriceMinor: 0,
      deductions: [],
      totalDeductionsMinor: 0,
      estimatedDeviceValueMinor: 0,
      payoutPercentage,
      unroundedCashOfferMinor: 0,
      roundingRule,
      roundingAdjustmentMinor: 0,
      finalCashOfferMinor: 0,
      isManualAssessmentRequired: true,
      manualAssessmentReasons: ['รุ่นและความจุนี้ยังไม่มีราคาประเมินอัตโนมัติ เจ้าหน้าที่สาขาจะติดต่อเพื่อประเมินราคาพิเศษ'],
      isEligible: true,
      ineligibilityReasons: [],
      disclaimer: 'ราคาเบื้องต้น ขึ้นอยู่กับผลตรวจสภาพเครื่องจริง',
      validUntil,
      calculatedAt: now.toISOString(),
    };
  }

  const basePrice = configuration.baseBuybackPriceMinor;
  const deductions: DeductionItem[] = [];

  // Map answers to options and deductions
  topics.forEach((topic) => {
    const rawAnswer = answers[topic.id as keyof CustomerConditionAnswers];
    if (!rawAnswer) {
      if (topic.isRequired) {
        manualReasons.push(`ไม่ได้ระบุข้อมูลในหัวข้อ ${topic.title}`);
      }
      return;
    }

    const selectedOptionIds: string[] = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];

    selectedOptionIds.forEach((optId) => {
      const option = topic.options.find((o) => o.id === optId);
      if (!option) return;

      // Check eligibility hold or rejection
      if (option.eligibilityHold) {
        ineligibilityReasons.push(`${topic.title}: ${option.label}`);
      }

      // Check manual review required
      if (option.manualReviewRequired) {
        manualReasons.push(`${topic.title}: ${option.label}`);
      }

      // Calculate deduction amount
      let amountMinor = 0;
      if (option.adjustmentType === 'PERCENTAGE') {
        // All percentage deductions use ORIGINAL base buyback price
        amountMinor = Math.round((basePrice * option.adjustmentValue) / 100);
      } else if (option.adjustmentType === 'FIXED' || option.adjustmentType === 'REPAIR_DEDUCTION') {
        amountMinor = option.adjustmentValue;
      }

      if (amountMinor > 0 || option.adjustmentType !== 'NO_DEDUCTION') {
        deductions.push({
          topicId: topic.id,
          topicTitle: topic.title,
          selectedOptionId: option.id,
          selectedOptionLabel: option.label,
          adjustmentType: option.adjustmentType,
          overlapGroup: option.overlapGroup,
          isOverlapped: false,
          amountMinor,
          reason:
            option.adjustmentType === 'PERCENTAGE'
              ? `หัก ${option.adjustmentValue}% ของราคาตั้งต้น (${option.label})`
              : option.label,
        });
      }
    });
  });

  // Handle Overlap Groups (Deduplication of repair deductions)
  // For each overlap group, keep the deduction with the highest amountMinor active,
  // and flag subsequent ones as isOverlapped = true, amountMinor = 0
  const overlapGroupSeen = new Map<string, number>(); // groupName -> max index

  // First pass: find max deduction per overlap group
  deductions.forEach((item, index) => {
    if (!item.overlapGroup) return;
    const currentMaxIndex = overlapGroupSeen.get(item.overlapGroup);
    if (currentMaxIndex === undefined) {
      overlapGroupSeen.set(item.overlapGroup, index);
    } else {
      if (item.amountMinor > deductions[currentMaxIndex].amountMinor) {
        overlapGroupSeen.set(item.overlapGroup, index);
      }
    }
  });

  // Second pass: mark other items in the same overlap group as overlapped
  deductions.forEach((item, index) => {
    if (!item.overlapGroup) return;
    const maxIndex = overlapGroupSeen.get(item.overlapGroup);
    if (maxIndex !== undefined && index !== maxIndex) {
      item.isOverlapped = true;
      item.reason = `${item.reason} (รวมอยู่ในกลุ่มการซ่อมหน้าจอเดียวกัน ไม่คิดซ้ำ)`;
      item.amountMinor = 0;
    }
  });

  // Sum active deductions
  const totalDeductionsMinor = deductions.reduce((sum, item) => sum + (item.isOverlapped ? 0 : item.amountMinor), 0);

  // Calculate estimated device value
  let estimatedDeviceValueMinor = basePrice - totalDeductionsMinor;

  // If deductions equal/exceed base price or value is <= 0 -> route to manual assessment
  if (estimatedDeviceValueMinor <= 0) {
    estimatedDeviceValueMinor = 0;
    manualReasons.push('ค่าลดหย่อนตามสภาพเครื่องรวมมากกว่าหรือเท่ากับราคาตั้งต้น ต้องตรวจสภาพจริงโดยช่างเทคนิค');
  }

  // Calculate cash offer
  const unroundedCashOfferMinor = (estimatedDeviceValueMinor * payoutPercentage) / 100;
  let finalCashOfferMinor = unroundedCashOfferMinor;

  if (roundingRule === 'ROUND_DOWN_100') {
    finalCashOfferMinor = Math.floor(unroundedCashOfferMinor / 100) * 100;
  } else if (roundingRule === 'ROUND_NEAREST_100') {
    finalCashOfferMinor = Math.round(unroundedCashOfferMinor / 100) * 100;
  }

  const roundingAdjustmentMinor = Math.round((finalCashOfferMinor - unroundedCashOfferMinor) * 100) / 100;

  const isManualAssessmentRequired = manualReasons.length > 0 || estimatedDeviceValueMinor <= 0;
  const isEligible = ineligibilityReasons.length === 0;

  return {
    quoteId,
    configurationId: configuration.id,
    baseBuybackPriceMinor: basePrice,
    deductions,
    totalDeductionsMinor,
    estimatedDeviceValueMinor,
    payoutPercentage,
    unroundedCashOfferMinor,
    roundingRule,
    roundingAdjustmentMinor,
    finalCashOfferMinor,
    isManualAssessmentRequired,
    manualAssessmentReasons: manualReasons,
    isEligible,
    ineligibilityReasons,
    disclaimer: 'ราคาเบื้องต้น ขึ้นอยู่กับผลตรวจสภาพเครื่องจริง',
    validUntil,
    calculatedAt: now.toISOString(),
  };
}
