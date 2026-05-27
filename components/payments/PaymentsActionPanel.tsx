"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, Landmark, Smartphone, WalletCards } from "lucide-react";

export function PaymentsActionPanel() {
  const quickActions = [
    { href: "/payments/send", label: "Supplier payout", icon: Building2 },
    { href: "/payments/mobile-money", label: "Mobile money", icon: Smartphone },
    { href: "/payments/stablecoin", label: "Stablecoin", icon: WalletCards },
    { href: "/payments/bank-transfer", label: "Bank transfer", icon: Landmark },
  ];

  return (
    <div className="relative min-h-[228px] overflow-hidden rounded-[28px] border border-cyan-200/30 bg-[radial-gradient(circle_at_18%_0%,rgba(126,231,246,0.24),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(217,255,87,0.12),transparent_28%),linear-gradient(135deg,rgba(31,82,132,0.96),rgba(16,42,79,0.98)_58%,rgba(9,25,50,0.99))] p-5 shadow-[0_28px_62px_rgba(13,35,68,0.32),0_0_36px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-200 hover:border-cyan-200/38 md:p-6">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(126,231,246,0),rgba(126,231,246,0.56),rgba(217,255,87,0.35),rgba(126,231,246,0))]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Send Payment</p>
          <h2 className="mt-4 text-[40px] font-semibold leading-none tracking-[-0.01em] text-white">Send Payment</h2>
          <p className="mt-4 max-w-[660px] text-[16px] leading-[1.7] text-[#D7E3F8]">
            Prepare payouts across connected rails.
          </p>
        </div>

        <Link
          href="/payments/send"
          className="zila-operational-action group inline-flex h-16 shrink-0 items-center justify-center gap-3 rounded-full bg-[#D9FF57] px-8 text-[15px] font-semibold text-[#102A4F] shadow-[0_18px_36px_rgba(217,255,87,0.18),0_0_28px_rgba(217,255,87,0.10),inset_0_1px_0_rgba(255,255,255,0.36)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E5FF75] hover:shadow-[0_24px_48px_rgba(217,255,87,0.22),0_0_34px_rgba(217,255,87,0.14),inset_0_1px_0_rgba(255,255,255,0.42)] active:translate-y-0 active:scale-[0.99]"
        >
          <span>Prepare payment</span>
          <ArrowUpRight className="h-[15px] w-[15px] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-white/14 bg-white/[0.065] px-3 text-[12px] font-semibold text-[#EAF1FF] transition hover:-translate-y-0.5 hover:bg-white/[0.11]"
            >
              <ActionIcon className="h-[14px] w-[14px] text-[#BFEFFF]" strokeWidth={2} />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentsActionPanel;
