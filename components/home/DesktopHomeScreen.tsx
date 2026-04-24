import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
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

import { DesktopConnectMoneyPrompt } from "@/components/home/DesktopConnectMoneyPrompt";

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
    tone: "text-[#7DD3C7]",
    time: "Today",
    icon: TrendingUp,
    iconTone: "from-[#312E81] to-[#1E1B4B] text-[#A78BFA]",
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
    iconTone: "from-[#1E3A8A] to-[#172554] text-[#93C5FD]",
  },
];

function CashFlowGraph() {
  return (
    <div className="relative mt-5 h-[126px] overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_76%_16%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_18%_88%,rgba(56,189,248,0.08),transparent_30%),linear-gradient(180deg,#0A1230_0%,#050A1A_58%,#020411_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),inset_0_0_34px_rgba(0,0,0,0.28),inset_0_-36px_70px_rgba(0,0,0,0.32),0_22px_48px_rgba(0,0,0,0.26),0_0_28px_rgba(120,100,255,0.08)]">
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
      <div className="absolute right-5 top-10 rounded-[16px] border border-white/14 bg-[#11172F]/95 px-4 py-3 text-right shadow-[0_24px_48px_rgba(0,0,0,0.42),0_0_36px_rgba(124,58,237,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
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
        src="/images/hero.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 900px, 100vw"
        className="object-cover object-right opacity-95 contrast-[0.98] saturate-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(248,246,255,0.76)_0%,rgba(239,246,255,0.48)_28%,rgba(229,240,255,0.18)_52%,rgba(255,255,255,0)_82%),radial-gradient(circle_at_22%_26%,rgba(124,58,237,0.08),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_45%,rgba(15,23,42,0.08)_100%),radial-gradient(circle_at_82%_22%,rgba(15,23,42,0.12),transparent_26%),radial-gradient(ellipse_at_center,rgba(255,255,255,0)_58%,rgba(15,23,42,0.08)_100%)]" />
    </div>
  );
}

