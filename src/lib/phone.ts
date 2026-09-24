export interface ThaiPhoneNumber {
  national: string;
  e164: string;
}

export function normalizeThaiPhone(value: unknown): ThaiPhoneNumber | null {
  if (typeof value !== 'string') return null;

  const compact = value.trim().replace(/[\s()-]/g, '');
  let national: string;

  if (/^0[0-9]{9}$/.test(compact)) {
    national = compact;
  } else if (/^\+66[0-9]{9}$/.test(compact)) {
    national = `0${compact.slice(3)}`;
  } else if (/^66[0-9]{9}$/.test(compact)) {
    national = `0${compact.slice(2)}`;
  } else {
    return null;
  }

  return { national, e164: `+66${national.slice(1)}` };
}

export function formatThaiPhone(national: string): string {
  return /^0[0-9]{9}$/.test(national)
    ? `${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`
    : national;
}
