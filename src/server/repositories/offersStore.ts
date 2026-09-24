import 'server-only';

import { randomUUID } from 'crypto';

export interface OfferItem {
  id: string;
  name: string;
  planCode: string;
  months: number;
  interestRateAnnual: number;
  isZeroPercent: boolean;
  effectiveFrom: string; // ISO datetime
  effectiveUntil?: string | null; // ISO datetime
  minPriceBaht?: number;
  description: string;
  badge?: string;
  isActive: boolean;
}

export type OfferStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export interface OfferWithStatus extends OfferItem {
  status: OfferStatus;
  statusLabel: string;
}

const DEFAULT_OFFERS_INIT: OfferItem[] = [
  {
    id: 'off-001',
    name: 'ผ่อน 0% นาน 3 เดือน สบายกระเป๋า',
    planCode: 'ZERO_3M_V1',
    months: 3,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: '2026-12-31T23:59:59Z',
    minPriceBaht: 3000,
    description: 'ดอกเบี้ย 0% สำหรับยอดสั่งซื้อตั้งแต่ ฿3,000 ขึ้นไป',
    badge: 'ยอดนิยม',
    isActive: true,
  },
  {
    id: 'off-002',
    name: 'ผ่อน 0% นาน 6 เดือน ยอดนิยม',
    planCode: 'ZERO_6M_V1',
    months: 6,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: '2026-12-31T23:59:59Z',
    minPriceBaht: 5000,
    description: 'โปรโมชั่นร่วมกับพันธมิตรบัตรและสินเชื่อดิจิทัล',
    badge: 'แนะนำ',
    isActive: true,
  },
  {
    id: 'off-003',
    name: 'ผ่อน 0% นาน 10 เดือน สำหรับรุ่นเรือธง',
    planCode: 'ZERO_10M_V1',
    months: 10,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: '2026-12-31T23:59:59Z',
    minPriceBaht: 15000,
    description: 'ครอบคลุม iPhone 16 Pro, Galaxy S25 และแล็ปท็อปรุ่นที่ร่วมรายการ',
    badge: 'เรือธง 0%',
    isActive: true,
  },
  {
    id: 'off-004',
    name: 'ผ่อนยาว 24 เดือน ดอกเบี้ยพิเศษ 0.69%',
    planCode: 'EXTENDED_24M_V1',
    months: 24,
    interestRateAnnual: 8.28,
    isZeroPercent: false,
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: null,
    minPriceBaht: 10000,
    description: 'ค่างวดเริ่มต้นสบายๆ แบ่งเบาภาระค่าใช้จ่าย',
    badge: 'ผ่อนยาวสบาย',
    isActive: true,
  },
  {
    id: 'off-005',
    name: 'แคมเปญ 11.11 Mega Sale ผ่อน 0% 12 เดือน (ตั้งเวลาล่วงหน้า)',
    planCode: 'PROMO_1111_12M',
    months: 12,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-11-01T00:00:00Z',
    effectiveUntil: '2026-11-15T23:59:59Z',
    minPriceBaht: 12000,
    description: 'โปรโมชั่นเทศกาล 11.11 ตั้งค่าล่วงหน้า พร้อมรับคูปองเครดิตเงินคืน',
    badge: 'เร็วๆ นี้',
    isActive: true,
  },
];

const offerStore: Map<string, OfferItem> = new Map(
  DEFAULT_OFFERS_INIT.map((o) => [o.id, { ...o }])
);

export function computeOfferStatus(offer: OfferItem): { status: OfferStatus; statusLabel: string } {
  if (!offer.isActive) {
    return { status: 'disabled', statusLabel: 'ปิดใช้งาน' };
  }

  const now = Date.now();
  const start = new Date(offer.effectiveFrom).getTime();

  if (!isNaN(start) && now < start) {
    return { status: 'scheduled', statusLabel: 'ตั้งเวลาล่วงหน้า (Pre-created)' };
  }

  if (offer.effectiveUntil) {
    const end = new Date(offer.effectiveUntil).getTime();
    if (!isNaN(end) && now > end) {
      return { status: 'expired', statusLabel: 'หมดอายุแล้ว (Expired)' };
    }
  }

  return { status: 'active', statusLabel: 'ใช้งานอยู่ (Active)' };
}

