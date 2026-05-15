import { generateMockTransactionHash, saveProofTransaction } from "@/lib/proofTransactionStore";

export type TransferStatus = "idle" | "connecting" | "connected" | "pending" | "received";

export interface IncomingPayment {
  id: string;
  amount: number;
  amountLabel: string;
  from: string;
  project: string;
  status: "Received" | "Pending";
  txHash: string;
  explorerUrl?: string;
  createdAtIso: string;
  displayTimestamp: string;
}

export interface MoneyMovementState {
  receiveAddress: string;
  incoming: IncomingPayment[];
  transferStatus: TransferStatus;
}

const STORAGE_KEY = "zila-money-movement";
const UPDATE_EVENT = "zila-money-movement-updated";
const DEFAULT_RECEIVE_ADDRESS = "zila-operating-balance-8K2D-44Q9";

function isBrowser() {
  return typeof window !== "undefined";
}

function defaultState(): MoneyMovementState {
  return {
    receiveAddress: DEFAULT_RECEIVE_ADDRESS,
    incoming: [],
    transferStatus: "idle",
  };
}

function safeParse(value: string | null): MoneyMovementState {
  if (!value) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(value) as Partial<MoneyMovementState>;
    return {
      receiveAddress: parsed.receiveAddress || DEFAULT_RECEIVE_ADDRESS,
      incoming: Array.isArray(parsed.incoming) ? parsed.incoming : [],
      transferStatus: parsed.transferStatus || "idle",
    };
  } catch {
    return defaultState();
  }
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function displayTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function saveState(state: MoneyMovementState) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: state }));
}

export function getMoneyMovementState(): MoneyMovementState {
  if (!isBrowser()) {
    return defaultState();
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function connectOperatingBalance() {
  const current = getMoneyMovementState();
  saveState({
    ...current,
    receiveAddress: current.receiveAddress || DEFAULT_RECEIVE_ADDRESS,
    transferStatus: "connected",
  });
}

export function getIncomingTotal() {
  return getMoneyMovementState().incoming
    .filter((payment) => payment.status === "Received")
    .reduce((total, payment) => total + payment.amount, 0);
}

export function simulateIncomingPayment(input?: Partial<Pick<IncomingPayment, "amount" | "from" | "project">>) {
  const current = getMoneyMovementState();
  const amount = input?.amount ?? 2000;
  const from = input?.from ?? "Atlas Client";
  const project = input?.project ?? "Atlas Project";
  const now = new Date();
  const txHash = `OPS-${generateMockTransactionHash()}`;
  const payment: IncomingPayment = {
    id: `incoming-${Date.now()}`,
    amount,
    amountLabel: formatCurrency(amount),
    from,
    project,
    status: "Received",
    txHash,
    explorerUrl: "#",
    createdAtIso: now.toISOString(),
    displayTimestamp: displayTimestamp(now),
  };

  saveState({
    ...current,
    transferStatus: "received",
    incoming: [payment, ...current.incoming].slice(0, 12),
  });

  saveProofTransaction({
    id: `proof-${payment.id}`,
    walletAddress: current.receiveAddress || DEFAULT_RECEIVE_ADDRESS,
    walletAddressShort: "Operating balance",
    status: "Confirmed",
    amountLabel: payment.amountLabel,
    amountValue: payment.amount,
    network: "XRPL Mainnet",
    linkedType: "project",
    linkedLabel: project,
    project,
    actionLabel: "received",
    contextLabel: `${payment.amountLabel} received from ${from}`,
    summary: `${payment.amountLabel} was received from ${from}, assigned to ${project}, and recorded as verified operational activity.`,
    hash: txHash,
    createdAtIso: payment.createdAtIso,
    displayTimestamp: payment.displayTimestamp,
  });

  return payment;
}

export function subscribeToMoneyMovement(onChange: () => void) {
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
