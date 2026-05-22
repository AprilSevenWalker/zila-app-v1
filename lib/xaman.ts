import { XummSdk } from "xumm-sdk";
import { xrpToDrops } from "xrpl";

import { readServerEnv } from "@/lib/serverEnv";

type PaymentAmount =
  | string
  | {
      currency: string;
      issuer: string;
      value: string;
    };

export interface CreatePaymentPayloadInput {
  supplierName: string;
  amount: string | number;
  destinationAddress: string;
  projectId: string;
  projectName?: string;
  memo?: string;
  senderAddress?: string;
  currency?: string;
  issuer?: string;
  returnUrl?: {
    app: string;
    web: string;
  };
}

function readEnv(name: string, fallback?: string) {
  return readServerEnv(name, fallback);
}

function requireEnv(name: string, fallback?: string) {
  const value = readEnv(name, fallback);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}${fallback ? ` or ${fallback}` : ""}`);
  }

  return value;
}

function normalizeNetwork() {
  const network = process.env.XRPL_NETWORK?.trim().toUpperCase();
  return network === "TESTNET" ? "TESTNET" : "MAINNET";
}

function normalizePaymentAmount(input: CreatePaymentPayloadInput): PaymentAmount {
  const currency = input.currency?.trim().toUpperCase() || "XRP";
  const numericAmount = typeof input.amount === "number" ? input.amount : Number(input.amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Payment amount must be a positive number.");
  }

  if (currency === "XRP") {
    return xrpToDrops(String(numericAmount));
  }

  if (!input.issuer) {
    throw new Error("Issued stablecoin payments require an issuer address.");
  }

  return {
    currency,
    issuer: input.issuer,
    value: String(input.amount),
  };
}

function encodeMemo(memo: string) {
  return Buffer.from(memo, "utf8").toString("hex").toUpperCase();
}

export function getXamanSdk() {
  return new XummSdk(requireEnv("XUMM_API_KEY", "XAMAN_API_KEY"), requireEnv("XUMM_API_SECRET", "XAMAN_API_SECRET"));
}

export async function createPaymentPayload(input: CreatePaymentPayloadInput) {
  if (!input.destinationAddress?.trim()) {
    throw new Error("Supplier destination address is required.");
  }

  const sdk = getXamanSdk();
  const memo = input.memo?.trim() || `${input.supplierName} payout for ${input.projectName || input.projectId}`;
  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: input.destinationAddress.trim(),
    Amount: normalizePaymentAmount(input),
    Memos: [
      {
        Memo: {
          MemoType: encodeMemo("Zila operational payout"),
          MemoData: encodeMemo(memo),
        },
      },
    ],
  };

  if (input.senderAddress?.trim()) {
    txjson.Account = input.senderAddress.trim();
  }

  const payloadBody = {
    txjson,
    options: {
      force_network: normalizeNetwork(),
      return_url: input.returnUrl,
    },
    custom_meta: {
      identifier: `zila-payment-${input.projectId}-${Date.now()}`,
      instruction: `Approve ${input.supplierName} payout for ${input.projectName || input.projectId}.`,
      blob: {
        supplierName: input.supplierName,
        projectId: input.projectId,
        projectName: input.projectName,
        destinationAddress: input.destinationAddress,
        memo,
        currency: input.currency?.trim().toUpperCase() || "XRP",
      },
    },
  };
  const payload = await sdk.payload.create(payloadBody as unknown as Parameters<typeof sdk.payload.create>[0]);

  if (!payload) {
    throw new Error("Unable to create Xaman payment request.");
  }

  return payload;
}

export async function getPayload(uuid: string) {
  const sdk = getXamanSdk();
  return sdk.payload.get(uuid, true);
}

export async function getTransactionStatus(uuid: string) {
  const payload = await getPayload(uuid);

  if (!payload) {
    return null;
  }

  return {
    payload,
    signed: Boolean(payload.meta?.signed),
    rejected: payload.meta?.signed === false || Boolean(payload.meta?.cancelled || payload.meta?.expired),
    txHash: payload.response?.txid || null,
    account: payload.response?.account || null,
    resolvedAt: payload.response?.resolved_at || null,
  };
}
