"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CreditCard,
  FileText,
  FolderKanban,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

import { ActiveFocusCard } from "@/components/home/ActiveFocusCard";
import { DesktopConnectMoneyPrompt } from "@/components/home/DesktopConnectMoneyPrompt";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { projects as seedProjects } from "@/data/projects";
import {
  getPaymentMovementHistory,
  getLatestPaymentTransaction,
  subscribeToLatestPaymentTransaction,
  type LatestPaymentTransaction,
  type PaymentMovementRecord,
} from "@/lib/paymentTransactionStore";
import { getStoredOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";
import {
  BASE_PROTECTED,
  COMMITTED,
  getProtectedMoneySummary,
  subscribeToProtectedMoney,
  TOTAL_BALANCE,
} from "@/lib/protectedMoneyStore";

const suggestionChips = ["Supplier payout ready", "Reserve protected"];

const glanceItems = [
  {
    label: "Projects",
    detail: "Pressure and runway",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Payments",
    detail: "$4.3K supplier payout",
    href: "/payments",
    icon: CreditCard,
  },
  {
    label: "Proof",
    detail: "Generated from activity",
    href: "/proof",
    icon: ShieldCheck,
    live: true,
  },
];

const defaultRecentActivity = [
  {
    label: "Northline invoice attached",
    amount: "$4,300",
    tone: "text-[#D9FF57]",
    time: "Today",
    icon: FileText,
    iconTone: "from-[#173D6D] to-[#102A4F] text-[#D9FF57]",
  },
  {
    label: "Supplier reserve protected",
    amount: "$24,220",
    tone: "text-[#67E8F9]",
    time: "Today",
    icon: ShieldCheck,
    iconTone: "from-[#173D6D] to-[#102A4F] text-[#67E8F9]",
  },
  {
    label: "Stablecoin route prepared",
    amount: "XRPL ready",
    tone: "text-[#AEBBDA]",
    time: "Today",
    icon: TrendingUp,
    iconTone: "from-[#173D6D] to-[#102A4F] text-[#BFA7FF]",
  },
];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

type ProtectedMoneySummary = ReturnType<typeof getProtectedMoneySummary>;

function getInitialProtectedMoneySummary(): ProtectedMoneySummary {
  return {
    reserves: [],
    activity: [],
    totalBalance: TOTAL_BALANCE,
    protectedAmount: BASE_PROTECTED,
    committedAmount: COMMITTED,
    safeToSpend: Math.max(TOTAL_BALANCE - BASE_PROTECTED - COMMITTED, 0),
  };
}

function formatActivityTime(value: string) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) {
    return "Recently";
  }

  const minutes = Math.max(Math.round((Date.now() - createdAt.getTime()) / 60000), 0);
  if (minutes < 2) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} mins ago`;
  }

  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} hrs ago` : createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function movementActivity(record: PaymentMovementRecord) {
  const isVerified = record.status === "Verified" || record.txHash;

  return {
    label: isVerified ? `${record.recipientName ?? "Supplier"} payout verified` : record.title,
    amount: record.amountLabel,
    tone: isVerified ? "text-[#D9FF57]" : "text-[#67E8F9]",
    time: formatActivityTime(record.createdAtIso),
    icon: isVerified ? ShieldCheck : CreditCard,
    iconTone: isVerified ? "from-[#173D6D] to-[#102A4F] text-[#D9FF57]" : "from-[#173D6D] to-[#102A4F] text-[#67E8F9]",
  };
}

