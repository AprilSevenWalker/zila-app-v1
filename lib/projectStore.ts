import type { Project } from "@/data/projects";

const PROJECTS_KEY = "zila-operational-projects";
const UPDATE_EVENT = "zila-operational-projects-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}

function currency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function numberFromStorage(key: string, fallback: number) {
  if (!isBrowser()) {
    return fallback;
  }

  const value = Number(window.localStorage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function makeProject(input: {
  id?: string;
  name: string;
  budget: number;
  template?: string;
  protectedTotal?: number;
  safeToSpend?: number;
  createdAtIso?: string;
}): Project {
  const protectedTotal = input.protectedTotal ?? Math.round(input.budget * 0.22);
  const safeToSpend = input.safeToSpend ?? Math.max(input.budget - protectedTotal, 0);
  const spent = Math.max(input.budget - safeToSpend - protectedTotal, 0);
  const id = input.id ?? `project-${slugify(input.name)}`;

  return {
    id,
    name: input.name,
    client: input.name,
    location: "Live workspace",
    category: "Project",
    stage: "Live setup",
    status: "Healthy",
    statusTone: "success",
    budget: currency(input.budget),
    spent: currency(spent),
    reserved: currency(protectedTotal),
    progress: 24,
    dueLabel: "New project live",
    cashNeeded: "$0",
    nextMilestone: "Connect first payout or reserve movement",
    owner: "Operations",
    verifiedDays: 1,
    updatedAt: "Created just now",
    insight: "New project is live. Payments, reserves, and proof records will sync here automatically.",
    stateSignal: "Live project ready for operational movement.",
    summary: `${input.name} is ready for payment coordination, reserve tracking, and verified operational proof.`,
    remaining: currency(safeToSpend),
    financialImpact: "No payout pressure yet. Operational activity will appear here as money moves.",
    zilaSays: "Start with the first supplier payout or reserve allocation to build verified operational memory.",
    zilaSuggestionShort: "Add first payment or reserve movement",
    nextMoveTitle: "Next move",
    nextMoveSummary: "Prepare the first operational payment",
    ifNoAction: "Project remains ready with no movement yet",
    ifActionTaken: "Payment, reserve, and proof state will sync automatically",
    primaryActionLabel: "Make Payment",
    secondaryActionLabel: "Review options",
    recentUpdates: [
      { label: "Project created", tone: "success" },
      { label: "Operational workspace ready", tone: "info" },
      { label: "Proof history ready", tone: "success" },
    ],
    suggestedActions: ["Make Payment", "Protect reserve"],
    lastVerifiedAction: "Project created · Just now · Ready",
    tasks: [
      { title: "Add first supplier or payee", due: "Today", status: "Ready now" },
      { title: "Prepare first payment", due: "Today", status: "Ready now" },
      { title: "Review reserve setup", due: "This week", status: "Prepared" },
    ],
    timeline: [
      { label: "Now", detail: "Project created and ready for operational movement" },
      { label: "Next", detail: "Connect a payment, reserve, or proof event" },
      { label: "Then", detail: "Zila keeps project state synced automatically" },
    ],
  };
}

function safeParseProjects(value: string | null): Project[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Project[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getOnboardingProject(): Project | null {
  if (!isBrowser()) {
    return null;
  }

  const name = window.localStorage.getItem("zila-first-project-name")?.trim();
  if (!name) {
    return null;
  }

  return makeProject({
    id: `project-${slugify(name)}`,
    name,
    template: window.localStorage.getItem("zila-first-project-template") || undefined,
    budget: numberFromStorage("zila-first-project-budget", 16000),
    protectedTotal: numberFromStorage("zila-first-project-protected-total", 3600),
    safeToSpend: numberFromStorage("zila-first-project-safe-to-spend", 9400),
  });
}

export function getStoredOperationalProjects() {
  if (!isBrowser()) {
    return [];
  }

  const projects = safeParseProjects(window.localStorage.getItem(PROJECTS_KEY));
  const onboardingProject = getOnboardingProject();
  const all = onboardingProject ? [onboardingProject, ...projects] : projects;
  const seen = new Set<string>();

  return all.filter((project) => {
    const key = project.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function mergeOperationalProjects(seedProjects: Project[]) {
  const stored = getStoredOperationalProjects();
  const seedNames = new Set(seedProjects.map((project) => project.name.toLowerCase()));
  const freshStored = stored.filter((project) => !seedNames.has(project.name.toLowerCase()));

  return [...freshStored, ...seedProjects];
}

export function getOperationalProjectById(seedProjects: Project[], id: string) {
  return mergeOperationalProjects(seedProjects).find((project) => project.id === id);
}

export function subscribeToOperationalProjects(onChange: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === PROJECTS_KEY || event.key.startsWith("zila-first-project-")) {
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
