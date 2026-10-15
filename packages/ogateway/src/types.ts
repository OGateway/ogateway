// Mirrors the OGateway API's transaction status values and the currencies
// it currently allows for momo collections.
export type TrxStatus = 'INITIATED' | 'FAILED' | 'COMPLETED' | 'CANCELLED' | 'OTP' | 'RECONCILE' | 'REVERSED';

export type Currency = 'GHS' | 'XOF' | 'XAF' | 'KES' | 'UGX' | 'TZS' | 'ZMW';

export interface MomoCollectionRequest {
  amount: number;
  currency: Currency;
  network: string;
  accountNumber: string;
  accountName: string;
  reason: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  email?: string;
}

// The shape of the OGateway API's transaction record, as returned flat
// (not wrapped) by POST /collections/mobilemoney, /collections/otp and
// /collections/otp/resend.
export interface Transaction {
  id: string;
  status: TrxStatus;
  amount?: number;
  currency?: string;
  reference?: string;
  [key: string]: unknown;
}

export interface VerifyResponse {
  status: TrxStatus;
  retryStatus: TrxStatus | null;
  provider?: string;
  message?: string;
  payment: Transaction;
}

export type CollectStage = 'idle' | 'submitting' | 'otp_required' | 'verifying_otp' | 'polling' | 'success' | 'failed';

export interface CollectState {
  stage: CollectStage;
  transaction: Transaction | null;
  error: string | null;
}
