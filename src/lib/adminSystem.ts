'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type AdminRole = 'ADMIN' | 'DEVELOPER';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  email: string;
  token: string;
}

export const DEMO_ADMIN_USERS: { [key: string]: { pin: string; user: AdminUser } } = {
  'admin01': {
    pin: '9999',
    user: {
      id: 'ADM-001',
      username: 'admin01',
      name: 'นรินทร์ ผู้ดูแลระบบ',
      role: 'ADMIN',
      email: 'narin.admin@meepro.co.th',
      token: 'adm_token_sec999',
    },
  },
  'dev01': {
    pin: '7777',
    user: {
      id: 'DEV-001',
      username: 'dev01',
      name: 'ภัทร วิศวกรระบบ',
      role: 'DEVELOPER',
      email: 'phat.dev@meepro.co.th',
      token: 'dev_token_eng777',
    },
  },
};

export interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  otpProvider: 'Mock' | 'ThaiBulkSMS' | 'Twilio' | 'AWS_SNS';
  otpExpirySeconds: number;
  otpCooldownSeconds: number;
  botProtectionEnabled: boolean;
  botProtectionSensitivity: 'Low' | 'Medium' | 'High';
  apiRateLimitPerMin: number;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'ระบบกำลังปิดปรับปรุงชั่วคราวเพื่ออัปเกรดประสิทธิภาพ ขออภัยในความไม่สะดวก',
  otpProvider: 'Mock',
  otpExpirySeconds: 300,
  otpCooldownSeconds: 60,
  botProtectionEnabled: true,
  botProtectionSensitivity: 'Medium',
  apiRateLimitPerMin: 120,
};

export interface SystemLogEntry {
  id: string;
  type: 'API' | 'WEBHOOK' | 'AUDIT' | 'ERROR';
  timestamp: string;
  source: string;
  message: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  ipAddress: string;
  metadata?: string;
}

export const INITIAL_LOGS: SystemLogEntry[] = [
  {
    id: "LOG-9012",
    type: "AUDIT",
    timestamp: "2026-09-21 15:10:45",
    source: "AuthService/OTP",
    message: "ลูกค้า 0891234567 ยืนยันรหัส OTP สำเร็จและยอมรับ PDPA v1.0",
    status: "SUCCESS",
    ipAddress: "172.16.4.100",
  },
  {
    id: "LOG-9011",
    type: "API",
    timestamp: "2026-09-21 15:08:12",
    source: "GET /api/v1/homepage/widgets",
    message: "ส่งข้อมูล Widget ทั้งหมด 7 รายการ (Latency: 18ms)",
    status: "SUCCESS",
    ipAddress: "172.16.4.100",
  },
  {
    id: "LOG-9010",
    type: "WEBHOOK",
    timestamp: "2026-09-21 14:55:01",
    source: "KBank/PaymentGateway",
    message: "รับผลการอนุมัติสัญญาผ่อน 0% เลขที่ INS-6901 ยอด ฿36,900",
    status: "SUCCESS",
    ipAddress: "203.144.144.12",
  },
  {
    id: "LOG-9009",
    type: "AUDIT",
    timestamp: "2026-09-21 14:40:22",
    source: "StaffPortal/CentralWorld",
    message: "เจ้าหน้าที่ staff01 ทำการบันทึกหมายเหตุการให้คำปรึกษาลูกค้า CUST-10029",
    status: "SUCCESS",
    ipAddress: "192.168.10.45",
  },
  {
    id: "LOG-9008",
    type: "ERROR",
    timestamp: "2026-09-21 14:15:30",
    source: "NotificationWorker",
    message: "SMS Gateway timeout (retry attempt 1/3 succeeded)",
    status: "WARNING",
    ipAddress: "10.0.4.12",
  },
];

export interface RolePermissionRow {
  module: string;
  description: string;
  customer: boolean;
  staff: boolean;
  manager: boolean;
  admin: boolean;
  developer: boolean;
}

export const RBAC_MATRIX: RolePermissionRow[] = [
  {
    module: "Customer Frontend",
    description: "เข้าชมสินค้า แคตตาล็อก โปรโมชั่น สาขา และยืนยันตัวตน OTP",
    customer: true,
    staff: true,
    manager: true,
    admin: true,
    developer: true,
  },
  {
    module: "Customer Lookup (CRM)",
    description: "ค้นหาข้อมูลลูกค้า ตรวจสอบสัญญาผ่อน และประวัติการยืนยันเบอร์",
    customer: false,
    staff: true,
    manager: true,
    admin: true,
    developer: true,
  },
  {
    module: "Homepage Builder",
    description: "จัดเรียงลำดับ Widget เปิด/ปิด และแก้ไขชื่อหัวข้อหน้าแรก",
    customer: false,
    staff: false,
    manager: true,
    admin: true,
    developer: true,
  },
  {
    module: "Banner Publishing",
    description: "สร้าง แก้ไข และกำหนดเวลาเผยแพร่แคมเปญแบนเนอร์",
    customer: false,
    staff: false,
    manager: true,
    admin: true,
    developer: true,
  },
  {
    module: "System Configuration",
    description: "ตั้งค่า OTP Gateway, Bot Protection และโหมดปิดปรับปรุงระบบ",
    customer: false,
    staff: false,
    manager: false,
    admin: true,
    developer: true,
  },
  {
    module: "Observability Logs",
    description: "ตรวจสอบ API Logs, Webhook Logs, Error Logs และ Audit Trail",
    customer: false,
    staff: false,
    manager: false,
    admin: true,
    developer: true,
  },
  {
    module: "Database & Secrets",
    description: "จัดการ Database Connection, API Keys และ Encryption Keys",
    customer: false,
    staff: false,
    manager: false,
    admin: false,
    developer: true,
  },
];

const ADMIN_AUTH_KEY = 'meepro_admin_session_v1';
const SYSTEM_CONFIG_KEY = 'meepro_system_config_v1';

export function getAdminAuth(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminAuth(user: AdminUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set admin session:', e);
  }
}

export function clearAdminAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function getSystemConfig(): SystemConfig {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_CONFIG;
  try {
    const raw = localStorage.getItem(SYSTEM_CONFIG_KEY);
    if (!raw) return DEFAULT_SYSTEM_CONFIG;
    return JSON.parse(raw) as SystemConfig;
  } catch {
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export function saveSystemConfig(cfg: SystemConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save system config:', e);
  }
}

export function useAdminGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const current = getAdminAuth();
    setAdmin(current);

    const isLoginPage = pathname === '/admin/login';

    if (!current && !isLoginPage) {
      router.replace('/admin/login');
    } else if (current && isLoginPage) {
      router.replace('/admin/dashboard');
    }

    setIsChecking(false);
  }, [pathname, router]);

  return { admin, isChecking };
}
