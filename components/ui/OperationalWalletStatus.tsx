"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Power, WalletCards } from "lucide-react";

import {
  disconnectMoneySource,
  getMoneySourceState,
  subscribeToMoneySource,
  type MoneySourceState,
} from "@/lib/moneySourceStore";
import {
  getLatestPaymentTransaction,
  subscribeToLatestPaymentTransaction,
  type LatestPaymentTransaction,
} from "@/lib/paymentTransactionStore";

function getWalletDisplayState(moneySource: MoneySourceState, latestPayment: LatestPaymentTransaction | null) {
  if (!moneySource.connected || !moneySource.walletAddress) {
    return {
      label: "Not connected",
      detail: "Connect Xaman",
      tone: "border-white/12 bg-white/[0.07] text-[#D8E7FA]",
      ready: false,
    };
  }

  if (latestPayment?.transferStatus === "Processing") {
    return {
      label: "Payment pending",
      detail: "Awaiting settlement",
      tone: "border-amber-200/22 bg-amber-300/[0.10] text-[#FFE8B0]",
      ready: true,
    };
  }

  if (latestPayment?.transferStatus === "Completed") {
    return {
      label: "Transaction confirmed",
      detail: "Proof enabled",
      tone: "border-[#D9FF57]/24 bg-[#D9FF57]/12 text-[#F1FFB8]",
      ready: true,
    };
  }

  return {
    label: moneySource.status === "connected" ? "Connected" : "Ready for payments",
    detail: "Operational wallet ready",
    tone: "border-[#D9FF57]/24 bg-[#D9FF57]/12 text-[#F1FFB8]",
    ready: true,
  };
}

export function OperationalWalletStatus({ compact = false }: { compact?: boolean }) {
  const [moneySource, setMoneySource] = useState<MoneySourceState>(getMoneySourceState);
  const [latestPayment, setLatestPayment] = useState<LatestPaymentTransaction | null>(getLatestPaymentTransaction);
  const display = useMemo(() => getWalletDisplayState(moneySource, latestPayment), [moneySource, latestPayment]);

  useEffect(() => {
    const updateWallet = () => setMoneySource(getMoneySourceState());
    const updatePayment = () => setLatestPayment(getLatestPaymentTransaction());
    const unsubscribeWallet = subscribeToMoneySource(updateWallet);
    const unsubscribePayment = subscribeToLatestPaymentTransaction(updatePayment);

    updateWallet();
    updatePayment();

    return () => {
      unsubscribeWallet();
      unsubscribePayment();
    };
  }, []);

  if (!moneySource.connected || !moneySource.walletAddress) {
    return (
      <Link
        href="/payments/connect-account"
        className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-[12px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition hover:bg-white/[0.10] ${display.tone}`}
      >
        <WalletCards className="h-4 w-4" strokeWidth={2} />
        <span>{compact ? "Connect wallet" : "Not connected"}</span>
      </Link>
    );
  }

  return (
    <div className={`rounded-[18px] border px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] ${display.tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.10]">
            {display.ready ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> : <WalletCards className="h-3.5 w-3.5" strokeWidth={2} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em]">{display.label}</p>
            <p className="mt-0.5 truncate text-[12px] font-semibold text-white">{moneySource.walletAddressShort || "Connected wallet"}</p>
            {!compact ? <p className="mt-0.5 truncate text-[10px] font-medium text-[#B9C8DF]">{moneySource.network || "XRPL Mainnet"} • Active • Proof enabled</p> : null}
          </div>
        </div>
        {!compact ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="https://xaman.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
              aria-label="View in Xaman"
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={disconnectMoneySource}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
              aria-label="Disconnect wallet"
            >
              <Power className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </div>
      {!compact ? <p className="mt-2 text-[10px] font-medium text-[#DCE8FF]/78">{display.detail}</p> : null}
    </div>
  );
}

export default OperationalWalletStatus;
