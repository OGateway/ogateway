import { type FormEvent, useState } from 'react';
import { useOGCollect } from './useOGCollect';
import type { Currency, Transaction } from './types';

const NETWORKS = ['MTN', 'VODAFONE', 'AIRTELTIGO'];

export interface OGCollectProps {
  /** The business's publishable key. Never pass a secret key here. */
  publicKey: string;
  /** Base URL of the og-api instance to collect against, e.g. https://api.ogateway.co */
  apiBaseUrl: string;
  amount: number;
  currency: Currency;
  reason?: string;
  /** Pre-fill and lock a field instead of asking the payer for it. */
  network?: string;
  accountNumber?: string;
  accountName?: string;
  buttonLabel?: string;
  onSuccess?: (transaction: Transaction) => void;
  onFailed?: (transaction: Transaction | null, error?: string) => void;
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void initiate({ amount, currency, network, accountNumber, accountName, reason }).catch(() => {
      // surfaced via `error` state; swallow here so React doesn't log an unhandled rejection
    });
  };

  const handleOtp = (event: FormEvent) => {
    event.preventDefault();
    void submitOtp(otp).catch(() => {});
  };

  if (stage === 'success') {
    return (
      <div className="ogc-status ogc-success">
        Payment successful{transaction?.id ? ` — ref ${transaction.id}` : ''}.
      </div>
    );
  }

  if (stage === 'failed') {
    return (
      <div className="ogc-status ogc-failed">
        <p>{error ?? 'Payment failed.'}</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </div>
    );
  }

  if (stage === 'otp_required' || stage === 'verifying_otp') {
    return (
      <form onSubmit={handleOtp} className="ogc-form">
        <label>
          Enter the code sent to {accountNumber}
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </label>
        {error && <p className="ogc-error">{error}</p>}
        <button type="submit" disabled={stage === 'verifying_otp'}>
          {stage === 'verifying_otp' ? 'Verifying…' : 'Confirm'}
        </button>
        <button type="button" onClick={() => void resendOtp().catch(() => {})}>
          Resend code
        </button>
      </form>
    );
  }

  if (stage === 'polling') {
    return <div className="ogc-status">Waiting for confirmation…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="ogc-form">
      {!fixedNetwork && (
        <label>
          Network
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      {!fixedAccountNumber && (
        <label>
          Mobile number
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
        </label>
      )}
      {!fixedAccountName && (
        <label>
          Account name
          <input value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
        </label>
      )}
      {error && <p className="ogc-error">{error}</p>}
      <button type="submit" disabled={stage === 'submitting'}>
        {stage === 'submitting' ? 'Processing…' : buttonLabel}
      </button>
    </form>
  );
}
