"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";

export function PaymentsActionPanel() {
  const [connected, setConnected] = useState(getMoneySourceState().connected);

  useEffect(() => {
    const update = () => {
      setConnected(getMoneySourceState().connected);
    };

    update();
    return subscribeToMoneySource(update);
  }, []);

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <Link
        href={connected ? "/payments/make-payment" : "/wallet"}
        className="inline-flex h-14 items-center justify-center rounded-[20px] border border-cyan-300/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(129,140,248,0.14))] px-5 text-[14px] font-semibold text-[#F4FBFF] shadow-[0_10px_26px_rgba(34,211,238,0.14),0_0_28px_rgba(34,211,238,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/44 hover:shadow-[0_16px_32px_rgba(34,211,238,0.2),0_0_34px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.16)] active:translate-y-0"
      >
        {connected ? "Make payment" : "Connect account"}
      </Link>
      <Link
        href="/move-funds"
        className="inline-flex h-14 items-center justify-center rounded-[20px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] px-5 text-[14px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.09] hover:shadow-[0_12px_26px_rgba(15,23,42,0.16),0_0_20px_rgba(99,102,241,0.06),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0"
      >
        Move funds
      </Link>
      <Link
        href="/wallet"
        className="inline-flex h-14 items-center justify-center rounded-[20px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] px-5 text-[14px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.09] hover:shadow-[0_12px_26px_rgba(15,23,42,0.16),0_0_20px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0"
      >
        {connected ? "Manage connection" : "Connect account"}
      </Link>
      <Link
        href="/ask?action=upload-document"
        className="inline-flex h-14 items-center justify-center rounded-[20px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.035))] px-5 text-[14px] font-semibold text-[#EAFBFF] shadow-[0_0_18px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/28 hover:shadow-[0_12px_26px_rgba(15,23,42,0.16),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0"
      >
        Upload document
      </Link>
    </div>
  );
}

export default PaymentsActionPanel;
