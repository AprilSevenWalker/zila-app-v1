import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CreditCard,
  FileText,
  FolderKanban,
  Mic,
  Paperclip,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { ActiveFocusCard } from "@/components/home/ActiveFocusCard";
import { DesktopConnectMoneyPrompt } from "@/components/home/DesktopConnectMoneyPrompt";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";

const suggestionChips = ["Paid a supplier", "Client hasn't paid", "Costs increased", "Can I afford this?"];

const glanceItems = [
  {
    label: "Projects",
    detail: "3 active",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Payments",
    detail: "$4.3K due this week",
    href: "/payments",
    icon: CreditCard,
  },
  {
    label: "Proof of Operations",
    detail: "13 days verified",
    href: "/proof",
    icon: ShieldCheck,
    live: true,
  },
];

const recentActivity = [
  {
    label: "Payment received from Lush Marketing",
    amount: "+$2,400",
    tone: "text-[#D9FF57]",
    time: "Today",
    icon: TrendingUp,
    iconTone: "from-[#173D6D] to-[#102A4F] text-[#D9FF57]",
  },
  {
    label: "Invoice paid to CleanCo",
    amount: "-$1,200",
    tone: "text-[#FB7185]",
    time: "Yesterday",
    icon: TrendingDown,
    iconTone: "from-[#3A1F35] to-[#1E1B2F] text-[#FB7185]",
  },
  {
    label: "Project update",
    amount: "Website Redesign",
    tone: "text-[#AEBBDA]",
    time: "2 days ago",
    icon: FileText,
    iconTone: "from-[#173D6D] to-[#102A4F] text-[#67E8F9]",
  },
];

function CashFlowGraph() {
  return (
    <div className="relative mt-5 h-[126px] overflow-hidden rounded-[22px] border border-white/18 bg-[radial-gradient(circle_at_76%_16%,rgba(103,232,249,0.16),transparent_28%),linear-gradient(180deg,#1D4A78_0%,#17345F_58%,#10233F_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_34px_rgba(25,68,116,0.16),0_22px_48px_rgba(31,68,116,0.18)]">
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
      <div className="absolute right-5 top-10 rounded-[16px] border border-white/18 bg-[#17345F]/92 px-4 py-3 text-right shadow-[0_24px_48px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
        <p className="text-[16px] font-semibold tracking-[-0.04em] text-white">$84,320</p>
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
        className="object-cover object-right opacity-[0.42] saturate-[1.02] contrast-[1.02] brightness-[1.12] [mask-image:linear-gradient(90deg,transparent_0%,transparent_52%,rgba(0,0,0,0.72)_70%,rgba(0,0,0,0.90)_100%)]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_16%,rgba(255,255,255,0.30),transparent_30%),radial-gradient(ellipse_at_56%_2%,rgba(103,232,249,0.22),transparent_26%),linear-gradient(100deg,rgba(21,53,96,0.04)_0%,rgba(65,117,173,0.24)_58%,rgba(212,237,255,0.24)_100%)]" />
      <div className="absolute right-[-14%] top-[10%] h-52 w-[66%] rounded-full bg-[rgba(255,255,255,0.22)] blur-3xl" />
      <div className="absolute right-[8%] top-[-8%] h-48 w-[50%] rounded-full bg-[rgba(103,232,249,0.18)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(16,35,63,0.56),transparent)]" />
    </div>
  );
}

