'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearStaffAuth, getStaffAuth } from './staffAuth';

export type AdminRole = 'ADMIN' | 'HQ';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  phone?: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  otpProvider: 'SupabaseAuth' | 'ThaiBulkSMS' | 'Twilio' | 'AWS_SNS';
  otpExpirySeconds: number;
  otpCooldownSeconds: number;
  botProtectionEnabled: boolean;
  botProtectionSensitivity: 'Low' | 'Medium' | 'High';
  apiRateLimitPerMin: number;
  membershipEnabled: boolean;
  rewardsEnabled: boolean;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'ระบบกำลังปิดปรับปรุงชั่วคราวเพื่ออัปเกรดประสิทธิภาพ ขออภัยในความไม่สะดวก',
  otpProvider: 'SupabaseAuth',
  otpExpirySeconds: 300,
  otpCooldownSeconds: 60,
  botProtectionEnabled: true,
  botProtectionSensitivity: 'Medium',
  apiRateLimitPerMin: 120,
  membershipEnabled: true,
  rewardsEnabled: true,
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
  pcStaff: boolean;
  branchManager: boolean;
  hq: boolean;
  admin: boolean;
}

export const RBAC_MATRIX: RolePermissionRow[] = [
  {
    module: "Customer Frontend",
    description: "เรียกดูข้อมูลสาธารณะที่เผยแพร่แล้วและเข้าสู่ระบบตามประเภทบัญชี",
    customer: true,
    pcStaff: true,
    branchManager: true,
    hq: true,
    admin: true,
  },
  {
    module: "Application Queue",
    description: "ดูใบสมัครตามขอบเขตสาขาและสิทธิ์ที่บันทึกไว้",
    customer: false,
    pcStaff: false,
    branchManager: true,
    hq: true,
    admin: true,
  },
  {
    module: "Branch Drafts",
    description: "แก้ไขแบบร่างสาขาที่ได้รับมอบหมาย; การเผยแพร่เป็นสิทธิ์ส่วนกลาง",
    customer: false,
    pcStaff: false,
    branchManager: true,
    hq: true,
    admin: true,
  },
  {
    module: "CMS Draft & Preview",
    description: "แก้ไขและดูตัวอย่างแบบร่างเว็บไซต์โดยไม่กระทบข้อมูลสาธารณะ",
    customer: false,
    pcStaff: false,
    branchManager: false,
    hq: true,
    admin: true,
  },
  {
    module: "Global Publishing",
    description: "ตรวจสอบและเผยแพร่หน้า เนื้อหา ข้อเสนอ และสาขา",
    customer: false,
    pcStaff: false,
    branchManager: false,
    hq: true,
    admin: true,
  },
  {
    module: "User & Audit Administration",
    description: "จัดการบัญชีเจ้าหน้าที่ การมอบหมายสาขา และอ่านบันทึกตรวจสอบ",
    customer: false,
    pcStaff: false,
    branchManager: false,
    hq: true,
    admin: true,
  },
  {
    module: "System Secrets",
    description: "ตั้งค่าลับผ่านสภาพแวดล้อมการปรับใช้ ไม่เปิดเผยผ่านหน้าเว็บ",
    customer: false,
    pcStaff: false,
    branchManager: false,
    hq: false,
    admin: true,
  },
];

const SYSTEM_CONFIG_KEY = 'meepro_system_config_v1';

export async function getAdminAuth(): Promise<AdminUser | null> {
  const staff = await getStaffAuth();
  if (!staff || (staff.role !== 'ADMIN' && staff.role !== 'HQ')) return null;

  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,
    phone: staff.phone,
  };
}

export async function clearAdminAuth(): Promise<void> {
  await clearStaffAuth();
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
    let active = true;

    async function verifyAdmin() {
      const current = await getAdminAuth();
      if (!active) return;

      setAdmin(current);
      const isLoginPage = pathname === '/admin/login';
      if (!current && !isLoginPage) router.replace('/admin/login');
      else if (current && isLoginPage) router.replace('/admin/dashboard');
      setIsChecking(false);
    }

    void verifyAdmin();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { admin, isChecking };
}
