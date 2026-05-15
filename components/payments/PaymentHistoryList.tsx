"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Shuffle } from "lucide-react";

import { getMoneyMovementState, subscribeToMoneyMovement } from "@/lib/moneyMovementStore";
import { getPaymentMovementHistory, subscribeToLatestPaymentTransaction, type PaymentMovementRecord } from "@/lib/paymentTransactionStore";
import { getProtectedMoneyState, subscribeToProtectedMoney, type ReserveActivity } from "@/lib/protectedMoneyStore";

function formatAmount(amount: number, type: "incoming" | "outgoing" | "reserve-transfer" | "operational-movement") {
  const prefix = type === "incoming" ? "+" : type === "outgoing" ? "-" : "";
  return `${prefix}$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatTimestamp(createdAtIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAtIso));
}

type UnifiedMovement = {
  id: string;
  type: "incoming" | "outgoing" | "reserve-transfer" | "operational-movement";
  title: string;
  amount: number;
  status: string;
  project: string;
  source: string;
  createdAtIso: string;
  href: string;
};

function reserveActivityToMovement(activity: ReserveActivity): UnifiedMovement {
  return {
    id: activity.id,
    type: "reserve-transfer",
    title: activity.action,
    amount: activity.amount,
    status: activity.transactionState ?? "Recorded",
    project: activity.linkedProject ?? activity.reserveName,
    source: activity.reserveName,
    createdAtIso: activity.createdAtIso,
    href: "/proof",
  };
}

function paymentRecordToMovement(record: PaymentMovementRecord): UnifiedMovement {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    amount: record.amountValue,
    status: record.status,
    project: record.project,
    source: record.sourceLabel,
    createdAtIso: record.createdAtIso,
    href: "/proof",
  };
}

export function PaymentHistoryList() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const update = () => setVersion((value) => value + 1);
    const unsubscribePayment = subscribeToLatestPaymentTransaction(update);
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribeMovement = subscribeToMoneyMovement(update);

    return () => {
      unsubscribePayment();
      unsubscribeProtected();
      unsubscribeMovement();
    };
  }, []);

  const movements = useMemo(() => {
    void version;

    const incoming: UnifiedMovement[] = getMoneyMovementState().incoming.map((payment) => ({
      id: payment.id,
      type: "incoming",
      title: `Incoming payment from ${payment.from}`,
      amount: payment.amount,
      status: payment.status,
      project: payment.project,
      source: "Receive money",
      createdAtIso: payment.createdAtIso,
      href: "/payments/receive",
    }));
    const outgoing = getPaymentMovementHistory().map(paymentRecordToMovement);
    const reserves = getProtectedMoneyState().activity.map(reserveActivityToMovement);

    return [...incoming, ...outgoing, ...reserves]
      .sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso))
      .slice(0, 6);
  }, [version]);

  if (!movements.length) {
    return (
      <div className="rounded-[18px] border border-white/14 bg-[#102A4F]/60 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <p className="text-[15px] font-semibold text-white">No operational movements yet</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-[#B8C8DE]">
          Incoming payments, outgoing payments, reserve transfers, and protected money updates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => {
        const Icon = movement.type === "incoming" ? ArrowDownLeft : movement.type === "outgoing" ? ArrowUpRight : movement.type === "reserve-transfer" ? ShieldCheck : Shuffle;
        const amountTone = movement.type === "incoming" ? "text-[#D9FF57]" : movement.type === "outgoing" ? "text-[#F8D7DF]" : "text-[#DCD6FF]";

        return (
          <Link
            key={movement.id}
            href={movement.href}
            className="block rounded-[18px] border border-white/14 bg-[#102A4F]/60 px-4 py-4 shadow-[0_12px_24px_rgba(13,35,68,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/22 hover:bg-[#173D6D]/72 hover:shadow-[0_14px_26px_rgba(13,35,68,0.22),inset_0_1px_0_rgba(255,255,255,0.10)] active:translate-y-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-white/14 bg-[#173D6D]/78 text-[#EAF1FF]">
                  <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">{movement.title}</p>
                  <p className="mt-1 truncate text-[13px] text-[#B8C8DE]">{movement.project}</p>
                </div>
              </div>
              <p className={`shrink-0 text-[20px] font-semibold tracking-[-0.03em] ${amountTone}`}>
                {formatAmount(movement.amount, movement.type)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/6 pt-3">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#9FB3D9]">{movement.status}</p>
              <p className="text-[12px] text-[#C4D2E4]">
                {movement.source} · {formatTimestamp(movement.createdAtIso)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default PaymentHistoryList;
