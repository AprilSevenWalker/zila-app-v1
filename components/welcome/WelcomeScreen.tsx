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

      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col px-6 pb-8 pt-10">
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

        <div className="relative max-w-[336px]">
          <div className="absolute -left-2 top-4 h-24 w-[2px] rounded-full bg-gradient-to-b from-[#67E8F9] via-[#818CF8] to-transparent opacity-70 shadow-[0_0_22px_rgba(103,232,249,0.26)]" />
          <p className="mb-5 pl-4 text-[12px] font-medium uppercase tracking-[0.24em] text-[#B3BCDD]">Live financial guidance</p>
          <h1 className="pl-4 text-[45px] font-semibold leading-[0.96] tracking-[-0.06em] text-[#FBFBFF]">
            <span className="block">You don&apos;t need</span>
            <span className="block text-[#EEF2FF]">to guess your</span>
            <span className="block">next move</span>
            <span className="block text-[#D6E2F7]">anymore</span>
          </h1>
          <p className="mt-5 max-w-[286px] pl-4 text-[15px] leading-[1.68] text-[#D4DCEF]/76">
            See what&apos;s happening, what it means, and what to do next.
          </p>
        </div>

        <div className="relative mt-14 h-[244px]">
          <div className="absolute left-[4%] top-5 h-[1px] w-[76%] bg-gradient-to-r from-white/0 via-white/16 to-white/0" />

          <div className="absolute left-[calc(34%-0.25rem)] top-[0.4rem] w-[66%] max-w-[248px]">
            <div className="grid grid-cols-3 gap-3">
              <span className="aspect-square w-full rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] bg-[#F35D44] shadow-[0_16px_28px_rgba(243,93,68,0.22)]" />
              <span className="aspect-square w-full rounded-full bg-[#AAADED] shadow-[0_16px_28px_rgba(170,173,237,0.18)]" />
              <span className="aspect-square w-full rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] bg-[#58A992] shadow-[0_16px_28px_rgba(88,169,146,0.18)]" />
              <span className="aspect-square w-full rounded-tl-[24px] rounded-bl-[24px] rounded-br-[24px] bg-[#4083DD] shadow-[0_16px_28px_rgba(64,131,221,0.22)]" />
              <span className="col-span-2 aspect-[2/1] w-full rounded-[24px] bg-[#F7E56E] shadow-[0_16px_28px_rgba(247,229,110,0.18)]" />
            </div>
          </div>

          <div className="absolute left-[4%] bottom-0 z-10 w-[66%] rounded-[24px] border border-white/8 bg-[linear-gradient(155deg,rgba(15,23,42,0.86),rgba(20,35,63,0.68))] px-4 py-4 shadow-[0_20px_42px_rgba(5,10,24,0.28),0_0_28px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Next move</p>
              <span className="inline-flex items-center rounded-full border border-white/8 bg-white/6 px-2.5 py-1 text-[10px] font-medium text-[#D6E2F7]">
                Insight ready
              </span>
            </div>
            <p className="text-[13px] font-semibold leading-[1.45] text-white">
              <span className="block">See the signal</span>
              <span className="mt-1.5 block">Understand the impact</span>
              <span className="mt-1.5 block text-[#F8FBFF]">Act on it</span>
            </p>
            <div className="mt-4 h-1.5 rounded-full bg-white/8">
              <div className="h-1.5 w-[62%] rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]" />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <div className="space-y-3">
            <Link
              href="/home"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/60 bg-white px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_18px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-[#F7F7FB]"
            >
              <Mail className="h-[16px] w-[16px]" strokeWidth={2} />
              Continue with email
            </Link>
            <Link
              href="/home"
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
    </div>
  );
}
