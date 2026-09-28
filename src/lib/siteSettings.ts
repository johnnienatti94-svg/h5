'use client';

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  hotline: string;
  lineOfficialId: string;
  facebookUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  primaryColor: string;
  secondaryColor: string;
  loginPrimaryColor: string;
  loginSecondaryColor: string;
  loginBgColor: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'มีโปรโฟน',
  logoUrl: '/logo.jpg',
  hotline: '02-000-0000',
  lineOfficialId: '@meepro',
  facebookUrl: 'https://facebook.com/meeprooficial',
  defaultSeoTitle: 'MeePro — ผ่อนสมาร์ตโฟน 0% ดอกเบี้ยพิเศษ อนุมัติไวใน 3 นาที',
  defaultSeoDescription:
    'บริการผ่อนมือถือและแกดเจ็ตแท้ศูนย์ไทย ไม่ต้องมีบัตรเครดิต 45 สาขาทั่วประเทศ พร้อมบริการ Trade-in แลกเครื่องเก่าเป็นเงินสด',
  primaryColor: '#FF6E00',
  secondaryColor: '#007ACC',
  loginPrimaryColor: '#FF6E00',
  loginSecondaryColor: '#007ACC',
  loginBgColor: '#F8FAFC',
};

export const SITE_SETTINGS_STORAGE_KEY = 'meepro_site_settings_v1';

export function getClientSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const stored = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Fallback
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveClientSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const current = getClientSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('meepro_site_settings_updated'));
    return updated;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
