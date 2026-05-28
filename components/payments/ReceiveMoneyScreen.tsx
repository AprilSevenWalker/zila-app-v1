"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, Landmark, QrCode, Send, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import { FlowBackNav } from "@/components/ui/FlowBackNav";
import { getMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";
import {
  getMoneyMovementState,
  simulateIncomingPayment,
  subscribeToMoneyMovement,
  type IncomingPayment,
} from "@/lib/moneyMovementStore";
import { getProtectedMoneySummary, subscribeToProtectedMoney } from "@/lib/protectedMoneyStore";
import { subscribeToLatestPaymentTransaction } from "@/lib/paymentTransactionStore";

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function MiniQr() {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1,
    1, 0, 1, 0, 0, 1, 0, 1,
    1, 1, 1, 1, 0, 1, 1, 0,
    0, 1, 0, 1, 1, 0, 1, 1,
    1, 0, 1, 0, 1, 1, 0, 1,
    0, 1, 1, 1, 0, 0, 1, 0,
    1, 0, 0, 1, 1, 1, 0, 1,
    1, 1, 0, 0, 1, 0, 1, 1,
  ];

  return (
    <div className="grid h-36 w-36 grid-cols-8 gap-1 rounded-[24px] border border-white/70 bg-white p-4 shadow-[0_18px_36px_rgba(31,68,116,0.18)]" aria-label="Receive QR code">
      {cells.map((active, index) => (
        <span key={index} className={`rounded-[3px] ${active ? "bg-[#17345F]" : "bg-[#DCEEFF]"}`} />
      ))}
    </div>
  );
}

