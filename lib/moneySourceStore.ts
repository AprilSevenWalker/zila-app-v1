export interface MoneySourceState {
  connected: boolean;
  sourceLabel: string;
  walletAddress: string;
  walletAddressShort: string;
  status?: "not-connected" | "connecting" | "connected" | "ready" | "payment-pending" | "transaction-confirmed";
  network?: string;
  proofEnabled?: boolean;
  connectedAtIso?: string;
}

const STORAGE_KEY = "zila-money-source";
const UPDATE_EVENT = "zila-money-source-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function defaultState(): MoneySourceState {
  return {
    connected: false,
    sourceLabel: "Stable balance",
    walletAddress: "",
    walletAddressShort: "",
    status: "not-connected",
    network: "XRPL Mainnet",
    proofEnabled: false,
  };
}

function safeParse(value: string | null): MoneySourceState {
  if (!value) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(value) as Partial<MoneySourceState>;
    return {
      connected: Boolean(parsed.connected),
      sourceLabel: parsed.sourceLabel || "Stable balance",
      walletAddress: parsed.walletAddress || "",
      walletAddressShort: parsed.walletAddressShort || "",
      status: parsed.status || (parsed.connected ? "ready" : "not-connected"),
      network: parsed.network || "XRPL Mainnet",
      proofEnabled: parsed.proofEnabled ?? Boolean(parsed.connected),
      connectedAtIso: parsed.connectedAtIso,
    };
  } catch {
    return defaultState();
  }
}

export function getMoneySourceState(): MoneySourceState {
  if (!isBrowser()) {
    return defaultState();
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveMoneySourceState(state: MoneySourceState) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...state,
    status: state.status || (state.connected ? "ready" : "not-connected"),
    network: state.network || "XRPL Mainnet",
    proofEnabled: state.proofEnabled ?? state.connected,
    connectedAtIso: state.connectedAtIso || (state.connected ? new Date().toISOString() : undefined),
  }));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: state }));
}

export function disconnectMoneySource() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function subscribeToMoneySource(onChange: () => void) {
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
