"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Copy,
  Landmark,
  LoaderCircle,
  MoveRight,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";

import { formatTransactionHash, saveProofTransaction, shortenWalletAddress, type ProofLinkedType } from "@/lib/proofTransactionStore";
import { saveMoneySourceState } from "@/lib/moneySourceStore";
import { saveLatestPaymentTransaction } from "@/lib/paymentTransactionStore";

interface LinkTarget {
  id: string;
  label: string;
  type: "project" | "payment";
  project: string;
  context: string;
  summary: string;
}

interface XamanPayloadRequest {
  id: string;
  url: string;
  qrPng: string;
  websocketStatus: string;
  kind: "connect" | "payment";
}

interface PendingFlowState {
  kind: "connect" | "payment";
  payloadId: string;
  amountLabel?: string;
  amountValue?: number;
  linkedType?: ProofLinkedType;
  linkedLabel?: string;
  project?: string;
  contextLabel?: string;
  summary?: string;
}

interface PaymentResult {
  status: "Pending" | "Confirmed";
  amountLabel: string;
  linkedLabel: string;
  createdAtIso: string;
  walletAddressShort: string;
  network: "XRPL Mainnet";
  hash?: string;
  explorerUrl?: string;
}

interface PayloadStatusResponse {
  meta: {
    resolved: boolean;
    signed: boolean;
    opened_by_deeplink: boolean | null;
  };
  request: Record<string, unknown>;
  response: {
    account: string | null;
    txid: string | null;
    resolved_at: string | null;
  };
}

const linkTargets: LinkTarget[] = [
  {
    id: "project-horizon",
    label: "Project Horizon",
    type: "project",
    project: "Project Horizon",
    context: "Payment recorded for Project Horizon",
    summary: "A verified payment was recorded and attached to Project Horizon's operating history.",
  },
  {
    id: "harbour-road",
    label: "Harbour Road",
    type: "project",
    project: "Harbour Road",
    context: "Funds move recorded for Harbour Road",
    summary: "A verified funds movement was recorded and attached to Harbour Road's operating history.",
  },
  {
    id: "supplier-payment",
    label: "Supplier payment",
    type: "payment",
    project: "Project Horizon",
    context: "Payment action recorded for supplier settlement",
    summary: "A verified payment was recorded and linked to the supplier payment history.",
  },
];

const defaultTarget = linkTargets[0];
const pendingFlowStorageKey = "zila-xaman-pending-flow";

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPendingFlowState(): PendingFlowState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(pendingFlowStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingFlowState;
  } catch {
    return null;
  }
}

function setPendingFlowState(state: PendingFlowState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(pendingFlowStorageKey, JSON.stringify(state));
}

function clearPendingFlowState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(pendingFlowStorageKey);
}

function buildExplorerUrl(hash: string) {
  return `https://xumm.app/explorer/mainnet/${hash}`;
}

