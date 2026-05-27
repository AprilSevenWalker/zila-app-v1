"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Copy, LoaderCircle, MoveRight, ShieldCheck, Wallet } from "lucide-react";

import { getMoneySourceState, saveMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";
import { clearPaymentDraft, getPaymentDraft, subscribeToPaymentDraft } from "@/lib/paymentDraftStore";
import { saveLatestPaymentTransaction, savePaymentMovement } from "@/lib/paymentTransactionStore";
import { formatTransactionHash, saveProofTransaction, shortenWalletAddress } from "@/lib/proofTransactionStore";
import { recordPaymentReserveRecalculation } from "@/lib/protectedMoneyStore";

type PaymentStatus = "idle" | "connecting" | "preparing" | "awaiting-signature" | "submitted" | "confirmed";

interface XamanPayloadRequest {
  id: string;
  url: string;
  qrPng: string;
  websocketStatus: string;
  kind: "connect" | "payment";
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

interface PendingPaymentState {
  payloadId: string;
  amountLabel: string;
  amountValue: number;
  projectName: string;
  walletAddress: string;
}

const pendingPaymentStorageKey = "zila-payment-xaman-pending";

function getPendingPaymentState(): PendingPaymentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(pendingPaymentStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingPaymentState;
  } catch {
    return null;
  }
}

function setPendingPaymentState(state: PendingPaymentState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(pendingPaymentStorageKey, JSON.stringify(state));
}

function clearPendingPaymentState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(pendingPaymentStorageKey);
}

