import type { PublicBranch } from './types';

const BRANCH_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164_PATTERN = /^\+[1-9][0-9]{7,14}$/;
const CONTROL_CHARACTERS_PATTERN = /[\u0000-\u001f\u007f-\u009f]/g;
const GOOGLE_MAPS_HOSTS = new Set([
  'google.com',
  'google.co.th',
  'maps.google.com',
  'maps.google.co.th',
]);

const MAX_SLUG_LENGTH = 120;
const MAX_URL_LENGTH = 2_048;
const MAX_OPENING_HOUR_ROWS = 14;

export interface PublishedBranchInput {
  id: unknown;
  slug: unknown;
  name: unknown;
  fullAddress: unknown;
  province: unknown;
  region: unknown;
  displayPhone: unknown;
  normalizedPhone: unknown;
  googleMapsUrl: unknown;
  imageUrl: unknown;
  imageAlt: unknown;
  openingHours: unknown;
  directions: unknown;
  publishedAt: unknown;
}

export type PublicBranchValidationResult =
  | { success: true; data: PublicBranch }
  | { success: false; reason: string };

export function normalizeBranchSlug(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const slug = value.trim().toLowerCase();

  if (
    slug.length === 0 ||
    slug.length > MAX_SLUG_LENGTH ||
    !BRANCH_SLUG_PATTERN.test(slug)
  ) {
    return null;
  }

  return slug;
}

export function createTelHref(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedPhone = value.trim();
  return E164_PATTERN.test(normalizedPhone) ? `tel:${normalizedPhone}` : null;
}

export function sanitizeGoogleMapsUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const candidate = value.trim();
  if (candidate.length === 0 || candidate.length > MAX_URL_LENGTH) {
    return null;
  }

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      url.port !== ''
    ) {
      return null;
    }

    const hostnameWithoutWww = hostname.startsWith('www.')
      ? hostname.slice(4)
      : hostname;
    const isMapsShortLink = hostnameWithoutWww === 'maps.app.goo.gl';
    const isLegacyShortLink =
      hostnameWithoutWww === 'goo.gl' &&
      (path === '/maps' || path.startsWith('/maps/'));
    const isGoogleMapsHost = isAllowedGoogleMapsHost(hostnameWithoutWww, path);

    if (!isMapsShortLink && !isLegacyShortLink && !isGoogleMapsHost) {
      return null;
    }

    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizePublicImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const candidate = value.trim();
  if (
    candidate.length === 0 ||
    candidate.length > MAX_URL_LENGTH ||
    candidate.includes('\\') ||
    CONTROL_CHARACTERS_PATTERN.test(candidate)
  ) {
    CONTROL_CHARACTERS_PATTERN.lastIndex = 0;
    return null;
  }
  CONTROL_CHARACTERS_PATTERN.lastIndex = 0;

  if (candidate.startsWith('/') && !candidate.startsWith('//')) {
    return candidate;
  }

  try {
    const url = new URL(candidate);
    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      url.port !== ''
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeOpeningHours(value: unknown): string[] {
  const rows = toOpeningHourRows(value);
  const result: string[] = [];

  for (const row of rows) {
    const formatted = formatOpeningHourRow(row);
    if (formatted && !result.includes(formatted)) {
      result.push(formatted);
    }

    if (result.length >= MAX_OPENING_HOUR_ROWS) {
      break;
    }
  }

  return result;
}

export function validatePublishedBranch(
  input: PublishedBranchInput
): PublicBranchValidationResult {
  const id = validateUuid(input.id);
  const slug = normalizeBranchSlug(input.slug);
  const name = sanitizeRequiredText(input.name, 255);
  const fullAddress = sanitizeRequiredText(input.fullAddress, 1_000);
  const province = sanitizeOptionalText(input.province, 120);
  const region = sanitizeOptionalText(input.region, 120);
  const displayPhone = sanitizeRequiredText(input.displayPhone, 60);
  const normalizedPhone =
    typeof input.normalizedPhone === 'string'
      ? input.normalizedPhone.trim()
      : null;
  const telHref = createTelHref(normalizedPhone);
  const googleMapsUrl = sanitizeGoogleMapsUrl(input.googleMapsUrl);
  const publishedAt = normalizeIsoTimestamp(input.publishedAt);

  if (!id) return invalid('invalid branch id');
  if (!slug) return invalid('invalid branch slug');
  if (!name) return invalid('invalid branch name');
  if (!fullAddress) return invalid('invalid branch address');
  if (!displayPhone) return invalid('invalid display phone');
  if (!normalizedPhone || !telHref) return invalid('invalid normalized phone');
  if (!googleMapsUrl) return invalid('invalid Google Maps URL');
  if (!publishedAt) return invalid('invalid publication timestamp');

  const imageUrl = sanitizePublicImageUrl(input.imageUrl);
  const imageAlt = imageUrl
    ? sanitizeOptionalText(input.imageAlt, 300)
    : null;

  return {
    success: true,
    data: {
      id,
      slug,
      name,
      fullAddress,
      province,
      region,
      displayPhone,
      normalizedPhone,
      telHref,
      googleMapsUrl,
      imageUrl,
      imageAlt,
      openingHours: normalizeOpeningHours(input.openingHours),
      directions: sanitizeOptionalText(input.directions, 1_000),
      publishedAt,
    },
  };
}

function isAllowedGoogleMapsHost(hostname: string, path: string): boolean {
  if (GOOGLE_MAPS_HOSTS.has(hostname) && hostname.startsWith('maps.')) {
    return true;
  }

  if (!GOOGLE_MAPS_HOSTS.has(hostname)) {
    return false;
  }

  return path === '/maps' || path.startsWith('/maps/');
}

function validateUuid(value: unknown): string | null {
  return typeof value === 'string' && UUID_PATTERN.test(value)
    ? value.toLowerCase()
    : null;
}

function sanitizeRequiredText(value: unknown, maxLength: number): string | null {
  const sanitized = sanitizeOptionalText(value, maxLength);
  return sanitized && sanitized.length > 0 ? sanitized : null;
}

function sanitizeOptionalText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const sanitized = value
    .replace(CONTROL_CHARACTERS_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFC');

  if (sanitized.length === 0 || sanitized.length > maxLength) {
    return null;
  }

  return sanitized;
}

function normalizeIsoTimestamp(value: unknown): string | null {
  if (
    typeof value !== 'string' ||
    value.length > 64 ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value)
  ) {
    return null;
  }

  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : null;
}