export function DesktopHomeScreen() {
  return (
    <div className="hidden md:block">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="zila-card-hover zila-surface-grain relative overflow-hidden rounded-[32px] border border-white/26 bg-[linear-gradient(155deg,#2B5F94_0%,#1E4A7D_46%,#17345F_100%)] p-8 shadow-[0_34px_82px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.20)] backdrop-blur-xl">
            <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.24),transparent_31%),radial-gradient(circle_at_78%_18%,rgba(103,232,249,0.20),transparent_30%),radial-gradient(circle_at_86%_44%,rgba(217,255,87,0.045),transparent_22%),linear-gradient(180deg,rgba(243,245,249,0.10),transparent_42%)]" />
            <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent_44%,rgba(16,35,63,0.10))]" />
            <HeroVisual />

            <div className="relative z-10 max-w-[620px]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/15 bg-white/12 shadow-[0_4px_20px_rgba(99,102,241,0.15)] backdrop-blur-[14px]">
                  <span className="relative h-[26px] w-[26px]">
                    <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="26px" className="object-contain" />
                  </span>
                </span>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#F3F5F9]">Zila</p>
                <span className="rounded-full border border-[#D9FF57]/28 bg-[#D9FF57]/12 px-3 py-1.5 text-[11px] font-semibold text-[#F7FFC8] shadow-[inset_0_1px_0_rgba(247,248,252,0.10)]">
                  Live update
                </span>
              </div>

              <h1 className="mt-8 max-w-[560px] text-[39px] font-semibold leading-[1.04] tracking-[-0.06em] text-[#F7F8FC]">
                Tell Zila what changed. Your operating view updates.
              </h1>

              <div className="mt-7 flex max-w-[575px] items-center gap-3 rounded-[24px] border border-white/28 bg-white/[0.18] p-3 shadow-[0_24px_52px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(243,245,249,0.20)] backdrop-blur-xl">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/18 bg-[#17345F]/56 text-[#F7F8FC] shadow-[inset_0_1px_0_rgba(247,248,252,0.10)]">
                  <FileText className="h-[16px] w-[16px]" strokeWidth={2} />
                </span>
                <input
                  placeholder="Say it how it happened..."
                  className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-[#F7F8FC] outline-none placeholder:text-[#A7B0C5]"
                />
                <button
                  type="button"
                  className="zila-button-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/85 bg-white text-[#59677F] shadow-[0_12px_24px_rgba(79,70,229,0.10)] hover:text-[#4F46E5]"
                  aria-label="Use microphone"
                >
                  <Mic className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="zila-button-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/85 bg-white text-[#59677F] shadow-[0_12px_24px_rgba(79,70,229,0.10)] hover:text-[#4F46E5]"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="zila-button-hover rounded-full border border-white/18 bg-white/[0.13] px-4 py-2.5 text-[12px] font-semibold text-[#EAF1FF] shadow-[0_12px_24px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(247,248,252,0.10)] hover:bg-white/[0.18]"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <p className="mt-5 text-[13px] font-medium text-[#A7B0C5]">Zila updates your finances, operating history, and next moves instantly.</p>
            </div>
          </section>

          <ProjectCarousel />

          <section className="zila-card-hover zila-surface-grain relative overflow-hidden rounded-[30px] border border-white/20 bg-[linear-gradient(145deg,#1E4A7D_0%,#17345F_50%,#10233F_100%)] p-6 text-white shadow-[0_28px_76px_rgba(31,68,116,0.24),0_34px_90px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.18),transparent_30%),radial-gradient(circle_at_72%_100%,rgba(109,94,248,0.10),transparent_34%),linear-gradient(180deg,rgba(243,245,249,0.08),transparent_36%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[12px] font-medium text-[#AEBBDA]">Here&apos;s where you stand</p>
                  <h2 className="mt-2 text-[50px] font-semibold leading-none tracking-[-0.08em] text-white">$84,320</h2>
                  <p className="mt-2 text-[13px] font-semibold text-[#67E8F9]">+$2,140 this week</p>
                </div>
                <div className="rounded-[22px] border border-white/16 bg-[#17345F]/62 px-4 py-4 text-center shadow-[0_24px_48px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#6D5EF8]/20 text-[#E9F2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <Zap className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <p className="mt-2 text-[14px] font-semibold text-[#C9D4F5]">+8.2%</p>
                  <p className="mt-1 text-[10px] text-[#8292AD]">vs last week</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="w-[49%] rounded-full bg-[#D9FF57] shadow-[0_0_16px_rgba(217,255,87,0.32)]" />
                  <div className="ml-2 w-[22%] rounded-full bg-[#67E8F9]" />
                  <div className="ml-2 flex-1 rounded-full bg-[#6D5EF8]/72" />
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-[#8FA0BC]">
                  <span>Cash · 49%</span>
                  <span>Receivables · 22%</span>
                  <span>Safety net · 29%</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Cash", "$41,200"],
                  ["Receivables", "$18,900"],
                  ["Safety net", "$24,220"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[17px] border border-white/14 bg-[#17345F]/46 px-4 py-4 text-center shadow-[0_14px_30px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
                    <p className="text-[11px] text-[#C9D4F5]">{label}</p>
                    <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.03em] text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[17px] border border-white/6 bg-white/[0.065] px-4 py-3 text-[12px] text-[#D2D9EA] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span>Keeps the business steady if revenue dips or costs rise</span>
                <span className="inline-flex items-center gap-2 text-[#B9F8EA]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.38)]" />
                  Updated just now
                </span>
              </div>
            </div>
          </section>

          <section className="zila-card-hover rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,#F3F5F9,#DCE8FF_86%)] p-5 shadow-[0_28px_72px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
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
                      Move $4,300 to cover upcoming payments
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-[#667085]">
                      This keeps you safe next week and protects project delivery.
                    </p>
                  </div>
                </div>
                <Link
                  href="/payments/make-payment"
                  className="zila-button-hover inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[15px] bg-[#1D4ED8] px-5 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(29,78,216,0.20)]"
                >
                  See details
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

        <aside className="space-y-5">
          <section className="zila-card-hover rounded-[30px] border border-white/20 bg-[linear-gradient(180deg,#214F83,#173D6D_58%,#102A4F)] p-5 text-white shadow-[0_26px_70px_rgba(31,68,116,0.22),0_34px_74px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/16 bg-white/[0.10] text-[#F8FBFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
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
                    className="group flex items-center justify-between rounded-[19px] border border-transparent px-3 py-3.5 transition hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.085] hover:shadow-[0_16px_30px_rgba(0,0,0,0.18)]"
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

          <section className="zila-card-hover rounded-[30px] border border-[#6D5EF8]/18 bg-[radial-gradient(circle_at_82%_0%,rgba(103,232,249,0.14),transparent_26%),linear-gradient(180deg,#173D6D,#214F83_48%,#102A4F)] p-5 text-white shadow-[0_26px_72px_rgba(31,68,116,0.22),0_30px_72px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold tracking-[-0.035em]">Operating flow</p>
              <span className="rounded-full border border-white/10 bg-white/[0.065] px-3.5 py-2 text-[12px] font-semibold text-[#C4CBE0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                This week
              </span>
            </div>
            <CashFlowGraph />
            <div className="mt-6 flex items-center justify-between">
              <p className="text-[18px] font-semibold tracking-[-0.035em]">Recent operational activity</p>
              <Link href="/proof" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C9D4F5] transition hover:text-white">
                View all
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.1} />
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.label}
                    className="group flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.06] px-3.5 py-3.5 shadow-[0_12px_26px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.09] hover:shadow-[0_16px_34px_rgba(31,68,116,0.16)]"
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

          <section className="zila-card-hover rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,#F3F5F9,#E8EDF5_86%)] p-5 shadow-[0_26px_64px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
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

          <section className="zila-card-hover relative overflow-hidden rounded-[30px] border border-[#D9FF57]/18 bg-[linear-gradient(180deg,#1E4A7D,#173D6D_54%,#102A4F)] p-5 text-white shadow-[0_26px_70px_rgba(31,68,116,0.24),0_34px_74px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]">
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
                Project Horizon is the only active pressure point. Move $4,300 or protect a partial reserve to keep the week steady.
              </p>
              <Link
                href="/move-funds"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D9FF57] px-4 py-2.5 text-[12px] font-semibold text-[#111827] shadow-[0_14px_28px_rgba(217,255,87,0.14)]"
              >
                Protect money
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
