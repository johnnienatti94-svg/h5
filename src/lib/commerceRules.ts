/**
 * MeePro CMS v2.1 — Server-Authoritative Commerce Rules & Engine
 * Spec Section 10: Server-Authoritative Commerce Rules & Idempotent Order Creation
 */

import crypto from 'crypto';
import { ALL_PRODUCTS, DetailedProduct } from './productsData';

// Secret key for HMAC token signing
const COMMERCE_HMAC_SECRET = process.env.COMMERCE_SECRET || 'meepro_commerce_secure_hmac_secret_2026';

export interface CartItemRequest {
  productId: string;
  quantity: number;
}

export interface ValidatedLineItem {
  productId: string;
  name: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  imageUrl: string;
}

export interface AuthoritativeCoupon {
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
}

export const AUTHORITATIVE_COUPONS: Record<string, AuthoritativeCoupon> = {
  MEEPRO500: {
    code: 'MEEPRO500',
    discountType: 'fixed',
    discountValue: 500,
    minSpend: 10000,
    description: 'ลดทันที ฿500 เมื่อช้อปครบ ฿10,000',
    isActive: true,
  },
  MEEPRO1000: {
    code: 'MEEPRO1000',
    discountType: 'fixed',
    discountValue: 1000,
    minSpend: 25000,
    description: 'ลดทันที ฿1,000 เมื่อช้อปครบ ฿25,000',
    isActive: true,
  },
  SPECIAL200: {
    code: 'SPECIAL200',
    discountType: 'fixed',
    discountValue: 200,
    minSpend: 5000,
    description: 'ลดทันที ฿200 เมื่อช้อปครบ ฿5,000',
    isActive: true,
  },
  INSTALL0: {
    code: 'INSTALL0',
    discountType: 'fixed',
    discountValue: 0,
    minSpend: 3000,
    description: 'สิทธิ์ผ่อนชำระ 0% สูงสุด 24 เดือน',
    isActive: true,
  },
};

export interface CheckoutQuote {
  quoteId: string;
  token: string;
  expiresAt: string;
  items: ValidatedLineItem[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  finalPayable: number;
  appliedCoupon?: {
    code: string;
    description: string;
    discountAmount: number;
  };
  installmentSchedule?: {
    months: number;
    monthlyPayment: number;
    interestRate: number;
  };
}

export interface OrderRecord {
  orderId: string;
  idempotencyKey: string;
  quoteId: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  paymentMethod: string;
  items: ValidatedLineItem[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  finalPayable: number;
  installmentMonths?: number;
  monthlyPayment?: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'PROCESSING';
  createdAt: string;
}

// In-memory stores for development / edge serverless runtime
const IDEMPOTENCY_CACHE = new Map<string, { order: OrderRecord; timestamp: number }>();
const QUOTE_CACHE = new Map<string, CheckoutQuote>();

/**
 * Validates cart items against the authoritative products database,
 * calculates server-authoritative discounts and creates an authenticated checkout quote.
 */
export function validateCartAndGenerateQuote(
  items: CartItemRequest[],
  couponCode?: string,
  installmentMonths: number = 10
): { success: true; quote: CheckoutQuote } | { success: false; error: string; code: string } {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อนดำเนินการ', code: 'EMPTY_CART' };
  }

  const validatedItems: ValidatedLineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = ALL_PRODUCTS.find((p) => p.id === item.productId);
    if (!product) {
      return {
        success: false,
        error: `ไม่พบสินค้า ID "${item.productId}" ในระบบ`,
        code: 'PRODUCT_NOT_FOUND',
      };
    }

    if (!product.inStock) {
      return {
        success: false,
        error: `สินค้า "${product.name}" สินค้าหมดชั่วคราว`,
        code: 'OUT_OF_STOCK',
      };
    }

    const qty = Math.max(1, Math.min(item.quantity, 10)); // Clamp 1 to 10
    const authoritativePrice = product.promoPrice || product.originalPrice;
    const lineTotal = authoritativePrice * qty;

    validatedItems.push({
      productId: product.id,
      name: product.name,
      unitPrice: authoritativePrice,
      originalPrice: product.originalPrice,
      quantity: qty,
      lineTotal,
      inStock: true,
      imageUrl: product.imageUrl,
    });

    subtotal += lineTotal;
  }

  // Authoritative Coupon Validation
  let discountTotal = 0;
  let appliedCoupon: CheckoutQuote['appliedCoupon'] = undefined;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = AUTHORITATIVE_COUPONS[cleanCode];

    if (!coupon || !coupon.isActive) {
      return {
        success: false,
        error: `รหัสคูปอง "${cleanCode}" ไม่ถูกต้องหรือหมดอายุแล้ว`,
        code: 'INVALID_COUPON',
      };
    }

    if (subtotal < coupon.minSpend) {
      return {
        success: false,
        error: `คูปอง "${cleanCode}" สามารถใช้ได้เมื่อมียอดสั่งซื้อขั้นต่ำ ฿${coupon.minSpend.toLocaleString()} (ยอดปัจจุบัน ฿${subtotal.toLocaleString()})`,
        code: 'MIN_SPEND_NOT_MET',
      };
    }

    if (coupon.discountType === 'fixed') {
      discountTotal = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'percent') {
      const computed = (subtotal * coupon.discountValue) / 100;
      discountTotal = coupon.maxDiscount ? Math.min(computed, coupon.maxDiscount) : computed;
    }

