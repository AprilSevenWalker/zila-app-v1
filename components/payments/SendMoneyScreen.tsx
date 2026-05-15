"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MoveRight,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { clearPaymentDraft, getPaymentDraft } from "@/lib/paymentDraftStore";
import { getMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";
import {
  getProtectedMoneySummary,
  subscribeToProtectedMoney,
  useReserveForPayment,
  type ProtectedReserve,
} from "@/lib/protectedMoneyStore";
import {
  saveLatestPaymentTransaction,
  savePaymentMovement,
  type PaymentMovementRecord,
} from "@/lib/paymentTransactionStore";
import {
  buildXrplExplorerUrl,
  saveProofTransaction,
  shortenWalletAddress,
} from "@/lib/proofTransactionStore";

type FlowState = "details" | "review" | "awaiting-signature" | "signing" | "processing" | "success" | "failed";

interface XamanPayloadRequest {
  id: string;
  url: string;
  qrPng: string;
  websocketStatus: string;
}

interface PayloadStatusResponse {
  meta: {
    signed: boolean;
  };
  response: {
    account: string | null;
    txid: string | null;
    resolved_at: string | null;
  };
  error?: string;
}

interface PendingOperationalPayment {
  payloadId: string;
  amountLabel: string;
  amountValue: number;
  projectName: string;
  sourceLabel: string;
  recipient: string;
  reason: string;
  reserveId?: string;
  safeBefore: number;
  safeAfter: number;
  walletAddress: string;
}

const pendingPaymentStorageKey = "zila-xaman-operational-payment";
const XRPL_VERIFICATION_AMOUNT = "0.000001";

const recipients = ["Northline Suppliers", "Mara Contractor Studio", "Atlas Logistics", "Kinetic Production"];
const projects = ["Project Horizon", "Atlas Project", "Northstar Project", "Helix Project"];
const reasons = ["Supplier payment", "Contractor payment", "Send project funds", "Move operational funds"];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatTime(dateIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateIso));
}

function buildRecommendation(input: {
  amount: number;
  safeBefore: number;
  safeAfter: number;
  selectedReserve?: ProtectedReserve;
  projectName: string;
}) {
  if (input.selectedReserve && input.amount <= input.selectedReserve.amount) {
    return `You can proceed safely using ${input.selectedReserve.name}.`;
  }

  if (input.safeAfter <= 0) {
    return `This payment may create pressure before the next incoming invoice.`;
  }

  if (input.amount > input.safeBefore * 0.6) {
    return `Paying 60% today keeps ${input.projectName} within a safer operating range.`;
  }

  if (input.safeAfter < 10000) {
    return "This payment reduces your safe range later this week.";
  }

  return "This payment can move without disrupting your current operating range.";
}

function riskLevel(safeAfter: number, amount: number, safeBefore: number) {
  if (safeAfter <= 0 || amount > safeBefore) {
    return { label: "High pressure", tone: "border-rose-200/24 bg-rose-300/[0.10] text-[#FFD6DA]" };
  }

  if (safeAfter < 10000 || amount > safeBefore * 0.6) {
    return { label: "Watch timing", tone: "border-amber-200/24 bg-amber-300/[0.10] text-[#FFE8B0]" };
  }

  return { label: "Safe to proceed", tone: "border-[#D9FF57]/24 bg-[#D9FF57]/10 text-[#F1FFB8]" };
}

function getPendingPayment(): PendingOperationalPayment | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(pendingPaymentStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingOperationalPayment;
  } catch {
    return null;
  }
}

function setPendingPayment(payment: PendingOperationalPayment) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(pendingPaymentStorageKey, JSON.stringify(payment));
}

function clearPendingPayment() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(pendingPaymentStorageKey);
}