export function ReceiveMoneyScreen() {
  const [moneySource, setMoneySource] = useState(getMoneySourceState);
  const [movement, setMovement] = useState(getMoneyMovementState);
  const [summary, setSummary] = useState(getProtectedMoneySummary);
  const [copied, setCopied] = useState(false);
  const [requestShared, setRequestShared] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);

  const latestIncoming = movement.incoming[0];
  const address = movement.receiveAddress;
  const recentIncoming = useMemo(() => movement.incoming.slice(0, 4), [movement.incoming]);

  useEffect(() => {
    const updateMoney = () => setMoneySource(getMoneySourceState());
    const updateMovement = () => setMovement(getMoneyMovementState());
    const updateSummary = () => setSummary(getProtectedMoneySummary());

    updateMoney();
    updateMovement();
    updateSummary();

    const unsubscribeMoney = subscribeToMoneySource(updateMoney);
    const unsubscribeMovement = subscribeToMoneyMovement(() => {
      updateMovement();
      updateSummary();
    });
    const unsubscribeProtected = subscribeToProtectedMoney(updateSummary);
    const unsubscribePayments = subscribeToLatestPaymentTransaction(updateSummary);

    return () => {
      unsubscribeMoney();
      unsubscribeMovement();
      unsubscribeProtected();
      unsubscribePayments();
    };
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const sharePaymentRequest = async () => {
    const text = `Payment request for Zila operating balance: ${address}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Zila payment request", text });
      } catch {
        // User dismissed native share.
      }
    }

    setRequestShared(true);
    window.setTimeout(() => setRequestShared(false), 1600);
  };

  const requestPayment = () => {
    if (pendingPayment) {
      return;
    }

    setPendingPayment(true);
    window.setTimeout(() => {
      const payment: IncomingPayment = simulateIncomingPayment({
        amount: 2000,
        from: "Atlas Client",
        project: "Atlas Project",
      });
      setMovement(getMoneyMovementState());
      setSummary(getProtectedMoneySummary());
      setPendingPayment(false);
      window.localStorage.setItem("zila-last-incoming-payment", payment.id);
    }, 1300);
  };

  return (
    <AppShell>
      <div className="-mx-4 -mt-2 min-h-[calc(100vh-7.5rem)] overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.62),transparent_32%),radial-gradient(ellipse_at_86%_8%,rgba(103,232,249,0.24),transparent_30%),linear-gradient(180deg,#DCEEFF_0%,#C6DDF8_48%,#AFCBEF_100%)] px-6 pb-28 pt-8 text-white md:-mx-6 md:rounded-[36px] md:px-8 md:pb-12 lg:-mx-8 lg:px-10">
        <div className="relative mx-auto max-w-[1180px]">
          <FlowBackNav
            surface="light"
            items={[
              { label: "Payments", href: "/payments", primary: true },
              { label: "Dashboard", href: "/home" },
            ]}
          />
          <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#1D4E7F]">Receive money</p>
              <h1 className="mt-3 text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#17345F]">Receive operational funds.</h1>
            </div>
            <Link href={moneySource.connected ? "/payments" : "/payments/connect-account"} className="rounded-full border border-white/52 bg-white/48 px-4 py-2 text-[13px] font-semibold text-[#17345F] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
              {moneySource.connected ? "Money connected" : "Connect money"}
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="zila-readable-text overflow-hidden rounded-[34px] border border-white/32 bg-[linear-gradient(155deg,#2B5F94,#1E4A7D_48%,#17345F)] p-6 shadow-[0_34px_86px_rgba(31,68,116,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] md:p-8">
              <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/18 bg-white/[0.12]">
                      <QrCode className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#BCEEFF]">Connected status</p>
                      <p className="mt-1 text-[18px] font-semibold text-white">{moneySource.connected ? "Ready to receive money" : "No money connected"}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                    {[
                      ["Total balance", summary.totalBalance],
                      ["Protected money", summary.protectedAmount],
                      ["Available", Math.max(summary.totalBalance - summary.protectedAmount, 0)],
                      ["Safe to spend", summary.safeToSpend],
                    ].map(([label, value]) => (
                      <div key={label as string} className="min-w-[150px] rounded-[20px] border border-white/14 bg-white/[0.10] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase leading-[1.45] tracking-[0.16em] text-[#C9DDF6]">{label}</p>
                        <p className="mt-2 whitespace-nowrap text-[20px] font-semibold tabular-nums tracking-[-0.04em] text-white sm:text-[21px]">{formatCurrency(value as number)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-[24px] border border-white/16 bg-[#102A4F]/42 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BCEEFF]">Receive address</p>
                    <p className="mt-3 break-all rounded-[16px] border border-white/10 bg-white/[0.08] px-4 py-3 font-mono text-[13px] tracking-[0.03em] text-[#F3F8FF]">{address}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={copyAddress} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-[#17345F]">
                        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        {copied ? "Copied" : "Copy address"}
                      </button>
                      <button type="button" onClick={sharePaymentRequest} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 bg-white/[0.11] px-4 text-[13px] font-semibold text-white">
                        <Send className="h-3.5 w-3.5" strokeWidth={2} />
                        {requestShared ? "Request ready" : "Share payment request"}
                      </button>
                      <button type="button" onClick={requestPayment} disabled={pendingPayment} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#D9FF57] px-4 text-[13px] font-semibold text-[#102A4F] disabled:opacity-70">
                        {pendingPayment ? "Waiting for payment…" : "Request payment"}
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <MiniQr />
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#F9FBFF,#E6F0FF)] p-5 text-[#17345F] shadow-[0_24px_54px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.94)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/80 bg-white text-[#1D4ED8]">
                    {latestIncoming ? <CheckCircle2 className="h-5 w-5" strokeWidth={1.9} /> : <Landmark className="h-5 w-5" strokeWidth={1.9} />}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7D95]">Incoming payment state</p>
                    <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em]">{pendingPayment ? "Payment request sent" : latestIncoming ? `${latestIncoming.amountLabel} received` : "Ready to receive funds"}</p>
                    <p className="mt-2 text-[13px] leading-[1.6] text-[#526173]">
                      {latestIncoming ? `${latestIncoming.amountLabel} assigned to ${latestIncoming.project}.` : "Share your receive details or request a payment from a client."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/22 bg-[linear-gradient(180deg,#214F83,#173D6D_52%,#102A4F)] p-5 shadow-[0_24px_54px_rgba(31,68,116,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#BCEEFF]">Recent incoming activity</p>
                </div>
                <div className="mt-4 space-y-3">
                  {recentIncoming.length ? recentIncoming.map((payment) => (
                    <div key={payment.id} className="rounded-[18px] border border-white/12 bg-white/[0.08] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-white">{payment.amountLabel} received</p>
                          <p className="mt-1 text-[12px] text-[#DCEBFF]">From {payment.from}</p>
                        </div>
                        <span className="rounded-full border border-[#D9FF57]/24 bg-[#D9FF57]/12 px-2.5 py-1 text-[10px] font-semibold text-[#F7FFC8]">{payment.status}</span>
                      </div>
                      <p className="mt-2 text-[12px] text-[#C9DDF6]">{payment.project} · {payment.displayTimestamp}</p>
                    </div>
                  )) : (
                    <p className="rounded-[18px] border border-white/12 bg-white/[0.08] px-4 py-4 text-[13px] leading-[1.6] text-[#DCEBFF]">
                      Incoming payments will appear here with project assignment and proof status.
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ReceiveMoneyScreen;
