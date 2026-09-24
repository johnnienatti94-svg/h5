import type { ApplicationStatus, PublicApplication } from '@/features/applications/types';

export type StaffRole = 'PC_STAFF' | 'BRANCH_MANAGER' | 'HQ' | 'ADMIN';

export interface StaffUser {
  id: string;
  name: string;
  role: StaffRole;
  branchId?: string;
  phone?: string;
}

export interface StaffInternalNote {
  id: string;
  applicationId: string;
  staffUserId: string;
  staffName: string;
  note: string;
  createdAt: string;
}

export interface StaffApplicationFilter {
  status?: ApplicationStatus | 'ALL';
  branchId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface StaffApplicationListResult {
  applications: PublicApplication[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}
