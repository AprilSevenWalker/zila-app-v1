"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Landmark } from "lucide-react";

import { getMoneySourceState, subscribeToMoneySource, type MoneySourceState } from "@/lib/moneySourceStore";

export function DesktopConnectMoneyPrompt() {
  const [moneySource, setMoneySource] = useState<MoneySourceState>(getMoneySourceState);

  useEffect(() => {
    const update = () => {
      setMoneySource(getMoneySourceState());
    };

    update();
    return subscribeToMoneySource(update);
  }, []);

  if (moneySource.connected) {
    return null;
  }

  return (
    <div className="zila-card-hover flex items-center justify-between gap-4 rounded-[24px] border border-[rgba(99,102,241,0.18)] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.10),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(238,246,255,0.70))] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.08),0_20px_42px_rgba(99,102,241,0.12),0_0_24px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/74 bg-[linear-gradient(135deg,#FFFFFF,#DBF7FF_52%,#EDE9FE)] text-[#4F46E5] shadow-[0_16px_32px_rgba(99,102,241,0.18),0_0_24px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.90)]">
          <Landmark className="h-[19px] w-[19px]" strokeWidth={1.85} />
        </span>
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#182033]">Connect your money</p>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#667085]">
            Needed before Zila can move funds or record verified activity.
          </p>
        </div>
      </div>
      <Link
        href="/wallet"
        className="zila-button-hover inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#C9CBFF] bg-white/90 px-4 text-[12px] font-semibold text-[#4F46E5] shadow-[0_14px_28px_rgba(99,102,241,0.14)] hover:bg-white"
      >
        Connect
        <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2} />
      </Link>
    </div>
  );
}

export default DesktopConnectMoneyPrompt;
