import 'server-only';

import { randomUUID } from 'crypto';
import type { PublicBranch } from '@/features/branches/types';
import { DEV_BRANCH_FIXTURES } from '@/server/fixtures/devBranches';
import { validatePublishedBranch } from '@/features/branches/validation';

// In-memory persistent store initialized with fixtures
const branchStore: Map<string, PublicBranch> = new Map(
  DEV_BRANCH_FIXTURES.map((b) => [b.id, { ...b }])
);

export function normalizeThaiPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('66')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+66${digits.substring(1)}`;
  }
  return `+66${digits}`;
}

export function getAllBranches(): PublicBranch[] {
  return Array.from(branchStore.values());
}

export function getBranchById(id: string): PublicBranch | null {
  return branchStore.get(id) || null;
}

export function getBranchBySlug(slug: string): PublicBranch | null {
  const normalized = slug.trim().toLowerCase();
  for (const branch of branchStore.values()) {
    if (branch.slug.toLowerCase() === normalized) {
      return branch;
    }
  }
  return null;
}

export interface CreateBranchInput {
  name: string;
  slug?: string;
  fullAddress: string;
  province?: string;
  region?: string;
  displayPhone: string;
  googleMapsUrl?: string;
  openingHours?: string | string[];
  directions?: string;
}

export function createBranch(input: CreateBranchInput): {
  success: boolean;
  branch?: PublicBranch;
  error?: string;
} {
  const id = randomUUID();
  const slug = (
    input.slug ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    `store-${Date.now().toString(36)}`
  )
    .trim()
    .toLowerCase();

  // Check unique slug
  if (getBranchBySlug(slug)) {
    return { success: false, error: `Slug "${slug}" already exists.` };
  }

  const normalizedPhone = normalizeThaiPhone(input.displayPhone);
  const mapsUrl = input.googleMapsUrl?.startsWith('http')
    ? input.googleMapsUrl
    : `https://maps.google.com/?q=${encodeURIComponent(input.name + ' ' + (input.fullAddress || ''))}`;

  const hours = Array.isArray(input.openingHours)
    ? input.openingHours
    : [input.openingHours || 'ทุกวัน 10:00 - 21:00 น.'];

  const rawBranch = {
    id,
    slug,
    name: input.name.trim(),
    fullAddress: input.fullAddress.trim(),
    province: input.province?.trim() || 'กรุงเทพมหานคร',
    region: input.region?.trim() || 'กรุงเทพฯ',
    displayPhone: input.displayPhone.trim(),
    normalizedPhone,
    telHref: `tel:${normalizedPhone}`,
    googleMapsUrl: mapsUrl,
    imageUrl: null,
    imageAlt: input.name.trim(),
    openingHours: hours,
    directions: input.directions?.trim() || null,
    publishedAt: new Date().toISOString(),
  };

  const validation = validatePublishedBranch(rawBranch);
  if (!validation.success) {
    return { success: false, error: validation.reason };
  }

  branchStore.set(id, validation.data);
  return { success: true, branch: validation.data };
}

export function updateBranch(
  id: string,
  input: Partial<CreateBranchInput>
): {
  success: boolean;
  branch?: PublicBranch;
  error?: string;
} {
  const existing = branchStore.get(id);
  if (!existing) {
    return { success: false, error: 'Branch not found' };
  }

  let slug = existing.slug;
  if (input.slug && input.slug.trim()) {
    slug = input.slug.trim().toLowerCase();
    const existingWithSlug = getBranchBySlug(slug);
    if (existingWithSlug && existingWithSlug.id !== id) {
      return { success: false, error: `Slug "${slug}" is already used by another branch.` };
    }
  }

  const displayPhone = input.displayPhone !== undefined ? input.displayPhone.trim() : existing.displayPhone;
  const normalizedPhone = input.displayPhone !== undefined ? normalizeThaiPhone(displayPhone) : existing.normalizedPhone;

  let mapsUrl = existing.googleMapsUrl;
  if (input.googleMapsUrl !== undefined) {
    mapsUrl = input.googleMapsUrl.startsWith('http')
      ? input.googleMapsUrl
      : `https://maps.google.com/?q=${encodeURIComponent((input.name || existing.name) + ' ' + (input.fullAddress || existing.fullAddress))}`;
  }

  let hours = existing.openingHours;
  if (input.openingHours !== undefined) {
    hours = Array.isArray(input.openingHours) ? input.openingHours : [input.openingHours];
  }

  const rawBranch = {
    id,
    slug,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    fullAddress: input.fullAddress !== undefined ? input.fullAddress.trim() : existing.fullAddress,
    province: input.province !== undefined ? input.province.trim() : existing.province,
    region: input.region !== undefined ? input.region.trim() : existing.region,
    displayPhone,
    normalizedPhone,
    telHref: `tel:${normalizedPhone}`,
    googleMapsUrl: mapsUrl,
    imageUrl: existing.imageUrl,
    imageAlt: input.name !== undefined ? input.name.trim() : existing.imageAlt,
    openingHours: hours,
    directions: input.directions !== undefined ? input.directions.trim() : existing.directions,
    publishedAt: existing.publishedAt,
  };

  const validation = validatePublishedBranch(rawBranch);
  if (!validation.success) {
    return { success: false, error: validation.reason };
  }

  branchStore.set(id, validation.data);
  return { success: true, branch: validation.data };
}

export function deleteBranch(id: string): { success: boolean; error?: string } {
  if (!branchStore.has(id)) {
    return { success: false, error: 'Branch not found' };
  }
  branchStore.delete(id);
  return { success: true };
}
