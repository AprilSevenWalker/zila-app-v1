export interface PaymentDraft {
  projectId: string;
  projectName: string;
  amountValue: number;
  amountLabel: string;
  paymentType: string;
  recipientName?: string;
  currency?: string;
  paymentRail?: string;
  notes?: string;
  selectedAction: "full-payment" | "recommended-partial";
  sourceLabel: string;
  availableBalanceLabel: string;
}

const STORAGE_KEY = "zila-payment-draft";
const UPDATE_EVENT = "zila-payment-draft-updated";

const defaultDraft: PaymentDraft = {
  projectId: "project-horizon",
  projectName: "Project Horizon",
  amountValue: 0,
  amountLabel: "$0",
  paymentType: "Supplier payment",
  recipientName: "",
  currency: "XRP",
  paymentRail: "Stablecoin",
  notes: "",
  selectedAction: "full-payment",
  sourceLabel: "Available balance",
  availableBalanceLabel: "$42,300",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeAmount(value: unknown) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.round(numeric);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function safeParse(value: string | null): PaymentDraft {
  if (!value) {
    return defaultDraft;
  }

  try {
    const parsed = JSON.parse(value) as Partial<PaymentDraft>;
    const legacyAutomatedDraft =
      parsed.recipientName === undefined &&
      parsed.currency === undefined &&
      parsed.paymentRail === undefined &&
      parsed.notes === undefined;
    const amountValue = legacyAutomatedDraft ? 0 : normalizeAmount(parsed.amountValue);

    return {
      projectId: parsed.projectId || defaultDraft.projectId,
      projectName: parsed.projectName || defaultDraft.projectName,
      amountValue,
      amountLabel: parsed.amountLabel || formatAmount(amountValue),
      paymentType: parsed.paymentType || defaultDraft.paymentType,
      recipientName: parsed.recipientName ?? defaultDraft.recipientName,
      currency: parsed.currency ?? defaultDraft.currency,
      paymentRail: parsed.paymentRail ?? defaultDraft.paymentRail,
      notes: parsed.notes ?? defaultDraft.notes,
      selectedAction: parsed.selectedAction || defaultDraft.selectedAction,
      sourceLabel: parsed.sourceLabel || defaultDraft.sourceLabel,
      availableBalanceLabel: parsed.availableBalanceLabel || defaultDraft.availableBalanceLabel,
    };
  } catch {
    return defaultDraft;
  }
}

export function getPaymentDraft() {
  if (!isBrowser()) {
    return defaultDraft;
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function savePaymentDraft(draft: Partial<PaymentDraft>) {
  if (!isBrowser()) {
    return;
  }

  const current = getPaymentDraft();
  const amountValue = normalizeAmount(draft.amountValue ?? current.amountValue);
  const next: PaymentDraft = {
    projectId: draft.projectId || current.projectId,
    projectName: draft.projectName || current.projectName,
    amountValue,
    amountLabel: draft.amountLabel || formatAmount(amountValue),
    paymentType: draft.paymentType || current.paymentType,
    recipientName: draft.recipientName ?? current.recipientName,
    currency: draft.currency ?? current.currency,
    paymentRail: draft.paymentRail ?? current.paymentRail,
    notes: draft.notes ?? current.notes,
    selectedAction: draft.selectedAction || current.selectedAction,
    sourceLabel: draft.sourceLabel || current.sourceLabel,
    availableBalanceLabel: draft.availableBalanceLabel || current.availableBalanceLabel,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: next }));
}

export function clearPaymentDraft() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function subscribeToPaymentDraft(onChange: () => void) {
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
