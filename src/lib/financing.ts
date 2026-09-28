/**
 * MeePro Financing Utilities
 * 
 * Business Rule:
 * 1. The website NEVER displays full cash prices (e.g. ฿36,900).
 *    All primary prices represent the DOWN PAYMENT (e.g. ดาวน์ ฿7,900).
 *    Discounts refer to discounts on the down payment (e.g. original down ฿9,900 -> promo down ฿7,900).
 * 2. On product cards and previews, the lowest monthly installment is displayed (24-month tier).
 * 3. On the product detail page, customers can choose among 6 installment packages:
 *    6, 9, 12, 15, 18, and 24 months.
 */

export const INSTALLMENT_TERMS = [6, 9, 12, 15, 18, 24] as const;
export type InstallmentTerm = (typeof INSTALLMENT_TERMS)[number];

export interface DownPaymentInfo {
  downPayment: number; // in Baht, e.g. 7900
  downPaymentMinor: number; // in Satang, e.g. 790000
  originalDownPayment: number; // in Baht, e.g. 9900
  originalDownPaymentMinor: number; // in Satang, e.g. 990000
  downDiscount: number; // in Baht, e.g. 2000
  downDiscountMinor: number; // in Satang, e.g. 200000
}

export interface InstallmentPackage {
  months: InstallmentTerm;
  monthlyAmount: number; // in Baht
  monthlyAmountMinor: number; // in Satang
  downPayment: number; // in Baht
  downPaymentMinor: number; // in Satang
  totalFinanced: number; // in Baht
  totalFinancedMinor: number; // in Satang
  isLowestMonthly: boolean;
}

/**
 * Calculates down payment and down payment discount.
 * Defaults to flagship 7,900 (down discount from 9,900).
 */
export function calculateDownPayment(
  cashPrice: number,
  customDown?: number,
  customOriginalDown?: number
): DownPaymentInfo {
  // If price is passed in minor units (satang, e.g. > 100,000), convert to Baht
  const priceInBaht = cashPrice > 100000 ? Math.round(cashPrice / 100) : cashPrice;

  let downPayment: number;
  if (customDown && customDown > 0) {
    downPayment = customDown > 100000 ? Math.round(customDown / 100) : customDown;
  } else if (priceInBaht >= 32000) {
    // Flagships (iPhone 16 Pro, Galaxy S25 Ultra, etc.): 7,900
    downPayment = 7900;
  } else if (priceInBaht >= 22000) {
    // Upper mid-range: 5,900
    downPayment = 5900;
  } else if (priceInBaht >= 12000) {
    // Mid-range: 3,900
    downPayment = 3900;
  } else {
    // Budget: 1,900
    downPayment = 1900;
  }

  let originalDownPayment: number;
  if (customOriginalDown && customOriginalDown > 0) {
    originalDownPayment =
      customOriginalDown > 100000 ? Math.round(customOriginalDown / 100) : customOriginalDown;
  } else {
    // Standard promotional discount on down payment is 2,000 Baht
    originalDownPayment = downPayment + 2000;
  }

  const downDiscount = Math.max(0, originalDownPayment - downPayment);

  return {
    downPayment,
    downPaymentMinor: downPayment * 100,
    originalDownPayment,
    originalDownPaymentMinor: originalDownPayment * 100,
    downDiscount,
    downDiscountMinor: downDiscount * 100,
  };
}

/**
 * Calculates the 6 standard installment packages: 6, 9, 12, 15, 18, 24 months.
 */
export function calculateInstallmentPackages(
  cashPrice: number,
  customDown?: number
): InstallmentPackage[] {
  const priceInBaht = cashPrice > 100000 ? Math.round(cashPrice / 100) : cashPrice;
  const { downPayment } = calculateDownPayment(priceInBaht, customDown);
  const financedAmount = Math.max(0, priceInBaht - downPayment);

  return INSTALLMENT_TERMS.map((months) => {
    const monthlyAmount = Math.round(financedAmount / months);
    return {
      months,
      monthlyAmount,
      monthlyAmountMinor: monthlyAmount * 100,
      downPayment,
      downPaymentMinor: downPayment * 100,
      totalFinanced: financedAmount,
      totalFinancedMinor: financedAmount * 100,
      isLowestMonthly: months === 24,
    };
  });
}

/**
 * Returns the package with the lowest monthly installment (the 24-month package).
 */
export function getLowestInstallmentPackage(
  cashPrice: number,
  customDown?: number
): InstallmentPackage {
  const packages = calculateInstallmentPackages(cashPrice, customDown);
  return packages[packages.length - 1]; // 24 months has lowest monthly payment
}
