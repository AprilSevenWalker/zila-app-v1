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

      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col px-6 pb-8 pt-10 lg:max-w-[1480px] lg:px-10 lg:pb-12">
        <div className="welcome-logo-float mb-10 w-fit lg:hidden">
          <Image
            src="/zila-logo-white.png"
            alt="Zila"
            width={132}
            height={52}
            className="h-auto w-[128px] object-contain opacity-95"
            priority
          />
        </div>

        <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,600px)_minmax(420px,1fr)] lg:items-start lg:gap-24">
          <div className="relative max-w-[336px] lg:max-w-[600px] lg:pt-2 lg:-translate-y-12">
            <div className="welcome-logo-float mb-12 hidden w-fit lg:block">
              <Image
                src="/zila-logo-white.png"
                alt="Zila"
                width={132}
                height={52}
                className="h-auto w-[128px] object-contain opacity-95"
                priority
              />
            </div>

            <div className="absolute -left-2 top-4 h-24 w-[2px] rounded-full bg-gradient-to-b from-[#67E8F9] via-[#818CF8] to-transparent opacity-70 shadow-[0_0_22px_rgba(103,232,249,0.26)] lg:left-0 lg:top-[9.6rem]" />
            <p className="mb-5 pl-4 text-[12px] font-medium uppercase tracking-[0.24em] text-[#B3BCDD] lg:pl-6">
              Live financial guidance
            </p>
            <h1 className="pl-4 text-[45px] font-semibold leading-[0.96] tracking-[-0.06em] text-[#FBFBFF] lg:max-w-[600px] lg:pl-6 lg:text-[64px] lg:leading-[0.94]">
              You don&apos;t need to guess your next move anymore
            </h1>
            <p className="mt-6 max-w-[560px] pl-4 text-[17px] font-medium leading-[1.65] text-[#E7ECF7]/90 lg:pl-6 lg:text-[19px]">
              Built for businesses managing real money,{" "}
              <span className="bg-[linear-gradient(90deg,#8CF5FF_0%,#9FD8FF_44%,#D5C3FF_100%)] bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(126,231,246,0.12)]">
                real-time decisions
              </span>
              , and real pressure
            </p>
            <p className="mt-5 max-w-[420px] pl-4 text-[15px] leading-[1.68] text-[#D4DCEF]/76 lg:pl-6 lg:text-[17px] lg:text-[#DCE4F3]/78">
              See what&apos;s happening, what it means, and what to do next.
            </p>

            <div className="mt-10 hidden pl-4 lg:mt-10 lg:block lg:pl-6">
              <div className="w-full max-w-[404px] rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] p-5 shadow-[0_24px_48px_rgba(6,10,24,0.24),0_0_34px_rgba(99,102,241,0.09),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B9C4E5]">
                  Start with Zila
                </p>
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
                  <Link
                    href="/login"
                    className="text-[13px] font-semibold text-[#F8FBFF] transition hover:text-[#7EE7F6]"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-14 h-[244px] lg:mt-8 lg:h-[580px] lg:w-full lg:max-w-[700px] lg:self-start">
            <div className="hidden lg:block">
              <div className="absolute inset-[2%] rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_28px_60px_rgba(5,10,24,0.24),0_0_44px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-20px_60px_rgba(8,12,26,0.18)] backdrop-blur-xl" />
              <div className="absolute inset-[3.5%] rounded-[34px] bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.1),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(34,211,238,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
              <div className="absolute inset-x-[8%] top-[9%] h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
              <div className="absolute left-[9%] top-[8%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22),rgba(99,102,241,0)_72%)] blur-3xl" />
              <div className="absolute right-[7%] top-[14%] h-36 w-36 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.18),rgba(34,211,238,0)_74%)] blur-3xl" />
            </div>

            <div className="absolute left-[4%] top-5 h-[1px] w-[76%] bg-gradient-to-r from-white/0 via-white/16 to-white/0 lg:left-[10%] lg:top-[16%] lg:w-[70%]" />

            <div className="absolute left-[calc(34%-0.25rem)] top-[0.4rem] w-[66%] max-w-[248px] lg:left-[34%] lg:top-[19%] lg:max-w-[360px]">
              <div className="grid grid-cols-3 gap-3 lg:gap-5">
                <span className="welcome-light-drift aspect-square w-full rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] bg-[#F35D44] shadow-[0_16px_28px_rgba(243,93,68,0.22)] lg:rounded-tl-[34px] lg:rounded-tr-[34px] lg:rounded-bl-[34px]" />
                <span className="welcome-light-drift-delayed aspect-square w-full rounded-full bg-[#AAADED] shadow-[0_16px_28px_rgba(170,173,237,0.18)]" />
                <span className="welcome-light-drift-slow aspect-square w-full rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] bg-[#58A992] shadow-[0_16px_28px_rgba(88,169,146,0.18)] lg:rounded-tl-[34px] lg:rounded-tr-[34px] lg:rounded-br-[34px]" />
                <span className="welcome-light-drift-delayed aspect-square w-full rounded-tl-[24px] rounded-bl-[24px] rounded-br-[24px] bg-[#4083DD] shadow-[0_16px_28px_rgba(64,131,221,0.22)] lg:rounded-tl-[34px] lg:rounded-bl-[34px] lg:rounded-br-[34px]" />
                <span className="welcome-light-drift col-span-2 aspect-[2/1] w-full rounded-[24px] bg-[#F7E56E] shadow-[0_16px_28px_rgba(247,229,110,0.18)] lg:rounded-[34px]" />
              </div>
            </div>

            <div className="absolute left-[4%] bottom-0 z-10 w-[66%] rounded-[24px] border border-white/8 bg-[linear-gradient(155deg,rgba(15,23,42,0.86),rgba(20,35,63,0.68))] px-4 py-4 shadow-[0_20px_42px_rgba(5,10,24,0.28),0_0_28px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm lg:left-[10%] lg:bottom-[11%] lg:w-[60%] lg:max-w-[380px] lg:rounded-[30px] lg:px-6 lg:py-6 lg:shadow-[0_24px_48px_rgba(5,10,24,0.32),0_0_32px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Next move</p>
                <span className="inline-flex items-center rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] font-medium text-[#D6E2F7]">
                  Insight ready
                </span>
              </div>
              <p className="text-[13px] font-semibold leading-[1.45] text-white lg:text-[16px]">
                <span className="block">See the signal</span>
                <span className="mt-1.5 block">Understand the impact</span>
                <span className="mt-1.5 block text-[#F8FBFF]">Act on it</span>
              </p>
              <div className="mt-4 h-1.5 rounded-full bg-white/8">
                <div className="h-1.5 w-[62%] rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]" />
              </div>
            </div>
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
    </div>
  );
}
