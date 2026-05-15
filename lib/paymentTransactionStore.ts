export interface LatestPaymentTransaction {
  txid: string;
  amountLabel: string;
  amountValue: number;
  projectName: string;
  recipientName?: string;
  sourceLabel?: string;
  paymentReason?: string;
  movementType?: PaymentMovementType;
  verificationState?: "Prepared" | "Verified";
  transferStatus?: "Processing" | "Completed";
  walletAddress: string;
  network: "XRPL Mainnet";
  createdAtIso: string;
}

export type PaymentMovementType = "incoming" | "outgoing" | "reserve-transfer" | "operational-movement";

export interface PaymentMovementRecord {
  id: string;
  type: PaymentMovementType;
  title: string;
  amountLabel: string;
  amountValue: number;
  status: "Prepared" | "Completed" | "Verified";
  project: string;
  sourceLabel: string;
  recipientName?: string;
  reason?: string;
  txHash: string;
  explorerUrl: string;
  createdAtIso: string;
}

const STORAGE_KEY = "zila-latest-payment-transaction";
const HISTORY_STORAGE_KEY = "zila-payment-movement-history";
const UPDATE_EVENT = "zila-latest-payment-transaction-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse(value: string | null): LatestPaymentTransaction | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LatestPaymentTransaction>;

    if (!parsed.txid || !parsed.createdAtIso) {
      return null;
    }

    return {
      txid: parsed.txid,
      amountLabel: parsed.amountLabel || "",
      amountValue: Number(parsed.amountValue) || 0,
      projectName: parsed.projectName || "",
      recipientName: parsed.recipientName || undefined,
      sourceLabel: parsed.sourceLabel || undefined,
      paymentReason: parsed.paymentReason || undefined,
      movementType: parsed.movementType || "outgoing",
      verificationState: parsed.verificationState || "Verified",
      transferStatus: parsed.transferStatus || "Completed",
      walletAddress: parsed.walletAddress || "",
      network: "XRPL Mainnet",
      createdAtIso: parsed.createdAtIso,
    };
  } catch {
    return null;
  }
}

function safeParseHistory(value: string | null): PaymentMovementRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Partial<PaymentMovementRecord>[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((record) => record.id && record.createdAtIso)
      .map((record) => ({
        id: record.id || `movement-${Date.now()}`,
        type: record.type || "outgoing",
        title: record.title || "Operational movement",
        amountLabel: record.amountLabel || "",
        amountValue: Number(record.amountValue) || 0,
        status: record.status || "Completed",
        project: record.project || "General operations",
        sourceLabel: record.sourceLabel || "Available balance",
        recipientName: record.recipientName || undefined,
        reason: record.reason || undefined,
        txHash: record.txHash || "",
        explorerUrl: record.explorerUrl || "",
        createdAtIso: record.createdAtIso || new Date().toISOString(),
      }))
      .sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso));
  } catch {
    return [];
  }
}

export function getLatestPaymentTransaction() {
  if (!isBrowser()) {
    return null;
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveLatestPaymentTransaction(transaction: LatestPaymentTransaction) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transaction));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: transaction }));
}

export function getPaymentMovementHistory() {
  if (!isBrowser()) {
    return [];
  }

  return safeParseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
}

export function savePaymentMovement(record: PaymentMovementRecord) {
  if (!isBrowser()) {
    return;
  }

  const existing = getPaymentMovementHistory().filter((item) => item.id !== record.id);
  const next = [record, ...existing].slice(0, 20);

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: record }));
}

export function getOutgoingPaymentTotal() {
  return getPaymentMovementHistory()
    .filter((record) => (record.type === "outgoing" || record.type === "operational-movement") && record.status !== "Prepared")
    .reduce((total, record) => total + record.amountValue, 0);
}

export function subscribeToLatestPaymentTransaction(onChange: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onChange();
    }
  };

  const handleUpdate = () => {
    onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(UPDATE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
  };
}
