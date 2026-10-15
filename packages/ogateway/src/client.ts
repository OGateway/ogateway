import type { MomoCollectionRequest, Transaction, VerifyResponse } from './types';

export class OGatewayApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'OGatewayApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function post<T>(url: string, publicKey: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: publicKey,
    },
    body: JSON.stringify(body),
  });
  const data = await parseBody(res);
  if (!res.ok) {
    throw new OGatewayApiError(
      data?.message || data?.error || `Request failed with status ${res.status}`,
      res.status,
      data,
    );
  }
  return data as T;
}

export interface OGatewayClient {
  initiateMomo(body: MomoCollectionRequest): Promise<Transaction>;
  submitOtp(id: string, otp: string): Promise<Transaction>;
  resendOtp(id: string): Promise<Transaction>;
  verify(id: string): Promise<VerifyResponse>;
}

export function createClient(apiBaseUrl: string, publicKey: string): OGatewayClient {
  const base = apiBaseUrl.replace(/\/$/, '');

  return {
    initiateMomo: (body) => post<Transaction>(`${base}/collections/mobilemoney`, publicKey, body),
    submitOtp: (id, otp) => post<Transaction>(`${base}/collections/otp`, publicKey, { id, otp }),
    resendOtp: (id) => post<Transaction>(`${base}/collections/otp/resend`, publicKey, { id }),
    verify: async (id) => {
      const res = await fetch(`${base}/transactions/verify/${id}`);
      const data = await parseBody(res);
      if (!res.ok) {
        throw new OGatewayApiError(
          data?.message || data?.error || `Verify failed with status ${res.status}`,
          res.status,
          data,
        );
      }
      return data as VerifyResponse;
    },
  };
}
