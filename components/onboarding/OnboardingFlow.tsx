"use client";

import { startTransition, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FolderKanban,
  Landmark,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { createReserve, getProtectedMoneySummary, type ReserveCategory } from "@/lib/protectedMoneyStore";
import { connectOperatingBalance } from "@/lib/moneyMovementStore";

const ONBOARDING_COMPLETE_KEY = "zila-onboarding-complete";
const GUIDE_STORAGE_KEY = "zila-product-guide-seen";
const TOTAL_STEPS = 6;

const concepts = [
  {
    title: "Projects",
    text: "Track money across real operational work.",
    icon: FolderKanban,
  },
  {
    title: "Protected Money",
    text: "Set aside money for suppliers, payroll, tax, and commitments.",
    icon: LockKeyhole,
  },
  {
    title: "Safe to Spend",
    text: "See what is actually available before making decisions.",
    icon: WalletCards,
  },
  {
    title: "Proof of Operations",
    text: "Every important movement creates a verified operational record.",
    icon: FileCheck2,
  },
];

const projectTypes = ["Client delivery", "Site operations", "Production", "Internal initiative"];
const commitmentSuggestions = ["Supplier payment", "Payroll", "Equipment", "Production", "Travel"];
const reserveCategories: ReserveCategory[] = ["Tax", "Supplier", "Payroll", "Emergency", "Project Reserve"];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function OnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [projectName, setProjectName] = useState("Project Horizon");
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [incomingAmount, setIncomingAmount] = useState("18000");
  const [commitment, setCommitment] = useState("Supplier payment");
  const [reserveName, setReserveName] = useState("Supplier reserve");
  const [reserveCategory, setReserveCategory] = useState<ReserveCategory>("Supplier");
  const [reserveAmount, setReserveAmount] = useState("4300");
  const [reserveCreated, setReserveCreated] = useState(false);
  const [safeToSpend, setSafeToSpend] = useState(() => getProtectedMoneySummary().safeToSpend);

  const currentStep = stepIndex + 1;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const progress = useMemo(() => (currentStep / TOTAL_STEPS) * 100, [currentStep]);

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

  const handleConnectMoney = () => {
    if (connectionStatus !== "idle") {
      return;
    }

    setConnectionStatus("connecting");
    window.setTimeout(() => {
      connectOperatingBalance();
      setConnectionStatus("connected");
    }, 1100);
  };

  const handleCreateProject = () => {
    window.localStorage.setItem("zila-first-project-name", projectName.trim() || "Project Horizon");
    window.localStorage.setItem("zila-first-project-template", projectType);
    window.localStorage.setItem("zila-first-project-incoming", incomingAmount);
    window.localStorage.setItem("zila-first-project-commitment", commitment);
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
                        Your operating system for money movement and decisions.
                      </h1>
                      <p className="mt-6 max-w-[610px] text-[17px] leading-[1.75] text-[#E4F0FF]">
                        Zila helps project-based businesses understand what&apos;s safe to spend, protect important money, and move funds with confidence.
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
                        Four operating concepts keep the business clear.
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
                        Set up your operating balance to receive, move, and protect funds inside Zila.
                      </p>

                      <div className="mt-8 rounded-[26px] border border-white/18 bg-white/[0.10] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                        <div className="space-y-3">
                          {[
                            ["Connecting", connectionStatus === "connecting" || connectionStatus === "connected"],
                            ["Connected successfully", connectionStatus === "connected"],
                            ["Ready to receive money", connectionStatus === "connected"],
                          ].map(([label, active]) => (
                            <div key={label as string} className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#102A4F]/38 px-4 py-3">
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${active ? "bg-[#D9FF57] text-[#102A4F]" : "bg-white/12 text-[#DCEBFF]"}`}>
                                {label === "Connecting" && connectionStatus === "connecting" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> : active ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> : <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />}
                              </span>
                              <p className="text-[14px] font-semibold text-white">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button type="button" onClick={handleConnectMoney} disabled={connectionStatus !== "idle"} className="zila-button-hover mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-[#1D4ED8] px-6 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(29,78,216,0.24)] disabled:cursor-not-allowed disabled:opacity-60">
                        {connectionStatus === "connecting" ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Landmark className="h-4 w-4" strokeWidth={2} />}
                        {connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting" : "Connect money"}
                      </button>
                    </div>
                  ) : null}

                  {stepIndex === 3 ? (
                    <div className="max-w-[680px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">Create your first project</p>
                      <h1 className="mt-3 text-[42px] font-semibold leading-[1.04] tracking-[-0.055em]">Connect money to real operational work.</h1>
                      <div className="mt-7 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Project name</span>
                          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-white/[0.12] px-4 text-[14px] text-white outline-none placeholder:text-[#C9DDF6]/70" />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Type</span>
                          <select value={projectType} onChange={(event) => setProjectType(event.target.value)} className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-[#173D6D] px-4 text-[14px] text-white outline-none">
                            {projectTypes.map((type) => <option key={type}>{type}</option>)}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Expected incoming amount</span>
                          <input value={incomingAmount} onChange={(event) => setIncomingAmount(event.target.value)} inputMode="numeric" className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-white/[0.12] px-4 text-[14px] text-white outline-none placeholder:text-[#C9DDF6]/70" />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Upcoming commitments</span>
                          <select value={commitment} onChange={(event) => setCommitment(event.target.value)} className="mt-2 h-13 w-full rounded-[17px] border border-white/14 bg-[#173D6D] px-4 text-[14px] text-white outline-none">
                            {commitmentSuggestions.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {stepIndex === 4 ? (
                    <div className="max-w-[680px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">Create your first reserve</p>
                      <h1 className="mt-3 text-[42px] font-semibold leading-[1.04] tracking-[-0.055em]">Protect important money before you spend it.</h1>
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
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">First operational insight</p>
                      <h1 className="mt-3 text-[44px] font-semibold leading-[1.02] tracking-[-0.055em]">You&apos;re covered for 18 days after protecting supplier funds.</h1>
                      <p className="mt-5 max-w-[560px] text-[16px] leading-[1.75] text-[#E4F0FF]">
                        Moving money into reserves reduced future payment pressure and kept Project Horizon inside a clearer operating range.
                      </p>
                      <div className="mt-8 rounded-[26px] border border-white/18 bg-white/[0.11] p-5">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Operational signal</p>
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
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BCEEFF]">Why this matters</p>
                  <p className="mt-3 text-[20px] font-semibold leading-[1.3] tracking-[-0.04em]">
                    {stepIndex === 0
                      ? "Zila starts with operational clarity, not financial noise."
                      : stepIndex === 1
                        ? "Projects, protected money, safe range, and proof work together."
                        : stepIndex === 2
                          ? "Your operating balance gives Zila the source of truth for movement."
                          : stepIndex === 3
                            ? "Projects connect every payment to the work it belongs to."
                            : stepIndex === 4
                              ? "Protected money keeps important commitments out of everyday spending."
                              : "Zila turns simple setup into calm decision support."}
                  </p>
                  <div className="mt-6 rounded-[22px] border border-white/14 bg-[#102A4F]/38 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C9DDF6]">Current setup</p>
                    <div className="mt-4 space-y-3 text-[13px] text-[#E4F0FF]">
                      <div className="flex justify-between gap-4"><span>Project</span><strong className="text-white">{projectName || "Not set"}</strong></div>
                      <div className="flex justify-between gap-4"><span>Commitment</span><strong className="text-white">{commitment}</strong></div>
                      <div className="flex justify-between gap-4"><span>Reserve</span><strong className="text-white">{reserveCreated ? reserveName : "Ready"}</strong></div>
                      <div className="flex justify-between gap-4"><span>Safe to Spend</span><strong className="text-[#F7FFC8]">{formatCurrency(safeToSpend)}</strong></div>
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
              disabled={(stepIndex === 2 && connectionStatus !== "connected") || (stepIndex === 4 && !reserveCreated)}
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
