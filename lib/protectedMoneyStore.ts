import type { ProofTimelineItem } from "@/data/proof";
import { getIncomingTotal } from "@/lib/moneyMovementStore";
import { getOutgoingPaymentTotal } from "@/lib/paymentTransactionStore";
import { buildXrplExplorerUrl, formatTransactionHash, generateMockTransactionHash } from "@/lib/proofTransactionStore";

export const TOTAL_BALANCE = 84320;
export const BASE_PROTECTED = 24220;
export const COMMITTED = 18900;

export type ReserveCategory =
  | "Tax"
  | "Payroll"
  | "Supplier"
  | "Emergency"
  | "Project Reserve"
  | "Travel"
  | "Equipment";

export interface ProtectedReserve {
  id: string;
  name: string;
  amount: number;
  category: ReserveCategory;
  linkedProject?: string;
  createdAtIso: string;
}

export interface ReserveActivity {
  id: string;
  action: string;
  context: string;
  amount: number;
  reserveName: string;
  linkedProject?: string;
  summary: string;
  insight: string;
  protectedAmountAfter: number;
  safeToSpendAfter: number;
  transactionState: "Prepared" | "Recorded";
  txHash: string;
  explorerUrl: string;
  createdAtIso: string;
}

interface ProtectedMoneyState {
  reserves: ProtectedReserve[];
  activity: ReserveActivity[];
}

const STORAGE_KEY = "zila-protected-money";
const UPDATE_EVENT = "zila-protected-money-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function defaultState(): ProtectedMoneyState {
  return {
    reserves: [],
    activity: [],
  };
}

function safeParse(value: string | null): ProtectedMoneyState {
  if (!value) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(value) as Partial<ProtectedMoneyState>;
    return {
      reserves: Array.isArray(parsed.reserves) ? parsed.reserves : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    };
  } catch {
    return defaultState();
  }
}

function saveState(state: ProtectedMoneyState) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: state }));
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function timestampLabel(createdAtIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAtIso));
}

function buildInsight(category: ReserveCategory, reserveName: string, linkedProject?: string) {
  if (linkedProject) {
    return `This reserve keeps ${linkedProject} within a safer operating range.`;
  }

  if (category === "Supplier") {
    return "Protecting supplier funds reduced upcoming payment pressure.";
  }

  if (category === "Payroll") {
    return "You've set aside enough for this week's payroll commitments.";
  }

  if (category === "Tax") {
    return "Tax money is now separated before everyday spending decisions.";
  }

  if (category === "Emergency") {
    return "This reserve gives the business more room to absorb unexpected pressure.";
  }

  return `${reserveName} is now protected and Safe to Spend has been recalculated.`;
}

function calculateSummaryWithReserves(reserves: ProtectedReserve[]) {
  const totalBalance = TOTAL_BALANCE + getIncomingTotal() - getOutgoingPaymentTotal();
  const extraProtected = reserves.reduce((total, reserve) => total + reserve.amount, 0);
  const protectedAmount = BASE_PROTECTED + extraProtected;
  const safeToSpend = Math.max(totalBalance - protectedAmount - COMMITTED, 0);

  return {
    totalBalance,
    protectedAmount,
    committedAmount: COMMITTED,
    safeToSpend,
  };
}

function toRelativeDay(createdAtIso: string): "Today" | "Yesterday" {
  const createdAt = new Date(createdAtIso);
  const today = new Date();
  const createdDay = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return Math.round((currentDay - createdDay) / 86400000) <= 0 ? "Today" : "Yesterday";
}