function CashFlowGraph() {
  return (
    <div className="relative mt-4 h-[112px] overflow-hidden rounded-[20px] border border-white/18 bg-[radial-gradient(circle_at_76%_16%,rgba(103,232,249,0.16),transparent_28%),linear-gradient(180deg,#1D4A78_0%,#17345F_58%,#10233F_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_34px_rgba(25,68,116,0.16),0_22px_48px_rgba(31,68,116,0.18)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0)),radial-gradient(circle_at_72%_28%,rgba(167,139,250,0.10),transparent_24%),radial-gradient(circle_at_18%_90%,rgba(34,211,238,0.06),transparent_28%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 292 126" fill="none" aria-hidden="true">
        <path
          d="M8 92C24 82 31 57 45 56C62 55 65 82 84 79C105 76 110 52 132 50C154 48 159 59 178 48C197 37 204 22 221 22C239 22 245 39 262 36C274 34 280 21 288 18L288 126L8 126Z"
          fill="url(#chartAreaGlow)"
          opacity="0.72"
        />
        <path
          d="M8 92C24 82 31 57 45 56C62 55 65 82 84 79C105 76 110 52 132 50C154 48 159 59 178 48C197 37 204 22 221 22C239 22 245 39 262 36C274 34 280 21 288 18"
          stroke="rgba(124,58,237,0.32)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#chartGlow)"
        />
        <path
          d="M8 92C24 82 31 57 45 56C62 55 65 82 84 79C105 76 110 52 132 50C154 48 159 59 178 48C197 37 204 22 221 22C239 22 245 39 262 36C274 34 280 21 288 18"
          stroke="url(#premiumChartLine)"
          strokeWidth="6.6"
          strokeLinecap="round"
          filter="url(#linePolish)"
        />
        <path
          d="M8 92C24 82 31 57 45 56C62 55 65 82 84 79C105 76 110 52 132 50C154 48 159 59 178 48C197 37 204 22 221 22C239 22 245 39 262 36C274 34 280 21 288 18"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle cx="221" cy="22" r="19" fill="rgba(167,139,250,0.30)" filter="url(#pointGlow)" />
        <circle cx="221" cy="22" r="11" fill="rgba(56,189,248,0.20)" stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" />
        <circle cx="221" cy="22" r="7.8" fill="#C4B5FD" stroke="rgba(255,255,255,0.98)" strokeWidth="3" />
        <circle cx="221" cy="22" r="3.2" fill="#FFFFFF" />
        <defs>
          <linearGradient id="premiumChartLine" x1="8" y1="92" x2="288" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A66BFF" />
            <stop offset="0.44" stopColor="#D9B4FF" />
            <stop offset="1" stopColor="#67E8F9" />
          </linearGradient>
          <linearGradient id="chartAreaGlow" x1="148" y1="18" x2="148" y2="126" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" stopOpacity="0.18" />
            <stop offset="0.46" stopColor="#6366F1" stopOpacity="0.08" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
          <filter id="chartGlow" x="-32" y="-34" width="358" height="190" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="5.5" />
          </filter>
          <filter id="linePolish" x="-28" y="-28" width="348" height="182" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="#8B5CF6" floodOpacity="0.58" />
            <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#38BDF8" floodOpacity="0.18" />
          </filter>
          <filter id="pointGlow" x="181" y="-18" width="80" height="80" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
      </svg>
      <div className="absolute right-4 top-8 rounded-[15px] border border-white/18 bg-[#17345F]/92 px-3.5 py-2.5 text-right shadow-[0_24px_48px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
        <p className="text-[15px] font-semibold tracking-[-0.04em] text-white">$84,320</p>
        <p className="mt-1 text-[10px] font-medium text-[#97A4C4]">Total capital</p>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-[32px]">
      <Image
        src="/zila-home-hero-mountain.png"
        alt=""
        fill
        unoptimized
        sizes="900px"
        className="object-cover object-right opacity-[0.42] saturate-[1.02] contrast-[1.02] brightness-[1.12] [mask-image:linear-gradient(90deg,transparent_0%,transparent_66%,rgba(0,0,0,0.34)_78%,rgba(0,0,0,0.90)_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,transparent_66%,rgba(0,0,0,0.34)_78%,rgba(0,0,0,0.90)_100%)]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_16%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(ellipse_at_56%_2%,rgba(103,232,249,0.11),transparent_28%),linear-gradient(100deg,rgba(21,53,96,0.03)_0%,rgba(65,117,173,0.12)_58%,rgba(212,237,255,0.12)_100%)]" />
      <div className="absolute right-[8%] top-[-8%] h-48 w-[50%] rounded-full bg-[rgba(103,232,249,0.09)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(16,35,63,0.44),transparent)]" />
    </div>
  );
}