export function WalletOnChainScreen() {
  const searchParams = useSearchParams();
  const [walletStatus, setWalletStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance] = useState("$18,420.00");
  const [selectedTargetId, setSelectedTargetId] = useState(defaultTarget.id);
  const [amount, setAmount] = useState("2000");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [isReconcilingPayload, setIsReconcilingPayload] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);

  const selectedTarget = linkTargets.find((target) => target.id === selectedTargetId) ?? defaultTarget;

  useEffect(() => {
    return () => {
      websocketRef.current?.close();
    };
  }, []);

  const fetchPayloadStatus = useEffectEvent(async (payloadId: string) => {
    const response = await fetch(`/api/xaman/payload/${payloadId}`, { cache: "no-store" });
    const body = (await response.json()) as PayloadStatusResponse & { error?: string };

    if (!response.ok) {
      throw new Error(body.error || "Unable to verify Xaman request.");
    }

    return body;
  });

  const finalizeConnectFlow = useEffectEvent(async (payloadId: string) => {
    const payload = await fetchPayloadStatus(payloadId);

    if (!payload.meta.signed || !payload.response.account) {
      setWalletStatus("disconnected");
      setConnectionMessage("Connection was not completed.");
      clearPendingFlowState();
      setActivePayload(null);
      return;
    }

    setWalletAddress(payload.response.account);
    setWalletStatus("connected");
    setConnectionMessage("Money source connected.");
    saveMoneySourceState({
      connected: true,
      sourceLabel: "Stable balance",
      walletAddress: payload.response.account,
      walletAddressShort: shortenWalletAddress(payload.response.account),
    });
    clearPendingFlowState();
    setActivePayload(null);
  });

  const finalizePaymentFlow = useEffectEvent(async (payloadId: string) => {
    const pendingFlow = getPendingFlowState();
    const payload = await fetchPayloadStatus(payloadId);

    if (!payload.meta.signed || !payload.response.txid || !pendingFlow?.amountLabel || !pendingFlow.linkedLabel || !pendingFlow.project || !pendingFlow.contextLabel || !pendingFlow.summary || !pendingFlow.linkedType || !pendingFlow.amountValue) {
      setPaymentMessage("Payment was not completed.");
      clearPendingFlowState();
      setActivePayload(null);
      return;
    }

    const resolvedAt = payload.response.resolved_at ?? new Date().toISOString();
    const account = payload.response.account ?? walletAddress;
    const confirmedResult: PaymentResult = {
      status: "Confirmed",
      amountLabel: pendingFlow.amountLabel,
      linkedLabel: pendingFlow.linkedLabel,
      createdAtIso: resolvedAt,
      walletAddressShort: shortenWalletAddress(account),
      network: "XRPL Mainnet",
      hash: payload.response.txid,
      explorerUrl: buildExplorerUrl(payload.response.txid),
    };

    setResult(confirmedResult);
    setPaymentMessage("Payment confirmed.");
    saveLatestPaymentTransaction({
      txid: payload.response.txid,
      amountLabel: pendingFlow.amountLabel,
      amountValue: pendingFlow.amountValue,
      projectName: pendingFlow.project,
      walletAddress: account,
      network: "XRPL Mainnet",
      createdAtIso: resolvedAt,
    });
    saveProofTransaction({
      id: `wallet-${payloadId}`,
      walletAddress: account,
      walletAddressShort: shortenWalletAddress(account),
      status: "Confirmed",
      amountLabel: pendingFlow.amountLabel,
      amountValue: pendingFlow.amountValue,
      network: "XRPL Mainnet",
      linkedType: pendingFlow.linkedType,
      linkedLabel: pendingFlow.linkedLabel,
      project: pendingFlow.project,
      actionLabel: "recorded",
      contextLabel: pendingFlow.contextLabel,
      summary: pendingFlow.summary,
      hash: payload.response.txid,
      createdAtIso: resolvedAt,
      displayTimestamp: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(resolvedAt)),
    });

    clearPendingFlowState();
    setActivePayload(null);
  });

  useEffect(() => {
    const payloadId = searchParams.get("payload");
    if (!payloadId) {
      return;
    }

    const pendingFlow = getPendingFlowState();
    if (!pendingFlow || pendingFlow.payloadId !== payloadId) {
      return;
    }

    let cancelled = false;

    const reconcile = async () => {
      setIsReconcilingPayload(true);

      try {
        if (pendingFlow.kind === "connect") {
          await finalizeConnectFlow(payloadId);
        } else {
          await finalizePaymentFlow(payloadId);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unable to complete Xaman request.";
          if (pendingFlow.kind === "connect") {
            setWalletStatus("disconnected");
            setConnectionMessage(message);
          } else {
            setPaymentMessage(message);
          }
        }
      } finally {
        if (!cancelled) {
          setIsReconcilingPayload(false);
        }
      }
    };

    void reconcile();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!activePayload) {
      websocketRef.current?.close();
      websocketRef.current = null;
      return;
    }

    const websocket = new WebSocket(activePayload.websocketStatus);
    websocketRef.current = websocket;

    websocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { opened?: boolean; signed?: boolean; dispatched?: boolean; expired?: boolean };

        if (data.opened) {
          if (activePayload.kind === "connect") {
            setConnectionMessage("Approve the connection in Xaman.");
          } else {
            setPaymentMessage("Approve the payment in Xaman.");
          }
        }

        if (data.dispatched) {
          setPaymentMessage("Payment submitted to XRPL Mainnet.");
        }

        if (data.expired) {
          clearPendingFlowState();
          setActivePayload(null);
          if (activePayload.kind === "connect") {
            setWalletStatus("disconnected");
            setConnectionMessage("Connection request expired. Try again.");
          } else {
            setPaymentMessage("Payment request expired. Try again.");
          }
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            clearPendingFlowState();
            setActivePayload(null);
            if (activePayload.kind === "connect") {
              setWalletStatus("disconnected");
              setConnectionMessage("Connection was cancelled.");
            } else {
              setPaymentMessage("Payment was cancelled.");
            }
            return;
          }

          if (activePayload.kind === "connect") {
            await finalizeConnectFlow(activePayload.id);
          } else {
            await finalizePaymentFlow(activePayload.id);
          }
        }
      } catch {
        // Ignore websocket keepalive payloads.
      }
    };

    websocket.onerror = () => {
      if (activePayload.kind === "connect") {
        setConnectionMessage("Waiting for confirmation from Xaman.");
      } else {
        setPaymentMessage("Waiting for confirmation from Xaman.");
      }
    };

    return () => {
      websocket.close();
    };
  }, [activePayload]);

  const handleConnectWallet = async () => {
    setConnectionMessage(null);
    setWalletStatus("connecting");

    try {
      const response = await fetch("/api/xaman/connect", {
        method: "POST",
      });
      const body = (await response.json()) as {
        error?: string;
        id: string;
        url: string;
        qrPng: string;
        websocketStatus: string;
      };

      if (!response.ok) {
        throw new Error(body.error || "Unable to create Xaman connection.");
      }

      setPendingFlowState({
        kind: "connect",
        payloadId: body.id,
      });

      setActivePayload({
        kind: "connect",
        id: body.id,
        url: body.url,
        qrPng: body.qrPng,
        websocketStatus: body.websocketStatus,
      });
      setConnectionMessage("Open Xaman and approve the connection.");
    } catch (error) {
      setWalletStatus("disconnected");
      setConnectionMessage(error instanceof Error ? error.message : "Unable to connect your money source.");
    }
  };

  const handleManageConnection = () => {
    void handleConnectWallet();
  };

  const handleRecordTransaction = async () => {
    if (walletStatus !== "connected") {
      return;
    }

    const numericAmount = Number(amount.replace(/[^0-9.]/g, "")) || 2000;
    const amountLabel = `£${numericAmount.toLocaleString("en-GB")}`;
    const createdAtIso = new Date().toISOString();

    setResult({
      status: "Pending",
      amountLabel,
      linkedLabel: selectedTarget.label,
      createdAtIso,
      walletAddressShort: shortenWalletAddress(walletAddress),
      network: "XRPL Mainnet",
    });
    setPaymentMessage(null);
    setIsCreatingPayment(true);

    try {
      const response = await fetch("/api/xaman/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          walletAddress,
          linkedLabel: selectedTarget.label,
          project: selectedTarget.project,
        }),
      });
      const body = (await response.json()) as {
        error?: string;
        id: string;
        url: string;
        qrPng: string;
        websocketStatus: string;
      };

      if (!response.ok) {
        throw new Error(body.error || "Unable to create Xaman payment.");
      }

      setPendingFlowState({
        kind: "payment",
        payloadId: body.id,
        amountLabel,
        amountValue: numericAmount,
        linkedType: selectedTarget.type,
        linkedLabel: selectedTarget.label,
        project: selectedTarget.project,
        contextLabel: selectedTarget.context,
        summary: selectedTarget.summary,
      });

      setActivePayload({
        kind: "payment",
        id: body.id,
        url: body.url,
        qrPng: body.qrPng,
        websocketStatus: body.websocketStatus,
      });
      setPaymentMessage("Open Xaman to approve the payment.");
    } catch (error) {
      setPaymentMessage(error instanceof Error ? error.message : "Unable to create payment request.");
      setResult(null);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCopyReference = async () => {
    if (!result?.hash) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formatTransactionHash(result.hash));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const renderPayloadAction = (kind: "connect" | "payment") => {
    if (!activePayload || activePayload.kind !== kind) {
      return null;
    }

    return (
      <div className="mt-5 rounded-[22px] border border-[rgba(18,20,23,0.08)] bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#667085]">
          {kind === "connect" ? "Finish setup" : "Approve payment"}
        </p>
        <p className="mt-2 text-[14px] leading-[1.7] text-[#475467]">
          Scan the QR code with Xaman or open the signing request directly.
        </p>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <Image
            src={activePayload.qrPng}
            alt="Xaman QR code"
            width={144}
            height={144}
            unoptimized
            className="h-36 w-36 rounded-[16px] border border-[rgba(18,20,23,0.08)] bg-white p-2"
          />
          <div className="space-y-3">
            <Link
              href={activePayload.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(34,211,238,0.12))] px-4 text-[13px] font-semibold text-[#121417] shadow-[0_12px_24px_rgba(99,102,241,0.08)] transition hover:-translate-y-0.5"
            >
              Open Xaman
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
            </Link>
            <p className="text-[12px] leading-[1.6] text-[#667085]">
              {kind === "connect"
                ? "After approval, your account will be available as the active money source."
                : "After approval, the payment will settle on XRPL Mainnet and appear in verified history."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="-mx-4 -mt-2 min-h-[calc(100vh-7.5rem)] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_24%),linear-gradient(165deg,#EEF4F8_0%,#F6F2EC_42%,#F1EEE6_100%)] px-4 pb-28 pt-6 text-[#121417] md:-mx-6 md:rounded-[34px] md:px-6 md:pb-12 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-[620px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">Money</p>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#121417] md:text-[42px]">Money</h1>
          <p className="mt-4 text-[15px] leading-[1.72] text-[#5F6C7B]">
            Connect your account and make payments with verified records.
          </p>
        </div>

        <section className="mt-6 rounded-[32px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,#121A2B_0%,#1B2842_56%,#17314B_100%)] p-6 text-white shadow-[0_28px_56px_rgba(15,23,42,0.18),0_0_28px_rgba(34,211,238,0.08)] md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#95B6DA]">Available funds</p>
              <p className="mt-3 text-[42px] font-semibold tracking-[-0.07em] text-white md:text-[52px]">{balance}</p>
              <p className="mt-2 text-[14px] text-[#BDD0EA]">Ready to use from your active money source.</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/8 text-[#DCEEFF] shadow-[0_0_18px_rgba(103,232,249,0.14)]">
              <Wallet className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6">
          <div className="space-y-5">
            <section className="rounded-[30px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))] p-6 shadow-[0_28px_60px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.76)] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Connect account</p>
                  <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#121417]">Your active money source</h2>
                  <p className="mt-2 max-w-[440px] text-[14px] leading-[1.7] text-[#667085]">
                    Connect the source you want to use for payments and fund movements.
                  </p>
                </div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-[rgba(99,102,241,0.14)] bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(34,211,238,0.08))] text-[#4F46E5] shadow-[0_14px_30px_rgba(99,102,241,0.08)]">
                  <Landmark className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {walletStatus === "disconnected" ? (
                  <>
                    <p className="text-[15px] font-semibold text-[#121417]">No money source connected</p>
                    <p className="mt-2 text-[14px] leading-[1.7] text-[#475467]">
                      Start with your stable balance to make payments and keep records in sync.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleConnectWallet()}
                      className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] border border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.12))] px-5 text-[14px] font-semibold text-[#121417] shadow-[0_14px_30px_rgba(99,102,241,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(99,102,241,0.12)]"
                    >
                      Connect your money
                    </button>
                  </>
                ) : walletStatus === "connecting" ? (
                  <>
                    <p className="text-[15px] font-semibold text-[#121417]">Connecting...</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(18,20,23,0.08)] bg-white px-3 py-2 text-[13px] font-medium text-[#475467]">
                      <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={1.9} />
                      Waiting for approval in Xaman
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[22px] border border-[rgba(18,20,23,0.08)] bg-white/70 p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#667085]">Account</p>
                        <p className="mt-3 text-[18px] font-semibold tracking-[-0.03em] text-[#121417]">{shortenWalletAddress(walletAddress)}</p>
                      </div>
                      <div className="rounded-[22px] border border-emerald-300/26 bg-[linear-gradient(180deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04))] p-4 shadow-[0_0_24px_rgba(16,185,129,0.08)]">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#4B8F74]">Status</p>
                        <div className="mt-3 inline-flex items-center gap-2 text-[16px] font-semibold text-[#115E46]">
                          <CheckCircle2 className="h-[16px] w-[16px]" strokeWidth={1.9} />
                          Connected
                        </div>
                      </div>
                      <div className="rounded-[22px] border border-[rgba(18,20,23,0.08)] bg-white/70 p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#667085]">Source</p>
                        <p className="mt-3 text-[18px] font-semibold tracking-[-0.03em] text-[#121417]">Stable balance</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleManageConnection}
                      className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] border border-[rgba(18,20,23,0.08)] bg-white px-5 text-[14px] font-semibold text-[#121417] transition hover:bg-[#F3F4F6]"
                    >
                      Manage connection
                    </button>
                  </>
                )}

                {connectionMessage ? <p className="mt-4 text-[13px] leading-[1.6] text-[#5F6C7B]">{connectionMessage}</p> : null}
                {renderPayloadAction("connect")}
              </div>
            </section>

            <section className="rounded-[30px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.9))] p-6 shadow-[0_28px_60px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Payment sources</p>
                  <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#121417]">Choose where money moves from</h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-[22px] border border-emerald-300/22 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))] px-4 py-4 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-emerald-300/20 bg-white/80 text-[#115E46]">
                      <Wallet className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#121417]">Stable balance</p>
                      <p className="mt-1 text-[13px] text-[#667085]">Available now for payments and fund moves</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-300/22 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#115E46]">Active</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-[rgba(18,20,23,0.08)] bg-white text-[#667085]">
                      <Building2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#121417]">Bank</p>
                      <p className="mt-1 text-[13px] text-[#667085]">Business bank connections will land next</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[rgba(18,20,23,0.08)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">Coming soon</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] border border-[rgba(18,20,23,0.08)] bg-white text-[#667085]">
                      <Smartphone className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#121417]">Mobile money</p>
                      <p className="mt-1 text-[13px] text-[#667085]">Regional payout rails are coming soon</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[rgba(18,20,23,0.08)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">Coming soon</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[30px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.9))] p-6 shadow-[0_28px_60px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] md:p-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Make payment</p>
              <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#121417]">Move funds with a record attached</h2>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#667085]">
                Approve the payment in Xaman and Zila will add the verified record to your operational history.
              </p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#667085]">Assign this payment to</span>
                  <select
                    value={selectedTargetId}
                    onChange={(event) => setSelectedTargetId(event.target.value)}
                    className="mt-2 h-13 w-full rounded-[18px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] px-4 text-[15px] font-medium text-[#121417] outline-none transition focus:border-[#A5B4FC]"
                  >
                    {linkTargets.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#667085]">Amount</span>
                  <div className="mt-2 flex h-13 items-center rounded-[18px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] px-4">
                    <span className="text-[15px] font-semibold text-[#121417]">XRP</span>
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      className="ml-3 w-full bg-transparent text-[15px] font-medium text-[#121417] outline-none"
                      aria-label="Transaction amount"
                    />
                  </div>
                  <p className="mt-2 text-[12px] text-[#667085]">MAINNET payments are signed in XRP and submitted to XRPL in drops.</p>
                </label>
              </div>

              <div className="mt-6 rounded-[22px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] p-4">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[rgba(18,20,23,0.08)] bg-white text-[#475467]">
                    <MoveRight className="h-[16px] w-[16px]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#121417]">{selectedTarget.label}</p>
                    <p className="mt-1 text-[13px] leading-[1.65] text-[#667085]">{selectedTarget.summary}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleRecordTransaction()}
                disabled={walletStatus !== "connected" || isCreatingPayment}
                className={`mt-6 inline-flex h-13 w-full items-center justify-center rounded-[18px] px-5 text-[14px] font-semibold transition ${
                  walletStatus !== "connected" || isCreatingPayment
                    ? "cursor-not-allowed border border-[rgba(18,20,23,0.08)] bg-[#ECE9E2] text-[#98A2B3]"
                    : "border border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.12))] text-[#121417] shadow-[0_14px_30px_rgba(99,102,241,0.08)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(99,102,241,0.12)]"
                }`}
              >
                {isCreatingPayment ? "Preparing Xaman..." : "Make payment"}
              </button>

              {paymentMessage ? <p className="mt-4 text-[13px] leading-[1.6] text-[#5F6C7B]">{paymentMessage}</p> : null}
              {renderPayloadAction("payment")}
            </section>

            <section className="rounded-[30px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.9))] p-6 shadow-[0_28px_60px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.8)] md:p-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Recent activity</p>
              <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#121417]">Latest money movement</h2>

              {result ? (
                <div
                  className={`mt-6 rounded-[28px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${
                    result.status === "Confirmed"
                      ? "border-emerald-300/26 bg-[linear-gradient(180deg,rgba(12,41,37,0.96),rgba(10,26,29,0.92))] text-white shadow-[0_24px_48px_rgba(5,10,24,0.22),0_0_32px_rgba(16,185,129,0.12)]"
                      : "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(15,30,52,0.96),rgba(13,24,42,0.92))] text-white shadow-[0_24px_48px_rgba(5,10,24,0.22),0_0_24px_rgba(34,211,238,0.1)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A9C0DE]">Payment detail</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-[12px] font-semibold text-white">
                        <ShieldCheck className="h-[13px] w-[13px]" strokeWidth={1.8} />
                        {result.status === "Confirmed" ? "Verified" : result.status}
                      </div>
                    </div>
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-[16px] border ${
                        result.status === "Confirmed"
                          ? "border-emerald-300/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.22),rgba(16,185,129,0.08))] shadow-[0_0_24px_rgba(16,185,129,0.2)]"
                          : "border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(59,130,246,0.08))] shadow-[0_0_22px_rgba(34,211,238,0.16)]"
                      }`}
                    >
                      {result.status === "Confirmed" ? (
                        <CheckCircle2 className="h-[18px] w-[18px] text-[#DFFBF0]" strokeWidth={1.9} />
                      ) : (
                        <LoaderCircle className="h-[18px] w-[18px] animate-spin text-[#DFFAFF]" strokeWidth={1.8} />
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-[34px] font-semibold tracking-[-0.06em] text-white">{`${result.amountLabel} recorded`}</p>
                  <p className="mt-1 text-[14px] text-[#D2DCEF]">{result.linkedLabel}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/14 bg-[#173D6D]/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#9FB3D9]">Timestamp</p>
                      <p className="mt-2 text-[14px] font-medium text-white">{formatDisplayDate(new Date(result.createdAtIso))}</p>
                    </div>
                    <div className="rounded-[18px] border border-white/14 bg-[#173D6D]/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#9FB3D9]">Reference ID</p>
                      <p className="mt-2 text-[14px] font-medium text-white">{result.hash ? formatTransactionHash(result.hash) : "Waiting for confirmation"}</p>
                    </div>
                  </div>

                  <details className="mt-5 rounded-[18px] border border-white/14 bg-[#173D6D]/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <summary className="cursor-pointer text-[13px] font-semibold text-white">Transaction detail</summary>
                    <div className="mt-3 grid gap-3 text-[13px] text-[#D2DCEF]">
                      <p>Network: {result.network}</p>
                      <p>Account: {result.walletAddressShort}</p>
                      <p>XRPL transaction hash: {result.hash ? formatTransactionHash(result.hash) : "Pending confirmation"}</p>
                    </div>
                  </details>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleCopyReference}
                      disabled={!result.hash}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/7 px-4 text-[13px] font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Copy className="h-[13px] w-[13px]" strokeWidth={1.9} />
                      {copied ? "Copied" : "Copy reference"}
                    </button>
                    {result.explorerUrl ? (
                      <Link
                        href={result.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-emerald-300/18 bg-emerald-300/10 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-300/14"
                      >
                        View on explorer
                        <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
                      </Link>
                    ) : null}
                    <Link
                      href="/proof"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-emerald-300/18 bg-emerald-300/10 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-300/14"
                    >
                      View in Proof
                      <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] p-5">
                  <p className="text-[15px] font-semibold text-[#121417]">No recent payments yet</p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#667085]">
                    Once you make a payment here, the latest record will appear in this activity view and sync into verified history.
                  </p>
                </div>
              )}

              {isReconcilingPayload ? (
                <div className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-[#667085]">
                  <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={1.8} />
                  Finalizing Xaman request...
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletOnChainScreen;
