import Link from "next/link";
import { ArrowUpRight, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { CurrencyAmount, getFxHelperText } from "@/components/ui/CurrencyAmount";
import { IconTile } from "@/components/ui/IconTile";
import { getCashflowOverview } from "@/data/payments";

export default function PaymentsPage() {
  const overview = getCashflowOverview();

  return (
    <AppShell>
      <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(160deg,#0D142B_0%,#171E46_42%,#1F2559_72%,#15374F_100%)] px-6 pb-28 pt-8 text-white">
        <div className="absolute inset-x-0 top-14 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.18),transparent_22%),linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
        <div className="absolute left-[8%] top-[16%] h-52 w-40 rotate-[18deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.018)_38%,rgba(255,255,255,0)_82%)] blur-2xl opacity-65" />
        <div className="absolute right-[-2rem] top-[26%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.14),rgba(129,140,248,0.08)_48%,rgba(129,140,248,0)_78%)] blur-3xl opacity-80" />

        <div className="relative flex flex-1 flex-col space-y-6">
          <div className="max-w-[320px]">
            <div className="mb-5 inline-flex h-8 w-8 items-center justify-center">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#7EE7F6] shadow-[0_0_18px_rgba(126,231,246,0.32)]">
                <span className="absolute inset-0 rounded-full border border-[#A5B4FC]/55"></span>
              </span>
            </div>
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#B7C2E0]">Cashflow overview</p>
            <h1 className="mt-4 text-[42px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              Payments
            </h1>
            <p className="mt-5 max-w-[292px] text-[16px] leading-[1.68] text-[#D4DCEF]/84">
              Know how much money you have, where it sits, and what can move right now.
            </p>
          </div>

          <section className="rounded-[34px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(15,23,42,0.38))] p-8 shadow-[0_24px_58px_rgba(5,10,24,0.28),0_0_34px_rgba(34,211,238,0.07),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-start gap-3">
              <IconTile size="md" glow="cyan" className="flex-shrink-0 bg-white/10 text-white/95">
                <WalletCards className="h-[18px] w-[18px]" strokeWidth={2} />
              </IconTile>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Total available</p>
                <div className="relative mt-5">
                  <div className="absolute left-[-1.5rem] top-1/2 h-28 w-56 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.24),rgba(59,130,246,0.16)_42%,rgba(59,130,246,0)_74%)] blur-2xl opacity-85" />
                  <CurrencyAmount
                    amount={overview.totalAvailable}
                    primaryClassName="relative text-[52px] font-semibold leading-none tracking-[-0.075em] text-transparent bg-[linear-gradient(90deg,#7EE7F6_0%,#67E8F9_34%,#93C5FD_68%,#C4B5FD_100%)] bg-clip-text [text-shadow:0_0_24px_rgba(34,211,238,0.14)]"
                    secondaryClassName="mt-2 text-[14px] font-medium tracking-[0.02em] text-[#9EC5E8]"
                  />
                </div>
                <p className="mt-5 text-[15px] leading-relaxed text-[#CBD5E1]">Across all accounts</p>
                <p className="mt-2 text-[12px] text-[#89A3C6]">{getFxHelperText()}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-6 shadow-[0_20px_42px_rgba(5,10,24,0.18),0_0_26px_rgba(99,102,241,0.05),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">What you can do</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link
                href="/payments/make-payment"
                className="inline-flex h-14 items-center justify-center rounded-[20px] border border-cyan-300/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(129,140,248,0.14))] px-5 text-[14px] font-semibold text-[#F4FBFF] shadow-[0_10px_26px_rgba(34,211,238,0.14),0_0_28px_rgba(34,211,238,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/44 hover:shadow-[0_16px_32px_rgba(34,211,238,0.2),0_0_34px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.16)] active:translate-y-0"
              >
                Make payment
              </Link>
              <Link
                href="/move-funds"
                className="inline-flex h-14 items-center justify-center rounded-[20px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] px-5 text-[14px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.09] hover:shadow-[0_12px_26px_rgba(15,23,42,0.16),0_0_20px_rgba(99,102,241,0.06),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0"
              >
                Move funds
              </Link>
              <Link
                href="/payments/connect-account"
                className="inline-flex h-14 items-center justify-center rounded-[20px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] px-5 text-[14px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.09] hover:shadow-[0_12px_26px_rgba(15,23,42,0.16),0_0_20px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0"
              >
                Connect account
              </Link>
              <Link
                href="/ask?action=upload-document"
                className="inline-flex h-14 items-center justify-center rounded-[20px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.035))] px-5 text-[14px] font-semibold text-[#EAFBFF] shadow-[0_0_18px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/28 hover:shadow-[0_12px_26px_rgba(15,23,42,0.16),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0"
              >
                Upload document
              </Link>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(228,236,255,0.12),rgba(255,255,255,0.035))] p-5 shadow-[0_18px_34px_rgba(8,15,32,0.14),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(236,253,255,0.12),rgba(191,219,254,0.06))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Free to use</p>
                <div className="mt-3 w-full min-w-0">
                  <CurrencyAmount
                    amount={overview.allocation.freeToUse}
                    containerClassName="w-full min-w-0"
                    primaryClassName="block w-full min-w-0 whitespace-nowrap text-2xl font-semibold leading-none tracking-[-0.03em] text-white sm:text-3xl"
                    secondaryClassName="mt-1 block w-full min-w-0 text-[12px] font-medium text-[#A8CAE1]"
                  />
                </div>
              </div>
              <div className="min-w-0 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(224,231,255,0.12),rgba(148,163,184,0.06))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D7E2FF]">Allocated</p>
                <div className="mt-3 w-full min-w-0">
                  <CurrencyAmount
                    amount={overview.allocation.allocated}
                    containerClassName="w-full min-w-0"
                    primaryClassName="block w-full min-w-0 whitespace-nowrap pr-1 text-[26px] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[28px]"
                    secondaryClassName="mt-1 block w-full min-w-0 text-[12px] font-medium text-[#B9C7E6]"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B7C2E0]">
                Allocated across projects
              </p>
              <div className="mt-3 space-y-2.5">
                {overview.allocation.projectBreakdown.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] bg-white/[0.035] px-4 py-3"
                  >
                    <p className="text-[13px] font-medium text-[#E7EEFF]">{allocation.project}</p>
                    <CurrencyAmount
                      amount={allocation.amount}
                      align="right"
                      primaryClassName="text-[15px] font-semibold text-white"
                      secondaryClassName="mt-0.5 text-[11px] font-medium text-[#AFC0DD]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-5 flex items-center gap-2">
              <IconTile glow="indigo" className="bg-white/6 text-[#DCE8F8]">
                <Landmark className="h-3.5 w-3.5" strokeWidth={2} />
              </IconTile>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">
                Where your money is
              </h2>
            </div>
            <div className="space-y-3">
              {overview.rails.map((rail) => (
                <div
                  key={rail.id}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-white/6 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-[15px] font-medium text-[#D4DEEE]">{rail.label}</p>
                  <CurrencyAmount
                    amount={rail.amount}
                    align="right"
                    primaryClassName="text-[24px] font-semibold tracking-[-0.04em] text-white"
                    secondaryClassName="mt-0.5 text-[11px] font-medium text-[#97AFCB]"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-amber-300/16 bg-[linear-gradient(180deg,rgba(251,191,36,0.1),rgba(249,115,22,0.05)_52%,rgba(59,130,246,0.04))] p-5 shadow-[0_0_20px_rgba(251,191,36,0.05),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-start gap-3">
              <IconTile glow="cyan" className="flex-shrink-0 bg-white/10 text-[#FFF0CC]">
                <ShieldCheck className="h-[16px] w-[16px]" strokeWidth={2} />
              </IconTile>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFDDA0]">Upcoming</p>
                <div className="mt-3">
                  <CurrencyAmount
                    amount={overview.commitmentsThisWeek}
                    primaryClassName="text-[34px] font-semibold tracking-[-0.05em] text-white"
                    secondaryClassName="mt-1 text-[12px] font-medium text-[#F4CD93]"
                  />
                </div>
                <p className="mt-1 text-[14px] text-[#FCE6BE]">due this week</p>
              </div>
            </div>
          </section>

          {overview.needsAttention ? (
            <Link
              href="/projects/harbour-road"
              className="block rounded-[26px] border border-orange-300/28 bg-[linear-gradient(180deg,rgba(251,146,60,0.24),rgba(244,63,94,0.14)_52%,rgba(15,23,42,0.16))] p-6 shadow-[0_18px_38px_rgba(15,23,42,0.2),0_0_32px_rgba(251,146,60,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200/38 hover:shadow-[0_22px_42px_rgba(15,23,42,0.22),0_0_36px_rgba(251,146,60,0.14),inset_0_1px_0_rgba(255,255,255,0.14)] active:translate-y-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFD39A]">Needs attention</p>
              <p className="mt-3 text-[28px] font-semibold tracking-[-0.05em] text-white">
                {overview.needsAttention.project}
              </p>
              <p className="mt-2 text-[17px] font-medium leading-[1.7] text-[#FFE1C4]">{overview.needsAttention.detail}</p>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#FFF1D8]">
                Open project and resolve
              </p>
            </Link>
          ) : null}

          <section className="rounded-[26px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Recent activity</h2>
            <div className="mt-4 space-y-3">
              {overview.recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="block rounded-[18px] border border-white/6 bg-white/[0.03] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.05] hover:shadow-[0_10px_20px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.05)] active:translate-y-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-white">{activity.type}</p>
                      <p className="mt-1 text-[13px] text-[#B8C8DE]">{activity.project}</p>
                    </div>
                    <CurrencyAmount
                      amount={activity.amount}
                      align="right"
                      primaryClassName="text-[20px] font-semibold tracking-[-0.03em] text-white"
                      secondaryClassName="mt-0.5 text-[11px] font-medium text-[#97AFCB]"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/6 pt-3">
                    <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#9FB3D9]">
                      {activity.status}
                    </p>
                    <p className="text-[12px] text-[#C4D2E4]">
                      {activity.type === "Invoice" ? "Detected from latest update" : "Saved from recent project update"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <Link
            href="/payments/connect-account"
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7F7FB] hover:shadow-[0_22px_42px_rgba(255,255,255,0.18),0_0_26px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.82)] active:translate-y-0"
          >
            <span>Connect account</span>
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