export function DesktopHomeScreen() {
  const [latestPayment, setLatestPayment] = useState<LatestPaymentTransaction | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentMovementRecord[]>([]);
  const [moneySummary, setMoneySummary] = useState(getInitialProtectedMoneySummary);
  const [storedProjects, setStoredProjects] = useState<ReturnType<typeof getStoredOperationalProjects>>([]);
  const displayActivity = useMemo(() => {
    if (latestPayment) {
      return [
        {
          label: `${latestPayment.recipientName ?? "Supplier"} payout completed`,
          amount: latestPayment.amountLabel,
          tone: "text-[#D9FF57]",
          time: "Just now",
          icon: CreditCard,
          iconTone: "from-[#173D6D] to-[#102A4F] text-[#D9FF57]",
        },
        {
          label: "Reserve and runway recalculated",
          amount: latestPayment.reserveAfter ?? formatCurrency(moneySummary.protectedAmount),
          tone: "text-[#67E8F9]",
          time: "Just now",
          icon: ShieldCheck,
          iconTone: "from-[#173D6D] to-[#102A4F] text-[#67E8F9]",
        },
        {
          label: "Operational proof generated",
          amount: "XRPL synced",
          tone: "text-[#AEBBDA]",
          time: "Just now",
          icon: FileText,
          iconTone: "from-[#173D6D] to-[#102A4F] text-[#BFA7FF]",
        },
      ];
    }

    if (paymentHistory.length > 0) {
      return paymentHistory.slice(0, 3).map(movementActivity);
    }

    const seedNames = new Set(seedProjects.map((project) => project.name.toLowerCase()));
    const newestProject = storedProjects.find((project) => !seedNames.has(project.name.toLowerCase()));
    if (newestProject) {
      return [
        {
          label: `${newestProject.name} project created`,
          amount: "Workspace live",
          tone: "text-[#D9FF57]",
          time: "Just now",
          icon: FolderKanban,
          iconTone: "from-[#173D6D] to-[#102A4F] text-[#D9FF57]",
        },
        {
          label: "Payment flow connected",
          amount: "Ready",
          tone: "text-[#67E8F9]",
          time: "Just now",
          icon: CreditCard,
          iconTone: "from-[#173D6D] to-[#102A4F] text-[#67E8F9]",
        },
        {
          label: "Operational memory prepared",
          amount: "Proof ready",
          tone: "text-[#AEBBDA]",
          time: "Just now",
          icon: FileText,
          iconTone: "from-[#173D6D] to-[#102A4F] text-[#BFA7FF]",
        },
      ];
    }

    return defaultRecentActivity;
  }, [latestPayment, moneySummary.protectedAmount, paymentHistory, storedProjects]);

  useEffect(() => {
    const updatePayment = () => {
      setLatestPayment(getLatestPaymentTransaction());
      setPaymentHistory(getPaymentMovementHistory());
    };
    const updateMoney = () => setMoneySummary(getProtectedMoneySummary());
    const updateProjects = () => setStoredProjects(getStoredOperationalProjects());

    updatePayment();
    updateMoney();
    updateProjects();
    const unsubscribePayment = subscribeToLatestPaymentTransaction(() => {
      updatePayment();
      updateMoney();
    });
    const unsubscribeProtected = subscribeToProtectedMoney(updateMoney);
    const unsubscribeProjects = subscribeToOperationalProjects(updateProjects);

    return () => {
      unsubscribePayment();
      unsubscribeProtected();
      unsubscribeProjects();
    };
  }, []);

  return (
    <div className="hidden lg:block">
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_270px]">
        <div className="space-y-3">
          <section className="zila-card-hover zila-surface-grain relative min-h-[430px] overflow-hidden rounded-[26px] border border-white/18 bg-[linear-gradient(150deg,#254E7F_0%,#1E416E_44%,#17345F_100%)] p-5 shadow-[0_28px_66px_rgba(31,68,116,0.20),0_0_34px_rgba(103,232,249,0.06),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl">
            <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_16%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_72%_18%,rgba(103,232,249,0.12),transparent_30%),radial-gradient(circle_at_86%_50%,rgba(217,255,87,0.025),transparent_24%),linear-gradient(180deg,rgba(243,245,249,0.08),transparent_48%)]" />
            <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_44%,rgba(16,35,63,0.12))]" />
            <HeroVisual />

            <div className="relative z-10 max-w-[660px]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/15 bg-white/12 shadow-[0_4px_20px_rgba(99,102,241,0.15)] backdrop-blur-[14px]">
                  <span className="relative h-[24px] w-[24px]">
                    <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="26px" className="object-contain" />
                  </span>
                </span>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#DCE8FF]">Operational OS</p>
                <span className="rounded-full border border-[#D9FF57]/20 bg-[#D9FF57]/8 px-3 py-1.5 text-[11px] font-semibold text-[#F7FFC8] shadow-[inset_0_1px_0_rgba(246,245,241,0.08)]">
                  Live coordination
                </span>
              </div>

              <h1 className="mt-8 max-w-[720px] text-[52px] font-semibold leading-[0.92] tracking-[-0.075em] text-[#F6F5F1] md:text-[60px]">
                Coordinate projects, payments, and approvals across borders.
              </h1>

              <p className="mt-6 max-w-[520px] text-[16px] font-medium leading-[1.72] text-[#F6F5F1]/76">
                Money moves constantly across projects, suppliers, approvals, and borders. Zila keeps operations coordinated in real time.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="zila-button-hover rounded-full border border-white/14 bg-white/[0.075] px-3 py-1.5 text-[11px] font-semibold text-[#EAF1FF]/80 shadow-[0_12px_24px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(246,245,241,0.08)] hover:bg-white/[0.11]"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <p className="mt-5 text-[11px] font-medium text-[#A7B0C5]">Across banks, mobile money, and stablecoin rails.</p>
            </div>

          </section>

          <ProjectCarousel />

          <section className="zila-card-hover zila-surface-grain relative overflow-hidden rounded-[24px] border border-white/20 bg-[linear-gradient(145deg,#1E4A7D_0%,#17345F_50%,#10233F_100%)] p-4 text-white shadow-[0_24px_58px_rgba(31,68,116,0.20),0_28px_68px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.18),transparent_30%),radial-gradient(circle_at_72%_100%,rgba(109,94,248,0.10),transparent_34%),linear-gradient(180deg,rgba(243,245,249,0.08),transparent_36%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[12px] font-medium text-[#AEBBDA]">Here&apos;s where you stand</p>
                  <h2 className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.08em] text-white">$84,320</h2>
                  <p className="mt-2 text-[13px] font-semibold text-[#67E8F9]">+$2,140 this week</p>
                </div>
                <div className="rounded-[20px] border border-white/16 bg-[#17345F]/62 px-3.5 py-3.5 text-center shadow-[0_22px_42px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#6D5EF8]/20 text-[#E9F2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <Zap className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <p className="mt-2 text-[14px] font-semibold text-[#C9D4F5]">+8.2%</p>
                  <p className="mt-1 text-[10px] text-[#8292AD]">vs last week</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="w-[49%] rounded-full bg-[#D9FF57] shadow-[0_0_16px_rgba(217,255,87,0.32)]" />
                  <div className="ml-2 w-[22%] rounded-full bg-[#67E8F9]" />
                  <div className="ml-2 flex-1 rounded-full bg-[#6D5EF8]/72" />
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-[#8FA0BC]">
                  <span>Cash · 49%</span>
                  <span>Receivables · 22%</span>
                  <span>Protected reserve · 29%</span>
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                {[
                  ["Cash", formatCurrency(Math.max(moneySummary.totalBalance - moneySummary.committedAmount - moneySummary.protectedAmount, 0))],
                  ["Receivables", "$18,900"],
                  ["Protected reserve", formatCurrency(moneySummary.protectedAmount)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[16px] border border-white/14 bg-[#17345F]/46 px-3 py-3 text-center shadow-[0_14px_30px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
                    <p className="text-[11px] text-[#C9D4F5]">{label}</p>
                    <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.03em] text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[17px] border border-white/6 bg-white/[0.065] px-4 py-3 text-[12px] text-[#D2D9EA] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span>{latestPayment ? `${latestPayment.projectName} refreshed after supplier payout` : "Keeps the business steady if revenue dips or costs rise"}</span>
                <span className="inline-flex items-center gap-2 text-[#B9F8EA]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.38)]" />
                  {latestPayment ? "Synced just now" : "Updated just now"}
                </span>
              </div>
            </div>
          </section>

          <section className="zila-card-hover rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,#F3F5F9,#DCE8FF_86%)] p-4 shadow-[0_26px_64px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7A8498]">Safe to spend</p>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-[#667085]">Keep today&apos;s choices inside the operating range.</p>
            </div>

            <div className="rounded-[24px] border border-[#C8D2E4] bg-[linear-gradient(135deg,#FFFFFF,#F3F5F9_58%,#E4ECF8)] p-4 shadow-[0_24px_54px_rgba(17,24,39,0.13),inset_0_1px_0_rgba(255,255,255,0.94)]">
              <div className="flex items-center justify-between gap-5">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/70 bg-[#173D6D] text-white shadow-[0_16px_32px_rgba(31,68,116,0.20)]">
                    <Zap className="h-[19px] w-[19px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#1D4ED8]">To stay on track</p>
                    <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.035em] text-[#182033]">
                      {latestPayment ? `${latestPayment.recipientName ?? "Supplier"} obligation cleared` : "Coordinate the $4,300 Northline payout"}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-[#667085]">
                      {latestPayment
                        ? `Reserve remains ${latestPayment.reserveAfter ?? formatCurrency(moneySummary.protectedAmount)} and proof is now attached.`
                        : "Stablecoin settlement can clear the obligation while the supplier reserve remains protected."}
                    </p>
                  </div>
                </div>
                <Link
                  href={latestPayment ? "/proof" : "/payments/send"}
                  className="zila-button-hover inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[15px] bg-[#1D4ED8] px-5 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(29,78,216,0.20)]"
                >
                  {latestPayment ? "View proof" : "Make Payment"}
                  <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
                </Link>
              </div>
            </div>

            <div className="mt-3">
              <DesktopConnectMoneyPrompt />
            </div>
          </section>

          <ActiveFocusCard />
        </div>

        <aside className="space-y-3.5">
          <section className="zila-card-hover rounded-[26px] border border-white/20 bg-[linear-gradient(180deg,#214F83,#173D6D_58%,#102A4F)] p-4 text-white shadow-[0_24px_62px_rgba(31,68,116,0.20),0_30px_66px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] border border-white/16 bg-white/[0.10] text-[#F8FBFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <BarChart3 className="h-[20px] w-[20px]" strokeWidth={1.9} />
              </span>
              <p className="text-[16px] font-semibold tracking-[-0.025em]">At a glance</p>
            </div>

            <div className="space-y-2">
              {glanceItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between rounded-[17px] border border-transparent px-2.5 py-2.5 transition hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.085] hover:shadow-[0_16px_30px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/12 bg-white/[0.08] text-[#DCE7FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.85} />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#E9EEF9]">{item.label}</p>
                        <p className="mt-0.5 text-[11px] text-[#8998B2]">{item.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.live ? <span className="h-2 w-2 rounded-full bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.38)]" /> : null}
                      <ArrowRight className="h-[13px] w-[13px] text-[#69758B] transition group-hover:translate-x-0.5 group-hover:text-white" strokeWidth={2} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="zila-card-hover rounded-[26px] border border-[#6D5EF8]/18 bg-[radial-gradient(circle_at_82%_0%,rgba(103,232,249,0.14),transparent_26%),linear-gradient(180deg,#173D6D,#214F83_48%,#102A4F)] p-4 text-white shadow-[0_24px_62px_rgba(31,68,116,0.20),0_28px_64px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold tracking-[-0.035em]">Operating flow</p>
              <span className="rounded-full border border-white/10 bg-white/[0.065] px-3.5 py-2 text-[12px] font-semibold text-[#C4CBE0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                This week
              </span>
            </div>
            <CashFlowGraph />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[18px] font-semibold tracking-[-0.035em]">Recent operational activity</p>
              <Link href="/proof" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C9D4F5] transition hover:text-white">
                View all
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.1} />
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {displayActivity.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.label}
                    className="group flex items-center justify-between gap-3 rounded-[17px] border border-white/10 bg-white/[0.06] px-3 py-2.5 shadow-[0_12px_26px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.09] hover:shadow-[0_16px_34px_rgba(31,68,116,0.16)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activity.iconTone} shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#E5EAF6]">{activity.label}</p>
                        <p className="mt-1 text-[11px] text-[#8998B2]">{activity.time}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                    <p className={`text-[17px] font-semibold tracking-[-0.04em] ${activity.tone}`}>{activity.amount}</p>
                      <p className="mt-1 text-[11px] text-[#7E8BA6]">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="zila-card-hover rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,#F3F5F9,#E8EDF5_86%)] p-4 shadow-[0_24px_58px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/80 bg-white text-[#6D5EF8] shadow-[0_14px_28px_rgba(17,24,39,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <Brain className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
                    <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A8498]">Business memory</p>
                <p className="mt-2 text-[18px] font-semibold leading-[1.38] tracking-[-0.035em] text-[#121417]">
                  Supplier costs tend to rise during delivery weeks.
                </p>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#667085]">
                  Zila recognised a similar pressure pattern from last month and kept this week&apos;s safe range tighter.
                </p>
              </div>
            </div>
          </section>

          <section className="zila-card-hover relative overflow-hidden rounded-[26px] border border-[#D9FF57]/18 bg-[linear-gradient(180deg,#1E4A7D,#173D6D_54%,#102A4F)] p-4 text-white shadow-[0_24px_62px_rgba(31,68,116,0.22),0_30px_66px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(217,255,87,0.08),transparent_26%),linear-gradient(180deg,rgba(243,245,249,0.045),transparent_40%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">Today&apos;s operating signal</p>
                  <h3 className="mt-3 text-[20px] font-semibold leading-[1.18] tracking-[-0.04em]">
                    Protect the supplier payment before Friday.
                  </h3>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-[#D9FF57]/22 bg-[#D9FF57]/12 text-[#F7FFC8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.9} />
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-[1.6] text-[#DCE8FF]">
                {latestPayment
                  ? `${latestPayment.projectName} is synced. Supplier obligation settled, reserve recalculated, and proof generated automatically.`
                  : "Project Horizon is the only active pressure point. Coordinate the Northline payout without drawing down the protected reserve."}
              </p>
              <Link
                href={latestPayment ? "/proof" : "/payments/send"}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D9FF57] px-4 py-2.5 text-[12px] font-semibold text-[#111827] shadow-[0_14px_28px_rgba(217,255,87,0.14)]"
              >
                {latestPayment ? "View proof" : "Make Payment"}
                <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default DesktopHomeScreen;