function toOpeningHourRows(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [value];
  }

  const usesStructuredKeys = [
    'label',
    'day',
    'days',
    'name',
    'hours',
    'time',
    'value',
    'open',
    'opens',
    'openTime',
    'close',
    'closes',
    'closeTime',
    'closed',
  ].some((key) => key in value);

  if (usesStructuredKeys) {
    return [value];
  }

  return Object.entries(value).map(([label, hours]) => ({ label, hours }));
}

function formatOpeningHourRow(value: unknown): string | null {
  if (typeof value === 'string') {
    return sanitizeOptionalText(value, 180);
  }

  if (!isRecord(value)) {
    return null;
  }

  const label = firstSafeText(value, ['label', 'day', 'days', 'name'], 80);
  const hours = firstSafeText(value, ['hours', 'time', 'value'], 100);
  const open = firstSafeText(value, ['open', 'opens', 'openTime'], 40);
  const close = firstSafeText(value, ['close', 'closes', 'closeTime'], 40);
  const closed = value.closed === true;

  if (label && closed) return `${label}: Closed`;
  if (label && hours) return `${label}: ${hours}`;
  if (label && open && close) return `${label}: ${open} - ${close}`;
  if (hours) return hours;
  if (open && close) return `${open} - ${close}`;

  return null;
}

function firstSafeText(
  record: Record<string, unknown>,
  keys: string[],
  maxLength: number
): string | null {
  for (const key of keys) {
    const value = sanitizeOptionalText(record[key], maxLength);
    if (value) return value;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalid(reason: string): PublicBranchValidationResult {
  return { success: false, reason };
}
