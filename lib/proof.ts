import type { ProofTimelineItem } from "@/data/proof";
import { buildXrplExplorerUrl, formatTransactionHash } from "@/lib/proofTransactionStore";

export interface OperationalProofRecord {
  id: string;
  projectName: string;
  supplier: string;
  paymentAmount: string;
  paymentRail: string;
  xrplTransactionHash: string;
  ledgerIndex?: number;
  timestamp: string;
  operationalCategory: string;
  reserveImpact: string;
  safeToSpendImpact: string;
}

const STORAGE_KEY = "zila-operational-proof-records";
const UPDATE_EVENT = "zila-operational-proof-records-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse(value: string | null): OperationalProofRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as OperationalProofRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function relativeDay(timestamp: string): "Today" | "Yesterday" {
  const created = new Date(timestamp);
  const now = new Date();
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return Math.round((currentDay - createdDay) / 86400000) <= 0 ? "Today" : "Yesterday";
}

export function createOperationalProofRecord(input: Omit<OperationalProofRecord, "id" | "timestamp"> & { timestamp?: string }) {
  return {
    ...input,
    id: `proof-${input.xrplTransactionHash || Date.now()}`,
    timestamp: input.timestamp || new Date().toISOString(),
  };
}

export function getOperationalProofRecords() {
  if (!isBrowser()) {
    return [];
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY)).sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export function saveOperationalProofRecord(record: OperationalProofRecord) {
  if (!isBrowser()) {
    return;
  }

  const existing = getOperationalProofRecords().filter((item) => item.id !== record.id);
  const next = [record, ...existing].slice(0, 24);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: record }));
}

export function subscribeToOperationalProofRecords(onChange: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onChange();
    }
  };
  const handleUpdate = () => onChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(UPDATE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
  };
}

export function operationalProofToTimelineItem(record: OperationalProofRecord): ProofTimelineItem {
  return {
    id: record.id,
    day: relativeDay(record.timestamp),
    action: `${record.paymentAmount} payout confirmed`,
    context: `${record.supplier} · ${record.projectName}`,
    status: "Verified on XRPL",
    timestamp: formatTime(record.timestamp),
    summary: `Verified operational activity: ${record.operationalCategory}. ${record.reserveImpact} ${record.safeToSpendImpact}`,
    project: record.projectName,
    before: `Rail: ${record.paymentRail}`,
    after: record.ledgerIndex ? `Ledger ${record.ledgerIndex}` : "Settlement confirmed",
    xrplReference: formatTransactionHash(record.xrplTransactionHash),
    txid: record.xrplTransactionHash,
    xrplExplorerUrl: buildXrplExplorerUrl(record.xrplTransactionHash),
  };
}
