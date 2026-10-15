import { useCallback, useRef, useState } from 'react';
import { createClient } from './client';
import type { CollectState, MomoCollectionRequest, Transaction, TrxStatus } from './types';

export interface UseOGCollectOptions {
  publicKey: string;
  apiBaseUrl: string;
  /** How often to poll /transactions/verify after a momo debit is submitted. Default 3000ms. */
  pollIntervalMs?: number;
  /** How long to keep polling before giving up. Default 120000ms (2 minutes). */
  pollTimeoutMs?: number;
  onSuccess?: (transaction: Transaction) => void;
  onFailed?: (transaction: Transaction | null, error?: string) => void;
}

const TERMINAL_STATUSES = new Set<TrxStatus>(['COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED']);

function genReference(): string {
  return `ogc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useOGCollect(options: UseOGCollectOptions) {
  const { publicKey, apiBaseUrl, pollIntervalMs = 3000, pollTimeoutMs = 120_000, onSuccess, onFailed } = options;

  const client = useRef(createClient(apiBaseUrl, publicKey)).current;
  const [state, setState] = useState<CollectState>({ stage: 'idle', transaction: null, error: null });

  const pollHandle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollDeadline = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollHandle.current) {
      clearTimeout(pollHandle.current);
      pollHandle.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (id: string) => {
      pollDeadline.current = Date.now() + pollTimeoutMs;

      const tick = async () => {
        try {
          const result = await client.verify(id);
          const transaction = result.payment ?? ({ id, status: result.status } as Transaction);

          if (TERMINAL_STATUSES.has(result.status)) {
            stopPolling();
            if (result.status === 'COMPLETED') {
              setState({ stage: 'success', transaction, error: null });
              onSuccess?.(transaction);
            } else {
              const error = `Transaction ${result.status.toLowerCase()}`;
              setState({ stage: 'failed', transaction, error });
              onFailed?.(transaction, error);
            }
            return;
          }

          setState({ stage: 'polling', transaction, error: null });
          if (Date.now() < pollDeadline.current) {
            pollHandle.current = setTimeout(tick, pollIntervalMs);
          } else {
            const error = 'Timed out waiting for payment confirmation';
            setState({ stage: 'failed', transaction, error });
            onFailed?.(transaction, error);
          }
        } catch (err) {
          if (Date.now() < pollDeadline.current) {
            pollHandle.current = setTimeout(tick, pollIntervalMs);
            return;
          }
          const message = err instanceof Error ? err.message : 'Failed to check transaction status';
          setState(prev => ({ ...prev, stage: 'failed', error: message }));
          onFailed?.(null, message);
        }
      };

      void tick();
    },
    [client, pollIntervalMs, pollTimeoutMs, onSuccess, onFailed, stopPolling],
  );

  const initiate = useCallback(
    async (payload: MomoCollectionRequest) => {
      stopPolling();
      setState({ stage: 'submitting', transaction: null, error: null });
      try {
        const transaction = await client.initiateMomo({
          reference: genReference(),
          ...payload,
        });

        if (transaction.status === 'OTP') {
          setState({ stage: 'otp_required', transaction, error: null });
        } else {
          setState({ stage: 'polling', transaction, error: null });
          pollStatus(transaction.id);
        }
        return transaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initiate collection';
        setState({ stage: 'failed', transaction: null, error: message });
        onFailed?.(null, message);
        throw err;
      }
    },
    [client, pollStatus, stopPolling, onFailed],
  );

  const submitOtp = useCallback(
    async (otp: string) => {
      const id = state.transaction?.id;
      if (!id) throw new Error('No pending transaction to verify an OTP for');

      setState(prev => ({ ...prev, stage: 'verifying_otp', error: null }));
      try {
        const transaction = await client.submitOtp(id, otp);
        setState({ stage: 'polling', transaction, error: null });
        pollStatus(transaction.id);
        return transaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to verify OTP';
        setState(prev => ({ ...prev, stage: 'otp_required', error: message }));
        throw err;
      }
    },
    [client, pollStatus, state.transaction],
  );

  const resendOtp = useCallback(async () => {
    const id = state.transaction?.id;
    if (!id) throw new Error('No pending transaction to resend an OTP for');
    await client.resendOtp(id);
  }, [client, state.transaction]);

  const reset = useCallback(() => {
    stopPolling();
    setState({ stage: 'idle', transaction: null, error: null });
  }, [stopPolling]);

  return { ...state, initiate, submitOtp, resendOtp, reset };
}
