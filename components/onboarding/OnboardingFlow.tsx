"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FolderKanban,
  Landmark,
  Layers3,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { BASE_PROTECTED, COMMITTED, createReserve, getProtectedMoneySummary, TOTAL_BALANCE, type ReserveCategory } from "@/lib/protectedMoneyStore";
import { connectOperatingBalance } from "@/lib/moneyMovementStore";

const ONBOARDING_COMPLETE_KEY = "zila-onboarding-complete";
const GUIDE_STORAGE_KEY = "zila-product-guide-seen";
const TOTAL_STEPS = 6;
const INITIAL_SAFE_TO_SPEND = TOTAL_BALANCE - BASE_PROTECTED - COMMITTED;

const concepts = [
  {
    title: "Projects",
    text: "Track money across real operational work so payments, suppliers, and decisions stay connected.",
    icon: FolderKanban,
  },
  {
    title: "Protected Reserves",
    text: "Set aside money for suppliers, payroll, tax, and important commitments before it becomes available to spend.",
    icon: LockKeyhole,
  },
  {
    title: "Safe to Spend",
    text: "See what is actually available after protected money, upcoming payments, and commitments are accounted for.",
    icon: WalletCards,
  },
  {
    title: "Payments Across Rails",
    text: "Coordinate payments across banks, mobile money, and stablecoin rails from one operational system.",
    icon: Landmark,
  },
  {
    title: "Proof of Operations",
    text: "Important payment and operational activity automatically creates verified business records.",
    icon: FileCheck2,
  },
];

const operationalSignals = [
  "Project needs attention",
  "Supplier payout ready",
  "Reserve set aside",
  "Payment rail selected",
  "Proof record created",
  "Next step is clear",
];