export function getProtectedMoneyState(): ProtectedMoneyState {
  if (!isBrowser()) {
    return defaultState();
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function getProtectedMoneySummary() {
  const state = getProtectedMoneyState();
  const summary = calculateSummaryWithReserves(state.reserves);

  return {
    ...state,
    ...summary,
  };
}

export function createReserve(input: {
  name: string;
  amount: number;
  category: ReserveCategory;
  linkedProject?: string;
}) {
  const createdAtIso = new Date().toISOString();
  const cleanName = input.name.trim() || `${input.category} reserve`;
  const current = getProtectedMoneyState();
  const reserve: ProtectedReserve = {
    id: `reserve-${Date.now()}`,
    name: cleanName,
    amount: input.amount,
    category: input.category,
    linkedProject: input.linkedProject?.trim() || undefined,
    createdAtIso,
  };
  const nextReserves = [reserve, ...current.reserves];
  const nextSummary = calculateSummaryWithReserves(nextReserves);
  const txHash = generateMockTransactionHash();
  const activity: ReserveActivity = {
    id: `reserve-activity-${Date.now()}`,
    action: `${input.category} reserve created`,
    context: `${formatCurrency(input.amount)} moved into ${cleanName}`,
    amount: input.amount,
    reserveName: cleanName,
    linkedProject: reserve.linkedProject,
    summary: `Protected balance updated to ${formatCurrency(nextSummary.protectedAmount)} and Safe to Spend recalculated to ${formatCurrency(nextSummary.safeToSpend)} after ${formatCurrency(input.amount)} moved into ${cleanName}.`,
    insight: buildInsight(input.category, cleanName, reserve.linkedProject),
    protectedAmountAfter: nextSummary.protectedAmount,
    safeToSpendAfter: nextSummary.safeToSpend,
    transactionState: "Prepared",
    txHash,
    explorerUrl: buildXrplExplorerUrl(txHash),
    createdAtIso,
  };

  saveState({
    reserves: nextReserves,
    activity: [activity, ...current.activity].slice(0, 16),
  });

  return { reserve, activity };
}

export function releaseReserveAmount(reserveId: string, amount: number) {
  const current = getProtectedMoneyState();
  const reserve = current.reserves.find((item) => item.id === reserveId);

  if (!reserve || amount <= 0) {
    return;
  }

  const releaseAmount = Math.min(amount, reserve.amount);
  const nextReserves = current.reserves
    .map((item) => (item.id === reserveId ? { ...item, amount: item.amount - releaseAmount } : item))
    .filter((item) => item.amount > 0);
  const createdAtIso = new Date().toISOString();
  const nextSummary = calculateSummaryWithReserves(nextReserves);
  const txHash = generateMockTransactionHash();
  const activity: ReserveActivity = {
    id: `reserve-activity-${Date.now()}`,
    action: "Protected money released",
    context: `${formatCurrency(releaseAmount)} moved from ${reserve.name} to available balance`,
    amount: releaseAmount,
    reserveName: reserve.name,
    linkedProject: reserve.linkedProject,
    summary: `Safe to Spend recalculated to ${formatCurrency(nextSummary.safeToSpend)} after ${formatCurrency(releaseAmount)} moved from ${reserve.name} to available balance.`,
    insight: `${reserve.name} was released back to available balance and operating range was updated.`,
    protectedAmountAfter: nextSummary.protectedAmount,
    safeToSpendAfter: nextSummary.safeToSpend,
    transactionState: "Recorded",
    txHash,
    explorerUrl: buildXrplExplorerUrl(txHash),
    createdAtIso,
  };

  saveState({
    reserves: nextReserves,
    activity: [activity, ...current.activity].slice(0, 16),
  });
}

export function useReserveForPayment(input: {
  reserveId: string;
  amount: number;
  paymentLabel: string;
  projectName: string;
  recipientName: string;
}) {
  const current = getProtectedMoneyState();
  const reserve = current.reserves.find((item) => item.id === input.reserveId);

  if (!reserve || input.amount <= 0) {
    return null;
  }

  const usedAmount = Math.min(input.amount, reserve.amount);
  const nextReserves = current.reserves
    .map((item) => (item.id === reserve.id ? { ...item, amount: item.amount - usedAmount } : item))
    .filter((item) => item.amount > 0);
  const createdAtIso = new Date().toISOString();
  const nextSummary = calculateSummaryWithReserves(nextReserves);
  const txHash = generateMockTransactionHash();
  const activity: ReserveActivity = {
    id: `reserve-activity-${Date.now()}`,
    action: "Reserve allocation used",
    context: `${formatCurrency(usedAmount)} used from ${reserve.name} for ${input.recipientName}`,
    amount: usedAmount,
    reserveName: reserve.name,
    linkedProject: reserve.linkedProject ?? input.projectName,
    summary: `${reserve.name} supported ${input.paymentLabel}. Protected balance updated to ${formatCurrency(nextSummary.protectedAmount)} and Safe to Spend is ${formatCurrency(nextSummary.safeToSpend)}.`,
    insight: `You can proceed safely using ${reserve.name}.`,
    protectedAmountAfter: nextSummary.protectedAmount,
    safeToSpendAfter: nextSummary.safeToSpend,
    transactionState: "Recorded",
    txHash,
    explorerUrl: buildXrplExplorerUrl(txHash),
    createdAtIso,
  };

  saveState({
    reserves: nextReserves,
    activity: [activity, ...current.activity].slice(0, 16),
  });

  return activity;
}

export function recordPaymentReserveRecalculation(input: {
  amount: number;
  amountLabel: string;
  projectName: string;
  recipientName: string;
  txHash: string;
  reserveAfterLabel?: string;
  runwayAfterLabel?: string;
}) {
  const current = getProtectedMoneyState();
  const createdAtIso = new Date().toISOString();
  const nextSummary = calculateSummaryWithReserves(current.reserves);
  const activity: ReserveActivity = {
    id: `payment-reserve-${input.txHash}`,
    action: "Reserve and runway recalculated",
    context: `${input.amountLabel} supplier payout completed for ${input.recipientName}`,
    amount: input.amount,
    reserveName: "Protected supplier reserve",
    linkedProject: input.projectName,
    summary: `Protected reserve remains ${input.reserveAfterLabel ?? formatCurrency(nextSummary.protectedAmount)} after the payout. Runway updated to ${input.runwayAfterLabel ?? "current operating range"}.`,
    insight: `${input.projectName} stayed coordinated after the supplier obligation cleared.`,
    protectedAmountAfter: nextSummary.protectedAmount,
    safeToSpendAfter: nextSummary.safeToSpend,
    transactionState: "Recorded",
    txHash: input.txHash,
    explorerUrl: buildXrplExplorerUrl(input.txHash),
    createdAtIso,
  };

  saveState({
    reserves: current.reserves,
    activity: [activity, ...current.activity.filter((item) => item.id !== activity.id)].slice(0, 16),
  });

  return activity;
}

export function protectedMoneyActivityToTimelineItem(activity: ReserveActivity): ProofTimelineItem {
  const txHash = activity.txHash ?? "OPERATIONSRESERVE";
  const protectedAmountAfter = activity.protectedAmountAfter ?? getProtectedMoneySummary().protectedAmount;
  const safeToSpendAfter = activity.safeToSpendAfter ?? getProtectedMoneySummary().safeToSpend;

  return {
    id: activity.id,
    day: toRelativeDay(activity.createdAtIso),
    action: activity.action,
    context: activity.context,
    status: activity.transactionState ?? "Recorded",
    timestamp: timestampLabel(activity.createdAtIso),
    summary: activity.summary,
    project: activity.linkedProject ?? activity.reserveName,
    before: "Available balance",
    after: `Protected ${formatCurrency(protectedAmountAfter)} · Safe ${formatCurrency(safeToSpendAfter)}`,
    xrplReference: formatTransactionHash(txHash),
    txid: txHash,
    xrplExplorerUrl: activity.explorerUrl ?? buildXrplExplorerUrl(txHash),
  };
}

export function subscribeToProtectedMoney(onChange: () => void) {
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