export function DesktopHomeScreen() {
  return (
    <div className="hidden md:block">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="zila-card-hover zila-surface-grain zila-animated-gradient relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#EFE7FF_0%,#DDEBFF_42%,#C9DDFF_100%)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_36px_90px_rgba(99,102,241,0.26),0_0_46px_rgba(120,100,255,0.18),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl">
            <div className="zila-hero-breathing-gradient absolute inset-0 z-[1] bg-[radial-gradient(circle_at_14%_18%,rgba(124,58,237,0.10),transparent_34%),radial-gradient(circle_at_38%_6%,rgba(34,211,238,0.10),transparent_36%)]" />
            <div className="pointer-events-none absolute inset-0 z-[3] opacity-[0.028] mix-blend-soft-light [background-image:radial-gradient(circle_at_20%_30%,rgba(15,23,42,0.45)_0_0.55px,transparent_0.8px),radial-gradient(circle_at_70%_62%,rgba(255,255,255,0.55)_0_0.5px,transparent_0.75px)] [background-size:16px_16px,22px_22px]" />
            <HeroVisual />

            <div className="relative z-10 max-w-[620px]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/15 bg-white/12 shadow-[0_4px_20px_rgba(99,102,241,0.15)] backdrop-blur-[14px]">
                  <span className="relative h-[26px] w-[26px]">
                    <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="26px" className="object-contain" />
                  </span>
                </span>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#5B5DE8]">Zila</p>
                <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1.5 text-[11px] font-semibold text-[#344767] shadow-[0_10px_20px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.86)]">
                  Live update
                </span>
              </div>

              <h1 className="mt-8 max-w-[560px] text-[39px] font-semibold leading-[1.04] tracking-[-0.06em] text-[#080F1F] drop-shadow-[0_1px_0_rgba(255,255,255,0.48)]">
                Tell me what changed. I&apos;ll update everything.
              </h1>

              <div className="mt-7 flex max-w-[575px] items-center gap-3 rounded-[24px] border border-white/82 bg-white/82 p-3 shadow-[0_24px_48px_rgba(79,70,229,0.16),0_0_28px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-[#E2E7FF] bg-[linear-gradient(135deg,#FFFFFF,#EAF9FF)] text-[#5B5DE8] shadow-[0_14px_26px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.90)]">
                  <FileText className="h-[16px] w-[16px]" strokeWidth={2} />
                </span>
                <input
                  placeholder="Say it how it happened..."
                  className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-[#263246] outline-none placeholder:text-[#7A879B]"
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
                    className="zila-button-hover rounded-full border border-white/75 bg-white/72 px-4 py-2.5 text-[12px] font-semibold text-[#374763] shadow-[0_12px_24px_rgba(99,102,241,0.09),inset_0_1px_0_rgba(255,255,255,0.84)] hover:bg-white"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <p className="mt-5 text-[13px] font-medium text-[#64748B]">Zila updates your finances and next moves instantly.</p>
            </div>
          </section>

          <section className="zila-card-hover zila-surface-grain zila-animated-gradient-slow relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,#030815_0%,#0D1731_42%,#21145E_100%)] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15),0_34px_86px_rgba(15,23,42,0.36),0_0_52px_rgba(99,102,241,0.22),0_0_40px_rgba(120,100,255,0.15),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(99,102,241,0.42),transparent_30%),radial-gradient(circle_at_84%_6%,rgba(34,211,238,0.24),transparent_28%),radial-gradient(circle_at_70%_100%,rgba(124,58,237,0.20),transparent_34%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[12px] font-medium text-[#AEBBDA]">Here&apos;s where you stand</p>
                  <h2 className="mt-2 text-[50px] font-semibold leading-none tracking-[-0.08em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]">$84,320</h2>
                  <p className="mt-2 text-[13px] font-semibold text-[#67E8F9] drop-shadow-[0_0_14px_rgba(103,232,249,0.42)]">+$2,140 this week</p>
                </div>
                <div className="rounded-[22px] border border-white/12 bg-white/[0.085] px-4 py-4 text-center shadow-[0_24px_48px_rgba(0,0,0,0.24),0_0_30px_rgba(99,102,241,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,rgba(124,58,237,0.66),rgba(34,211,238,0.28))] text-[#E9F2FF] shadow-[0_0_30px_rgba(99,102,241,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <Zap className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <p className="mt-2 text-[14px] font-semibold text-[#B9C3FF]">+8.2%</p>
                  <p className="mt-1 text-[10px] text-[#8292AD]">vs last week</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="w-[49%] rounded-full bg-[linear-gradient(90deg,#7C3AED,#5B5DE8)] shadow-[0_0_24px_rgba(99,102,241,0.82)]" />
                  <div className="ml-2 w-[22%] rounded-full bg-[linear-gradient(90deg,#22D3EE,#67E8F9)] shadow-[0_0_24px_rgba(69,213,233,0.64)]" />
                  <div className="ml-2 flex-1 rounded-full bg-[linear-gradient(90deg,#39445F,#56627F)]" />
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
                  <div key={label} className="rounded-[17px] border border-white/10 bg-white/[0.075] px-4 py-4 text-center shadow-[0_14px_30px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
                    <p className="text-[11px] text-[#8FA0BC]">{label}</p>
                    <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.03em] text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[17px] border border-white/6 bg-white/[0.065] px-4 py-3 text-[12px] text-[#D2D9EA] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span>Keeps the business steady if revenue dips or costs rise</span>
                <span className="inline-flex items-center gap-2 text-[#B9F8EA]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3C7] shadow-[0_0_12px_rgba(125,211,199,0.8)]" />
                  Updated just now
                </span>
              </div>
            </div>
          </section>

          <section className="zila-card-hover rounded-[30px] border border-white/76 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,246,255,0.78))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.10),0_30px_70px_rgba(99,102,241,0.14),0_0_32px_rgba(120,100,255,0.10),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7A8498]">What needs your attention</p>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-[#667085]">Zila looks ahead and shows the next best move.</p>
            </div>

            <div className="rounded-[24px] border border-[#C7CBFF] bg-[radial-gradient(circle_at_12%_12%,rgba(99,102,241,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,242,255,0.90))] p-4 shadow-[0_24px_48px_rgba(99,102,241,0.18),0_0_26px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="flex items-center justify-between gap-5">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/70 bg-[linear-gradient(135deg,#6D5DFB,#22D3EE)] text-white shadow-[0_16px_32px_rgba(99,102,241,0.24),0_0_22px_rgba(34,211,238,0.18)]">
                    <Zap className="h-[19px] w-[19px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6366F1]">To stay on track</p>
                    <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.035em] text-[#182033]">
                      Move $4,300 to cover upcoming payments
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-[#667085]">
                      This keeps you safe next week and protects project delivery.
                    </p>
                  </div>
                </div>
                <Link
                  href="/move-funds"
                  className="zila-button-hover inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[15px] bg-[linear-gradient(135deg,#4F46E5,#7C3AED)] px-5 text-[13px] font-semibold text-white shadow-[0_20px_38px_rgba(99,102,241,0.34),0_0_22px_rgba(124,58,237,0.16)]"
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
        </div>

        <aside className="space-y-5">
          <section className="zila-card-hover rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.20),transparent_28%),linear-gradient(180deg,#040916,#0E172D_58%,#151044)] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15),0_34px_74px_rgba(15,23,42,0.30),0_0_44px_rgba(99,102,241,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#4338CA,#0EA5E9)] text-[#F8FBFF] shadow-[0_0_28px_rgba(99,102,241,0.32),inset_0_1px_0_rgba(255,255,255,0.14)]">
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
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/9 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(34,211,238,0.08))] text-[#DCE7FF] shadow-[0_0_18px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.09)]">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.85} />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#E9EEF9]">{item.label}</p>
                        <p className="mt-0.5 text-[11px] text-[#8998B2]">{item.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.live ? <span className="h-2 w-2 rounded-full bg-[#7DD3C7] shadow-[0_0_12px_rgba(125,211,199,0.8)]" /> : null}
                      <ArrowRight className="h-[13px] w-[13px] text-[#69758B] transition group-hover:translate-x-0.5 group-hover:text-white" strokeWidth={2} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="zila-card-hover rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.18),transparent_28%),linear-gradient(180deg,#050A17,#111936)] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15),0_30px_68px_rgba(15,23,42,0.28),0_0_36px_rgba(124,58,237,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold tracking-[-0.035em]">Cash flow trend</p>
              <span className="rounded-full border border-white/10 bg-white/[0.065] px-3.5 py-2 text-[12px] font-semibold text-[#C4CBE0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                This week
              </span>
            </div>
            <CashFlowGraph />
            <div className="mt-6 flex items-center justify-between">
              <p className="text-[18px] font-semibold tracking-[-0.035em]">Recent activity</p>
              <Link href="/proof" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A78BFA] transition hover:text-white">
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
                    className="group flex items-center justify-between gap-3 rounded-[18px] border border-white/7 bg-white/[0.045] px-3.5 py-3.5 shadow-[0_12px_26px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.07] hover:shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activity.iconTone} shadow-[0_0_22px_rgba(120,100,255,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]`}>
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

          <section className="zila-card-hover relative min-h-[178px] overflow-hidden rounded-[30px] border border-white/10 bg-[#11103B] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15),0_34px_74px_rgba(15,23,42,0.30),0_0_42px_rgba(99,102,241,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Image
              src="/images/card.png"
              alt=""
              fill
              unoptimized
              sizes="320px"
              className="object-contain object-center opacity-90 saturate-[1.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,59,0.99)_0%,rgba(17,16,59,0.84)_40%,rgba(17,16,59,0.40)_72%,rgba(17,16,59,0.12)_100%),radial-gradient(circle_at_80%_24%,rgba(251,191,36,0.24),transparent_24%),radial-gradient(circle_at_20%_90%,rgba(99,102,241,0.20),transparent_30%)]" />
            <div className="relative">
              <div className="relative h-[34px] w-[34px] drop-shadow-[0_0_16px_rgba(124,125,255,0.24)]">
                <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="34px" className="object-contain" />
              </div>
              <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.04em]">Your business. In sync.</h3>
              <p className="mt-3 max-w-[190px] text-[13px] leading-[1.6] text-[#AEBBDA]">
                Every update brings clarity. Every decision moves you forward.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default DesktopHomeScreen;
