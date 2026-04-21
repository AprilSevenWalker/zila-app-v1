export interface MoneySourceState {
  connected: boolean;
  sourceLabel: string;
  walletAddress: string;
  walletAddressShort: string;
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

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: state }));
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
