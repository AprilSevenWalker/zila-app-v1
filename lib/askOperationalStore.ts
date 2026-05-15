export interface AskOperationalUpdate {
  id: string;
  project: string;
  change: string;
  consequence: string;
  recommendation: string;
  pressureLevel: "Low" | "Watch" | "High";
  proofReference: string;
  amountLabel?: string | null;
  createdAtIso: string;
}

const STORAGE_KEY = "zila-ask-operational-updates";
const UPDATE_EVENT = "zila-ask-operational-updates-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse(value: string | null): AskOperationalUpdate[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Partial<AskOperationalUpdate>[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item.id && item.createdAtIso)
      .map((item) => ({
        id: item.id || `ask-update-${Date.now()}`,
        project: item.project || "Project Horizon",
        change: item.change || "Operational update recorded",
        consequence: item.consequence || "Operating context updated.",
        recommendation: item.recommendation || "Review next move.",
        pressureLevel: item.pressureLevel || "Watch",
        proofReference: item.proofReference || "OPS-ASK",
        amountLabel: item.amountLabel ?? null,
        createdAtIso: item.createdAtIso || new Date().toISOString(),
      }))
      .sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso));
  } catch {
    return [];
  }
}

export function getAskOperationalUpdates() {
  if (!isBrowser()) {
    return [];
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveAskOperationalUpdate(update: AskOperationalUpdate) {
  if (!isBrowser()) {
    return;
  }

  const next = [update, ...getAskOperationalUpdates().filter((item) => item.id !== update.id)].slice(0, 16);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: update }));
}

export function subscribeToAskOperationalUpdates(onChange: () => void) {
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