    appliedCoupon = {
      code: coupon.code,
      description: coupon.description,
      discountAmount: discountTotal,
    };
  }

  // Shipping Calculation: Free above ฿1,000
  const shippingFee = subtotal >= 1000 ? 0 : 60;
  const finalPayable = Math.max(0, subtotal - discountTotal + shippingFee);

  // Installment Schedule
  const validInstallmentMonths = [3, 6, 10, 24].includes(installmentMonths) ? installmentMonths : 10;
  const installmentSchedule = {
    months: validInstallmentMonths,
    monthlyPayment: Math.ceil(finalPayable / validInstallmentMonths),
    interestRate: 0.0,
  };

  // Generate signed checkout token
  const quoteId = `quote-${crypto.randomBytes(8).toString('hex')}`;
  const expiresEpoch = Date.now() + 15 * 60 * 1000; // 15 mins expiry
  const expiresAt = new Date(expiresEpoch).toISOString();

  const tokenPayload = `${quoteId}|${finalPayable}|${expiresEpoch}`;
  const signature = crypto
    .createHmac('sha256', COMMERCE_HMAC_SECRET)
    .update(tokenPayload)
    .digest('hex');
  const token = `${tokenPayload}|${signature}`;

  const quote: CheckoutQuote = {
    quoteId,
    token,
    expiresAt,
    items: validatedItems,
    subtotal,
    discountTotal,
    shippingFee,
    finalPayable,
    appliedCoupon,
    installmentSchedule,
  };

  QUOTE_CACHE.set(quoteId, quote);
  return { success: true, quote };
}

/**
 * Validates checkout token authenticity and expiration.
 */
export function verifyCheckoutToken(token: string): { valid: boolean; quoteId?: string; finalPayable?: number; error?: string } {
  if (!token) return { valid: false, error: 'Missing checkout token' };

  const parts = token.split('|');
  if (parts.length !== 4) return { valid: false, error: 'Malformed checkout token' };

  const [quoteId, finalPayableStr, expiresEpochStr, signature] = parts;
  const tokenPayload = `${quoteId}|${finalPayableStr}|${expiresEpochStr}`;
  const expectedSignature = crypto
    .createHmac('sha256', COMMERCE_HMAC_SECRET)
    .update(tokenPayload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid checkout signature (tampering detected)' };
  }

  const expiresEpoch = Number(expiresEpochStr);
  if (expiresEpoch < Date.now()) {
    return { valid: false, error: 'Checkout token has expired (exceeded 15 minutes)' };
  }

  return { valid: true, quoteId, finalPayable: Number(finalPayableStr) };
}

/**
 * Processes order creation atomically with idempotency protection.
 */
export function createOrderWithIdempotency(params: {
  idempotencyKey: string;
  token: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  paymentMethod: string;
  installmentMonths?: number;
}): { success: true; order: OrderRecord; idempotent: boolean } | { success: false; error: string; code: string } {
  const { idempotencyKey, token, customer, paymentMethod, installmentMonths } = params;

  if (!idempotencyKey || idempotencyKey.trim().length < 8) {
    return { success: false, error: 'Idempotency-Key header หรือพารามิเตอร์ไม่ถูกต้อง', code: 'INVALID_IDEMPOTENCY_KEY' };
  }

  // 1. Idempotency Check: return previously created order if already executed
  const existing = IDEMPOTENCY_CACHE.get(idempotencyKey);
  if (existing) {
    return {
      success: true,
      order: existing.order,
      idempotent: true,
    };
  }

  // 2. Token Verification
  const tokenCheck = verifyCheckoutToken(token);
  if (!tokenCheck.valid || !tokenCheck.quoteId) {
    return { success: false, error: tokenCheck.error || 'Token สั่งซื้อไม่ถูกต้อง', code: 'INVALID_TOKEN' };
  }

  // 3. Retrieve Quote
  const quote = QUOTE_CACHE.get(tokenCheck.quoteId);
  if (!quote) {
    return { success: false, error: 'ไม่พบข้อมูลใบเสนอราคา หรือใบเสนอราคาหมดอายุแล้ว', code: 'QUOTE_EXPIRED' };
  }

  // 4. Validate Customer
  if (!customer.name || !customer.phone) {
    return { success: false, error: 'กรุณาระบุชื่อและเบอร์โทรศัพท์ของผู้สั่งซื้อ', code: 'CUSTOMER_INFO_REQUIRED' };
  }

  // 5. Atomic Order Creation
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `MP-${todayStr}-${randomSuffix}`;

  const finalMonths = installmentMonths || quote.installmentSchedule?.months || 10;
  const monthlyPay = Math.ceil(quote.finalPayable / finalMonths);

  const order: OrderRecord = {
    orderId,
    idempotencyKey,
    quoteId: quote.quoteId,
    customer,
    paymentMethod: paymentMethod || 'installment_kbank',
    items: quote.items,
    subtotal: quote.subtotal,
    discountTotal: quote.discountTotal,
    shippingFee: quote.shippingFee,
    finalPayable: quote.finalPayable,
    installmentMonths: finalMonths,
    monthlyPayment: monthlyPay,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  // Save to cache for idempotency protection (24h TTL)
  IDEMPOTENCY_CACHE.set(idempotencyKey, { order, timestamp: Date.now() });

  return {
    success: true,
    order,
    idempotent: false,
  };
}
