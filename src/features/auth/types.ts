export interface CustomerSessionUser {
  id: string;
  phone: string;
  e164: string;
  phoneVerified: boolean;
  contactName?: string | null;
  createdAt: string;
}

export interface OtpChallengeState {
  phone: string;
  e164: string;
  code: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  lastRequestedAt: number;
  verified: boolean;
}

export interface CustomerAuthPayload {
  userId: string;
  phone: string;
  e164: string;
  issuedAt: number;
  expiresAt: number;
}