export function SendMoneyScreen() {
  const searchParams = useSearchParams();
  const draft = getPaymentDraft();
  const [moneySource, setMoneySource] = useState(getMoneySourceState);
  const [summary, setSummary] = useState(getProtectedMoneySummary);
  const [recipient, setRecipient] = useState(recipients[0]);
  const [projectName, setProjectName] = useState(draft.projectName || projects[0]);
  const [sourceId, setSourceId] = useState("available");
  const [amount, setAmount] = useState(String(draft.amountValue || 4300));
  const [reason, setReason] = useState(draft.paymentType || reasons[0]);
  const [flowState, setFlowState] = useState<FlowState>("details");
  const [paymentRecord, setPaymentRecord] = useState<PaymentMovementRecord | null>(null);
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setSummary(getProtectedMoneySummary());

    update();
    return subscribeToProtectedMoney(update);
  }, []);

  useEffect(() => {
    const update = () => setMoneySource(getMoneySourceState());

    update();
    return subscribeToMoneySource(update);
  }, []);

  const amountValue = useMemo(() => {
    const parsed = Number(amount.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
  }, [amount]);

  const selectedReserve = summary.reserves.find((reserve) => reserve.id === sourceId);
  const sourceLabel = selectedReserve?.name ?? "Available balance";
  const safeBefore = summary.safeToSpend;
  const safeAfter = selectedReserve ? safeBefore : Math.max(safeBefore - amountValue, 0);
  const protectedAfter = selectedReserve
    ? Math.max(summary.protectedAmount - Math.min(amountValue, selectedReserve.amount), 0)
    : summary.protectedAmount;
  const totalAfter = Math.max(summary.totalBalance - amountValue, 0);
  const recommendation = buildRecommendation({
    amount: amountValue,
    safeBefore,
    safeAfter,
    selectedReserve,
    projectName,
  });
  const risk = riskLevel(safeAfter, amountValue, safeBefore);

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amountValue) {
      return;
    }

    setFlowState("review");
  };

  const finalizePayment = async (payloadId: string) => {
    const pending = getPendingPayment();
    const response = await fetch(`/api/xaman/payload/${payloadId}`, { cache: "no-store" });
    const body = (await response.json()) as PayloadStatusResponse;

    if (!response.ok) {
      throw new Error(body.error || "Unable to verify payment.");
    }

    if (!body.meta.signed || !body.response.txid || !pending) {
      clearPendingPayment();
      setFlowState("failed");
      setPaymentMessage("Payment was not completed.");
      setActivePayload(null);
      return;
    }

    const createdAtIso = body.response.resolved_at ?? new Date().toISOString();
    const txHash = body.response.txid;
    const record: PaymentMovementRecord = {
      id: `payment-movement-${Date.now()}`,
      type: "outgoing",
      title: `${pending.reason} completed`,
      amountLabel: pending.amountLabel,
      amountValue: pending.amountValue,
      status: "Verified",
      project: pending.projectName,
      sourceLabel: pending.sourceLabel,
      recipientName: pending.recipient,
      reason: pending.reason,
      txHash,
      explorerUrl: buildXrplExplorerUrl(txHash),
      createdAtIso,
    };

    savePaymentMovement(record);
    if (pending.reserveId) {
      useReserveForPayment({
        reserveId: pending.reserveId,
        amount: pending.amountValue,
        paymentLabel: pending.reason,
        projectName: pending.projectName,
        recipientName: pending.recipient,
      });
    }
    saveLatestPaymentTransaction({
      txid: txHash,
      amountLabel: pending.amountLabel,
      amountValue: pending.amountValue,
      projectName: pending.projectName,
      recipientName: pending.recipient,
      sourceLabel: pending.sourceLabel,
      paymentReason: pending.reason,
      movementType: "outgoing",
      verificationState: "Verified",
      transferStatus: "Completed",
      walletAddress: body.response.account || pending.walletAddress,
      network: "XRPL Mainnet",
      createdAtIso,
    });
    saveProofTransaction({
      id: `outgoing-payment-${Date.now()}`,
      walletAddress: body.response.account || pending.walletAddress,
      walletAddressShort: shortenWalletAddress(body.response.account || pending.walletAddress),
      status: "Confirmed",
      amountLabel: pending.amountLabel,
      amountValue: pending.amountValue,
      network: "XRPL Mainnet",
      linkedType: "project",
      linkedLabel: pending.projectName,
      project: pending.projectName,
      actionLabel: "completed",
      contextLabel: `${pending.reason} sent to ${pending.recipient}`,
      summary: `${pending.amountLabel} moved from ${pending.sourceLabel} for ${pending.projectName}. Safe to Spend updated from ${formatCurrency(pending.safeBefore)} to ${formatCurrency(pending.safeAfter)}. XRPL transaction confirmed.`,
      hash: txHash,
      createdAtIso,
      displayTimestamp: formatTime(createdAtIso),
    });
    clearPaymentDraft();
    clearPendingPayment();
    setPaymentRecord(record);
    setActivePayload(null);
    setPaymentMessage("Payment confirmed and proof record updated.");
    setFlowState("success");
  };

  useEffect(() => {
    const payloadId = searchParams.get("payload");

    if (!payloadId) {
      return;
    }

    const pending = getPendingPayment();
    if (pending?.payloadId !== payloadId) {
      return;
    }

    setFlowState("processing");
    void finalizePayment(payloadId).catch((error) => {
      setFlowState("failed");
      setPaymentMessage(error instanceof Error ? error.message : "Unable to confirm payment.");
    });
  }, [searchParams]);

  useEffect(() => {
    if (!activePayload) {
      return;
    }

    const websocket = new WebSocket(activePayload.websocketStatus);

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { opened?: boolean; signed?: boolean; dispatched?: boolean; expired?: boolean };

        if (data.opened) {
          setFlowState("signing");
          setPaymentMessage("Review the payment in Xaman.");
        }

        if (data.dispatched) {
          setFlowState("processing");
          setPaymentMessage("Payment submitted. Waiting for confirmation.");
        }

        if (data.expired) {
          clearPendingPayment();
          setFlowState("failed");
          setPaymentMessage("Signing request expired. Try again.");
          setActivePayload(null);
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            clearPendingPayment();
            setFlowState("failed");
            setPaymentMessage("Payment was cancelled.");
            setActivePayload(null);
            return;
          }

          setFlowState("processing");
          void finalizePayment(activePayload.id).catch((error) => {
            setFlowState("failed");
            setPaymentMessage(error instanceof Error ? error.message : "Unable to confirm payment.");
          });
        }
      } catch {
        // Xaman websocket sends keepalive frames that are safe to ignore.
      }
    };

    return () => websocket.close();
  }, [activePayload]);

  const handleConfirm = async () => {
    if (!amountValue || flowState === "processing") {
      return;
    }

    if (!moneySource.connected || !moneySource.walletAddress) {
      setPaymentMessage("Connect your money before confirming this payment.");
      return;
    }

    setFlowState("processing");
    setPaymentMessage("Preparing signing request...");

    try {
      const response = await fetch("/api/xaman/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: XRPL_VERIFICATION_AMOUNT,
          walletAddress: moneySource.walletAddress,
          linkedLabel: `${reason} · ${formatCurrency(amountValue)}`,
          project: projectName,
          currency: "XRP",
          returnPath: "/payments/make-payment",
        }),
      });
      const body = (await response.json()) as XamanPayloadRequest & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "Unable to prepare signing request.");
      }

      setPendingPayment({
        payloadId: body.id,
        amountLabel: formatCurrency(amountValue),
        amountValue,
        projectName,
        sourceLabel,
        recipient,
        reason,
        reserveId: selectedReserve?.id,
        safeBefore,
        safeAfter,
        walletAddress: moneySource.walletAddress,
      });
      setActivePayload(body);
      setFlowState("awaiting-signature");
      setPaymentMessage("Open Xaman to approve this operational payment.");
    } catch (error) {
      setFlowState("failed");
      setPaymentMessage(error instanceof Error ? error.message : "Unable to prepare payment.");
    }
  };

  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.24),transparent_30%),radial-gradient(ellipse_at_84%_8%,rgba(103,232,249,0.18),transparent_28%),linear-gradient(160deg,#12325A_0%,#173D6D_44%,#102A4F_100%)] px-6 pb-28 pt-8 text-white md:-mx-6 md:rounded-[36px] md:px-8 md:pb-12 lg:-mx-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-12 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(103,232,249,0.18),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(109,94,248,0.14),transparent_24%)]" />
      <div className="relative flex flex-1 flex-col">
        <Link href="/payments" className="inline-flex w-fit items-center gap-2 text-[12px] font-semibold text-[#DCE8FF] transition hover:opacity-80">
          <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2} />
          Payments
        </Link>

        <div className="mt-7 max-w-[560px]">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#BFEFFF]">Send money</p>
          <h1 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">Review the impact before money moves.</h1>
          <p className="mt-5 max-w-[390px] text-[16px] leading-[1.68] text-[#DCE8FF]/88">
            Choose the recipient, project, and source so Zila can show the operating effect before you confirm.
          </p>
        </div>

        {flowState === "success" && paymentRecord ? (
          <section className="mt-8 rounded-[30px] border border-[#D9FF57]/22 bg-[linear-gradient(180deg,rgba(217,255,87,0.13),rgba(16,42,79,0.42))] p-6 shadow-[0_24px_58px_rgba(31,68,116,0.22),0_0_30px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F1FFB8]">Payment completed</p>
                <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.055em]">Supplier payment completed successfully.</h2>
                <p className="mt-3 max-w-[520px] text-[15px] leading-[1.7] text-[#E8F7D1]">
                  {paymentRecord.amountLabel} moved to {paymentRecord.recipientName}. Proof of Operations and payment history were updated.
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/16 bg-white/12 text-[#F1FFB8]">
                <CheckCircle2 className="h-[20px] w-[20px]" strokeWidth={2} />
              </span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Project", paymentRecord.project],
                ["Source", paymentRecord.sourceLabel],
                ["Status", paymentRecord.status],
                ["Reference", `OPS-${paymentRecord.txHash.slice(0, 8)}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9D4F5]">{label}</p>
                  <p className="mt-2 text-[15px] font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/proof" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-[#111827]">
                View proof
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
              </Link>
              <Link href="/payments" className="inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                Payment history
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <form onSubmit={handleReview} className="rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(15,42,79,0.72),rgba(12,31,58,0.56))] p-6 shadow-[0_24px_58px_rgba(31,68,116,0.22),inset_0_1px_0_rgba(255,255,255,0.11)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">Payment details</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Recipient</span>
                  <select value={recipient} onChange={(event) => setRecipient(event.target.value)} className="h-13 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {recipients.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Project</span>
                  <select value={projectName} onChange={(event) => setProjectName(event.target.value)} className="h-13 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {projects.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Reserve / source</span>
                  <select value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="h-13 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    <option value="available">Available balance</option>
                    {summary.reserves.map((reserve) => (
                      <option key={reserve.id} value={reserve.id}>
                        {reserve.name} · {formatCurrency(reserve.amount)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Amount</span>
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" className="h-13 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payment reason</span>
                  <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-13 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {reasons.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <button type="submit" disabled={!amountValue} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-[#111827] shadow-[0_18px_36px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-50">
                Review operational impact
                <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2} />
              </button>
            </form>

            <aside className="space-y-4">
              <section className="rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(103,232,249,0.12),rgba(16,42,79,0.48))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/12 bg-white/10 text-[#D9FF57]">
                    <Sparkles className="h-[16px] w-[16px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">Zila recommendation</p>
                    <p className="mt-2 text-[18px] font-semibold leading-[1.35] tracking-[-0.035em] text-white">{recommendation}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/14 bg-[#F3F5F9]/94 p-5 text-[#111827] shadow-[0_20px_48px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.72)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">Operational impact</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    ["Total", summary.totalBalance],
                    ["Protected", summary.protectedAmount],
                    ["Committed", summary.committedAmount],
                    ["Safe now", safeBefore],
                    ["Total after", totalAfter],
                    ["Protected after", protectedAfter],
                    ["Safe after", safeAfter],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-[14px] bg-white/72 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#65738B]">{label}</p>
                      <p className="mt-1 text-[15px] font-semibold text-[#111827]">{formatCurrency(value as number)}</p>
                    </div>
                  ))}
                  <div className={`rounded-[14px] border p-3 ${risk.tone}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Risk</p>
                    <p className="mt-1 text-[15px] font-semibold">{risk.label}</p>
                  </div>
                </div>
                <p className="mt-4 text-[12px] leading-[1.55] text-[#526078]">
                  Reserve impact: {selectedReserve ? `${formatCurrency(Math.min(amountValue, selectedReserve.amount))} used from ${selectedReserve.name}.` : "Available balance will fund this payment."}
                </p>
                <p className="mt-2 text-[12px] leading-[1.55] text-[#526078]">
                  Project impact: {projectName} pressure updates after confirmation.
                </p>
              </section>
            </aside>
          </div>
        )}

        {flowState === "review" ? (
          <div className="mt-6 rounded-[26px] border border-white/14 bg-[#102A4F]/72 p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">Review ready</p>
                <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-white">
                  {formatCurrency(amountValue)} to {recipient} from {sourceLabel}
                </p>
                <p className="mt-1 text-[13px] text-[#C9D4F5]">{recommendation}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setFlowState("details")} className="h-11 rounded-full border border-white/14 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                  Edit
                </button>
                <button type="button" onClick={handleConfirm} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-[#111827]">
                  Confirm payment
                  <MoveRight className="h-[14px] w-[14px]" strokeWidth={2} />
                </button>
              </div>
            </div>
            {!moneySource.connected ? (
              <div className="mt-4 rounded-[18px] border border-amber-200/22 bg-amber-300/[0.09] px-4 py-4">
                <p className="text-[13px] font-semibold text-[#FFE8B0]">Connect your money before confirming this payment.</p>
                <Link href="/payments/connect-account" className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[12px] font-semibold text-[#111827]">
                  Connect money
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {activePayload && (flowState === "awaiting-signature" || flowState === "signing") ? (
          <section className="mt-6 rounded-[26px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.12),rgba(16,42,79,0.62))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src={activePayload.qrPng}
                alt="Xaman signing QR code"
                width={136}
                height={136}
                unoptimized
                className="h-36 w-36 rounded-[18px] border border-white/18 bg-white p-2"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">
                  {flowState === "signing" ? "Signing" : "Awaiting signature"}
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-white">Approve in Xaman</h2>
                <p className="mt-2 max-w-[420px] text-[13px] leading-[1.65] text-[#DCE8FF]">
                  Zila will record the operational amount, project, source, and transaction reference after confirmation.
                </p>
                <Link
                  href={activePayload.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#111827]"
                >
                  Open Xaman
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {flowState === "failed" ? (
          <section className="mt-6 rounded-[22px] border border-rose-200/20 bg-rose-300/[0.09] p-4">
            <p className="text-[14px] font-semibold text-[#FFD6DA]">{paymentMessage ?? "Payment could not be completed."}</p>
            <button
              type="button"
              onClick={() => {
                setFlowState("review");
                setPaymentMessage(null);
                setActivePayload(null);
              }}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.10] px-4 text-[12px] font-semibold text-[#F4F8FF]"
            >
              Review again
            </button>
          </section>
        ) : null}

        {flowState === "processing" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06101F]/68 px-4 backdrop-blur-sm">
            <section className="w-full max-w-[380px] rounded-[26px] border border-white/16 bg-[linear-gradient(180deg,rgba(16,42,79,0.98),rgba(7,17,31,0.96))] p-6 text-center shadow-[0_28px_68px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#67E8F9]" strokeWidth={2} />
              <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.045em] text-white">Processing payment</h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#C9D4F5]">
                {paymentMessage ?? "Zila is recording the operational update, proof reference, reserve impact, and project state."}
              </p>
            </section>
          </div>
        ) : null}

        {flowState !== "success" ? (
          <div className="mt-auto flex items-center gap-3 pt-10 text-[12px] text-[#C9D4F5]">
            <ShieldCheck className="h-[14px] w-[14px] text-[#D9FF57]" strokeWidth={2} />
            Every confirmed payment creates a Proof of Operations record.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SendMoneyScreen;
