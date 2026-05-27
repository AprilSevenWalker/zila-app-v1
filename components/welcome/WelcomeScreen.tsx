import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(155deg,#09101F_0%,#131A3A_28%,#22265D_62%,#123B57_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(99,102,241,0.26),transparent_32%),radial-gradient(circle_at_88%_22%,rgba(34,211,238,0.11),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
      <div className="welcome-light-drift absolute left-[-1rem] top-[10%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(98,102,245,0.34),rgba(98,102,245,0.16)_42%,rgba(34,211,238,0.08)_66%,rgba(34,211,238,0)_82%)] blur-3xl" />
      <div className="absolute left-[12%] top-[13%] h-[20rem] w-[10rem] rotate-[18deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.018)_34%,rgba(255,255,255,0)_80%)] blur-2xl opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0)_16%,rgba(120,136,255,0.06)_44%,rgba(82,225,247,0.05)_62%,rgba(255,255,255,0)_82%)]" />

      <div className="relative mx-auto min-h-screen max-w-[430px] px-6 pb-8 pt-10 lg:hidden">
        <div className="welcome-logo-float mb-10 w-fit">
          <Image
            src="/zila-logo-white.png"
            alt="Zila"
            width={132}
            height={52}
            className="h-auto w-[128px] object-contain opacity-95"
            priority
          />
        </div>

        <div className="flex flex-col">
          <div className="relative max-w-[336px]">
            <div className="absolute -left-2 top-4 h-24 w-[2px] rounded-full bg-gradient-to-b from-[#67E8F9] via-[#818CF8] to-transparent opacity-70 shadow-[0_0_22px_rgba(103,232,249,0.26)]" />
            <p className="mb-5 pl-4 text-[12px] font-medium uppercase tracking-[0.24em] text-[#B3BCDD]">
              Live financial guidance
            </p>
            <h1 className="pl-4 text-[45px] font-semibold leading-[0.96] tracking-[-0.06em] text-[#FBFBFF]">
              You don&apos;t need to guess your next move anymore
            </h1>
            <p className="mt-6 max-w-[560px] pl-4 text-[17px] font-medium leading-[1.65] text-[#E7ECF7]/90">
              Built for businesses managing real money,{" "}
              <span className="bg-[linear-gradient(90deg,#8CF5FF_0%,#9FD8FF_44%,#D5C3FF_100%)] bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(126,231,246,0.12)]">
                real-time decisions
              </span>
              , and real pressure
            </p>
            <p className="mt-5 max-w-[420px] pl-4 text-[15px] leading-[1.68] text-[#D4DCEF]/76">
              See what&apos;s happening, what it means, and what to do next.
            </p>
          </div>

        </div>

        <div className="mt-auto space-y-3 pt-8 lg:hidden">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/60 bg-white px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_18px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-[#F7F7FB]"
          >
            <Mail className="h-[16px] w-[16px]" strokeWidth={2} />
            Continue with email
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.085),rgba(255,255,255,0.045))] px-4 py-4 text-[14px] font-semibold text-white shadow-[0_0_28px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm transition hover:bg-white/10"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#DDE7FF]">
              <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.1} />
            </span>
            Continue with Google
          </Link>
        </div>
      </div>

      <div className="relative mx-auto hidden min-h-screen max-w-[1480px] px-10 pb-12 pt-10 lg:block">
        <div className="grid min-h-screen grid-cols-[minmax(0,560px)_minmax(520px,1fr)] items-center gap-20">
          <div className="relative z-10 flex flex-col justify-center">
            <div className="welcome-logo-float w-fit">
              <Image
                src="/zila-logo-white.png"
                alt="Zila"
                width={144}
                height={56}
                className="h-auto w-[138px] object-contain opacity-95"
                priority
              />
            </div>

            <div className="mt-16 max-w-[560px]">
              <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-[#B3BCDD]">Live financial guidance</p>
              <h1 className="mt-6 text-[68px] font-semibold leading-[0.94] tracking-[-0.065em] text-[#FBFCFF]">
                You don&apos;t need to guess your next move anymore
              </h1>
              <p className="mt-7 max-w-[520px] text-[20px] font-medium leading-[1.65] text-[#E7ECF7]/90">
                Built for businesses managing real money, real-time decisions, and real pressure.
              </p>
              <p className="mt-5 max-w-[460px] text-[17px] leading-[1.75] text-[#D4DCEF]/78">
                See what changed, understand the impact, and know what to do next.
              </p>
            </div>

            <div className="mt-12 w-full max-w-[430px] rounded-[28px] border border-white/18 bg-[linear-gradient(180deg,rgba(16,42,79,0.86),rgba(9,25,50,0.92))] p-5 shadow-[0_24px_48px_rgba(13,35,68,0.30),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B9C4E5]">Start with Zila</p>
              <div className="mt-4 space-y-3">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/60 bg-white px-6 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_18px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-[#F7F7FB]"
                >
                  <Mail className="h-[16px] w-[16px]" strokeWidth={2} />
                  Continue with email
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.085),rgba(255,255,255,0.045))] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_0_28px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm transition hover:bg-white/10"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#DDE7FF]">
                    <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.1} />
                  </span>
                  Continue with Google
                </Link>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-[18px] border border-white/8 bg-white/4 px-4 py-3.5">
                <span className="text-[13px] text-[#C9D5EA]">Already using Zila?</span>
                <Link href="/login" className="text-[13px] font-semibold text-[#F8FBFF] transition hover:text-[#7EE7F6]">
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[720px] items-center justify-end">
            <div className="absolute left-[10%] top-[12%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22),rgba(99,102,241,0)_72%)] blur-3xl" />
            <div className="absolute right-[8%] top-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.16),rgba(34,211,238,0)_72%)] blur-3xl" />
            <div className="absolute right-[16%] bottom-[12%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.16),rgba(124,58,237,0)_76%)] blur-3xl" />

            <div className="relative h-[620px] w-full max-w-[720px] overflow-hidden rounded-[40px] bg-[linear-gradient(145deg,#08101F_0%,#121A3A_40%,#241C52_78%,#1A2348_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.05),transparent_18%),radial-gradient(circle_at_72%_18%,rgba(99,102,241,0.18),transparent_24%),radial-gradient(circle_at_64%_70%,rgba(124,58,237,0.16),transparent_26%),radial-gradient(circle_at_20%_78%,rgba(34,211,238,0.10),transparent_20%)]" />
              <div className="absolute left-[9%] top-[14%] max-w-[240px] text-[15px] font-medium tracking-[-0.03em] text-[#F1F5FF] opacity-95">
                Paid supplier $2,400
              </div>
              <div className="absolute left-[58%] top-[18%] text-[14px] font-semibold uppercase tracking-[0.14em] text-[#91A3C7]">
                Cash ↓
              </div>
              <div className="absolute left-[22%] top-[46%] text-[14px] font-semibold uppercase tracking-[0.14em] text-[#9CB4D8]">
                Runway ↓
              </div>
              <div className="absolute right-[12%] top-[58%] max-w-[180px] text-right text-[16px] font-medium tracking-[-0.03em] text-[#D9E6FF]">
                You&apos;re still safe
              </div>

              <div className="absolute left-[16%] top-[22%] h-px w-[180px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.22),rgba(255,255,255,0))]" />
              <div className="absolute right-[15%] top-[33%] h-px w-[140px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(147,197,253,0.24),rgba(255,255,255,0))]" />
              <div className="absolute left-[24%] bottom-[24%] h-px w-[120px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(165,180,252,0.20),rgba(255,255,255,0))]" />

              <div className="absolute bottom-[10%] left-[10%] z-10 w-[430px] rounded-[30px] border border-white/8 bg-[linear-gradient(155deg,rgba(9,14,28,0.82),rgba(18,28,52,0.68))] px-7 py-7 shadow-[0_24px_48px_rgba(5,10,24,0.30),0_0_28px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Next move</p>
                  <span className="inline-flex items-center rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] font-medium text-[#D6E2F7]">
                    Updated just now
                  </span>
                </div>
                <p className="text-[24px] font-semibold leading-[1.25] tracking-[-0.045em] text-white">
                  Kevin paid supplier $2,400
                </p>
                <p className="mt-3 text-[19px] font-semibold leading-[1.3] tracking-[-0.035em] text-[#8CF5FF]">
                  → Remaining runway: 18 days
                </p>
                <p className="mt-4 text-[17px] font-medium leading-[1.6] text-[#D9E6FF]">
                  You&apos;re still within safe range
                </p>
                <div className="mt-5 h-[3px] rounded-full bg-white/8">
                  <div className="h-[3px] w-[64%] rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