const projectTypes = ["Residency", "Construction", "Media production", "Logistics", "Agency project", "Client delivery", "Site operations"];
const commitmentSuggestions = ["Supplier payout", "Payroll", "Contractor payment", "Equipment deposit", "Travel booking", "Mobile money field payout"];
const reserveCategories: ReserveCategory[] = ["Tax", "Supplier", "Payroll", "Emergency", "Project Reserve"];
const protectedAllocations = [
  { key: "supplier", label: "Supplier reserve", helper: "For confirmed vendor payouts", defaultAmount: "4300" },
  { key: "payroll", label: "Payroll reserve", helper: "For staff and contractor timing", defaultAmount: "2800" },
  { key: "tax", label: "Tax reserve", helper: "For statutory commitments", defaultAmount: "1200" },
  { key: "operations", label: "Operations buffer", helper: "For day-to-day project movement", defaultAmount: "2100" },
  { key: "safety", label: "Safety net / contingency", helper: "For unexpected operational pressure", defaultAmount: "1800" },
];
const obligationOptions = ["Suppliers", "Staffing", "Logistics", "Materials", "Permits", "Taxes", "Transport", "Additional project costs"];
const projectRailOptions = ["Bank", "Mobile money", "Stablecoin", "Mixed rails"];
const timingOptions = ["One time", "Weekly", "Monthly", "Milestone based", "Before delivery", "After invoice", "Flexible timing"];
const statusOptions = ["Awaiting deposit", "Pending invoice", "Due this week", "Waiting for approval", "Ready to payout"];
const obligationTemplates: Record<string, { title: string; addLabel: string; nameLabel: string; amountLabel: string; timingLabel: string; helper: string; namePlaceholder: string; frequencyOptions?: string[] }> = {
  Suppliers: {
    title: "Add suppliers and payout timing",
    addLabel: "Add supplier",
    nameLabel: "Supplier name",
    amountLabel: "Payout amount",
    timingLabel: "Due timing",
    helper: "Add the vendors this project depends on and when they need to be paid.",
    namePlaceholder: "Steel Supplier Ltd",
  },
  Staffing: {
    title: "Add staff and contractor costs",
    addLabel: "Add staff member",
    nameLabel: "Role or contractor",
    amountLabel: "Payout amount",
    timingLabel: "Payout timing",
    helper: "Include the people, roles, and recurring payouts that keep the work moving.",
    namePlaceholder: "Site manager",
    frequencyOptions: ["Monthly", "Weekly", "Milestone payout", "One-off"],
  },
  Logistics: {
    title: "Add logistics costs",
    addLabel: "Add logistics cost",
    nameLabel: "Logistics category",
    amountLabel: "Expected cost",
    timingLabel: "Timing",
    helper: "Track delivery, movement, and field costs before they affect payment timing.",
    namePlaceholder: "Regional delivery",
  },
  Materials: {
    title: "Add material expenses",
    addLabel: "Add material expense",
    nameLabel: "Material category",
    amountLabel: "Expected cost",
    timingLabel: "Timing",
    helper: "Include the materials and supplier costs this project needs to protect.",
    namePlaceholder: "Foundation steel",
  },
  Permits: {
    title: "Add permits and approvals",
    addLabel: "Add permit",
    nameLabel: "Permit or approval",
    amountLabel: "Expected cost",
    timingLabel: "Due timing",
    helper: "Track required approvals before they affect project movement.",
    namePlaceholder: "Site permit",
  },
  Taxes: {
    title: "Add tax commitments",
    addLabel: "Add tax cost",
    nameLabel: "Tax commitment",
    amountLabel: "Expected amount",
    timingLabel: "Due timing",
    helper: "Keep important statutory commitments protected before money moves.",
    namePlaceholder: "VAT reserve",
  },
  Transport: {
    title: "Add transport costs",
    addLabel: "Add transport cost",
    nameLabel: "Transport need",
    amountLabel: "Expected cost",
    timingLabel: "Timing",
    helper: "Include transport needs, field movement, and timing-sensitive costs.",
    namePlaceholder: "Field transport",
  },
  "Additional project costs": {
    title: "Add custom project costs",
    addLabel: "Add custom cost",
    nameLabel: "Project cost",
    amountLabel: "Expected amount",
    timingLabel: "Timing",
    helper: "Add project-specific responsibilities Zila should account for.",
    namePlaceholder: "FX protection",
  },
};
const moneyRails = [
  {
    id: "bank",
    title: "Bank Account",
    description: "Receive funds, coordinate payouts, and manage operational reserves.",
    icon: Landmark,
  },
  {
    id: "mobile-money",
    title: "Mobile Money",
    description: "Coordinate supplier, field, and regional payments.",
    icon: Smartphone,
  },
  {
    id: "stablecoin",
    title: "Stablecoin Wallet",
    description: "Enable cross-border settlement and verified XRPL-backed payment coordination.",
    icon: WalletCards,
  },
] as const;

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function parseAmount(value: string) {
  const amount = Number(value.replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function createObligationDraft(category: string) {
  const template = obligationTemplates[category] ?? obligationTemplates["Additional project costs"];
  return {
    name: template.namePlaceholder,
    amount: category === "Suppliers" ? "4300" : category === "Staffing" ? "2500" : "1200",
    timing: category === "Suppliers" ? "Due in 14 days" : "Next milestone",
    rail: category === "Suppliers" ? "Mobile money" : "Bank",
    priority: category === "Suppliers" ? "High priority" : "Normal priority",
    phase: category === "Suppliers" ? "Foundation phase" : "Active phase",
    frequency: template.frequencyOptions?.[0] ?? "One time",
    dependency: category === "Materials" ? "Required before installation" : category === "Logistics" ? "Required before delivery" : "Linked to project timing",
    status: category === "Suppliers" ? "Ready to payout" : category === "Staffing" ? "Due this week" : "Pending invoice",
    notes: "",
  };
}

function getProjectStructureSuggestion(projectType: string, projectValue: number) {
  const value = Math.max(projectValue, 1);
  const profiles: Record<string, { timing: string; pressure: string[]; allocations: Record<string, number>; obligations: string[]; rails: string[] }> = {
    Construction: {
      timing: "Milestone-based",
      pressure: ["Supplier deposits", "Permit timing", "Contingency protection"],
      allocations: { supplier: 0.18, payroll: 0.08, tax: 0.04, operations: 0.08, safety: 0.12 },
      obligations: ["Suppliers", "Materials", "Permits", "Transport"],
      rails: ["Bank", "Mobile money"],
    },
    Logistics: {
      timing: "Weekly",
      pressure: ["Fuel movement", "Transport timing", "Rolling operating cash"],
      allocations: { supplier: 0.12, payroll: 0.08, tax: 0.03, operations: 0.14, safety: 0.08 },
      obligations: ["Logistics", "Transport", "Staffing", "Suppliers"],
      rails: ["Mobile money", "Bank"],
    },
    "Agency project": {
      timing: "Flexible",
      pressure: ["Contractor payouts", "Client payment timing", "Delivery buffer"],
      allocations: { supplier: 0.08, payroll: 0.16, tax: 0.05, operations: 0.08, safety: 0.07 },
      obligations: ["Staffing", "Suppliers", "Taxes", "Additional project costs"],
      rails: ["Bank", "Stablecoin"],
    },
    Residency: {
      timing: "Milestone-based",
      pressure: ["Travel booking", "Accommodation holds", "Vendor deposits"],
      allocations: { supplier: 0.12, payroll: 0.07, tax: 0.03, operations: 0.11, safety: 0.09 },
      obligations: ["Suppliers", "Logistics", "Transport", "Staffing"],
      rails: ["Bank", "Mobile money"],
    },
  };
  const profile = profiles[projectType] ?? {
    timing: "Flexible",
    pressure: ["Supplier timing", "Protected reserves", "Payment coordination"],
    allocations: { supplier: 0.12, payroll: 0.1, tax: 0.04, operations: 0.1, safety: 0.08 },
    obligations: ["Suppliers", "Staffing", "Additional project costs"],
    rails: ["Bank", "Mobile money"],
  };

  return {
    timingModel: profile.timing,
    pressurePatterns: profile.pressure,
    obligations: profile.obligations,
    rails: profile.rails,
    allocations: protectedAllocations.map((allocation) => ({
      ...allocation,
      suggestedAmount: Math.round(value * profile.allocations[allocation.key]),
    })),
    contingencyPercent: Math.round((profile.allocations.safety ?? 0.08) * 100),
  };
}

export function OnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [connectedRails, setConnectedRails] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("Project Horizon");
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [projectBudget, setProjectBudget] = useState("42000");
  const [commitment, setCommitment] = useState("Supplier payment");
  const [allocationAmounts, setAllocationAmounts] = useState(() =>
    Object.fromEntries(protectedAllocations.map((allocation) => [allocation.key, allocation.defaultAmount])),
  );
  const [contingencyPercent, setContingencyPercent] = useState("8");
  const [contingencyAmount, setContingencyAmount] = useState("1800");
  const [selectedObligations, setSelectedObligations] = useState<string[]>(["Suppliers", "Staffing", "Logistics"]);
  const [activeObligation, setActiveObligation] = useState<string>("Suppliers");
  const [obligationDrafts, setObligationDrafts] = useState<Record<string, ReturnType<typeof createObligationDraft>[]>>(() =>
    Object.fromEntries(obligationOptions.map((option) => [option, [createObligationDraft(option)]])),
  );
  const [projectRails, setProjectRails] = useState<string[]>(["Bank", "Mobile money"]);
  const [reserveName, setReserveName] = useState("Supplier reserve");
  const [reserveCategory, setReserveCategory] = useState<ReserveCategory>("Supplier");
  const [reserveAmount, setReserveAmount] = useState("4300");
  const [reserveCreated, setReserveCreated] = useState(false);
  const [safeToSpend, setSafeToSpend] = useState(INITIAL_SAFE_TO_SPEND);

  const currentStep = stepIndex + 1;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const progress = useMemo(() => (currentStep / TOTAL_STEPS) * 100, [currentStep]);
  const approximateProjectValue = useMemo(() => parseAmount(projectBudget), [projectBudget]);
  const structureSuggestion = useMemo(() => getProjectStructureSuggestion(projectType, approximateProjectValue), [projectType, approximateProjectValue]);
  const availableCapitalEstimate = useMemo(() => Math.round(approximateProjectValue * 0.32), [approximateProjectValue]);
  const movingPartEntries = useMemo(() => Object.values(obligationDrafts).flat(), [obligationDrafts]);
  const liveProjectCostTotal = useMemo(() => movingPartEntries.reduce((total, entry) => total + parseAmount(entry.amount), 0), [movingPartEntries]);
  const urgentMovingPartCount = useMemo(
    () => movingPartEntries.filter((entry) => ["Due this week", "Ready to payout", "Awaiting deposit"].includes(entry.status)).length,
    [movingPartEntries],
  );
  const commitmentEstimate = useMemo(() => Math.max(Math.round(approximateProjectValue * 0.08), liveProjectCostTotal), [approximateProjectValue, liveProjectCostTotal]);
  const protectedTotal = useMemo(
    () => Object.values(allocationAmounts).reduce((total, value) => total + parseAmount(value), 0) + parseAmount(contingencyAmount),
    [allocationAmounts, contingencyAmount],
  );
  const projectedSafeToSpend = useMemo(() => Math.max(availableCapitalEstimate - protectedTotal - commitmentEstimate, 0), [availableCapitalEstimate, protectedTotal, commitmentEstimate]);
  const projectRailLabel = projectRails.length > 0 ? projectRails.join(" + ") : "Select later";
  const livePressureState = urgentMovingPartCount >= 4 ? "High attention" : urgentMovingPartCount >= 2 ? "Active" : "Calm";
  const payoutReadinessState = movingPartEntries.some((entry) => entry.status === "Ready to payout") ? "Payout ready" : "Watching timing";

  useEffect(() => {
    setSafeToSpend(getProtectedMoneySummary().safeToSpend);
  }, []);

  const completeOnboarding = () => {
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    window.localStorage.setItem(GUIDE_STORAGE_KEY, "true");

    startTransition(() => {
      router.push("/home");
    });
  };

  const goNext = () => {
    if (isLastStep) {
      completeOnboarding();
      return;
    }

    setStepIndex((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const toggleMoneyRail = (railId: string) => {
    setConnectedRails((current) => {
      const isConnected = current.includes(railId);
      const next = isConnected ? current.filter((item) => item !== railId) : [...current, railId];

      window.localStorage.setItem("zila-onboarding-money-rails", JSON.stringify(next));

      if (!isConnected && railId === "bank") {
        connectOperatingBalance();
      }

      return next;
    });
  };

  const updateAllocationAmount = (key: string, value: string) => {
    setAllocationAmounts((current) => ({ ...current, [key]: value }));
  };

  const openObligationMapping = (obligation: string) => {
    setActiveObligation((current) => (current === obligation ? "" : obligation));
    setSelectedObligations((current) => (current.includes(obligation) ? current : [...current, obligation]));
  };

  const addObligationEntry = (category: string) => {
    setActiveObligation(category);
    setSelectedObligations((current) => (current.includes(category) ? current : [...current, category]));
    setObligationDrafts((current) => ({
      ...current,
      [category]: [...(current[category] ?? []), createObligationDraft(category)],
    }));
  };

  const removeObligationEntry = (category: string, index: number) => {
    setObligationDrafts((current) => {
      const nextEntries = (current[category] ?? []).filter((_, entryIndex) => entryIndex !== index);

      return {
        ...current,
        [category]: nextEntries.length > 0 ? nextEntries : [createObligationDraft(category)],
      };
    });
  };

  const updateObligationDraft = (category: string, index: number, field: keyof ReturnType<typeof createObligationDraft>, value: string) => {
    setObligationDrafts((current) => ({
      ...current,
      [category]: (current[category] ?? [createObligationDraft(category)]).map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const toggleProjectRail = (rail: string) => {
    setProjectRails((current) => (current.includes(rail) ? current.filter((item) => item !== rail) : [...current, rail]));
  };

  const applySuggestedStructure = () => {
    setAllocationAmounts(Object.fromEntries(structureSuggestion.allocations.map((allocation) => [allocation.key, String(allocation.suggestedAmount)])));
    setContingencyPercent(String(structureSuggestion.contingencyPercent));
    setContingencyAmount(String(structureSuggestion.allocations.find((allocation) => allocation.key === "safety")?.suggestedAmount ?? 0));
    setSelectedObligations(structureSuggestion.obligations);
    setActiveObligation(structureSuggestion.obligations[0] ?? "Suppliers");
    setProjectRails(structureSuggestion.rails);
  };

  const getRecommendationSources = (key: string) => {
    const entriesByCategory: Record<string, string[]> = {
      supplier: ["Suppliers", "Logistics", "Materials"],
      payroll: ["Staffing"],
      tax: ["Taxes"],
      operations: ["Logistics", "Transport", "Permits", "Additional project costs"],
      safety: obligationOptions,
    };
    const names = (entriesByCategory[key] ?? [])
      .flatMap((category) => obligationDrafts[category] ?? [])
      .map((entry) => entry.name)
      .filter(Boolean)
      .slice(0, 3);

    if (names.length > 0) {
      return names;
    }

    if (key === "supplier") return ["Supplier timing", "Vendor payouts"];
    if (key === "payroll") return ["Staff costs", "Contractor timing"];
    if (key === "tax") return ["Tax timing"];
    if (key === "operations") return ["Delivery costs", "Field movement"];
    return ["Project timing", "Unexpected costs"];
  };

  const handleCreateProject = () => {
    window.localStorage.setItem("zila-first-project-name", projectName.trim() || "Project Horizon");
    window.localStorage.setItem("zila-first-project-template", projectType);
    window.localStorage.setItem("zila-first-project-budget", projectBudget);
    window.localStorage.setItem("zila-first-project-incoming", String(availableCapitalEstimate));
    window.localStorage.setItem("zila-first-project-capital", String(availableCapitalEstimate));
    window.localStorage.setItem("zila-first-project-payment-timing", structureSuggestion.timingModel);
    window.localStorage.setItem("zila-first-project-commitment", commitment);
    window.localStorage.setItem("zila-first-project-protected-total", String(protectedTotal));
    window.localStorage.setItem("zila-first-project-safe-to-spend", String(projectedSafeToSpend));
    window.localStorage.setItem("zila-first-project-obligations", JSON.stringify(selectedObligations));
    window.localStorage.setItem("zila-first-project-obligation-map", JSON.stringify(obligationDrafts));
    window.localStorage.setItem("zila-first-project-rails", JSON.stringify(projectRails));
    goNext();
  };

  const handleCreateReserve = () => {
    const amount = Number(reserveAmount.replace(/,/g, ""));

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    createReserve({
      name: reserveName,
      amount,
      category: reserveCategory,
      linkedProject: projectName,
    });
    setReserveCreated(true);
    setSafeToSpend(getProtectedMoneySummary().safeToSpend);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.72),transparent_32%),radial-gradient(ellipse_at_86%_8%,rgba(103,232,249,0.24),transparent_30%),linear-gradient(180deg,#DCEEFF_0%,#C6DDF8_48%,#AFCBEF_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(109,94,248,0.10),transparent_30%)]" />
      <div className="absolute left-[-8rem] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(103,232,249,0.20),rgba(103,232,249,0)_72%)] blur-3xl" />
      <div className="absolute right-[-8rem] bottom-[12%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.28),rgba(255,255,255,0)_74%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1180px] flex-col px-6 pb-8 pt-7 lg:px-10">
        <header className="mb-8 flex items-center justify-between">
          <Image src="/logo-full.png" alt="Zila" width={112} height={44} priority className="h-auto w-[104px] object-contain" />
          <button type="button" onClick={completeOnboarding} className="rounded-full border border-white/36 bg-white/28 px-4 py-2 text-[12px] font-semibold text-[#17345F] shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] backdrop-blur-md">
            Skip onboarding
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col justify-center">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#1D4E7F]">Step {currentStep} of {TOTAL_STEPS}</p>
              <div className="mt-3 h-2 w-[220px] overflow-hidden rounded-full bg-white/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]">
                <div className="h-full rounded-full bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.32)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="hidden items-center gap-1.5 md:flex">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <span key={index} className={`h-1.5 rounded-full transition-all ${index === stepIndex ? "w-8 bg-[#1D4ED8]" : index < stepIndex ? "w-4 bg-[#D9FF57]" : "w-2 bg-white/48"}`} />
              ))}
            </div>
          </div>

          <section className="overflow-hidden rounded-[34px] border border-white/36 bg-[linear-gradient(155deg,rgba(43,95,148,0.86),rgba(30,74,125,0.82)_48%,rgba(23,52,95,0.90))] shadow-[0_34px_86px_rgba(31,68,116,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl">
            <div className="grid min-h-[620px] gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="relative p-6 md:p-9">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(103,232,249,0.16),transparent_30%)]" />
                <div className="relative">
                  {stepIndex === 0 ? (
                    <div className="max-w-[680px]">
                      <span className="inline-flex h-13 w-13 items-center justify-center rounded-[18px] border border-white/18 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                        <Sparkles className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <h1 className="mt-8 max-w-[660px] text-[44px] font-semibold leading-[1.02] tracking-[-0.06em] md:text-[58px]">
                        Welcome to Zila
                      </h1>
                      <p className="mt-6 max-w-[610px] text-[17px] leading-[1.75] text-[#E4F0FF]">
                        Zila helps project-based businesses understand what is safe to spend, protect important money, and coordinate payments with confidence.
                      </p>
                      <div className="mt-10 flex flex-wrap gap-3">
                        <button type="button" onClick={goNext} className="zila-button-hover inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-[#1D4ED8] px-6 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(29,78,216,0.24)]">
                          Get started
                          <ArrowRight className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button type="button" onClick={completeOnboarding} className="inline-flex h-13 items-center justify-center rounded-[18px] border border-white/18 bg-white/[0.11] px-6 text-[14px] font-semibold text-[#F3F8FF] transition hover:bg-white/[0.15]">
                          Explore demo
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 1 ? (
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">How Zila works</p>
                      <h1 className="mt-3 max-w-[620px] text-[42px] font-semibold leading-[1.04] tracking-[-0.055em]">
                        Zila quietly keeps money connected to projects, suppliers, reserves, and payment rails.
                      </h1>
                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {concepts.map((concept) => {
                          const Icon = concept.icon;

                          return (
                            <article key={concept.title} className="rounded-[24px] border border-white/16 bg-white/[0.10] p-5 shadow-[0_18px_36px_rgba(31,68,116,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/16 bg-[#102A4F]/46 text-[#EAFBFF]">
                                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                              </span>
                              <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.04em]">{concept.title}</h2>
                              <p className="mt-2 text-[14px] leading-[1.65] text-[#DCEBFF]">{concept.text}</p>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 2 ? (
                    <div className="max-w-[620px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">Connect your money</p>
                      <h1 className="mt-3 text-[44px] font-semibold leading-[1.02] tracking-[-0.055em]">Connect your money</h1>
                      <p className="mt-5 text-[16px] leading-[1.75] text-[#E4F0FF]">
                        Coordinate payments, reserves, and payouts across the payment systems your business already uses.
                      </p>

                      <div className="mt-8 space-y-3">
                        {moneyRails.map((rail) => {
                          const Icon = rail.icon;
                          const isConnected = connectedRails.includes(rail.id);

                          return (
                            <button
                              key={rail.id}
                              type="button"
                              onClick={() => toggleMoneyRail(rail.id)}
                              className={`group w-full rounded-[24px] border px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition duration-300 ${
                                isConnected
                                  ? "border-[#D9FF57]/34 bg-[#D9FF57]/10 shadow-[0_18px_36px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]"
                                  : "border-white/16 bg-white/[0.09] hover:border-white/28 hover:bg-white/[0.12]"
                              }`}
                            >
                              <span className="flex items-start gap-4">
                                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border transition ${isConnected ? "border-[#D9FF57]/28 bg-[#D9FF57] text-[#102A4F]" : "border-white/16 bg-[#102A4F]/42 text-[#EAFBFF] group-hover:bg-[#102A4F]/58"}`}>
                                  {isConnected ? <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} /> : <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-2">
                                    <span className="text-[16px] font-semibold tracking-[-0.03em] text-white">{rail.title}</span>
                                    {isConnected ? <span className="rounded-full bg-[#D9FF57]/14 px-2.5 py-1 text-[11px] font-semibold text-[#F7FFC8]">Selected</span> : null}
                                  </span>
                                  <span className="mt-1.5 block text-[13px] leading-[1.55] text-[#DCEBFF]">{rail.description}</span>
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={goNext} className="zila-button-hover inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#D9FF57] px-6 text-[14px] font-semibold text-[#102A4F] shadow-[0_18px_36px_rgba(217,255,87,0.14)]">
                          Continue setup
                          <ArrowRight className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button type="button" onClick={goNext} className="inline-flex h-12 items-center justify-center rounded-[18px] border border-white/16 bg-white/[0.08] px-5 text-[14px] font-semibold text-[#E4F0FF] transition hover:border-white/28 hover:bg-white/[0.12]">
                          Skip for now
                        </button>
                      </div>
                      <p className="mt-4 max-w-[520px] text-[12px] leading-[1.6] text-[#C9DDF6]">
                        You can return later from Payments settings to connect or change payment rails.
                      </p>
                    </div>
                  ) : null}

                  {stepIndex === 3 ? (
                    <div className="max-w-[720px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">Project setup</p>
                      <h1 className="mt-3 text-[42px] font-semibold leading-[1.04] tracking-[-0.055em]">Give Zila the project shape.</h1>
                      <p className="mt-4 max-w-[600px] text-[15px] leading-[1.7] text-[#E4F0FF]">
                        Start with the essentials. Zila will suggest reserves, payout timing, and pressure points from there.
                      </p>

                      <div className="mt-7 rounded-[28px] border border-white/16 bg-white/[0.09] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Simple foundation</p>
                            <p className="mt-1 text-[13px] text-[#DCEBFF]">Enough context to create a useful operating structure.</p>
                          </div>
                          <span className="rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/10 px-3 py-1 text-[11px] font-semibold text-[#F7FFC8]">Fast setup</span>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Project name</span>
                            <input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="mt-2 h-12 w-full rounded-[17px] border border-white/14 bg-white/[0.12] px-4 text-[14px] text-white outline-none placeholder:text-[#C9DDF6]/70" />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Project type</span>
                            <select value={projectType} onChange={(event) => setProjectType(event.target.value)} className="mt-2 h-12 w-full rounded-[17px] border border-white/14 bg-[#173D6D] px-4 text-[14px] text-white outline-none">
                              {projectTypes.map((type) => <option key={type}>{type}</option>)}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Approximate project value</span>
                            <input value={projectBudget} onChange={(event) => setProjectBudget(event.target.value)} inputMode="numeric" className="mt-2 h-12 w-full rounded-[17px] border border-white/14 bg-white/[0.12] px-4 text-[14px] text-white outline-none" />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">First upcoming commitment</span>
                            <select value={commitment} onChange={(event) => setCommitment(event.target.value)} className="mt-2 h-12 w-full rounded-[17px] border border-white/14 bg-[#173D6D] px-4 text-[14px] text-white outline-none">
                              {commitmentSuggestions.map((item) => <option key={item}>{item}</option>)}
                            </select>
                          </label>
                        </div>
                        <div className="mt-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Payment rails used</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {projectRailOptions.map((rail) => {
                              const isSelected = projectRails.includes(rail);

                              return (
                                <button key={rail} type="button" onClick={() => toggleProjectRail(rail)} className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${isSelected ? "border-white/18 bg-white/[0.14] text-[#F7FFC8]" : "border-white/12 bg-[#102A4F]/30 text-[#DCEBFF] hover:border-white/24"}`}>
                                  {rail}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 rounded-[28px] border border-white/12 bg-[linear-gradient(135deg,rgba(16,42,79,0.46),rgba(255,255,255,0.07))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Zila suggested structure</p>
                            <p className="mt-1 text-[13px] text-[#DCEBFF]">
                              Based on {projectType.toLowerCase()} work, {formatCurrency(approximateProjectValue)} project value, and {movingPartEntries.length} moving parts.
                            </p>
                          </div>
                          <button type="button" onClick={applySuggestedStructure} className="rounded-full bg-[#D9FF57] px-4 py-2 text-[12px] font-semibold text-[#102A4F] shadow-[0_12px_28px_rgba(217,255,87,0.10)] transition hover:shadow-[0_16px_32px_rgba(217,255,87,0.16)]">
                            Apply suggestions
                          </button>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          {structureSuggestion.allocations.map((allocation) => (
                            <label key={allocation.key} className="rounded-[22px] bg-white/[0.065] p-4 transition hover:bg-white/[0.09]">
                              <span className="flex flex-wrap items-start justify-between gap-3">
                                <span className="min-w-0">
                                  <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white">{allocation.label}</span>
                                  <span className="mt-1 block text-[12px] leading-[1.5] text-[#DCEBFF]">{allocation.helper}</span>
                                </span>
                                <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-[#F7FFC8]">{formatCurrency(allocation.suggestedAmount)}</span>
                              </span>
                              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#C9DDF6]">
                                <span className="font-semibold text-[#F7FFC8]/90">Based on:</span>
                                {getRecommendationSources(allocation.key).map((source) => (
                                  <span key={source} className="max-w-full rounded-full bg-white/[0.07] px-2 py-1 text-[10px] font-semibold leading-none text-[#DCEBFF]">{source}</span>
                                ))}
                              </div>
                              <input value={allocationAmounts[allocation.key]} onChange={(event) => updateAllocationAmount(allocation.key, event.target.value)} inputMode="numeric" className="mt-3 h-10 w-full rounded-[14px] border border-white/12 bg-[#102A4F]/46 px-3 text-[13px] font-semibold text-white outline-none" />
                            </label>
                          ))}
                        </div>
                        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                          <div className="rounded-[22px] border border-white/14 bg-[#102A4F]/34 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Recommended timing</p>
                            <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-white">{structureSuggestion.timingModel}</p>
                            <p className="mt-2 text-[12px] leading-[1.55] text-[#DCEBFF]">You can change this later as invoices, payouts, and project activity come in.</p>
                          </div>
                          <div className="rounded-[22px] border border-white/14 bg-[#102A4F]/34 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">What usually affects this type of project</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {structureSuggestion.pressurePatterns.map((pattern) => (
                                <span key={pattern} className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[12px] font-semibold text-[#DCEBFF]">{pattern}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Project costs and moving parts</p>
                          <p className="mt-1 text-[12px] text-[#DCEBFF]">Add the suppliers, staff, delivery costs, and dependencies Zila should understand.</p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {obligationOptions.map((item) => {
                              const isSelected = selectedObligations.includes(item);
                              const isActive = activeObligation === item;
                              const count = obligationDrafts[item]?.length ?? 0;

                              return (
                                <button key={item} type="button" onClick={() => openObligationMapping(item)} className={`flex items-center justify-between gap-3 rounded-[17px] border px-3 py-3 text-left text-[12px] font-semibold transition ${isActive ? "border-white/24 bg-white/[0.14] text-[#F7FFC8] shadow-[0_14px_30px_rgba(8,20,42,0.16)]" : isSelected ? "border-white/16 bg-white/[0.08] text-[#EAF1FF]" : "border-white/10 bg-[#102A4F]/30 text-[#DCEBFF] hover:border-white/22"}`}>
                                  <span className="min-w-0 truncate">{item} {count > 0 ? `(${count})` : ""}</span>
                                  <ChevronDown className={`h-3.5 w-3.5 transition ${isActive ? "rotate-180" : ""}`} strokeWidth={2} />
                                </button>
                              );
                            })}
                          </div>
                          {(() => {
                            if (!activeObligation) {
                              return null;
                            }

                            const template = obligationTemplates[activeObligation] ?? obligationTemplates["Additional project costs"];
                            const drafts = obligationDrafts[activeObligation] ?? [createObligationDraft(activeObligation)];
                            const isStaffing = activeObligation === "Staffing";
                            const isSupplier = activeObligation === "Suppliers";
                            const entryLabel = activeObligation === "Staffing" ? "Staff cost" : activeObligation === "Logistics" ? "Logistics cost" : activeObligation === "Additional project costs" ? "Project cost" : activeObligation.endsWith("s") ? activeObligation.slice(0, -1) : activeObligation;

                            return (
                              <div className="mt-5 rounded-[24px] bg-[#102A4F]/34 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[15px] font-semibold tracking-[-0.03em] text-white">{template.title}</p>
                                    <p className="mt-1 max-w-[520px] text-[12px] leading-[1.55] text-[#DCEBFF]">{template.helper}</p>
                                  </div>
                                  <button type="button" onClick={() => addObligationEntry(activeObligation)} className="inline-flex items-center gap-1.5 rounded-full bg-[#D9FF57] px-3 py-2 text-[12px] font-semibold text-[#102A4F] shadow-[0_12px_28px_rgba(217,255,87,0.10)] transition hover:shadow-[0_16px_34px_rgba(217,255,87,0.16)]">
                                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                    {template.addLabel}
                                  </button>
                                </div>
                                <div className="mt-4 space-y-3">
                                  {drafts.map((draft, entryIndex) => (
                                    <div key={`${activeObligation}-${entryIndex}`} className="rounded-[18px] bg-white/[0.065] p-3">
                                      <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-[12px] font-semibold text-[#F7FFC8]">{entryLabel} {entryIndex + 1}</p>
                                        {drafts.length > 1 ? (
                                          <button type="button" onClick={() => removeObligationEntry(activeObligation, entryIndex)} className="text-[11px] font-semibold text-[#C9DDF6] transition hover:text-white">
                                            Remove
                                          </button>
                                        ) : null}
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">{template.nameLabel}</span>
                                          <input value={draft.name} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "name", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-white/[0.10] px-3 text-[13px] text-white outline-none" />
                                        </label>
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">{template.amountLabel}</span>
                                          <input value={draft.amount} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "amount", event.target.value)} inputMode="numeric" className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-white/[0.10] px-3 text-[13px] text-white outline-none" />
                                        </label>
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">{template.timingLabel}</span>
                                          <select value={draft.timing} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "timing", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-[#173D6D] px-3 text-[13px] text-white outline-none">
                                            {timingOptions.map((option) => <option key={option}>{option}</option>)}
                                          </select>
                                        </label>
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">{isStaffing ? "Payout frequency" : "Payment rail"}</span>
                                          <select value={isStaffing ? draft.frequency : draft.rail} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, isStaffing ? "frequency" : "rail", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-[#173D6D] px-3 text-[13px] text-white outline-none">
                                            {(isStaffing ? template.frequencyOptions ?? ["Monthly", "Milestone payout"] : projectRailOptions).map((option) => <option key={option}>{option}</option>)}
                                          </select>
                                        </label>
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">Status</span>
                                          <select value={draft.status} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "status", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-[#173D6D] px-3 text-[13px] text-white outline-none">
                                            {statusOptions.map((option) => <option key={option}>{option}</option>)}
                                          </select>
                                        </label>
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">{isStaffing ? "Critical or flexible" : "Priority level"}</span>
                                          <select value={draft.priority} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "priority", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-[#173D6D] px-3 text-[13px] text-white outline-none">
                                            {["High priority", "Normal priority", "Flexible", "Critical role"].map((option) => <option key={option}>{option}</option>)}
                                          </select>
                                        </label>
                                        <label>
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">Linked project phase</span>
                                          <input value={draft.phase} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "phase", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-white/[0.10] px-3 text-[13px] text-white outline-none" />
                                        </label>
                                        {!isSupplier ? (
                                          <label className="sm:col-span-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">Needed before</span>
                                            <input value={draft.dependency} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "dependency", event.target.value)} className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-white/[0.10] px-3 text-[13px] text-white outline-none" />
                                          </label>
                                        ) : null}
                                        <label className="sm:col-span-2">
                                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">Optional notes</span>
                                          <input value={draft.notes} onChange={(event) => updateObligationDraft(activeObligation, entryIndex, "notes", event.target.value)} placeholder="Add useful context for Zila" className="mt-2 h-10 w-full rounded-[14px] border border-white/12 bg-white/[0.10] px-3 text-[13px] text-white outline-none placeholder:text-[#C9DDF6]/55" />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                                  <p className="text-[12px] leading-[1.5] text-[#DCEBFF]">
                                    These details help Zila understand how the project actually operates, then guide reserves, payouts, and proof records.
                                  </p>
                                  <button type="button" onClick={() => setActiveObligation("")} className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-2 text-[12px] font-semibold text-[#DCEBFF] transition hover:border-white/28">
                                    Collapse section
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 4 ? (
                    <div className="max-w-[680px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">Create Protected Reserves</p>
                      <h1 className="mt-3 text-[42px] font-semibold leading-[1.04] tracking-[-0.055em]">Set money aside before it becomes available to spend.</h1>
                      <div className="mt-7 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Reserve name</span>
                          <input value={reserveName} onChange={(event) => setReserveName(event.target.value)} className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-white/[0.12] px-4 text-[14px] text-white outline-none" />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Reserve category</span>
                          <select value={reserveCategory} onChange={(event) => setReserveCategory(event.target.value as ReserveCategory)} className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-[#173D6D] px-4 text-[14px] text-white outline-none">
                            {reserveCategories.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Starter funds</span>
                          <input value={reserveAmount} onChange={(event) => setReserveAmount(event.target.value)} inputMode="numeric" className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-white/[0.12] px-4 text-[14px] text-white outline-none" />
                        </label>
                        <div className="rounded-[18px] border border-[#D9FF57]/22 bg-[#D9FF57]/10 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7FFC8]">Safe to Spend</p>
                          <p className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-white">{formatCurrency(safeToSpend)}</p>
                          <p className="mt-1 text-[12px] text-[#E8F4FF]">{reserveCreated ? "Recalculated after reserve creation." : "Updates when money is protected."}</p>
                        </div>
                      </div>
                      <button type="button" onClick={handleCreateReserve} disabled={reserveCreated} className="zila-button-hover mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-[#D9FF57] px-6 text-[14px] font-semibold text-[#102A4F] shadow-[0_18px_36px_rgba(217,255,87,0.16)] disabled:cursor-not-allowed disabled:opacity-70">
                        <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                        {reserveCreated ? "Reserve created" : "Create reserve"}
                      </button>
                    </div>
                  ) : null}

                  {stepIndex === 5 ? (
                    <div className="max-w-[680px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">What Happens Next</p>
                      <h1 className="mt-3 text-[44px] font-semibold leading-[1.02] tracking-[-0.055em]">Zila shows what needs attention next.</h1>
                      <p className="mt-5 max-w-[560px] text-[16px] leading-[1.75] text-[#E4F0FF]">
                        Zila turns payment movement, reserves, and operational activity into calm guidance about what needs attention next.
                      </p>
                      <div className="mt-8 rounded-[26px] border border-white/18 bg-white/[0.11] p-5">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">What Happens Next</p>
                        <p className="mt-3 text-[20px] font-semibold leading-[1.45]">Safe to Spend is now {formatCurrency(safeToSpend)} after protected money and committed payments.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <aside className="relative border-t border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-6 lg:border-l lg:border-t-0">
                <div className="sticky top-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/18 bg-white/[0.12] text-white">
                    {stepIndex < 2 ? <Layers3 className="h-5 w-5" strokeWidth={1.9} /> : stepIndex === 2 ? <Landmark className="h-5 w-5" strokeWidth={1.9} /> : stepIndex === 3 ? <FolderKanban className="h-5 w-5" strokeWidth={1.9} /> : stepIndex === 4 ? <LockKeyhole className="h-5 w-5" strokeWidth={1.9} /> : <Sparkles className="h-5 w-5" strokeWidth={1.9} />}
                  </span>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BCEEFF]">What Happens Next</p>
                  <p className="mt-3 text-[20px] font-semibold leading-[1.3] tracking-[-0.04em]">
                    {stepIndex === 0
                      ? "Zila helps you see what is safe to spend before money moves."
                      : stepIndex === 1
                        ? "Projects, payments, reserves, and proof stay connected."
                        : stepIndex === 2
                              ? "Connected payment rails help Zila coordinate supplier payouts, reserves, and verified payment movement."
                              : stepIndex === 3
                            ? "Zila is helping structure this project safely before money starts moving."
                            : stepIndex === 4
                              ? "Protected reserves keep important commitments out of everyday spending."
                              : "Zila is ready to help coordinate payments and show what needs attention."}
                  </p>
                  {stepIndex === 2 ? (
                    <div className="mt-5 overflow-hidden rounded-[22px] border border-white/14 bg-[#102A4F]/38 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">After setup</p>
                      <div className="mt-4 space-y-3">
                        {["Supplier payouts route through selected rails", "Protected reserves stay accounted for", "Payment movement creates verified records"].map((item, index) => (
                          <div key={item} className="flex items-center gap-3">
                            <span className="relative h-2 w-2 rounded-full bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.30)]">
                              {index === 1 ? <span className="absolute inset-[-5px] rounded-full border border-[#D9FF57]/20" /> : null}
                            </span>
                            <span className="text-[12px] font-medium text-[#EAF1FF]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {stepIndex === 3 ? (
                    <div className="mt-5 rounded-[22px] border border-white/12 bg-[linear-gradient(135deg,rgba(217,255,87,0.07),rgba(16,42,79,0.34))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7FFC8]">Live operational summary</p>
                      <div className="mt-4 space-y-3 text-[13px] text-[#E4F0FF]">
                        <div className="flex justify-between gap-4">
                          <span>Protected reserves</span>
                          <strong className="text-white">{formatCurrency(protectedTotal)}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Safe to Spend estimate</span>
                          <strong className="text-[#F7FFC8]">{formatCurrency(projectedSafeToSpend)}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Operational pressure</span>
                          <strong className="text-white">{livePressureState}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Moving parts tracked</span>
                          <strong className="text-white">{movingPartEntries.length}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Contingency coverage</span>
                          <strong className="text-white">{formatCurrency(parseAmount(contingencyAmount))} · {contingencyPercent}%</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Payout readiness</span>
                          <strong className="text-white">{projectRails.length > 0 ? payoutReadinessState : "Select later"}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Coordination state</span>
                          <strong className="text-[#F7FFC8]">{structureSuggestion.timingModel}</strong>
                        </div>
                        <div className="rounded-[16px] border border-white/12 bg-[#102A4F]/34 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9DDF6]">Safe to Spend logic</p>
                          <p className="mt-2 text-[12px] leading-[1.6] text-[#E4F0FF]">
                            {formatCurrency(availableCapitalEstimate)} available capital - {formatCurrency(protectedTotal)} protected reserves - {formatCurrency(commitmentEstimate)} upcoming costs = {formatCurrency(projectedSafeToSpend)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5 rounded-[22px] border border-white/14 bg-[#102A4F]/38 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Payment flow</p>
                    <div className="mt-4 space-y-3">
                      {operationalSignals.map((signal, index) => {
                        const isActive = index <= stepIndex;

                        return (
                          <div key={signal} className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full transition ${isActive ? "zila-live-dot bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.38)]" : "bg-white/24"}`} />
                            <span className={`text-[12px] font-medium transition ${isActive ? "text-[#EAF1FF]" : "text-[#8EA4C4]"}`}>{signal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 rounded-[22px] border border-white/14 bg-[#102A4F]/38 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Current setup</p>
                    <div className="mt-4 space-y-3 text-[13px] text-[#E4F0FF]">
                      <div className="flex justify-between gap-4"><span>Project</span><strong className="text-white">{projectName || "Not set"}</strong></div>
                      <div className="flex justify-between gap-4"><span>Commitment</span><strong className="text-white">{commitment}</strong></div>
                      <div className="flex justify-between gap-4"><span>Payment rails</span><strong className="text-right text-white">{stepIndex === 3 ? projectRailLabel : connectedRails.length > 0 ? `${connectedRails.length} selected` : "Later"}</strong></div>
                      <div className="flex justify-between gap-4"><span>Reserve</span><strong className="text-white">{reserveCreated ? reserveName : "Ready"}</strong></div>
                      <div className="flex justify-between gap-4"><span>Safe to Spend</span><strong className="text-[#F7FFC8]">{formatCurrency(stepIndex === 3 ? projectedSafeToSpend : safeToSpend)}</strong></div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <footer className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={goBack} disabled={isFirstStep} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#17345F]/12 bg-white/38 px-4 text-[13px] font-semibold text-[#17345F] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition disabled:opacity-35">
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back
            </button>
            <button
              type="button"
              onClick={stepIndex === 3 ? handleCreateProject : goNext}
              disabled={stepIndex === 4 && !reserveCreated}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#17345F] px-5 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(31,68,116,0.20)] transition disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLastStep ? "Enter workspace" : stepIndex === 3 ? "Create project" : "Continue"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
