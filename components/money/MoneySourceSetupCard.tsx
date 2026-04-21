"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Landmark } from "lucide-react";

import { getMoneySourceState, subscribeToMoneySource, type MoneySourceState } from "@/lib/moneySourceStore";

interface MoneySourceSetupCardProps {
  variant?: "light" | "dark";
  compact?: boolean;
  headline?: string;
  description?: string;
  ctaLabel?: string;
  helperText?: string;
  emphasis?: "default" | "required";
}

export function MoneySourceSetupCard({
  variant = "light",
  compact = false,
  headline = "No payment source connected",
  description = "Set up a payment source to move funds and record verified activity.",
  ctaLabel = "Connect account",
  helperText,
  emphasis = "default",
}: MoneySourceSetupCardProps) {
  const [moneySource, setMoneySource] = useState<MoneySourceState>(getMoneySourceState);

  useEffect(() => {
    const update = () => {
      setMoneySource(getMoneySourceState());
    };

    update();
    return subscribeToMoneySource(update);
  }, []);

  const isDark = variant === "dark";
  const isRequired = emphasis === "required";

  if (moneySource.connected) {
    return (
      <div
        className={`rounded-[24px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
          isDark
            ? "border-emerald-300/18 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))] text-white"
            : "border-emerald-300/22 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))] text-[#121417]"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-[12px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-[#B8F1D6]" : "text-[#23825F]"}`}>
              Money source
            </p>
            <p className="mt-3 text-[22px] font-semibold tracking-[-0.04em]">Stable balance active</p>
            <p className={`mt-2 text-[14px] leading-[1.7] ${isDark ? "text-[#D6F5E6]" : "text-[#4D6B5F]"}`}>
              Payments and verified activity can now be recorded from your active source.
            </p>
          </div>
          <div className={`inline-flex h-11 w-11 items-center justify-center rounded-[15px] border ${isDark ? "border-emerald-300/22 bg-white/8 text-[#E8FFF4]" : "border-emerald-300/22 bg-white text-[#23825F]"}`}>
            <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>
        </div>

        <div className={`mt-4 flex ${compact ? "flex-col gap-3" : "items-center justify-between gap-3"}`}>
          <p className={`text-[13px] ${isDark ? "text-[#C8ECDD]" : "text-[#48695C]"}`}>
            {moneySource.walletAddressShort ? `Account ${moneySource.walletAddressShort}` : "Ready for payments"}
          </p>
          <Link
            href="/wallet"
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border px-4 text-[13px] font-semibold transition ${
              isDark
                ? "border-white/12 bg-white/8 text-white hover:bg-white/12"
                : "border-[rgba(18,20,23,0.08)] bg-white text-[#121417] hover:bg-[#F8FAFC]"
            }`}
          >
            Manage connection
            <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[24px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
        isDark
          ? "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] text-white"
          : isRequired
            ? "border-[#D7D8FB] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.92))] text-[#121417] shadow-[0_18px_36px_rgba(99,102,241,0.08),0_0_0_1px_rgba(99,102,241,0.04),inset_0_1px_0_rgba(255,255,255,0.85)]"
            : "border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))] text-[#121417]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-[12px] font-semibold uppercase tracking-[0.18em] ${
              isDark ? "text-[#AFC0FF]" : isRequired ? "text-[#4F46E5]" : "text-[#6B7280]"
            }`}
          >
            Connect your money
          </p>
          <p className="mt-3 text-[22px] font-semibold tracking-[-0.04em]">{headline}</p>
          <p className={`mt-2 text-[14px] leading-[1.7] ${isDark ? "text-[#D5DEEF]" : "text-[#667085]"}`}>
            {description}
          </p>
          {helperText ? (
            <p className={`mt-3 text-[13px] font-medium ${isDark ? "text-[#C9D5EA]" : "text-[#4F5F75]"}`}>{helperText}</p>
          ) : null}
        </div>
        <div
          className={`inline-flex h-11 w-11 items-center justify-center rounded-[15px] border ${
            isDark
              ? "border-white/12 bg-white/8 text-[#E7EEFF]"
              : isRequired
                ? "border-[#D7D8FB] bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(34,211,238,0.08))] text-[#4F46E5] shadow-[0_0_18px_rgba(99,102,241,0.12)]"
                : "border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] text-[#475467]"
          }`}
        >
          <Landmark className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>

      <Link
        href="/wallet"
        className={`mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border px-4 text-[13px] font-semibold transition ${
          isDark
            ? "border-cyan-300/24 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(129,140,248,0.14))] text-white hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.2),rgba(129,140,248,0.16))]"
            : isRequired
              ? "border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.2),rgba(34,211,238,0.14))] text-[#121417] shadow-[0_14px_28px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.14)]"
              : "border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.12))] text-[#121417] hover:-translate-y-0.5"
        }`}
      >
        {ctaLabel}
        <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
      </Link>
    </div>
  );
}

export default MoneySourceSetupCard;
