import type { Project } from "@/data/projects";

const PROJECTS_KEY = "zila-operational-projects";
const OPERATIONAL_SUMMARY_KEY = "zila-onboarding-operational-summary";
const UPDATE_EVENT = "zila-operational-projects-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function isDemoWorkspace() {
  return isBrowser() && window.localStorage.getItem("zila-demo-mode") === "true";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}

function currency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function parseBudget(value?: string | number, fallback = 25000) {
  const amount = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : fallback;
}

function starterContextForStage(stage?: string, projectName = "this project") {
  if (stage === "Planning") {
    return {
      nextMilestone: "Create first supplier commitment",
      signal: `Create first supplier commitment for ${projectName}.`,
      action: "Add first commitment",
    };
  }
  if (stage === "Procurement") {
    return {
      nextMilestone: "Approve first supplier payment",
      signal: `${projectName} has procurement payments ready to structure.`,
      action: "Review supplier payout",
    };
  }
  if (stage === "Active") {
    return {
      nextMilestone: "Coordinate upcoming payout",
      signal: `Coordinate upcoming payout for ${projectName}.`,
      action: "Coordinate payout",
    };
  }
  if (stage === "Delivery") {
    return {
      nextMilestone: "Protect supplier reserve before final payment",
      signal: `Protect supplier reserve before final payment for ${projectName}.`,
      action: "Protect reserve",
    };
  }
  if (stage === "Completed") {
    return {
      nextMilestone: "Close out proof history",
      signal: `Prepare closeout proof history for ${projectName}.`,
      action: "Prepare closeout",
    };
  }

  return {
    nextMilestone: "Add first obligation",
    signal: `Add first obligation for ${projectName}.`,
    action: "Add first obligation",
  };
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
  stage?: string;
  protectedTotal?: number;
  committedTotal?: number;
  safeToSpend?: number;
  createdAtIso?: string;
}): Project {
  const protectedTotal = input.protectedTotal ?? Math.round(input.budget * 0.22);
  const committedTotal = input.committedTotal ?? Math.round(input.budget * 0.1);
  const safeToSpend = input.safeToSpend ?? Math.max(input.budget - protectedTotal - committedTotal, 0);
  const spent = Math.max(input.budget - safeToSpend - protectedTotal, 0);
  const id = input.id ?? `project-${slugify(input.name)}`;
  const starter = starterContextForStage(input.stage, input.name);

  return {
    id,
    name: input.name,
    client: input.name,
    location: "Live workspace",
    category: "Project",
    stage: input.stage || "Live setup",
    status: "Healthy",
    statusTone: "success",
    budget: currency(input.budget),
    spent: currency(spent),
    reserved: currency(protectedTotal),
    progress: 24,
    dueLabel: "New project live",
    cashNeeded: "$0",
    nextMilestone: starter.nextMilestone,
    owner: "Operations",
    verifiedDays: 1,
    updatedAt: "Created just now",
    insight: "New project is live. Payments, reserves, and proof records will sync here automatically.",
    stateSignal: starter.signal,
    summary: `${input.name} is ready for payment coordination, reserve tracking, and verified operational proof.`,
    remaining: currency(safeToSpend),
    financialImpact: "Add your first supplier payout or commitment to begin tracking operational pressure.",
    zilaSays: "Set up your first payout, supplier commitment, or reserve to start proof history.",
    zilaSuggestionShort: "Add first obligation",
    nextMoveTitle: "Next move",
    nextMoveSummary: "Add your first supplier payout or commitment",
    ifNoAction: "Project remains ready with no movement yet",
    ifActionTaken: "Payment, reserve, and proof state will sync automatically",
    primaryActionLabel: starter.action,
    secondaryActionLabel: "Review options",
    recentUpdates: [
      { label: `${input.name} added`, tone: "success" },
      { label: "Operational workspace ready", tone: "info" },
      { label: "Proof history ready", tone: "success" },
    ],
    suggestedActions: [starter.action, "Connect payment rail", "Create reserve"],
    lastVerifiedAction: "Project created · Just now · Ready",
    tasks: [
      { title: "Add first supplier commitment", due: "Today", status: "Setup required" },
      { title: "Connect payment rail", due: "Today", status: "Ready now" },
      { title: "Create reserve", due: "This week", status: "Prepared" },
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
  if (!isDemoWorkspace()) {
    return stored;
  }

  const seedNames = new Set(seedProjects.map((project) => project.name.toLowerCase()));
  const freshStored = stored.filter((project) => !seedNames.has(project.name.toLowerCase()));

  return [...freshStored, ...seedProjects];
}

export function saveOnboardingProjects(input: Array<{ name: string; description?: string; budget?: string; stage?: string; budgetUnknown?: boolean }>) {
  if (!isBrowser()) {
    return [];
  }

  const projects = input
    .map((project, index) => ({
      name: project.name.trim(),
      description: project.description?.trim() || "",
      budget: project.budget,
      stage: project.stage || "Planning",
      budgetUnknown: Boolean(project.budgetUnknown),
      index,
    }))
    .filter((project) => project.name.length > 0)
    .map((project) => {
      const budget = project.budgetUnknown ? 25000 : parseBudget(project.budget, 25000);
      const protectedTotal = Math.round(budget * 0.2);
      const committedTotal = Math.round(budget * 0.1);
      const safeToSpend = Math.max(budget - protectedTotal - committedTotal, 0);
      return {
        ...makeProject({
          id: `project-${slugify(project.name)}`,
          name: project.name,
          budget,
          template: project.description || "User project",
          stage: project.stage,
          protectedTotal,
          committedTotal,
          safeToSpend,
        }),
        summary: project.description || `${project.name} is ready for payment coordination and operating memory.`,
        nextMilestone: starterContextForStage(project.stage, project.name).nextMilestone,
        cashNeeded: currency(committedTotal),
        remaining: currency(safeToSpend),
        reserved: currency(protectedTotal),
        spent: currency(committedTotal),
        status: "Live",
        statusTone: "success" as const,
        zilaSays: "Record the first payment, supplier update, or approval to build this project's operational memory.",
        zilaSuggestionShort: "Add first obligation",
        nextMoveSummary: starterContextForStage(project.stage, project.name).signal,
        primaryActionLabel: starterContextForStage(project.stage, project.name).action,
      };
    });

  const totalBalance = projects.reduce((total, project) => total + parseBudget(project.budget.replace(/[^0-9.]/g, ""), 25000), 0);
  const protectedAmount = Math.round(totalBalance * 0.2);
  const committedAmount = Math.round(totalBalance * 0.1);
  const safeToSpend = Math.max(totalBalance - protectedAmount - committedAmount, 0);

  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  window.localStorage.setItem(
    OPERATIONAL_SUMMARY_KEY,
    JSON.stringify({
      totalBalance,
      protectedAmount,
      committedAmount,
      safeToSpend,
      generatedAtIso: new Date().toISOString(),
    }),
  );
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: projects }));
  return projects;
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
