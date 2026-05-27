"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, FolderKanban, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import {
  createReserve,
  getProtectedMoneySummary,
  releaseReserveAmount,
  subscribeToProtectedMoney,
  type ReserveActivity,
  type ReserveCategory,
} from "@/lib/protectedMoneyStore";
import { subscribeToLatestPaymentTransaction } from "@/lib/paymentTransactionStore";
import { getMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";

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
    txid: string | null;
  };
  error?: string;
}

interface PendingReserve {
  payloadId: string;
  name: string;
  amount: number;
  category: ReserveCategory;
  linkedProject: string;
}

const pendingReserveStorageKey = "zila-xaman-reserve-movement";
const XRPL_RESERVE_VERIFICATION_AMOUNT = "0.000001";

const categories: ReserveCategory[] = [
  "Tax",
  "Payroll",
  "Supplier",
  "Emergency",
  "Equipment",
  "Travel",
  "Project Reserve",
];

const projectOptions = ["Project Horizon", "Atlas Project", "Northstar Project", "Helix Project"];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function shortReference(hash: string) {
  return `OPS-${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
}

function setPendingReserve(reserve: PendingReserve) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(pendingReserveStorageKey, JSON.stringify(reserve));
}

function getPendingReserve(): PendingReserve | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(pendingReserveStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingReserve;
  } catch {
    return null;
  }
}

function clearPendingReserve() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(pendingReserveStorageKey);
}

export function ReserveFlowScreen() {
  const searchParams = useSearchParams();
  const [moneySource, setMoneySource] = useState(getMoneySourceState);
  const [summary, setSummary] = useState(getProtectedMoneySummary);
  const [reserveName, setReserveName] = useState("");
  const [amount, setAmount] = useState("500");
  const [category, setCategory] = useState<ReserveCategory>("Supplier");
  const [linkedProject, setLinkedProject] = useState("Project Horizon");
  const [latestActivity, setLatestActivity] = useState<ReserveActivity | null>(null);
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [reserveMessage, setReserveMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const nextSummary = getProtectedMoneySummary();
      setSummary(nextSummary);
      setLatestActivity((current) => current ?? nextSummary.activity[0] ?? null);
    };

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribePayments = subscribeToLatestPaymentTransaction(update);

    return () => {
      unsubscribeProtected();
      unsubscribePayments();
    };
  }, []);

  useEffect(() => {
    const update = () => setMoneySource(getMoneySourceState());

    update();
    return subscribeToMoneySource(update);
  }, []);

  const safePercentage = useMemo(() => {
    if (summary.totalBalance <= 0) {
      return 0;
    }

    return Math.max(Math.min((summary.safeToSpend / summary.totalBalance) * 100, 100), 0);
  }, [summary.safeToSpend, summary.totalBalance]);

  const numericAmount = useMemo(() => {
    const parsed = Number(amount.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const protectedPreview = Math.min(numericAmount, summary.safeToSpend);
  const safePreview = Math.max(summary.safeToSpend - protectedPreview, 0);

  const completeReserve = (pending: PendingReserve) => {
    const result = createReserve({
      name: pending.name,
      amount: pending.amount,
      category: pending.category,
      linkedProject: pending.linkedProject,
    });

    setLatestActivity(result.activity);
    setReserveName("");
    setAmount("500");
    clearPendingReserve();
    setActivePayload(null);
    setReserveMessage("Protected money recorded with transaction verification.");
  };

  const finalizeReserve = async (payloadId: string) => {
    const pending = getPendingReserve();
    const response = await fetch(`/api/xaman/payload/${payloadId}`, { cache: "no-store" });
    const body = (await response.json()) as PayloadStatusResponse;

    if (!response.ok) {
      throw new Error(body.error || "Unable to verify reserve movement.");
    }

    if (!body.meta.signed || !body.response.txid || !pending) {
      setReserveMessage("Reserve movement was not completed.");
      clearPendingReserve();
      setActivePayload(null);
      return;
    }

    completeReserve(pending);
  };

  useEffect(() => {
    const payloadId = searchParams.get("payload");
    const pending = getPendingReserve();

    if (!payloadId || pending?.payloadId !== payloadId) {
      return;
    }

    setReserveMessage("Confirming reserve movement...");
    void finalizeReserve(payloadId).catch((error) => {
      setReserveMessage(error instanceof Error ? error.message : "Unable to confirm reserve movement.");
    });
  }, [searchParams]);

  useEffect(() => {
    if (!activePayload) {
      return;
    }

    const websocket = new WebSocket(activePayload.websocketStatus);
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { opened?: boolean; signed?: boolean; expired?: boolean };

        if (data.opened) {
          setReserveMessage("Review the reserve movement in Xaman.");
        }

        if (data.expired) {
          clearPendingReserve();
          setActivePayload(null);
          setReserveMessage("Reserve request expired. Try again.");
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            clearPendingReserve();
            setActivePayload(null);
            setReserveMessage("Reserve movement was cancelled.");
            return;
          }

          setReserveMessage("Confirming reserve movement...");
          void finalizeReserve(activePayload.id).catch((error) => {
            setReserveMessage(error instanceof Error ? error.message : "Unable to confirm reserve movement.");
          });
        }
      } catch {
        // Xaman websocket sends keepalive frames that are safe to ignore.
      }
    };

    return () => websocket.close();
  }, [activePayload]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (protectedPreview <= 0) {
      return;
    }

    if (!moneySource.connected || !moneySource.walletAddress) {
      setReserveMessage("Connect your money before creating a verified reserve movement.");
      return;
    }

    try {
      setReserveMessage("Preparing reserve movement...");
      const response = await fetch("/api/xaman/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: XRPL_RESERVE_VERIFICATION_AMOUNT,
          walletAddress: moneySource.walletAddress,
          linkedLabel: `${category} reserve · ${formatCurrency(protectedPreview)}`,
          project: linkedProject || "Protected Money",
          currency: "XRP",
          returnPath: "/move-funds",
        }),
      });
      const body = (await response.json()) as XamanPayloadRequest & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "Unable to prepare reserve movement.");
      }

      setPendingReserve({
        payloadId: body.id,
        name: reserveName,
        amount: protectedPreview,
        category,
        linkedProject,
      });
      setActivePayload(body);
      setReserveMessage("Open Xaman to approve this reserve movement.");
    } catch (error) {
      setReserveMessage(error instanceof Error ? error.message : "Unable to prepare reserve movement.");
    }
  };

  return (
    <AppShell>
      <div className="relative -mx-4 -mt-2 min-h-[calc(100vh-7.5rem)] overflow-hidden bg-[radial-gradient(ellipse_at_16%_0%,rgba(255,255,255,0.46),transparent_30%),radial-gradient(ellipse_at_82%_10%,rgba(103,232,249,0.22),transparent_28%),linear-gradient(180deg,#CFE4FB_0%,#B9D3F3_48%,#8DB4E0_100%)] px-4 pb-28 pt-4 text-[#EAF1FF] md:mx-0 md:min-h-0 md:rounded-[32px] md:px-6 md:pb-8 md:pt-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_74%_30%,rgba(109,94,248,0.12),transparent_26%)]" />

        <div className="relative mx-auto max-w-[1040px]">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-[#17345F]/38 px-3 py-2 text-[12px] font-semibold text-[#F7F8FC] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition hover:bg-[#17345F]/48"
          >
            <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2} />
            Back
          </Link>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="overflow-hidden rounded-[30px] border border-white/28 bg-[linear-gradient(155deg,#245B8B_0%,#1C4776_46%,#14315A_100%)] p-5 shadow-[0_30px_76px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] md:p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-[520px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#BFEFFF]">Protected Money</p>
                  <h1 className="mt-3 text-[36px] font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-[46px]">
                    Organise money before it gets spent.
                  </h1>
                  <p className="mt-4 max-w-[460px] text-[14px] leading-[1.7] text-[#DCE8FF]">
                    Create operational reserves for suppliers, payroll, tax, projects, and upcoming commitments.
                  </p>
                </div>

                <div className="w-full min-w-0 rounded-[24px] border border-[#D9FF57]/24 bg-[#D9FF57]/12 p-4 text-[#F7FFC8] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:w-auto sm:min-w-[210px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Safe to spend</p>
                  <p className="mt-2 whitespace-nowrap text-[32px] font-semibold tracking-[-0.055em] sm:text-[34px] sm:tracking-[-0.06em]">{formatCurrency(summary.safeToSpend)}</p>
                  <p className="mt-2 text-[12px] leading-[1.5] text-[#F1FFB8]">Available after protected and committed money.</p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Total balance", summary.totalBalance, "text-white"],
                  ["Protected money", summary.protectedAmount, "text-[#DCD6FF]"],
                  ["Committed", summary.committedAmount, "text-[#BFEFFF]"],
                  ["Safe to spend", summary.safeToSpend, "text-[#F1FFB8]"],
                ].map(([label, value, tone]) => (
                  <div key={label as string} className="rounded-[20px] border border-white/16 bg-[#102A4F]/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-sm">
                    <p className="text-[10px] font-medium text-[#C9D4F5]">{label}</p>
                    <p className={`mt-2 whitespace-nowrap text-[20px] font-semibold tracking-[-0.04em] ${tone}`}>{formatCurrency(value as number)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#102A4F]/62">
                <div className="h-full bg-[#D9FF57] shadow-[0_0_18px_rgba(217,255,87,0.26)]" style={{ width: `${safePercentage}%` }} />
              </div>
            </section>

            <form
              onSubmit={handleSubmit}
              className="rounded-[30px] border border-white/28 bg-[linear-gradient(180deg,rgba(243,245,249,0.94),rgba(220,232,255,0.88))] p-5 text-[#111827] shadow-[0_28px_70px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#111827] text-[#D9FF57]">
                  <LockKeyhole className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Create reserve</p>
                  <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.05em] text-[#111827]">Protect money</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <input
                  value={reserveName}
                  onChange={(event) => setReserveName(event.target.value)}
                  placeholder={`${category} reserve`}
                  className="w-full rounded-[16px] border border-[#111827]/10 bg-white/72 px-4 py-3 text-[14px] font-medium text-[#111827] outline-none placeholder:text-[#6B7280]"
                />
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                  placeholder="Amount"
                  className="w-full rounded-[16px] border border-[#111827]/10 bg-white/72 px-4 py-3 text-[14px] font-medium text-[#111827] outline-none placeholder:text-[#6B7280]"
                />
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as ReserveCategory)}
                  className="w-full rounded-[16px] border border-[#111827]/10 bg-white/72 px-4 py-3 text-[14px] font-medium text-[#111827] outline-none"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={linkedProject}
                  onChange={(event) => setLinkedProject(event.target.value)}
                  className="w-full rounded-[16px] border border-[#111827]/10 bg-white/72 px-4 py-3 text-[14px] font-medium text-[#111827] outline-none"
                >
                  <option value="">Optional linked project</option>
                  {projectOptions.map((project) => (
                    <option key={project}>{project}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 rounded-[18px] border border-[#1D4ED8]/12 bg-[#EAF1FF]/74 p-4">
                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="text-[#4B5870]">After protection</span>
                  <span className="font-semibold text-[#111827]">{formatCurrency(safePreview)} safe to spend</span>
                </div>
                <p className="mt-2 text-[12px] leading-[1.55] text-[#526078]">
                  This moves money from available balance into an operating reserve and records the decision.
                </p>
              </div>

              {reserveMessage ? (
                <div className="mt-4 rounded-[18px] border border-[#1D4ED8]/12 bg-white/70 p-4">
                  <p className="text-[12px] font-semibold text-[#111827]">{reserveMessage}</p>
                  {!moneySource.connected ? (
                    <Link href="/payments/connect-account" className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-[#111827] px-4 text-[12px] font-semibold text-white">
                      Connect money
                    </Link>
                  ) : null}
                  {activePayload ? (
                    <div className="mt-4 flex items-center gap-4">
                      <Image
                        src={activePayload.qrPng}
                        alt="Xaman reserve movement QR code"
                        width={112}
                        height={112}
                        unoptimized
                        className="h-28 w-28 rounded-[14px] border border-[#111827]/10 bg-white p-2"
                      />
                      <Link href={activePayload.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-full bg-[#1D4ED8] px-4 text-[12px] font-semibold text-white">
                        Open Xaman
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={protectedPreview <= 0 || Boolean(activePayload)}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#1D4ED8] text-[14px] font-semibold text-white shadow-[0_18px_34px_rgba(29,78,216,0.22)] transition hover:bg-[#245FE0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="h-[15px] w-[15px]" strokeWidth={2} />
                Protect money
              </button>
            </form>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[28px] border border-white/24 bg-[#12315A]/72 p-5 shadow-[0_24px_60px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">Reserve structure</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.045em] text-white">Protected money</h2>
                </div>
                <WalletCards className="h-5 w-5 text-[#D9FF57]" strokeWidth={2} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {summary.reserves.length ? (
                  summary.reserves.map((reserve) => (
                    <div key={reserve.id} className="rounded-[20px] border border-white/14 bg-[#0F2749]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-white">{reserve.name}</p>
                          <p className="mt-1 text-[11px] text-[#C9D4F5]">{reserve.category}</p>
                        </div>
                        <span className="rounded-full border border-[#D9FF57]/22 bg-[#D9FF57]/10 px-2.5 py-1 text-[10px] font-semibold text-[#F1FFB8]">
                          Protected
                        </span>
                      </div>
                      {reserve.linkedProject ? (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[11px] text-[#DCE8FF]">
                          <FolderKanban className="h-[12px] w-[12px]" strokeWidth={2} />
                          {reserve.linkedProject}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-[22px] font-semibold tracking-[-0.05em] text-[#DCD6FF]">{formatCurrency(reserve.amount)}</p>
                        <button
                          type="button"
                          onClick={() => releaseReserveAmount(reserve.id, reserve.amount)}
                          className="rounded-full border border-white/14 bg-white/[0.09] px-3 py-1.5 text-[11px] font-semibold text-[#DCE8FF] transition hover:bg-white/[0.13]"
                        >
                          Release
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-white/14 bg-[#0F2749]/58 p-4 md:col-span-2">
                    <p className="text-[14px] font-semibold text-white">No new reserves yet</p>
                    <p className="mt-2 text-[13px] leading-[1.6] text-[#C9D4F5]">
                      Start by protecting supplier, payroll, tax, or project money before the next payment decision.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-[28px] border border-white/24 bg-[linear-gradient(180deg,rgba(109,94,248,0.16),rgba(18,49,90,0.76))] p-5 shadow-[0_24px_60px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#DCD6FF]">Operational insight</p>
                <p className="mt-3 text-[18px] font-semibold leading-[1.35] tracking-[-0.035em] text-white">
                  {latestActivity?.insight ?? "Protected money keeps commitments out of everyday spending decisions."}
                </p>
              </section>

              <section className="rounded-[28px] border border-white/24 bg-[#F3F5F9]/90 p-5 text-[#111827] shadow-[0_24px_60px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#111827] text-[#D9FF57]">
                    <CheckCircle2 className="h-[17px] w-[17px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Proof record</p>
                    <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.045em]">Recorded activity</h3>
                  </div>
                </div>

                {latestActivity ? (
                  <div className="mt-4 space-y-3 text-[13px]">
                    <div className="rounded-[16px] border border-[#111827]/10 bg-white/70 p-3">
                      <p className="font-semibold text-[#111827]">{latestActivity.action}</p>
                      <p className="mt-1 text-[#526078]">{latestActivity.context}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[14px] bg-[#EAF1FF] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#526078]">State</p>
                        <p className="mt-1 font-semibold text-[#111827]">{latestActivity.transactionState}</p>
                      </div>
                      <div className="rounded-[14px] bg-[#EAF1FF] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#526078]">Reference</p>
                        <p className="mt-1 font-semibold text-[#111827]">{shortReference(latestActivity.txHash)}</p>
                      </div>
                    </div>
                    <p className="text-[12px] leading-[1.55] text-[#526078]">
                      Future transfer metadata is prepared without exposing technical rails in the workflow.
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-[13px] leading-[1.65] text-[#526078]">
                    Reserve actions will appear here with timestamp, project reference, transfer state, and verification status.
                  </p>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
