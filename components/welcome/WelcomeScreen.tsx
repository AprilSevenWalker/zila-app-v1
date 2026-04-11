import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(165deg,#0C1328_0%,#191C4D_52%,#103854_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(129,140,248,0.22),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_50%_74%,rgba(168,85,247,0.12),transparent_28%)]" />
      <div className="welcome-light-drift absolute -left-10 top-24 h-48 w-48 rounded-full bg-[#6366F1]/18 blur-3xl" />
      <div className="welcome-light-drift-delayed absolute right-[-3.5rem] top-1/3 h-56 w-56 rounded-full bg-[#22D3EE]/12 blur-3xl" />
      <div className="welcome-light-drift-slow absolute bottom-16 left-1/3 h-44 w-44 rounded-full bg-[#A855F7]/12 blur-3xl" />

      <span className="welcome-signal-dot absolute left-[14%] top-[18%] h-2.5 w-2.5 rounded-full bg-[#67E8F9]/60 shadow-[0_0_18px_rgba(103,232,249,0.32)]" />
      <span className="welcome-signal-dot-delayed absolute left-[76%] top-[22%] h-2 w-2 rounded-full bg-[#C4B5FD]/55 shadow-[0_0_16px_rgba(196,181,253,0.28)]" />
      <span className="welcome-signal-dot-slow absolute left-[22%] top-[64%] h-2 w-2 rounded-full bg-[#93C5FD]/50 shadow-[0_0_14px_rgba(147,197,253,0.22)]" />
      <span className="welcome-signal-dot-delayed absolute right-[14%] top-[58%] h-1.5 w-1.5 rounded-full bg-[#F9A8D4]/40 shadow-[0_0_12px_rgba(249,168,212,0.18)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col px-6 pb-8 pt-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 backdrop-blur-sm">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,190,96,0.96),rgba(255,153,0,0.18)_42%,rgba(255,153,0,0)_84%)] text-[#FFE0B6] shadow-[0_0_16px_rgba(255,154,41,0.24)]">
              <Sparkles className="h-[13px] w-[13px]" strokeWidth={2.1} />
            </span>
            <span className="text-[12px] font-medium tracking-[0.02em] text-[#E8EBFF]">Zila</span>
          </div>
        </div>

        <div className="max-w-[320px]">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.24em] text-[#B3BCDD]">Live financial guidance</p>
          <h1 className="text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#FBFBFF]">
            You don&apos;t need to guess your next move anymore
          </h1>
        </div>

        <div className="relative mt-14">
          <div className="absolute -inset-x-2 top-3 h-full rounded-[34px] bg-[linear-gradient(135deg,rgba(99,102,241,0.18),rgba(34,211,238,0.1))] blur-2xl" />
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.9),rgba(28,33,75,0.92),rgba(17,55,82,0.82))] p-5 shadow-[0_22px_60px_rgba(5,10,24,0.38)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_82%_80%,rgba(34,211,238,0.14),transparent_20%),radial-gradient(circle_at_52%_100%,rgba(139,92,246,0.16),transparent_22%)] opacity-90" />
            <div className="absolute right-5 top-5 rounded-full border border-[#8DA99A]/18 bg-[#EEF4EF]/12 px-2.5 py-1 text-[10px] font-medium text-[#D9ECE1]">
              Protection ready
            </div>

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,189,96,0.95),rgba(255,143,31,0.22)_48%,rgba(255,143,31,0)_86%)] text-[#FFD19A] shadow-[0_0_14px_rgba(255,154,41,0.24)]">
                  <Sparkles className="h-[11px] w-[11px]" strokeWidth={2} />
                </span>
                <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-white">Harbour Road</h2>
              </div>

              <p className="max-w-[265px] text-[14px] leading-[1.6] text-[#DCE3F1]">
                You&apos;re close to a shortfall by Friday. One clear move keeps the project steady.
              </p>

              <div className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#7EE7F6] shadow-[0_0_12px_rgba(126,231,246,0.24)]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Next move</p>
                </div>
                <p className="text-[15px] font-semibold leading-[1.45] text-white">Move $4,300 now to stay on track</p>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4 opacity-80 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-[13px] w-[13px] text-[#BFE5D0]" strokeWidth={1.9} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9ECE1]">Safety Net</p>
                </div>
                <p className="text-[13px] leading-[1.55] text-[#E4E8F3]">
                  Protection is ready if revenue dips or costs rise.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-12">
          <div className="space-y-3">
            <Link
              href="/home"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14)] transition hover:bg-[#F7F7FB]"
            >
              <Mail className="h-[16px] w-[16px]" strokeWidth={2} />
              Continue with email
            </Link>
            <Link
              href="/home"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/6 px-4 py-4 text-[14px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#DDE7FF]">
                <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.1} />
              </span>
              Continue with Google
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