function buildExplorerUrl(hash: string) {
  return `https://xumm.app/explorer/mainnet/${hash}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MakePaymentScreen() {
  const searchParams = useSearchParams();
  const websocketRef = useRef<WebSocket | null>(null);
  const [moneySource, setMoneySource] = useState(getMoneySourceState);
  const [paymentDraft, setPaymentDraft] = useState(getPaymentDraft);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [referenceId, setReferenceId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState("");
  const [currencyMode, setCurrencyMode] = useState<"XRP" | "TOKEN">("XRP");
  const [tokenCurrency, setTokenCurrency] = useState("RLUSD");
  const [tokenIssuer, setTokenIssuer] = useState("");

  useEffect(() => {
    const update = () => {
      setMoneySource(getMoneySourceState());
    };

    update();
    return subscribeToMoneySource(update);
  }, []);

  useEffect(() => {
    const update = () => {
      setPaymentDraft(getPaymentDraft());
    };

    update();
    return subscribeToPaymentDraft(update);
  }, []);

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
      setPaymentStatus("idle");
      setConnectionMessage("Connection was not completed.");
      setActivePayload(null);
      return;
    }

    const nextMoneySource = {
      connected: true,
      sourceLabel: "Xaman wallet",
      walletAddress: payload.response.account,
      walletAddressShort: shortenWalletAddress(payload.response.account),
    };

    saveMoneySourceState(nextMoneySource);
    setMoneySource(nextMoneySource);
    setPaymentStatus("idle");
    setConnectionMessage("Xaman wallet connected. You can now send the payment for signing.");
    setActivePayload(null);
  });

  const finalizePaymentFlow = useEffectEvent(async (payloadId: string) => {
    const pendingPayment = getPendingPaymentState();
    const payload = await fetchPayloadStatus(payloadId);

    if (!payload.meta.signed || !payload.response.txid || !pendingPayment) {
      setPaymentStatus("idle");
      setPaymentMessage("Payment was not completed.");
      clearPendingPaymentState();
      setActivePayload(null);
      return;
    }

    const resolvedAt = payload.response.resolved_at ?? new Date().toISOString();
    const account = payload.response.account || pendingPayment.walletAddress;

    setReferenceId(payload.response.txid);
    setCreatedAt(resolvedAt);
    setExplorerUrl(buildExplorerUrl(payload.response.txid));
    setPaymentStatus("confirmed");
    setPaymentMessage("Payment confirmed on XRPL Mainnet.");

    savePaymentMovement({
      id: `payment-movement-${payload.response.txid}`,
      type: "outgoing",
      title: "Supplier payout completed",
      amountLabel: pendingPayment.amountLabel,
      amountValue: pendingPayment.amountValue,
      status: "Verified",
      project: pendingPayment.projectName,
      sourceLabel: "Xaman wallet",
      recipientName: "Supplier",
      reason: "Supplier payout",
      txHash: payload.response.txid,
      explorerUrl: buildExplorerUrl(payload.response.txid),
      createdAtIso: resolvedAt,
    });
    recordPaymentReserveRecalculation({
      amount: pendingPayment.amountValue,
      amountLabel: pendingPayment.amountLabel,
      projectName: pendingPayment.projectName,
      recipientName: "Supplier",
      txHash: payload.response.txid,
    });
    saveLatestPaymentTransaction({
      txid: payload.response.txid,
      amountLabel: pendingPayment.amountLabel,
      amountValue: pendingPayment.amountValue,
      projectName: pendingPayment.projectName,
      recipientName: "Supplier",
      sourceLabel: "Xaman wallet",
      paymentReason: "Supplier payout",
      movementType: "outgoing",
      verificationState: "Verified",
      transferStatus: "Completed",
      obligationStatus: "Settled",
      walletAddress: account,
      network: "XRPL Mainnet",
      createdAtIso: resolvedAt,
    });

    saveProofTransaction({
      id: `payment-${payloadId}`,
      walletAddress: account,
      walletAddressShort: shortenWalletAddress(account),
      status: "Confirmed",
      amountLabel: pendingPayment.amountLabel,
      amountValue: pendingPayment.amountValue,
      network: "XRPL Mainnet",
      linkedType: "project",
      linkedLabel: pendingPayment.projectName,
      project: pendingPayment.projectName,
      actionLabel: "recorded",
      contextLabel: `Payment recorded for ${pendingPayment.projectName}`,
      summary: `${pendingPayment.amountLabel} was signed in Xaman and confirmed on XRPL Mainnet for ${pendingPayment.projectName}.`,
      hash: payload.response.txid,
      createdAtIso: resolvedAt,
      displayTimestamp: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(resolvedAt)),
    });

    clearPaymentDraft();
    clearPendingPaymentState();
    setActivePayload(null);
  });

  useEffect(() => {
    const payloadId = searchParams.get("payload");
    if (!payloadId) {
      return;
    }

    const activePendingPayment = getPendingPaymentState();

    if (activePendingPayment?.payloadId === payloadId) {
      setPaymentStatus("submitted");
      void finalizePaymentFlow(payloadId);
      return;
    }

    void finalizeConnectFlow(payloadId);
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
        const data = JSON.parse(String(event.data)) as {
          opened?: boolean;
          signed?: boolean;
          dispatched?: boolean;
          expired?: boolean;
        };

        if (data.opened) {
          if (activePayload.kind === "connect") {
            setConnectionMessage("Approve the connection in Xaman.");
          } else {
            setPaymentMessage("Approve the XRPL payment in Xaman.");
          }
        }

        if (data.dispatched) {
          setPaymentStatus("submitted");
          setPaymentMessage("Payment submitted to XRPL Mainnet. Waiting for confirmation.");
        }

        if (data.expired) {
          clearPendingPaymentState();
          setPaymentStatus("idle");
          setActivePayload(null);
          if (activePayload.kind === "connect") {
            setConnectionMessage("Connection request expired. Try again.");
          } else {
            setPaymentMessage("Payment request expired. Try again.");
          }
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            clearPendingPaymentState();
            setPaymentStatus("idle");
            setActivePayload(null);
            if (activePayload.kind === "connect") {
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
        // Xaman websocket sends keepalive frames that are safe to ignore.
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

  const successSummary = useMemo(() => {
    if (!referenceId || !createdAt) {
      return null;
    }

    return {
      amountLabel: paymentDraft.amountLabel,
      projectName: paymentDraft.projectName,
      timestamp: formatDisplayDate(new Date(createdAt)),
      reference: formatTransactionHash(referenceId),
      explorerUrl,
    };
  }, [createdAt, explorerUrl, paymentDraft.amountLabel, paymentDraft.projectName, referenceId]);
  const canSendPayment =
    paymentStatus === "idle" &&
    (currencyMode === "XRP" || (tokenCurrency.trim().length > 0 && tokenIssuer.trim().length > 0));

  const handleConnectWallet = async () => {
    if (paymentStatus === "connecting") {
      return;
    }

    setConnectionMessage(null);
    setPaymentStatus("connecting");

    try {
      const response = await fetch("/api/xaman/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnPath: "/payments/send",
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
        throw new Error(body.error || "Unable to create Xaman connection.");
      }

      setActivePayload({
        kind: "connect",
        id: body.id,
        url: body.url,
        qrPng: body.qrPng,
        websocketStatus: body.websocketStatus,
      });
      setConnectionMessage("Open Xaman and approve the wallet connection.");
    } catch (error) {
      setPaymentStatus("idle");
      setConnectionMessage(error instanceof Error ? error.message : "Unable to connect Xaman wallet.");
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentStatus !== "idle") {
      return;
    }

    if (!canSendPayment) {
      setPaymentMessage("Token payments need a token code and issuer address.");
      return;
    }

    if (!moneySource.connected || !moneySource.walletAddress) {
      await handleConnectWallet();
      return;
    }

    setPaymentStatus("preparing");
    setPaymentMessage("Preparing XRPL Mainnet payment for Xaman.");

    try {
      const currency = currencyMode === "XRP" ? "XRP" : tokenCurrency.trim().toUpperCase();

      const response = await fetch("/api/xaman/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(paymentDraft.amountValue),
          walletAddress: moneySource.walletAddress,
          linkedLabel: paymentDraft.projectName,
          project: paymentDraft.projectName,
          currency,
          issuer: currencyMode === "TOKEN" ? tokenIssuer.trim() : undefined,
          returnPath: "/payments/send",
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

      setPendingPaymentState({
        payloadId: body.id,
        amountLabel: paymentDraft.amountLabel,
        amountValue: paymentDraft.amountValue,
        projectName: paymentDraft.projectName,
        walletAddress: moneySource.walletAddress,
      });

      setActivePayload({
        kind: "payment",
        id: body.id,
        url: body.url,
        qrPng: body.qrPng,
        websocketStatus: body.websocketStatus,
      });
      setPaymentStatus("awaiting-signature");
      setPaymentMessage("Open Xaman to review and sign the XRPL payment.");
    } catch (error) {
      setPaymentStatus("idle");
      setPaymentMessage(error instanceof Error ? error.message : "Unable to create Xaman payment request.");
    }
  };

  const handleCopyReference = async () => {
    if (!referenceId) {
      return;
    }

    await navigator.clipboard.writeText(formatTransactionHash(referenceId));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const renderPayloadAction = (kind: "connect" | "payment") => {
    if (!activePayload || activePayload.kind !== kind) {
      return null;
    }

    return (
      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B9F6FF]">
          {kind === "connect" ? "Connect Xaman wallet" : "Sign in Xaman"}
        </p>
        <p className="mt-2 text-[14px] leading-[1.7] text-[#D5E4F3]">
          Scan the QR code with Xaman or open the request directly.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Image
            src={activePayload.qrPng}
            alt="Xaman QR code"
            width={144}
            height={144}
            unoptimized
            className="h-36 w-36 rounded-[16px] border border-white/12 bg-white p-2"
          />
          <div className="space-y-3">
            <Link
              href={activePayload.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-4 text-[13px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB]"
            >
              Open Xaman
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
            </Link>
            <p className="max-w-[260px] text-[12px] leading-[1.6] text-[#C9D5EA]">
              {kind === "connect"
                ? "After approval, this wallet becomes your active payment source."
                : "After signing, Zila waits for the XRPL txid and adds it to verified history."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(160deg,#0D142B_0%,#171E46_42%,#1F2559_72%,#15374F_100%)] px-6 pb-28 pt-8 text-white">
      <div className="absolute inset-x-0 top-14 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.18),transparent_22%),linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
      <div className="relative flex flex-1 flex-col">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#B7C2E0]">Confirm payment</p>
        <h1 className="mt-4 max-w-[480px] text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
          Confirm payment
        </h1>
        <p className="mt-5 max-w-[360px] text-[16px] leading-[1.68] text-[#D4DCEF]/84">
          You are about to send {paymentDraft.amountLabel} to a supplier. This action will update your project and financial position.
        </p>

        {successSummary ? (
          <section className="mt-8 rounded-[30px] border border-emerald-300/24 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(15,72,64,0.34))] p-6 shadow-[0_22px_48px_rgba(13,35,68,0.28),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFF7DA]">Payment confirmed</p>
                <p className="mt-3 text-[28px] font-semibold tracking-[-0.05em] text-white">
                  Payment confirmed
                </p>
                <p className="mt-2 text-[15px] leading-[1.7] text-[#D7F7E6]">
                  This payment has been verified on XRPL.
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/12 bg-white/10 text-[#E9FFF4]">
                <CheckCircle2 className="h-[20px] w-[20px]" strokeWidth={1.9} />
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-white/16 bg-[#0F3D42]/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C7F2DD]">Status</p>
                <p className="mt-2 text-[18px] font-semibold text-white">Verified</p>
                <p className="mt-1 text-[13px] text-[#C8ECDD]">{successSummary.timestamp}</p>
              </div>
              <div className="rounded-[20px] border border-white/16 bg-[#0F3D42]/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C7F2DD]">Reference ID</p>
                <p className="mt-2 text-[18px] font-semibold text-white">{successSummary.reference}</p>
                <p className="mt-1 text-[13px] text-[#C8ECDD]">Stored with the payment record</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-4 text-[13px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.08]"
              >
                <Copy className="h-[13px] w-[13px]" strokeWidth={1.9} />
                {copied ? "Copied" : "Copy reference"}
              </button>
              {successSummary.explorerUrl ? (
                <Link
                  href={successSummary.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-4 text-[13px] font-semibold text-[#EAF2FF] transition hover:bg-emerald-300/14"
                >
                  View on explorer
                  <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
                </Link>
              ) : null}
              <Link
                href="/proof"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-4 text-[13px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB]"
              >
                View history
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={1.9} />
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_360px]">
            <div className="rounded-[28px] border border-white/18 bg-[linear-gradient(180deg,rgba(16,42,79,0.92),rgba(9,25,50,0.94))] p-6 shadow-[0_22px_48px_rgba(13,35,68,0.30),inset_0_1px_0_rgba(255,255,255,0.10)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Confirm payment</p>
              <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.05em] text-white">Confirm payment</h2>
              <p className="mt-3 max-w-[420px] text-[16px] leading-[1.7] text-[#D7E3F8]">
                You are about to send {paymentDraft.amountLabel} to a supplier.
              </p>
              <p className="mt-2 max-w-[420px] text-[15px] leading-[1.7] text-[#C9D5EA]">
                This action will update your project and financial position.
              </p>
              <div className="mt-5 rounded-[20px] border border-amber-200/18 bg-[linear-gradient(180deg,rgba(245,158,11,0.13),rgba(15,23,42,0.34))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFE4A3]">
                  Decision context
                </p>
                <div className="mt-3 rounded-[16px] border border-white/14 bg-[#173D6D]/58 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#B8C1DE]">
                    You&apos;re acting on
                  </p>
                  <p className="mt-1.5 text-[16px] font-semibold text-white">
                    Pay supplier for Project Horizon
                  </p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[16px] border border-rose-200/14 bg-rose-300/[0.07] px-3.5 py-3">
                    <p className="text-[12px] font-semibold text-[#FFC8C8]">Impact reminder</p>
                    <p className="mt-2 text-[14px] leading-[1.55] text-[#F6D7D7]">
                      This will reduce your coverage to 9 days
                      <br />
                      Your safety net will be at risk
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-cyan-200/16 bg-cyan-300/[0.07] px-3.5 py-3">
                    <p className="text-[12px] font-semibold text-[#C7F7FF]">Recommended move</p>
                    <p className="mt-2 text-[14px] leading-[1.55] text-[#DDFBFF]">
                      Pay 60% now to stay within your safe range
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C1DE]">From</p>
                  <p className="mt-2 text-[20px] font-semibold text-white">
                    {moneySource.sourceLabel || "Stable balance"}
                  </p>
                  <p className="mt-1 text-[13px] text-[#C9D5EA]">
                    {moneySource.walletAddressShort ? `Account ${moneySource.walletAddressShort}` : "Connected source"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C1DE]">Project</p>
                    <span className="rounded-full border border-white/14 bg-[#102A4F]/68 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D7E3F8]">
                      Locked
                    </span>
                  </div>
                  <p className="mt-2 text-[20px] font-semibold text-white">{paymentDraft.projectName}</p>
                  <p className="mt-1 text-[13px] text-[#C9D5EA]">Based on your last decision</p>
                </div>
                <div className="rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C1DE]">Type</p>
                  <p className="mt-2 text-[20px] font-semibold text-white">{paymentDraft.paymentType}</p>
                  <p className="mt-1 text-[13px] text-[#C9D5EA]">Supplier payment for Project Horizon</p>
                </div>
                <div className="rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C1DE]">Amount</p>
                  <p className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-white">
                    {paymentDraft.amountLabel}
                  </p>
                  <p className="mt-1 text-[13px] text-[#C9D5EA]">
                    Currency: {currencyMode === "XRP" ? "XRP" : tokenCurrency.trim().toUpperCase() || "Token"} on XRPL Mainnet
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B8C1DE]">Currency</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["XRP", "TOKEN"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCurrencyMode(mode)}
                        className={`h-10 rounded-[14px] border text-[13px] font-semibold transition ${
                          currencyMode === mode
                            ? "border-cyan-300/28 bg-cyan-300/14 text-[#E8FBFF]"
                            : "border-white/14 bg-[#102A4F]/68 text-[#D7E3F8]"
                        }`}
                      >
                        {mode === "XRP" ? "XRP" : "Token"}
                      </button>
                    ))}
                  </div>
                  {currencyMode === "TOKEN" ? (
                    <div className="mt-3 grid gap-3">
                      <input
                        value={tokenCurrency}
                        onChange={(event) => setTokenCurrency(event.target.value)}
                        placeholder="Token code"
                        className="h-11 rounded-[14px] border border-white/10 bg-white/[0.06] px-3 text-[13px] font-medium text-white outline-none placeholder:text-[#92A0B8]"
                      />
                      <input
                        value={tokenIssuer}
                        onChange={(event) => setTokenIssuer(event.target.value)}
                        placeholder="Issuer address"
                        className="h-11 rounded-[14px] border border-white/10 bg-white/[0.06] px-3 text-[13px] font-medium text-white outline-none placeholder:text-[#92A0B8]"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(15,23,42,0.26))] p-6 shadow-[0_20px_48px_rgba(5,10,24,0.24),0_0_26px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B9F6FF]">What happens next</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3 rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 text-[#EAF4FF]">
                    <Wallet className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Xaman signing request</p>
                    <p className="mt-1 text-[13px] leading-[1.65] text-[#D5E4F3]">
                      Zila prepares an XRPL Payment transaction with destination address, XRP amount, and project context.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[20px] border border-white/16 bg-[#173D6D]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 text-[#EAF4FF]">
                    <ShieldCheck className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Verified history updates</p>
                    <p className="mt-1 text-[13px] leading-[1.65] text-[#D5E4F3]">
                      The XRPL reference is added to Proof of Operations with the project link attached.
                    </p>
                  </div>
                </div>
              </div>
              {paymentMessage ? <p className="mt-5 text-[13px] leading-[1.6] text-[#C9D5EA]">{paymentMessage}</p> : null}
              {renderPayloadAction("payment")}
            </div>
          </section>
        )}

        <div className="mt-auto flex gap-3 pt-10">
          <Link
            href="/payments"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 text-[13px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.08]"
          >
            {successSummary ? "Back to payments" : "Cancel"}
          </Link>

          {moneySource.connected && !successSummary ? (
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={!canSendPayment}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-5 text-[13px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB] disabled:cursor-wait"
            >
              {paymentStatus === "preparing" ? (
                <>
                  <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
                  Preparing Xaman request
                </>
              ) : paymentStatus === "awaiting-signature" ? (
                <>
                  <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
                  Waiting for signature
                </>
              ) : paymentStatus === "submitted" ? (
                <>
                  <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
                  Waiting for confirmation
                </>
              ) : (
                <>
                  Confirm and send
                  <MoveRight className="h-[14px] w-[14px]" strokeWidth={2} />
                </>
              )}
            </button>
          ) : null}
        </div>

        {!moneySource.connected && !successSummary ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#070D1D]/72 px-4 backdrop-blur-sm">
            <section className="w-full max-w-[420px] rounded-[26px] border border-white/14 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-5 text-white shadow-[0_28px_68px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Wallet required</p>
              <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white">
                Connect your wallet to complete this payment
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#C9D5EA]">
                Stay here to connect Xaman, then confirm and send this payment.
              </p>
              <button
                type="button"
                onClick={() => void handleConnectWallet()}
                disabled={paymentStatus === "connecting"}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-5 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB] disabled:cursor-wait"
              >
                {paymentStatus === "connecting" ? (
                  <>
                    <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
                    Connecting Xaman
                  </>
                ) : (
                  "Connect Xaman"
                )}
              </button>
              {connectionMessage ? <p className="mt-4 text-[13px] leading-[1.6] text-[#C9D5EA]">{connectionMessage}</p> : null}
              {renderPayloadAction("connect")}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MakePaymentScreen;
