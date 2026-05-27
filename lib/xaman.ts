import { XummSdk } from "xumm-sdk";
import { xrpToDrops } from "xrpl";

import { readServerEnv } from "@/lib/serverEnv";

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

interface XamanPayloadResponse {
  uuid: string;
  refs: {
    qr_png: string;
    websocket_status: string;
  };
  next: {
    always: string;
  };
  response?: {
    txid?: string;
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
  const network = readEnv("XRPL_NETWORK")?.trim().toUpperCase();
  return network === "TESTNET" ? "TESTNET" : "MAINNET";
}

function normalizeXrpAmount(input: CreatePaymentPayloadInput) {
  const currency = input.currency?.trim().toUpperCase() || "XRP";
  const numericAmount = typeof input.amount === "number" ? input.amount : Number(input.amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Payment amount must be a positive number.");
  }

  if (currency !== "XRP") {
    throw new Error("Use XRP for the first Xaman payout test. Stablecoin support comes later.");
  }

  return xrpToDrops(String(numericAmount));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Xaman payment request error.";
}

function summarizeAddress(address?: string) {
  const trimmed = address?.trim();
  if (!trimmed) {
    return null;
  }

  return `${trimmed.slice(0, 6)}...${trimmed.slice(-6)}`;
}

function getPayloadLogContext(input: CreatePaymentPayloadInput, txjson: Record<string, unknown>) {
  return {
    network: normalizeNetwork(),
    transactionType: txjson.TransactionType,
    destinationAddress: summarizeAddress(input.destinationAddress),
    senderAddress: summarizeAddress(input.senderAddress),
    amount: txjson.Amount,
    currency: input.currency?.trim().toUpperCase() || "XRP",
  };
}

export function getXamanSdk() {
  return new XummSdk(requireEnv("XUMM_API_KEY", "XAMAN_API_KEY"), requireEnv("XUMM_API_SECRET", "XAMAN_API_SECRET"));
}

async function readXamanResponse(response: Response) {
  const text = await response.text();

  try {
    return {
      raw: text,
      body: JSON.parse(text) as Record<string, unknown>,
    };
  } catch {
    return {
      raw: text,
      body: null,
    };
  }
}

function getXamanApiMessage(body: Record<string, unknown> | null, fallback: string) {
  if (!body) {
    return fallback;
  }

  if (typeof body.message === "string") {
    return body.message;
  }

  if (typeof body.error === "string") {
    return body.error;
  }

  if (body.error && typeof body.error === "object") {
    const error = body.error as Record<string, unknown>;
    const code = typeof error.code === "number" || typeof error.code === "string" ? `Error code ${error.code}` : "Xaman API error";
    const reference = typeof error.reference === "string" ? `, reference: ${error.reference}` : "";
    const message = typeof error.message === "string" ? `: ${error.message}` : "";

    return `${code}${reference}${message}`;
  }

  return fallback;
}

export async function createPaymentPayload(input: CreatePaymentPayloadInput) {
  if (!input.destinationAddress?.trim()) {
    throw new Error("Supplier destination address is required.");
  }

  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: input.destinationAddress.trim(),
    Amount: normalizeXrpAmount(input),
  };

  const payloadBody = {
    txjson,
  };

  console.log("Xaman txjson", txjson);

  try {
    const response = await fetch("https://xumm.app/api/v1/platform/payload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": requireEnv("XUMM_API_KEY", "XAMAN_API_KEY"),
        "x-api-secret": requireEnv("XUMM_API_SECRET", "XAMAN_API_SECRET"),
      },
      body: JSON.stringify(payloadBody),
    });
    const xamanResponse = await readXamanResponse(response);

    if (!response.ok || !xamanResponse.body || !("next" in xamanResponse.body)) {
      console.error("Xaman payload API response", {
        status: response.status,
        response: xamanResponse.body ?? xamanResponse.raw,
        payload: getPayloadLogContext(input, txjson),
      });
      throw new Error(getXamanApiMessage(xamanResponse.body, `Xaman API returned HTTP ${response.status}.`));
    }

    return xamanResponse.body as unknown as XamanPayloadResponse;
  } catch (error) {
    console.error("Xaman payment payload request failed", {
      error: getErrorMessage(error),
      payload: getPayloadLogContext(input, txjson),
    });
    throw error;
  }
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
