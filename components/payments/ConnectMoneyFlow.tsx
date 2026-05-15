"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CheckCircle2, Landmark, LoaderCircle, WalletCards } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { AppShell } from "@/components/ui/AppShell";
import { connectOperatingBalance } from "@/lib/moneyMovementStore";
import { getMoneySourceState, saveMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";
import { shortenWalletAddress } from "@/lib/proofTransactionStore";

type ConnectState = "empty" | "connecting" | "connected";

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
  };
  error?: string;
}

export function ConnectMoneyFlow() {
  const searchParams = useSearchParams();
  const [connectState, setConnectState] = useState<ConnectState>(() => (getMoneySourceState().connected ? "connected" : "empty"));
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setConnectState(getMoneySourceState().connected ? "connected" : "empty");
    };

    update();
    return subscribeToMoneySource(update);
  }, []);

  const finalizeConnection = async (payloadId: string) => {
    const response = await fetch(`/api/xaman/payload/${payloadId}`, { cache: "no-store" });
    const body = (await response.json()) as PayloadStatusResponse;

    if (!response.ok) {
      throw new Error(body.error || "Unable to verify connection.");
    }

    if (!body.meta.signed || !body.response.account) {
      setConnectionMessage("Connection was not completed.");
      setConnectState("empty");
      setActivePayload(null);
      return;
    }

    saveMoneySourceState({
      connected: true,
      sourceLabel: "Operating balance",
      walletAddress: body.response.account,
      walletAddressShort: shortenWalletAddress(body.response.account),
    });
    connectOperatingBalance();
    setConnectionMessage("Money connected. You can now receive, protect, and move funds inside Zila.");
    setConnectState("connected");
    setActivePayload(null);
  };

  useEffect(() => {
    const payloadId = searchParams.get("payload");

    if (!payloadId) {
      return;
    }

    setConnectState("connecting");
    void finalizeConnection(payloadId).catch((error) => {
      setConnectionMessage(error instanceof Error ? error.message : "Unable to complete connection.");
      setConnectState("empty");
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
          setConnectionMessage("Review the connection in Xaman.");
        }

        if (data.expired) {
          setConnectionMessage("Connection request expired. Try again.");
          setConnectState("empty");
          setActivePayload(null);
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            setConnectionMessage("Connection was cancelled.");
            setConnectState("empty");
            setActivePayload(null);
            return;
          }

          void finalizeConnection(activePayload.id).catch((error) => {
            setConnectionMessage(error instanceof Error ? error.message : "Unable to complete connection.");
            setConnectState("empty");
          });
        }
      } catch {
        // Xaman websocket sends keepalive frames that are safe to ignore.
      }
    };

    return () => websocket.close();
  }, [activePayload]);

  const handleConnect = async () => {
    if (connectState !== "empty") {
      return;
    }

    setConnectState("connecting");
    setConnectionMessage("Preparing secure connection request...");

    try {
      const response = await fetch("/api/xaman/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnPath: "/payments/connect-account",
        }),
      });
      const body = (await response.json()) as XamanPayloadRequest & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "Unable to create connection request.");
      }

      setActivePayload(body);
      setConnectionMessage("Open Xaman to approve the connection.");
    } catch (error) {
      setConnectState("empty");
      setConnectionMessage(error instanceof Error ? error.message : "Unable to connect money.");
    }
  };

  return (
    <AppShell>
      <div className="-mx-4 -mt-2 min-h-[calc(100vh-7.5rem)] overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.62),transparent_32%),radial-gradient(ellipse_at_86%_8%,rgba(103,232,249,0.24),transparent_30%),linear-gradient(180deg,#DCEEFF_0%,#C6DDF8_48%,#AFCBEF_100%)] px-6 pb-28 pt-8 text-white md:-mx-6 md:rounded-[36px] md:px-8 md:pb-12 lg:-mx-8 lg:px-10">
        <div className="relative mx-auto flex min-h-[620px] max-w-[980px] items-center justify-center">
          <section className="relative w-full overflow-hidden rounded-[34px] border border-white/32 bg-[linear-gradient(155deg,#2B5F94,#1E4A7D_48%,#17345F)] p-6 shadow-[0_34px_86px_rgba(31,68,116,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_84%_10%,rgba(103,232,249,0.18),transparent_30%)]" />
            <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-center">
              <div>
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-[18px] border border-white/18 bg-white/[0.12] text-white">
                  {connectState === "connected" ? <CheckCircle2 className="h-5 w-5" strokeWidth={1.9} /> : <Landmark className="h-5 w-5" strokeWidth={1.9} />}
                </span>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">Connect your money</p>
                <h1 className="mt-3 text-[44px] font-semibold leading-[1.02] tracking-[-0.055em]">
                  {connectState === "connected" ? "Money connected" : "Connect your money"}
                </h1>
                <p className="mt-5 max-w-[560px] text-[16px] leading-[1.75] text-[#E4F0FF]">
                  {connectState === "connected"
                    ? "You’re ready to receive and move funds inside Zila."
                    : "Set up your operating balance to receive, protect, and move money inside Zila."}
                </p>

                {connectState === "connecting" ? (
                  <div className="mt-8 max-w-[420px] rounded-[24px] border border-white/16 bg-white/[0.10] p-5">
                    <div className="flex items-center gap-3">
                      <LoaderCircle className="h-5 w-5 animate-spin text-[#D9FF57]" strokeWidth={2} />
                      <p className="text-[15px] font-semibold text-white">Setting up your operating balance…</p>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/16">
                      <div className="h-full w-2/3 rounded-full bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.28)]" />
                    </div>
                    {connectionMessage ? <p className="mt-4 text-[13px] leading-[1.6] text-[#E4F0FF]">{connectionMessage}</p> : null}
                    {activePayload ? (
                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Image
                          src={activePayload.qrPng}
                          alt="Xaman connection QR code"
                          width={128}
                          height={128}
                          unoptimized
                          className="h-32 w-32 rounded-[16px] border border-white/18 bg-white p-2"
                        />
                        <Link
                          href={activePayload.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-white px-4 text-[13px] font-semibold text-[#102A4F]"
                        >
                          Open Xaman
                          <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-8 flex flex-wrap gap-3">
                  {connectState === "connected" ? (
                    <>
                      <Link href="/payments/receive" className="inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-[#D9FF57] px-6 text-[14px] font-semibold text-[#102A4F] shadow-[0_18px_36px_rgba(217,255,87,0.16)]">
                        Continue
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </Link>
                      <Link href="/payments" className="inline-flex h-13 items-center justify-center rounded-[18px] border border-white/18 bg-white/[0.11] px-6 text-[14px] font-semibold text-[#F3F8FF]">
                        Back to payments
                      </Link>
                    </>
                  ) : (
                    <button type="button" onClick={handleConnect} disabled={connectState === "connecting"} className="zila-button-hover inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-[#1D4ED8] px-6 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(29,78,216,0.24)] disabled:cursor-wait disabled:opacity-70">
                      {connectState === "connecting" ? <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Landmark className="h-4 w-4" strokeWidth={2} />}
                      Connect money
                    </button>
                  )}
                </div>
              </div>

              <aside className="rounded-[28px] border border-white/16 bg-white/[0.10] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                <WalletCards className="h-7 w-7 text-[#D9FF57]" strokeWidth={1.8} />
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BCEEFF]">Operating balance</p>
                <div className="mt-4 space-y-3">
                  {["Receive funds", "Protect money", "Move with proof"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#102A4F]/36 px-3 py-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${connectState === "connected" || index === 0 ? "bg-[#D9FF57]" : "bg-white/28"}`} />
                      <p className="text-[13px] font-semibold text-[#E4F0FF]">{item}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

export default ConnectMoneyFlow;
