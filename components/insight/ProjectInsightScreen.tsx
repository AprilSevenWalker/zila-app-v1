"use client";

import Link from "next/link";

import { AppShell } from "@/components/ui/AppShell";

export function ProjectInsightScreen() {
  return (
    <AppShell>
      <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(160deg,#0D142B_0%,#171E46_40%,#1F2559_70%,#15374F_100%)] px-6 pb-28 pt-8 text-white">
        <div className="absolute inset-x-0 top-16 h-96 bg-[radial-gradient(circle_at_26%_18%,rgba(99,102,241,0.28),transparent_34%),radial-gradient(circle_at_62%_18%,rgba(34,211,238,0.2),transparent_20%),linear-gradient(140deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
        <div className="absolute left-[10%] top-[18%] h-60 w-44 rotate-[18deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.018)_38%,rgba(255,255,255,0)_82%)] blur-2xl opacity-70" />
        <div className="absolute left-[12%] top-[15%] h-40 w-48 bg-[radial-gradient(circle_at_40%_40%,rgba(103,232,249,0.16),rgba(129,140,248,0.1)_48%,rgba(129,140,248,0)_78%)] blur-3xl opacity-85" />
        <div className="absolute right-[-2rem] top-[22%] opacity-[0.12] blur-xl">
          <div className="grid grid-cols-3 gap-3">
            <span className="h-16 w-16 rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] bg-[#F35D44]" />
            <span className="h-16 w-16 rounded-full bg-[#AAADED]" />
            <span className="h-16 w-16 rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] bg-[#58A992]" />
            <span className="h-16 w-16 rounded-tl-[24px] rounded-bl-[24px] rounded-br-[24px] bg-[#4083DD]" />
            <span className="col-span-2 h-16 rounded-[24px] bg-[#F7E56E]" />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col">
          <div className="max-w-[320px] pt-6">
            <div className="mb-5 inline-flex h-8 w-8 items-center justify-center">
              <span className="insight-signal-pulse relative inline-flex h-3 w-3 rounded-full bg-[#7EE7F6] shadow-[0_0_18px_rgba(126,231,246,0.32)]">
                <span className="insight-signal-ripple absolute inset-0 rounded-full border border-[#A5B4FC]/55"></span>
              </span>
            </div>
            <p className="mb-5 text-[12px] font-medium uppercase tracking-[0.22em] text-[#B7C2E0]">
              Project Horizon
            </p>
            <h1 className="text-[45px] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
              <span className="block">Project Horizon</span>
              <span className="block text-[#EDF2FF]">
                <span className="bg-[linear-gradient(90deg,#7EE7F6_0%,#B9B7FF_100%)] bg-clip-text text-transparent">
                  needs a small
                </span>
              </span>
              <span className="block text-[#DCE6F8]">adjustment this week</span>
            </h1>

            <p className="mt-8 max-w-[286px] text-[18px] leading-[1.65] text-[#E7EDF8]">
              You&apos;re about 6 days from a funding gap.
            </p>

            <p className="mt-10 max-w-[280px] text-[24px] font-semibold leading-[1.42] text-[#F8FBFF]">
              A small move now keeps everything <span className="text-[#C7BFFF]">on track</span>.
            </p>

            <div className="mt-10 flex max-w-[320px] flex-wrap gap-3">
              <Link
                href="/move-funds"
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-4 py-2.5 text-[14px] font-medium text-[#F7FAFF] shadow-[0_0_24px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm"
              >
                Move funds
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[14px] font-medium text-[#E4EBF9] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm"
              >
                Adjust timing
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(129,140,248,0.08))] px-4 py-2.5 text-[14px] font-medium text-[#EAF8FF] shadow-[0_0_26px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm"
              >
                Use Safety Net
              </button>
            </div>
            <p className="mt-10 max-w-[278px] text-[15px] leading-[1.72] text-[#B9C8DD]">
              This is a timing issue, not a revenue issue.
            </p>
          </div>

          <div className="mt-auto pt-12">
            <Link
              href="/home"
              className="inline-flex w-full items-center justify-center rounded-[18px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB]"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