export function getAllOffers(): OfferWithStatus[] {
  return Array.from(offerStore.values()).map((o) => {
    const { status, statusLabel } = computeOfferStatus(o);
    return { ...o, status, statusLabel };
  });
}

export function getOfferById(id: string): OfferWithStatus | null {
  const offer = offerStore.get(id);
  if (!offer) return null;
  const { status, statusLabel } = computeOfferStatus(offer);
  return { ...offer, status, statusLabel };
}

export interface CreateOfferInput {
  name: string;
  planCode?: string;
  months: number;
  interestRateAnnual: number;
  isZeroPercent?: boolean;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  minPriceBaht?: number;
  description: string;
  badge?: string;
  isActive?: boolean;
}

export function createOffer(input: CreateOfferInput): {
  success: boolean;
  offer?: OfferWithStatus;
  error?: string;
} {
  if (!input.name?.trim()) {
    return { success: false, error: 'กรุณาระบุชื่อโปรโมชั่น/ข้อเสนอ' };
  }

  const id = `off-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const months = Number(input.months) || 6;
  const interestRate = Number(input.interestRateAnnual) || 0;
  const isZeroPercent = input.isZeroPercent !== undefined ? input.isZeroPercent : interestRate === 0;

  const planCode = (
    input.planCode?.trim() ||
    (isZeroPercent ? `ZERO_${months}M_${Date.now().toString(36).toUpperCase()}` : `EXT_${months}M`)
  ).toUpperCase();

  const effectiveFrom = input.effectiveFrom
    ? new Date(input.effectiveFrom).toISOString()
    : new Date().toISOString();

  const effectiveUntil = input.effectiveUntil
    ? new Date(input.effectiveUntil).toISOString()
    : null;

  const newOffer: OfferItem = {
    id,
    name: input.name.trim(),
    planCode,
    months,
    interestRateAnnual: interestRate,
    isZeroPercent,
    effectiveFrom,
    effectiveUntil,
    minPriceBaht: Number(input.minPriceBaht) || 0,
    description: input.description?.trim() || '',
    badge: input.badge?.trim() || undefined,
    isActive: input.isActive !== undefined ? input.isActive : true,
  };

  offerStore.set(id, newOffer);
  const { status, statusLabel } = computeOfferStatus(newOffer);
  return { success: true, offer: { ...newOffer, status, statusLabel } };
}

export function updateOffer(
  id: string,
  input: Partial<CreateOfferInput>
): {
  success: boolean;
  offer?: OfferWithStatus;
  error?: string;
} {
  const existing = offerStore.get(id);
  if (!existing) {
    return { success: false, error: 'Offer not found' };
  }

  const months = input.months !== undefined ? Number(input.months) : existing.months;
  const interestRate =
    input.interestRateAnnual !== undefined
      ? Number(input.interestRateAnnual)
      : existing.interestRateAnnual;
  const isZeroPercent =
    input.isZeroPercent !== undefined
      ? input.isZeroPercent
      : interestRate === 0;

  let effectiveFrom = existing.effectiveFrom;
  if (input.effectiveFrom) {
    effectiveFrom = new Date(input.effectiveFrom).toISOString();
  }

  let effectiveUntil = existing.effectiveUntil;
  if (input.effectiveUntil !== undefined) {
    effectiveUntil = input.effectiveUntil ? new Date(input.effectiveUntil).toISOString() : null;
  }

  const updated: OfferItem = {
    id,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    planCode: input.planCode !== undefined ? input.planCode.trim().toUpperCase() : existing.planCode,
    months,
    interestRateAnnual: interestRate,
    isZeroPercent,
    effectiveFrom,
    effectiveUntil,
    minPriceBaht: input.minPriceBaht !== undefined ? Number(input.minPriceBaht) : existing.minPriceBaht,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    badge: input.badge !== undefined ? input.badge.trim() || undefined : existing.badge,
    isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
  };

  offerStore.set(id, updated);
  const { status, statusLabel } = computeOfferStatus(updated);
  return { success: true, offer: { ...updated, status, statusLabel } };
}

export function deleteOffer(id: string): { success: boolean; error?: string } {
  if (!offerStore.has(id)) {
    return { success: false, error: 'Offer not found' };
  }
  offerStore.delete(id);
  return { success: true };
}
