import type { ProofTimelineItem } from "@/data/proof";

export type ProofTransactionStatus = "Pending" | "Confirmed";
export type ProofLinkedType = "project" | "payment";

export interface StoredProofTransaction {
  id: string;
  walletAddress: string;
  walletAddressShort: string;
  status: ProofTransactionStatus;
  amountLabel: string;
  amountValue: number;
  network: "XRPL Mainnet";
  linkedType: ProofLinkedType;
  linkedLabel: string;
  project: string;
  actionLabel: string;
  contextLabel: string;
  summary: string;
  hash: string;
  createdAtIso: string;
  displayTimestamp: string;
}

const STORAGE_KEY = "zila-proof-transactions";
const UPDATE_EVENT = "zila-proof-transactions-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParseTransactions(value: string | null): StoredProofTransaction[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as StoredProofTransaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoredProofTransactions(): StoredProofTransaction[] {
  if (!isBrowser()) {
    return [];
  }

  return safeParseTransactions(window.localStorage.getItem(STORAGE_KEY)).sort((left, right) =>
    right.createdAtIso.localeCompare(left.createdAtIso),
  );
}

export function saveProofTransaction(transaction: StoredProofTransaction) {
  if (!isBrowser()) {
    return;
  }

  const existing = getStoredProofTransactions().filter((item) => item.id !== transaction.id);
  const next = [transaction, ...existing].slice(0, 12);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: transaction }));
}

export function subscribeToProofTransactions(onChange: () => void) {
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

export function shortenWalletAddress(address: string) {
  if (address.length <= 8) {
    return address;
  }

  return `${address.slice(0, 2)}...${address.slice(-3)}`;
}

export function formatTransactionHash(hash: string) {
  const compact = hash.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (compact.length < 12) {
    return hash.toUpperCase();
  }

  return `XRPL-${compact.slice(0, 4)}-${compact.slice(4, 8)}-${compact.slice(8, 12)}`;
}

function toRelativeDay(createdAtIso: string): "Today" | "Yesterday" {
  const createdAt = new Date(createdAtIso);
  const today = new Date();

  const createdDay = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayDifference = Math.round((currentDay - createdDay) / 86400000);

  return dayDifference <= 0 ? "Today" : "Yesterday";
}

export function storedTransactionToTimelineItem(transaction: StoredProofTransaction): ProofTimelineItem {
  const linkedLabel = transaction.linkedType === "project" ? `Project: ${transaction.linkedLabel}` : `Payment action: ${transaction.linkedLabel}`;
  const timelineStatus = transaction.status === "Confirmed" ? "Verified" : transaction.status;

  return {
    id: transaction.id,
    day: toRelativeDay(transaction.createdAtIso),
    action: `${transaction.amountLabel} ${transaction.actionLabel}`,
    context: transaction.contextLabel,
    status: timelineStatus,
    timestamp: transaction.displayTimestamp,
    summary: transaction.summary,
    project: transaction.project,
    before: linkedLabel,
    after: `${transaction.network} · Wallet ${transaction.walletAddressShort}`,
    xrplReference: formatTransactionHash(transaction.hash),
  };
}

export function generateMockWalletAddress() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `rXAMAN7${suffix}9P4K2`;
}

export function generateMockTransactionHash() {
  const alphabet = "ABCDEF0123456789";
  return Array.from({ length: 12 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}
