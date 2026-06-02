"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

const badges = [
  { label: "Live Coordination", icon: Sparkles },
  { label: "Supplier Payout Ready", icon: CreditCard },
  { label: "Reserve Protected", icon: ShieldCheck },
];

export function OperationalHeroCard() {
  return (
    <section className="zila-card-hover zila-surface-grain relative min-h-[360px] overflow-hidden rounded-[28px] border border-white/18 bg-[linear-gradient(150deg,#254E7F_0%,#1E416E_44%,#17345F_100%)] p-5 text-white shadow-[0_28px_66px_rgba(31,68,116,0.22),0_0_34px_rgba(103,232,249,0.07),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl lg:min-h-[430px] lg:p-7">
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_16%_15%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_72%_18%,rgba(103,232,249,0.12),transparent_30%),radial-gradient(circle_at_86%_50%,rgba(217,255,87,0.035),transparent_24%),linear-gradient(180deg,rgba(243,245,249,0.08),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_44%,rgba(16,35,63,0.14))]" />
      <Image
        src="/zila-home-hero-mountain.png"
        alt=""
        fill
        unoptimized
        sizes="900px"
        className="pointer-events-none absolute inset-0 z-[1] object-cover object-right opacity-[0.36] saturate-[1.02] contrast-[1.02] brightness-[1.10] [mask-image:linear-gradient(90deg,transparent_0%,transparent_58%,rgba(0,0,0,0.44)_76%,rgba(0,0,0,0.9)_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,transparent_58%,rgba(0,0,0,0.44)_76%,rgba(0,0,0,0.9)_100%)]"
      />

      <div className="relative z-10 max-w-[720px]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/15 bg-white/12 shadow-[0_4px_20px_rgba(99,102,241,0.15)] backdrop-blur-[14px]">
            <span className="relative h-[24px] w-[24px]">
              <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="26px" className="object-contain" />
            </span>
          </span>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#DCE8FF]">Operational OS</p>
          <span className="hidden rounded-full border border-[#D9FF57]/20 bg-[#D9FF57]/8 px-3 py-1.5 text-[11px] font-semibold text-[#F7FFC8] shadow-[inset_0_1px_0_rgba(246,245,241,0.08)] sm:inline-flex">
            Live coordination
          </span>
        </div>

        <h1 className="mt-8 max-w-[720px] text-[42px] font-semibold leading-[0.95] tracking-[-0.075em] text-[#F6F5F1] md:text-[58px]">
          Coordinate projects, payments, and approvals across borders.
        </h1>

        <p className="mt-6 max-w-[540px] text-[15px] font-medium leading-[1.72] text-[#F6F5F1]/78 md:text-[16px]">
          Money moves across projects, suppliers, approvals, and borders. Zila keeps operations coordinated in real time.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.075] px-3 py-2 text-[11px] font-semibold text-[#EAF1FF]/86 shadow-[0_12px_24px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(246,245,241,0.08)]"
              >
                <Icon className="h-3.5 w-3.5 text-[#D9FF57]" strokeWidth={2} />
                {badge.label}
              </span>
            );
          })}
        </div>

        <Link
          href="/payments/send"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#10233F] shadow-[0_18px_36px_rgba(217,255,87,0.16)]"
        >
          Coordinate next payout
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>

      <div className="absolute bottom-5 right-5 z-10 hidden rounded-[22px] border border-white/14 bg-[#102A4F]/64 p-4 shadow-[0_22px_44px_rgba(1,8,20,0.24),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md md:block">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] bg-[#D9FF57] text-[#10233F]">
            <BadgeCheck className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-white">Operations live</p>
            <p className="mt-1 text-[11px] text-[#C9D4F5]">Payments, approvals, and proof aligned</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OperationalHeroCard;
