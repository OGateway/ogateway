import { type FormEvent, useEffect, useState } from 'react';
import { useOGCollect } from './useOGCollect';
import type { Currency, Transaction } from './types';
import { Button } from './components/ui/button';
import { Input, Select } from './components/ui/input';
import { OtpInput } from './components/ui/otp-input';
import { SuccessIcon, FailureIcon } from './components/ui/status-icon';
import { cn } from './lib/cn';

const NETWORKS = ['MTN', 'VODAFONE', 'AIRTELTIGO'];
const RESEND_SECONDS = 60;

export interface OGCollectProps {
  /** The business's publishable key. Never pass a secret key here. */
  publicKey: string;
  /** Base URL of the OGateway API to collect against, e.g. https://api.ogateway.co */
  apiBaseUrl: string;
  amount: number;
  currency: Currency;
  reason?: string;
  /** Pre-fill and lock a field instead of asking the payer for it. */
  network?: string;
  accountNumber?: string;
  accountName?: string;
  buttonLabel?: string;
  className?: string;
  onSuccess?: (transaction: Transaction) => void;
  onFailed?: (transaction: Transaction | null, error?: string) => void;
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function OGCollect(props: OGCollectProps) {
  const {
    publicKey,
    apiBaseUrl,
    amount,
    currency,
    reason = 'Payment',
    network: fixedNetwork,
    accountNumber: fixedAccountNumber,
    accountName: fixedAccountName,
    buttonLabel = 'Pay now',
    className,
    onSuccess,
    onFailed,
  } = props;

  const { stage, transaction, error, initiate, submitOtp, resendOtp, reset } = useOGCollect({
    publicKey,
    apiBaseUrl,
    onSuccess,
    onFailed,
  });

  const [network, setNetwork] = useState(fixedNetwork ?? NETWORKS[0]);
  const [accountNumber, setAccountNumber] = useState(fixedAccountNumber ?? '');
  const [accountName, setAccountName] = useState(fixedAccountName ?? '');
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (stage !== 'otp_required') return;
    setResendIn(RESEND_SECONDS);
    const timer = setInterval(() => setResendIn(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [stage]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void initiate({
      amount,
      currency,
      network,
      accountNumber,
      accountName,
      reason,
    }).catch(() => {});
  };

  const handleOtp = (event: FormEvent) => {
    event.preventDefault();
    void submitOtp(otp).catch(() => {});
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    void resendOtp().catch(() => {});
  };

  return (
    <div
      className={cn(
        'og-collect box-border w-full max-w-105 rounded-og-2xl border border-og-border bg-og-bg p-6 font-og-sans text-og-secondary',
        className,
      )}>
      <div className="mb-6">
        <div className="text-xs font-medium text-og-muted-foreground">{reason}</div>
        <div className="mt-1 text-2xl font-semibold text-og-secondary">{formatAmount(amount, currency)}</div>
      </div>

      {stage === 'success' && (
        <div className="flex flex-col items-center py-4 text-center">
          <SuccessIcon className="size-16" />
          <div className="mt-4 text-lg font-semibold text-og-secondary">Payment successful</div>
          {transaction?.id && <div className="mt-1 text-sm text-og-muted-foreground">Ref {transaction.id}</div>}
        </div>
      )}

      {stage === 'failed' && (
        <div className="flex flex-col items-center py-4 text-center">
          <FailureIcon className="size-16" />
          <div className="mt-4 text-lg font-semibold text-og-secondary">Payment failed</div>
          <div className="mt-1 text-sm text-og-muted-foreground">{error ?? 'Something went wrong.'}</div>
          <Button variant="outline" className="mt-6 w-full" onClick={reset}>
            Try again
          </Button>
        </div>
      )}

      {(stage === 'otp_required' || stage === 'verifying_otp') && (
        <form onSubmit={handleOtp} className="flex flex-col gap-5">
          <div>
            <div className="text-sm text-og-secondary">Enter the code sent to</div>
            <div className="text-sm font-medium text-og-secondary">{accountNumber}</div>
          </div>
          <OtpInput length={6} value={otp} onChange={setOtp} disabled={stage === 'verifying_otp'} autoFocus />
          {error && <div className="text-sm text-og-destructive">{error}</div>}
          <Button type="submit" className="w-full" loading={stage === 'verifying_otp'} disabled={otp.length < 4}>
            Confirm
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendIn > 0}
            className="og-resend box-border text-sm font-medium text-og-primary disabled:text-og-muted-foreground disabled:cursor-not-allowed">
            {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
          </button>
          {currency === 'GHS' && (
            <div className="text-center text-xs text-og-muted-foreground">
              Didn't get the SMS? Dial <span className="font-medium text-og-secondary">*928*01#</span> on {accountNumber} to see your code.
            </div>
          )}
        </form>
      )}

      {stage === 'polling' && (
        <div className="flex flex-col items-center py-8 text-center">
          <svg className="size-8 animate-spin text-og-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <div className="mt-4 text-sm text-og-muted-foreground">Waiting for confirmation…</div>
        </div>
      )}

      {(stage === 'idle' || stage === 'submitting') && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!fixedNetwork && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-og-secondary">Network</label>
              <Select value={network} onChange={e => setNetwork(e.target.value)}>
                {NETWORKS.map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {!fixedAccountNumber && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-og-secondary">Mobile number</label>
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="024 123 4567" required />
            </div>
          )}
          {!fixedAccountName && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-og-secondary">Account name</label>
              <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Full name on the account" required />
            </div>
          )}
          {error && <div className="text-sm text-og-destructive">{error}</div>}
          <Button type="submit" className="mt-2 w-full" loading={stage === 'submitting'}>
            {buttonLabel}
          </Button>
        </form>
      )}
    </div>
  );
}
