"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Clock3,
  DollarSign,
  Landmark,
  Search,
  ShieldCheck,
  Smartphone,
  WalletCards,
  Zap,
} from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import { FlowBackNav } from "@/components/ui/FlowBackNav";
import { IconTile } from "@/components/ui/IconTile";
import { saveLatestPaymentTransaction, savePaymentMovement } from "@/lib/paymentTransactionStore";
import { buildXrplExplorerUrl, saveProofTransaction, shortenWalletAddress } from "@/lib/proofTransactionStore";
import { getMoneySourceState, subscribeToMoneySource, type MoneySourceState } from "@/lib/moneySourceStore";
import { recordPaymentReserveRecalculation } from "@/lib/protectedMoneyStore";

type FlowStep = "connect" | "review" | "confirm" | "proof";
type SettlementAsset = "auto" | "rlusd" | "usdt" | "usdc";
type RailId = "stablecoin" | "bank" | "mobile-money";
type ExecutionState =
  | "idle"
  | "preparing"
  | "awaiting-confirmation"
  | "reserve-allocated"
  | "settlement-routing"
  | "xrpl-syncing"
  | "proof-generating"
  | "complete"
  | "failed";

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

interface PendingStablecoinPayout {
  amountLabel: string;
  amountValue: number;
  projectName: string;
  supplierName: string;
  railLabel: string;
  reserveAfter: string;
  runwayAfter: string;
  walletAddress: string;
  settlementAssetLabel: string;
  payloadId: string;
}

const steps = ["Connect wallet", "Review impact", "Confirm payout", "Proof attached"];
const flowStepOrder: FlowStep[] = ["connect", "review", "confirm", "proof"];
const XRPL_OPERATIONAL_AMOUNT = "0.000001";
const PENDING_STABLECOIN_PAYOUT_KEY = "zila-pending-stablecoin-payout";

const settlementAssets: Array<{
  id: SettlementAsset;
  label: string;
  description: string;
  recommendation: string;
}> = [
  {
    id: "auto",
    label: "Auto select",
    description: "Recommended",
    recommendation: "Zila selects the most efficient settlement route based on liquidity, speed, and operational reliability.",
  },
  {
    id: "rlusd",
    label: "RLUSD",
    description: "XRPL aligned",
    recommendation: "RLUSD provides a fast institutional XRPL settlement path with verified operational proof.",
  },
  {
    id: "usdt",
    label: "USDT",
    description: "High liquidity",
    recommendation: "USDT currently offers stronger corridor liquidity for many emerging market payout flows.",
  },
  {
    id: "usdc",
    label: "USDC",
    description: "Broad support",
    recommendation: "USDC is available for supported operational corridors with stable settlement visibility.",
  },
];

const connectionMethods = [
  { label: "Xaman", status: "Available now" },
  { label: "WalletConnect", status: "Supported wallet path" },
  { label: "Future custodial support", status: "Coming soon" },
];

const projectOptions = [
  {
    id: "project-horizon",
    name: "Project Horizon",
    state: "Runway stable for 12 days",
    pressure: "Healthy",
    commitment: "$4,300 supplier obligation due today",
    reserveAfter: "$19,920",
    runwayAfter: "11.5 days",
    protectedBalance: "$24,220",
    health: "Stable after payout",
  },
  {
    id: "atlas-project",
    name: "Atlas Project",
    state: "Supplier timing tightening",
    pressure: "Watch timing",
    commitment: "$3,850 logistics payout due tomorrow",
    reserveAfter: "$17,640",
    runwayAfter: "8.2 days",
    protectedBalance: "$21,300",
    health: "Stable with reserve guard",
  },
  {
    id: "northstar-project",
    name: "Northstar Project",
    state: "Delivery close-out active",
    pressure: "Pressure rising",
    commitment: "$5,200 contractor payment overlaps payroll",
    reserveAfter: "$14,980",
    runwayAfter: "6.4 days",
    protectedBalance: "$18,600",
    health: "Delay optional if client payment slips",
  },
];

const supplierOptions = [
  {
    id: "horizon-supplier",
    name: "Northline Suppliers",
    role: "Materials supplier",
    status: "Ready to pay",
    obligation: "$4,300 due today",
    readiness: "Verified payout rail",
    amount: 4300,
    projectIds: ["project-horizon"],
  },
  {
    id: "skyline-travel",
    name: "Skyline Travel",
    role: "Flights and travel",
    status: "Awaiting release",
    obligation: "$3,850 due tomorrow",
    readiness: "Invoice and reserve linked",
    amount: 3850,
    projectIds: ["atlas-project"],
  },
  {
    id: "mara-contractors",
    name: "Mara Contractors",
    role: "Field operations",
    status: "Payment window open",
    obligation: "$5,200 due Friday",
    readiness: "Proof ready after settlement",
    amount: 5200,
    projectIds: ["northstar-project"],
  },
];

const paymentRails: Array<{
  id: RailId;
  label: string;
  detail: string;
  timing: string;
  status: string;
  icon: LucideIcon;
}> = [
  {
    id: "stablecoin",
    label: "Stablecoin settlement",
    detail: "XRPL/Xaman operational rail",
    timing: "Under 1 minute",
    status: "Available now",
    icon: WalletCards,
  },
  {
    id: "bank",
    label: "Bank transfer",
    detail: "Multi-currency bank payout",
    timing: "Same day preview",
    status: "Coming soon",
    icon: Landmark,
  },
  {
    id: "mobile-money",
    label: "Mobile money",
    detail: "Direct wallet payout",
    timing: "Fast payout preview",
    status: "Coming soon",
    icon: Smartphone,
  },
];

const guidance = [
  "Cheapest route available.",
  "Operational proof attaches automatically.",
  "Reserve protection remains active.",
  "Funds expected within 1 minute.",
];

const confirmationChecks = [
  "Reserve protection remains active",
  "Proof attaches automatically",
  "Verified payout rail",
  "Secure XRPL settlement",
];

const payoutLifecycle: Array<{ state: ExecutionState; label: string; detail: string }> = [
  { state: "preparing", label: "Preparing payout", detail: "Supplier, project, and payout reason checked." },
  { state: "reserve-allocated", label: "Reserve allocated", detail: "Protected balance and runway recalculated." },
  { state: "settlement-routing", label: "Settlement routing", detail: "Best available operational rail selected." },
  { state: "xrpl-syncing", label: "XRPL syncing", detail: "Settlement reference is being verified." },
  { state: "proof-generating", label: "Proof generated", detail: "Operational memory is updating automatically." },
  { state: "complete", label: "Payout confirmed", detail: "Supplier obligation, reserve state, and proof are synced." },
];

function getStepFromUrl(): FlowStep {
  if (typeof window === "undefined") {
    return "connect";
  }

  const step = new URLSearchParams(window.location.search).get("step");
  return flowStepOrder.includes(step as FlowStep) ? (step as FlowStep) : "connect";
}

function writeStepToUrl(step: FlowStep, mode: "push" | "replace" = "push") {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (step === "connect") {
    url.searchParams.delete("step");
  } else {
    url.searchParams.set("step", step);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const method = mode === "replace" ? "replaceState" : "pushState";
  window.history[method]({ step }, "", nextUrl);
}

function getSelectionFromUrl(param: "project" | "supplier" | "rail") {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(param);
}

function getPendingStablecoinPayout() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(PENDING_STABLECOIN_PAYOUT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingStablecoinPayout;
  } catch {
    return null;
  }
}

function setPendingStablecoinPayout(payout: PendingStablecoinPayout) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PENDING_STABLECOIN_PAYOUT_KEY, JSON.stringify(payout));
}

function clearPendingStablecoinPayout() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PENDING_STABLECOIN_PAYOUT_KEY);
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function buildPaymentContext(projectId: string, supplierId: string, railId: RailId, settlementAssetLabel: string) {
  const project = projectOptions.find((item) => item.id === projectId) ?? projectOptions[0];
  const projectSuppliers = supplierOptions.filter((item) => item.projectIds.includes(project.id));
  const supplier = supplierOptions.find((item) => item.id === supplierId && item.projectIds.includes(project.id)) ?? projectSuppliers[0] ?? supplierOptions[0];
  const rail = paymentRails.find((item) => item.id === railId) ?? paymentRails[0];
  const amountLabel = formatCurrency(supplier.amount);
  const fee = rail.id === "stablecoin" ? "$0.08" : rail.id === "bank" ? "$4.20 est." : "$1.15 est.";
  const finalTotal = rail.id === "stablecoin" ? `$${(supplier.amount + 0.08).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${amountLabel} + fees`;
  const fxEquivalent = `KES ${(supplier.amount * 130).toLocaleString("en-US")} est.`;
  const railReady = rail.id === "stablecoin";

  return {
    project,
    supplier,
    rail,
    railReady,
    amountLabel,
    fee,
    finalTotal,
    fxEquivalent,
    overview: [
      { label: "Payout amount", value: amountLabel },
      { label: "Estimated fees", value: fee },
      { label: "Final total", value: finalTotal },
      { label: "FX equivalent", value: fxEquivalent },
      { label: "Arrival time", value: rail.timing },
      { label: "Reserve impact", value: project.reserveAfter },
      { label: "Proof status", value: "Attaches automatically" },
    ],
    consequence: [
      { label: "Reserve remaining", value: project.reserveAfter },
      { label: "Runway after payout", value: project.runwayAfter },
      { label: "Protected balance", value: project.protectedBalance },
      { label: "Supplier coverage", value: supplier.status },
      { label: "Treasury effect", value: project.health },
      { label: "Proof readiness", value: "Project, supplier, and settlement linked" },
    ],
    businessContext: [
      { label: "Recipient", value: supplier.name },
      { label: "Project", value: project.name },
      { label: "Amount", value: amountLabel },
      { label: "Reason", value: "Supplier payout" },
    ],
    payoutDetails: [
      { label: "Destination account", value: supplier.name, note: supplier.readiness },
      { label: "Settlement rail", value: rail.label, note: rail.detail },
      { label: "Settlement asset", value: settlementAssetLabel, note: rail.id === "stablecoin" ? "Handled through operational settlement" : "Route preview only" },
      { label: "Payment reason", value: "Supplier payout", note: "Operational proof supported" },
    ],
  };
}

export default function StablecoinPaymentPage() {
  const [flowStep, setFlowStep] = useState<FlowStep>("connect");
  const [isConfirming, setIsConfirming] = useState(false);
  const [settlementAsset, setSettlementAsset] = useState<SettlementAsset>("auto");
  const [projectId, setProjectId] = useState(() => {
    const requestedProject = getSelectionFromUrl("project");
    return projectOptions.some((project) => project.id === requestedProject) ? requestedProject ?? projectOptions[0].id : projectOptions[0].id;
  });
  const [supplierId, setSupplierId] = useState(() => {
    const requestedSupplier = getSelectionFromUrl("supplier");
    return supplierOptions.some((supplier) => supplier.id === requestedSupplier) ? requestedSupplier ?? supplierOptions[0].id : supplierOptions[0].id;
  });
  const [projectSearch, setProjectSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [railId, setRailId] = useState<RailId>(() => {
    const requestedRail = getSelectionFromUrl("rail") as RailId | null;
    return paymentRails.some((rail) => rail.id === requestedRail) ? requestedRail ?? "stablecoin" : "stablecoin";
  });
  const [executionState, setExecutionState] = useState<ExecutionState>("idle");
  const [settlementMessage, setSettlementMessage] = useState("Payout checks are ready.");
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [txReference, setTxReference] = useState("XRPL-SETTLE-83A9");
  const [moneySource, setMoneySource] = useState<MoneySourceState>(() => getMoneySourceState());
  const selectedSettlementAsset = settlementAssets.find((asset) => asset.id === settlementAsset) ?? settlementAssets[0];
  const settlementAssetLabel = settlementAsset === "auto" ? "Auto select" : selectedSettlementAsset.label;
  const paymentContext = useMemo(
    () => buildPaymentContext(projectId, supplierId, railId, settlementAssetLabel),
    [projectId, railId, settlementAssetLabel, supplierId],
  );
  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) {
      return projectOptions;
    }

    return projectOptions.filter((project) =>
      [project.name, project.state, project.pressure, project.commitment].some((value) => value.toLowerCase().includes(query)),
    );
  }, [projectSearch]);
  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();
    const linkedSuppliers = supplierOptions.filter((supplier) => supplier.projectIds.includes(projectId));
    if (!query) {
      return linkedSuppliers;
    }

    return linkedSuppliers.filter((supplier) =>
      [supplier.name, supplier.role, supplier.status, supplier.obligation].some((value) => value.toLowerCase().includes(query)),
    );
  }, [projectId, supplierSearch]);
  const connected = moneySource.connected && Boolean(moneySource.walletAddress) && flowStep !== "connect";
  const activeStep = flowStep === "connect" ? 0 : flowStep === "review" ? 1 : flowStep === "confirm" ? 2 : 3;
  const previousStep = activeStep > 0 ? flowStepOrder[activeStep - 1] : null;
  const previousStepLabel =
    flowStep === "review"
      ? "Back to Connect Wallet"
      : flowStep === "confirm"
        ? "Back to Review Impact"
        : flowStep === "proof"
          ? "Back to Confirm Payout"
          : null;

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    setSupplierSearch("");
    const nextSupplier = supplierOptions.find((supplier) => supplier.projectIds.includes(nextProjectId));
    if (nextSupplier) {
      setSupplierId(nextSupplier.id);
    }
  };

  useEffect(() => {
    const update = () => setMoneySource(getMoneySourceState());

    update();
    return subscribeToMoneySource(update);
  }, []);

  const completeSettlement = (txid: string, walletAddress: string, resolvedAtIso = new Date().toISOString(), pendingPayout = getPendingStablecoinPayout()) => {
    const createdAtIso = resolvedAtIso;
    const payout = pendingPayout ?? {
      amountLabel: paymentContext.amountLabel,
      amountValue: paymentContext.supplier.amount,
      projectName: paymentContext.project.name,
      supplierName: paymentContext.supplier.name,
      railLabel: paymentContext.rail.label,
      reserveAfter: paymentContext.project.reserveAfter,
      runwayAfter: paymentContext.project.runwayAfter,
      walletAddress,
      settlementAssetLabel,
      payloadId: "",
    };

    setTxReference(txid);
    setExecutionState("reserve-allocated");
    setSettlementMessage("Reserve allocated. Runway and protected balance refreshed.");

    window.setTimeout(() => {
      setExecutionState("settlement-routing");
      setSettlementMessage("Settlement route confirmed across the operational rail.");
    }, 520);

    window.setTimeout(() => {
      setExecutionState("xrpl-syncing");
      setSettlementMessage("Settlement reference syncing with the operational record.");
    }, 1040);

    window.setTimeout(() => {
      setExecutionState("proof-generating");
      setSettlementMessage("Proof record generated from the payout, reserve, and project state.");
    }, 1560);

    window.setTimeout(() => {
      const explorerUrl = buildXrplExplorerUrl(txid);

      savePaymentMovement({
        id: `stablecoin-payout-${txid}`,
        type: "outgoing",
        title: "Supplier payout completed",
        amountLabel: payout.amountLabel,
        amountValue: payout.amountValue,
        status: "Verified",
        project: payout.projectName,
        sourceLabel: payout.railLabel,
        recipientName: payout.supplierName,
        reason: "Supplier payout",
        txHash: txid,
        explorerUrl,
        createdAtIso,
      });
      recordPaymentReserveRecalculation({
        amount: payout.amountValue,
        amountLabel: payout.amountLabel,
        projectName: payout.projectName,
        recipientName: payout.supplierName,
        txHash: txid,
        reserveAfterLabel: payout.reserveAfter,
        runwayAfterLabel: payout.runwayAfter,
      });
      saveLatestPaymentTransaction({
        txid,
        amountLabel: payout.amountLabel,
        amountValue: payout.amountValue,
        projectName: payout.projectName,
        recipientName: payout.supplierName,
        sourceLabel: payout.railLabel,
        paymentReason: "Supplier payout",
        movementType: "outgoing",
        verificationState: "Verified",
        transferStatus: "Completed",
        reserveAfter: payout.reserveAfter,
        runwayAfter: payout.runwayAfter,
        obligationStatus: "Settled",
        walletAddress,
        network: "XRPL Mainnet",
        createdAtIso,
      });
      saveProofTransaction({
        id: `stablecoin-payout-${Date.now()}`,
        walletAddress,
        walletAddressShort: shortenWalletAddress(walletAddress),
        status: "Confirmed",
        amountLabel: payout.amountLabel,
        amountValue: payout.amountValue,
        network: "XRPL Mainnet",
        linkedType: "project",
        linkedLabel: payout.projectName,
        project: payout.projectName,
        actionLabel: "completed",
        contextLabel: `Supplier payout sent to ${payout.supplierName}`,
        summary: `${payout.amountLabel} supplier payout completed through ${payout.railLabel}. Reserve after payout: ${payout.reserveAfter}.`,
        hash: txid,
        createdAtIso,
        displayTimestamp: "Just now",
      });
      setExecutionState("complete");
      setSettlementMessage("Payout confirmed. Proof and operational memory are updated.");
      setIsConfirming(false);
      setActivePayload(null);
      clearPendingStablecoinPayout();
      goToStep("proof", { force: true });
    }, 2140);
  };

  const handleConfirmPayout = async () => {
    if (!paymentContext.railReady || isConfirming) {
      return;
    }

    if (!moneySource.connected || !moneySource.walletAddress) {
      setExecutionState("failed");
      setSettlementMessage("Connect Xaman before sending a mainnet payout.");
      return;
    }

    setIsConfirming(true);
    setExecutionState("preparing");
    setSettlementMessage("Preparing payout request and allocating reserve context.");

    try {
      const response = await fetch("/api/xaman/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: XRPL_OPERATIONAL_AMOUNT,
          walletAddress: moneySource.walletAddress,
          linkedLabel: `${paymentContext.supplier.name} · ${paymentContext.amountLabel}`,
          project: paymentContext.project.name,
          currency: "XRP",
          returnPath: "/payments/stablecoin",
        }),
      });
      const body = (await response.json()) as XamanPayloadRequest & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "Unable to prepare settlement request.");
      }

      setPendingStablecoinPayout({
        amountLabel: paymentContext.amountLabel,
        amountValue: paymentContext.supplier.amount,
        projectName: paymentContext.project.name,
        supplierName: paymentContext.supplier.name,
        railLabel: paymentContext.rail.label,
        reserveAfter: paymentContext.project.reserveAfter,
        runwayAfter: paymentContext.project.runwayAfter,
        walletAddress: moneySource.walletAddress,
        settlementAssetLabel,
        payloadId: body.id,
      });
      setActivePayload(body);
      setExecutionState("awaiting-confirmation");
      setSettlementMessage("Xaman request prepared. Awaiting payout confirmation.");
    } catch (error) {
      setExecutionState("failed");
      setIsConfirming(false);
      setSettlementMessage(error instanceof Error ? error.message : "Unable to prepare mainnet settlement request.");
    }
  };

  const handleReviewPayment = () => {
    goToStep("confirm");
  };

  const goToStep = (nextStep: FlowStep, options: { force?: boolean; replace?: boolean } = {}) => {
    if (isConfirming && !options.force) {
      return;
    }

    if (nextStep === flowStep) {
      return;
    }

    setIsConfirming(false);
    setFlowStep(nextStep);
    writeStepToUrl(nextStep, options.replace ? "replace" : "push");
  };

  useEffect(() => {
    const urlStep = getStepFromUrl();
    setFlowStep(urlStep);
    writeStepToUrl(urlStep, "replace");

    const payloadId = new URLSearchParams(window.location.search).get("payload");
    const pendingPayout = getPendingStablecoinPayout();

    if (payloadId && pendingPayout?.payloadId === payloadId) {
      setFlowStep("confirm");
      setIsConfirming(true);
      setExecutionState("xrpl-syncing");
      setSettlementMessage("Returned from Xaman. Verifying mainnet settlement.");
      fetch(`/api/xaman/payload/${payloadId}`, { cache: "no-store" })
        .then((response) => response.json() as Promise<PayloadStatusResponse>)
        .then((body) => {
          if (!body.meta.signed || !body.response.txid) {
            throw new Error(body.error || "Settlement was not confirmed.");
          }

          completeSettlement(
            body.response.txid,
            body.response.account || pendingPayout.walletAddress,
            body.response.resolved_at || new Date().toISOString(),
            pendingPayout,
          );
        })
        .catch(() => {
          setExecutionState("failed");
          setSettlementMessage("Settlement could not be verified. Prepare the payout again when ready.");
          setIsConfirming(false);
          clearPendingStablecoinPayout();
        });
    }

    const handlePopState = () => {
      setIsConfirming(false);
      setFlowStep(getStepFromUrl());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!activePayload) {
      return;
    }

    const websocket = new WebSocket(activePayload.websocketStatus);

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { opened?: boolean; signed?: boolean; dispatched?: boolean; expired?: boolean };

        if (data.opened) {
          setExecutionState("awaiting-confirmation");
          setSettlementMessage("Payout opened in Xaman. Waiting for confirmation.");
        }

        if (data.dispatched) {
          setExecutionState("settlement-routing");
          setSettlementMessage("Payout submitted. Settlement confirmation in progress.");
        }

        if (data.expired) {
          setExecutionState("failed");
          setSettlementMessage("Signing request expired. Prepare the payout again when ready.");
          setIsConfirming(false);
          setActivePayload(null);
          clearPendingStablecoinPayout();
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            setExecutionState("failed");
            setSettlementMessage("Payout confirmation was cancelled.");
            setIsConfirming(false);
            setActivePayload(null);
            clearPendingStablecoinPayout();
            return;
          }

          setExecutionState("xrpl-syncing");
          setSettlementMessage("Settlement signed. Verifying payout reference.");
          const pendingPayout = getPendingStablecoinPayout();
          fetch(`/api/xaman/payload/${activePayload.id}`, { cache: "no-store" })
            .then((response) => response.json() as Promise<PayloadStatusResponse>)
            .then((body) => {
              if (!body.meta.signed || !body.response.txid) {
                throw new Error(body.error || "Settlement was not confirmed.");
              }

              completeSettlement(
                body.response.txid,
                body.response.account || pendingPayout?.walletAddress || moneySource.walletAddress,
                body.response.resolved_at || new Date().toISOString(),
                pendingPayout,
              );
            })
            .catch(() => {
              setExecutionState("failed");
              setSettlementMessage("Settlement could not be verified. Try preparing the payout again.");
              setIsConfirming(false);
              setActivePayload(null);
              clearPendingStablecoinPayout();
            });
        }
      } catch {
        // Xaman websocket sends occasional non-JSON keepalive frames.
      }
    };

    return () => websocket.close();
  }, [activePayload]);

  return (
    <AppShell>
      <div className="relative text-white">
        <div className="pointer-events-none absolute inset-x-[-2rem] top-[-1rem] h-80 rounded-[36px] bg-[radial-gradient(circle_at_20%_18%,rgba(217,255,87,0.13),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.16),transparent_24%)]" />
        <div className="relative space-y-6">
          <FlowBackNav
            items={[
              { label: "Back to Payment Methods", href: "/payments/send", primary: !previousStep },
              ...(previousStep && previousStepLabel
                ? [{ label: previousStepLabel, onClick: () => goToStep(previousStep), disabled: isConfirming }]
                : []),
              { label: "Payments", href: "/payments" },
              { label: "Dashboard", href: "/home" },
            ]}
          />

          <section className="zila-unified-panel-soft overflow-hidden rounded-[32px] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">Stablecoin Payout</p>
                <h1 className="mt-4 text-[42px] font-semibold leading-none tracking-[-0.02em] text-white">
                  {flowStep === "connect"
                    ? "Connect stablecoin wallet"
                    : flowStep === "review"
                      ? "Review operational payout"
                      : flowStep === "confirm"
                        ? "Confirm operational payout"
                        : "Proof attached successfully"}
                </h1>
                <p className="mt-4 max-w-[600px] text-[15px] leading-[1.7] text-[#D7E3F8]">
                  {flowStep === "connect"
                    ? "Connect a supported wallet to send operational payouts through stablecoin rails."
                    : flowStep === "proof"
                      ? "Settlement, reserve state, and operational record are verified."
                      : "Send a protected supplier payout through stablecoin rails."}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/20 bg-[#D9FF57]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F1FFB8]">
                <span className="zila-live-dot h-2 w-2 rounded-full bg-[#D9FF57]" />
                {flowStep === "proof" ? "Proof attached" : connected ? "Ready to send" : "Connection required"}
              </span>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-4">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isDone = index < activeStep;
                const canNavigate = index <= activeStep && !isConfirming;
                const isNextConfirm = flowStep === "review" && index === 2;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => canNavigate && goToStep(flowStepOrder[index])}
                    disabled={!canNavigate}
                    className={`rounded-[18px] border px-4 py-3 text-left transition duration-300 ${
                      canNavigate ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#D9FF57]/30 hover:bg-[#D9FF57]/[0.12]" : "cursor-default"
                    } ${isActive || isDone ? "border-[#D9FF57]/22 bg-[#D9FF57]/10 text-[#F1FFB8]" : isNextConfirm ? "border-[#D9FF57]/14 bg-[#D9FF57]/[0.045] text-[#DDE8B8]" : "border-white/10 bg-white/[0.04] text-[#AFC0DD]"}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Step {index + 1}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold">{step}</p>
                      {isDone ? <BadgeCheck className="h-3.5 w-3.5 text-[#D9FF57]" strokeWidth={2} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div key={flowStep} className="zila-flow-step">
            {flowStep === "connect" ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(16,42,79,0.72),rgba(9,25,50,0.82))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                  <div className="flex items-center gap-3">
                    <IconTile glow="mint" className="border-[#D9FF57]/22 bg-[#D9FF57]/12 text-[#EAFFB4]">
                      <WalletCards className="h-[15px] w-[15px]" strokeWidth={2} />
                    </IconTile>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Connect wallet</p>
                      <p className="mt-1 text-[13px] text-[#AFC0DD]">Stablecoin rail access for operational payouts.</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {connectionMethods.map((method, index) => (
                      <div key={method.label} className={`rounded-[20px] border p-4 ${index === 0 ? "border-[#D9FF57]/18 bg-[#D9FF57]/[0.06]" : "border-white/9 bg-white/[0.035]"}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[14px] font-semibold text-white">{method.label}</p>
                            <p className="mt-1 text-[12px] text-[#AFC0DD]">{method.status}</p>
                          </div>
                          {index === 0 ? <BadgeCheck className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} /> : <Clock3 className="h-4 w-4 text-[#BFEFFF]" strokeWidth={2} />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    {moneySource.connected && moneySource.walletAddress ? (
                      <button
                        type="button"
                        onClick={() => goToStep("review")}
                        className="zila-operational-action-soft inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-6 text-[14px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
                      >
                        Continue to payout
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                    ) : (
                      <Link
                        href="/payments/connect-account"
                        className="zila-operational-action-soft inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-6 text-[14px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
                      >
                        Connect Xaman
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                      </Link>
                    )}
                    <button
                      type="button"
                      className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-6 text-[14px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.10]"
                    >
                      <BookOpen className="h-4 w-4 text-[#BFEFFF]" strokeWidth={2} />
                      Learn how stablecoin payouts work
                    </button>
                  </div>
                </section>

                <OperationalSummary connected={connected} settlementAsset={selectedSettlementAsset} paymentContext={paymentContext} />
              </div>
            ) : flowStep === "review" ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(16,42,79,0.72),rgba(9,25,50,0.82))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <IconTile glow="cyan" className="bg-white/[0.07] text-[#BFEFFF]">
                        <WalletCards className="h-[15px] w-[15px]" strokeWidth={2} />
                      </IconTile>
                      <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Payout Details</p>
                        <p className="mt-1 text-[13px] text-[#AFC0DD]">Business context first. Stablecoin rail underneath.</p>
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-[#D9FF57]/14 bg-[#D9FF57]/[0.065] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D9FF57]">Connected via</p>
                      <p className="mt-1 text-[13px] font-semibold text-white">Xaman Wallet</p>
                      <p className="mt-1 text-[11px] text-[#C9D4F5]">{moneySource.walletAddressShort || "Connected"} • Verified • Ready to send</p>
                    </div>
                  </div>

                    <OperationalCoordinator
                      projectId={projectId}
                      onProjectChange={handleProjectChange}
                      projectSearch={projectSearch}
                      onProjectSearchChange={setProjectSearch}
                      filteredProjects={filteredProjects}
                      supplierId={supplierId}
                      onSupplierChange={setSupplierId}
                    supplierSearch={supplierSearch}
                    onSupplierSearchChange={setSupplierSearch}
                    filteredSuppliers={filteredSuppliers}
                    railId={railId}
                    onRailChange={setRailId}
                    paymentContext={paymentContext}
                  />

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {paymentContext.businessContext.map((item) => (
                      <div key={item.label} className="rounded-[20px] border border-white/9 bg-white/[0.04] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">{item.label}</p>
                        <p className="mt-2 text-[15px] font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4">
                    {paymentContext.payoutDetails.map((field) => (
                      <div key={field.label} className="rounded-[20px] border border-white/9 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">{field.label}</p>
                            <p className="mt-2 text-[14px] font-semibold text-white">{field.value}</p>
                          </div>
                          <BadgeCheck className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                        </div>
                        <p className="mt-3 text-[12px] text-[#C9D4F5]">{field.note}</p>
                      </div>
                    ))}
                  </div>

                  <SettlementAssetSelector selected={settlementAsset} onSelect={setSettlementAsset} />

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: DollarSign, label: "Fee estimate", value: "$0.08" },
                      { icon: ShieldCheck, label: "Reserve", value: "Active" },
                      { icon: Zap, label: "Proof", value: "Automatic" },
                    ].map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={item.label} className="rounded-[18px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.055] p-3">
                          <ItemIcon className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                          <p className="mt-2 text-[11px] text-[#E7F5C3]">{item.label}</p>
                          <p className="mt-1 text-[13px] font-semibold text-white">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <OperationalSummary connected={connected} flowStep={flowStep} settlementAsset={selectedSettlementAsset} paymentContext={paymentContext} onReview={handleReviewPayment} />
              </div>
            ) : flowStep === "confirm" ? (
              <ConfirmPayoutScreen
                isConfirming={isConfirming}
                settlementAsset={selectedSettlementAsset}
                settlementAssetLabel={settlementAssetLabel}
                selectedSettlementAsset={settlementAsset}
                onSelectSettlementAsset={setSettlementAsset}
                paymentContext={paymentContext}
                executionState={executionState}
                settlementMessage={settlementMessage}
                activePayload={activePayload}
                onBack={() => goToStep("review")}
                onConfirm={handleConfirmPayout}
              />
            ) : (
              <ProofAttachedScreen settlementAssetLabel={settlementAssetLabel} paymentContext={paymentContext} txReference={txReference} onBack={() => goToStep("confirm")} />
            )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function OperationalSummary({
  connected,
  flowStep = "connect",
  settlementAsset,
  paymentContext,
  onReview,
}: {
  connected: boolean;
  flowStep?: FlowStep;
  settlementAsset: (typeof settlementAssets)[number];
  paymentContext: ReturnType<typeof buildPaymentContext>;
  onReview?: () => void;
}) {
  return (
    <aside className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(28,73,121,0.64),rgba(9,25,50,0.84))] p-6 shadow-[0_24px_54px_rgba(13,35,68,0.20),inset_0_1px_0_rgba(255,255,255,0.10)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Operational Summary</p>
      <div className="mt-5 space-y-3">
        {paymentContext.overview.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
            <p className="text-[12px] text-[#AFC0DD]">{item.label}</p>
            <p className="text-right text-[13px] font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[20px] border border-white/9 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">Operational Consequence</p>
          <span className="zila-live-dot h-2 w-2 rounded-full bg-[#D9FF57]" />
        </div>
        <div className="mt-3 space-y-2">
          {paymentContext.consequence.slice(0, 4).map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4">
              <p className="text-[11px] text-[#9FB3D9]">{item.label}</p>
              <p className="max-w-[160px] text-right text-[12px] font-semibold leading-[1.35] text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {[
          paymentContext.railReady ? settlementAsset.recommendation : `${paymentContext.rail.label} is prepared as a future route. Stablecoin settlement is available now.`,
          ...guidance,
        ].map((item) => (
          <div key={item} className="flex gap-2 rounded-[14px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.055] px-3 py-2">
            <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D9FF57]" strokeWidth={2} />
            <p className="text-[11px] leading-[1.45] text-[#E7F5C3]">{item}</p>
          </div>
        ))}
      </div>

      {connected && flowStep === "review" ? (
        <button
          type="button"
          onClick={() => onReview?.()}
          disabled={!paymentContext.railReady}
          className="zila-operational-action-soft mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[14px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
        >
          {paymentContext.railReady ? "Continue to confirm payout" : "Select stablecoin to send now"}
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </button>
      ) : (
        <div className="mt-7 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-[12px] font-semibold text-white">
            {connected ? "Payment is ready for confirmation." : "Connect wallet to continue."}
          </p>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#AFC0DD]">
            {connected ? "Final checks stay attached to the payout record." : "Zila will show final review after connection."}
          </p>
        </div>
      )}
    </aside>
  );
}

function OperationalCoordinator({
  projectId,
  onProjectChange,
  projectSearch,
  onProjectSearchChange,
  filteredProjects,
  supplierId,
  onSupplierChange,
  supplierSearch,
  onSupplierSearchChange,
  filteredSuppliers,
  railId,
  onRailChange,
  paymentContext,
}: {
  projectId: string;
  onProjectChange: (projectId: string) => void;
  projectSearch: string;
  onProjectSearchChange: (value: string) => void;
  filteredProjects: typeof projectOptions;
  supplierId: string;
  onSupplierChange: (supplierId: string) => void;
  supplierSearch: string;
  onSupplierSearchChange: (value: string) => void;
  filteredSuppliers: typeof supplierOptions;
  railId: RailId;
  onRailChange: (railId: RailId) => void;
  paymentContext: ReturnType<typeof buildPaymentContext>;
}) {
  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Select Project</p>
            <p className="mt-1 text-[12px] text-[#AFC0DD]">Project context changes reserve, runway, and payout timing.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <div className="relative w-full sm:w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9FB3D9]" strokeWidth={2} />
              <input
                value={projectSearch}
                onChange={(event) => onProjectSearchChange(event.target.value)}
                placeholder="Search projects"
                className="h-10 w-full rounded-full border border-white/10 bg-[#102A4F]/70 pl-9 pr-3 text-[12px] text-white outline-none transition placeholder:text-[#7F91AF] focus:border-[#D9FF57]/24 focus:bg-[#102A4F]"
              />
            </div>
            <span className="rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
              {paymentContext.project.pressure}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {filteredProjects.map((project) => {
            const isSelected = project.id === projectId;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onProjectChange(project.id)}
                className={`rounded-[20px] border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                  isSelected ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.075]" : "border-white/8 bg-[#102A4F]/38 hover:bg-white/[0.055]"
                }`}
              >
                <p className="text-[14px] font-semibold text-white">{project.name}</p>
                <p className="mt-2 text-[12px] leading-[1.45] text-[#AFC0DD]">{project.state}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#D9FF57]/12 bg-[#D9FF57]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[#E7F5C3]">{project.commitment}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-[#D7E3F8]">Runway {project.runwayAfter}</span>
                </div>
              </button>
            );
          })}
        </div>
        {filteredProjects.length === 0 ? (
          <div className="mt-4 rounded-[18px] border border-white/8 bg-[#102A4F]/38 px-4 py-3">
            <p className="text-[12px] font-medium text-[#AFC0DD]">No project matches that search.</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Select Supplier</p>
            <p className="mt-1 text-[12px] text-[#AFC0DD]">Switch recipient and see linked obligation readiness.</p>
          </div>
          <div className="relative w-full sm:w-[230px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9FB3D9]" strokeWidth={2} />
            <input
              value={supplierSearch}
              onChange={(event) => onSupplierSearchChange(event.target.value)}
              placeholder="Search suppliers"
              className="h-10 w-full rounded-full border border-white/10 bg-[#102A4F]/70 pl-9 pr-3 text-[12px] text-white outline-none transition placeholder:text-[#7F91AF] focus:border-[#D9FF57]/24 focus:bg-[#102A4F]"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {filteredSuppliers.map((supplier) => {
            const isSelected = supplier.id === supplierId;
            return (
              <button
                key={supplier.id}
                type="button"
                onClick={() => onSupplierChange(supplier.id)}
                className={`rounded-[20px] border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                  isSelected ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.075]" : "border-white/8 bg-[#102A4F]/38 hover:bg-white/[0.055]"
                }`}
              >
                <p className="text-[14px] font-semibold text-white">{supplier.name}</p>
                <p className="mt-1 text-[12px] text-[#AFC0DD]">{supplier.role}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-[#D7E3F8]">{supplier.status}</span>
                  <span className="rounded-full border border-[#D9FF57]/12 bg-[#D9FF57]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[#E7F5C3]">{supplier.obligation}</span>
                </div>
              </button>
            );
          })}
        </div>
        {filteredSuppliers.length === 0 ? (
          <div className="mt-4 rounded-[18px] border border-white/8 bg-[#102A4F]/38 px-4 py-3">
            <p className="text-[12px] font-medium text-[#AFC0DD]">No supplier obligation matches this project search.</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[26px] border border-white/9 bg-white/[0.035] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Choose Rail</p>
            <p className="mt-1 text-[12px] text-[#AFC0DD]">Coordinate the payout route before confirmation.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D7E3F8]">
            {paymentContext.rail.timing}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {paymentRails.map((rail) => {
            const RailIcon = rail.icon;
            const isSelected = rail.id === railId;
            return (
              <button
                key={rail.id}
                type="button"
                onClick={() => onRailChange(rail.id)}
                className={`rounded-[20px] border p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                  isSelected ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.075]" : "border-white/8 bg-[#102A4F]/38 hover:bg-white/[0.055]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <RailIcon className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                    rail.id === "stablecoin" ? "border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] text-[#EAFFB4]" : "border-white/10 bg-white/[0.05] text-[#AFC0DD]"
                  }`}>
                    {rail.status}
                  </span>
                </div>
                <p className="mt-3 text-[14px] font-semibold text-white">{rail.label}</p>
                <p className="mt-1 text-[12px] leading-[1.45] text-[#AFC0DD]">{rail.detail}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SettlementAssetSelector({
  selected,
  onSelect,
}: {
  selected: SettlementAsset;
  onSelect: (asset: SettlementAsset) => void;
}) {
  const selectedAsset = settlementAssets.find((asset) => asset.id === selected) ?? settlementAssets[0];

  return (
    <section className="mt-6 rounded-[24px] border border-white/9 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Settlement Asset</p>
          <p className="mt-2 max-w-[520px] text-[13px] leading-[1.6] text-[#AFC0DD]">
            Zila keeps asset choice underneath the payout workflow and optimizes for the operating corridor.
          </p>
        </div>
        <span className="rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
          {selected === "auto" ? "Recommended" : "Manual route"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {settlementAssets.map((asset) => {
          const isSelected = asset.id === selected;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset.id)}
              className={`rounded-[18px] border px-3 py-3 text-left transition duration-300 hover:-translate-y-0.5 ${
                isSelected
                  ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.075] text-[#F1FFB8] shadow-[0_0_18px_rgba(217,255,87,0.07),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-white/8 bg-[#102A4F]/38 text-[#D7E3F8] hover:border-white/14 hover:bg-white/[0.055]"
              }`}
            >
              <span className="block text-[13px] font-semibold">{asset.label}</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB3D9]">{asset.description}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[16px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.045] px-4 py-3">
        <p className="text-[11px] font-medium leading-[1.55] text-[#E7F5C3]">{selectedAsset.recommendation}</p>
      </div>
    </section>
  );
}

function ExecutionLifecycle({
  executionState,
  settlementMessage,
}: {
  executionState: ExecutionState;
  settlementMessage: string;
}) {
  const activeIndex = payoutLifecycle.findIndex((item) => item.state === executionState);
  const visibleActiveIndex = activeIndex >= 0 ? activeIndex : -1;

  return (
    <section className="mt-6 rounded-[24px] border border-white/9 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.08),transparent_28%),rgba(7,29,56,0.35)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7EE7F6]">Payout Lifecycle</p>
          <p className="mt-2 text-[13px] leading-[1.55] text-[#C9D4F5]">{settlementMessage}</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
          executionState === "failed"
            ? "border-amber-200/22 bg-amber-300/[0.09] text-[#FFE8B0]"
            : "border-[#D9FF57]/16 bg-[#D9FF57]/[0.075] text-[#EAFFB4]"
        }`}>
          <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
          {executionState === "idle" ? "Ready" : executionState === "failed" ? "Needs review" : "Live"}
        </span>
      </div>

      <div className="relative mt-5 space-y-2 before:absolute before:bottom-4 before:left-[0.45rem] before:top-4 before:w-px before:bg-[linear-gradient(180deg,rgba(217,255,87,0.30),rgba(103,232,249,0.14),rgba(217,255,87,0))]">
        {payoutLifecycle.map((item, index) => {
          const isComplete = visibleActiveIndex > index || executionState === "complete";
          const isActive = visibleActiveIndex === index && executionState !== "complete";
          const isPending = visibleActiveIndex < index && executionState !== "complete";

          return (
            <div key={item.state} className={`relative grid grid-cols-[1rem_1fr] gap-3 rounded-[16px] px-1 py-2 transition duration-500 ${
              isActive ? "translate-x-0.5" : ""
            }`}>
              <span className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ${
                isActive
                  ? "zila-live-dot bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.38)]"
                  : isComplete
                    ? "bg-[#D9FF57]"
                    : "bg-[#506A8E]"
              }`} />
              <div className={`rounded-[15px] border px-3 py-2.5 transition duration-500 ${
                isActive
                  ? "border-[#D9FF57]/20 bg-[#D9FF57]/[0.065]"
                  : isComplete
                    ? "border-white/8 bg-white/[0.035]"
                    : isPending
                      ? "border-white/6 bg-white/[0.02] opacity-60"
                      : "border-white/8 bg-white/[0.035]"
              }`}>
                <p className="text-[12px] font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-[11px] leading-[1.45] text-[#AFC0DD]">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ConfirmPayoutScreen({
  isConfirming,
  settlementAsset,
  settlementAssetLabel,
  selectedSettlementAsset,
  onSelectSettlementAsset,
  paymentContext,
  executionState,
  settlementMessage,
  activePayload,
  onBack,
  onConfirm,
}: {
  isConfirming: boolean;
  settlementAsset: (typeof settlementAssets)[number];
  settlementAssetLabel: string;
  selectedSettlementAsset: SettlementAsset;
  onSelectSettlementAsset: (asset: SettlementAsset) => void;
  paymentContext: ReturnType<typeof buildPaymentContext>;
  executionState: ExecutionState;
  settlementMessage: string;
  activePayload: XamanPayloadRequest | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(16,42,79,0.76),rgba(9,25,50,0.86))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] transition duration-500">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Final Check</p>
            <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.02em] text-white">Confirm operational payout</h2>
            <p className="mt-2 max-w-[520px] text-[13px] leading-[1.65] text-[#AFC0DD]">
              Review the business outcome before Zila sends the payout and attaches proof.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] px-3 py-2 text-[11px] font-semibold text-[#F1FFB8]">
            <span className="zila-live-dot h-2 w-2 rounded-full bg-[#D9FF57]" />
            Ready to Send
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { label: "Recipient", value: paymentContext.supplier.name },
            { label: "Project", value: paymentContext.project.name },
            { label: "Destination account", value: paymentContext.supplier.name },
            { label: "Payout amount", value: paymentContext.amountLabel },
            { label: "Settlement asset", value: settlementAssetLabel },
            { label: "Settlement rail", value: paymentContext.rail.label },
            { label: "Reserve impact", value: paymentContext.project.reserveAfter },
            { label: "Estimated arrival", value: paymentContext.rail.timing },
            { label: "Proof status", value: "Attaches automatically" },
            { label: "Fees", value: `${paymentContext.fee} estimated` },
            { label: "Operational record", value: `${paymentContext.project.name} linked` },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border border-white/9 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">{item.label}</p>
              <p className="mt-2 text-[14px] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <SettlementAssetSelector selected={selectedSettlementAsset} onSelect={onSelectSettlementAsset} />

        <div className="mt-6 rounded-[24px] border border-[#D9FF57]/12 bg-[#D9FF57]/[0.045] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#D9FF57]">Operational Consequence Preview</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {paymentContext.consequence.map((item) => (
              <div key={item.label} className="rounded-[16px] border border-white/8 bg-[#071D38]/35 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AFC0DD]">{item.label}</p>
                <p className="mt-1 text-[12px] font-semibold leading-[1.4] text-[#E7F5C3]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#D9FF57]/12 bg-[#D9FF57]/[0.045] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#D9FF57]">Operational Verification</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {confirmationChecks.map((check) => (
              <div key={check} className="flex items-center gap-2 rounded-[16px] border border-white/8 bg-[#071D38]/35 px-3 py-3">
                <BadgeCheck className="h-4 w-4 shrink-0 text-[#D9FF57]" strokeWidth={2} />
                <p className="text-[12px] font-medium text-[#E7F5C3]">{check}</p>
              </div>
            ))}
          </div>
        </div>

        <ExecutionLifecycle executionState={executionState} settlementMessage={settlementMessage} />
      </section>

      <aside className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(28,73,121,0.64),rgba(9,25,50,0.84))] p-6 shadow-[0_24px_54px_rgba(13,35,68,0.20),inset_0_1px_0_rgba(255,255,255,0.10)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Execution Readiness</p>
        <div className="mt-5 space-y-3">
          {[
            `${paymentContext.supplier.name} is ${paymentContext.supplier.status.toLowerCase()}.`,
            settlementAsset.recommendation,
            `${paymentContext.project.name} reserve remains at ${paymentContext.project.reserveAfter}.`,
            "Proof record will include project, reason, and settlement.",
          ].map((item) => (
            <div key={item} className="flex gap-2 rounded-[14px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.055] px-3 py-2.5">
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D9FF57]" strokeWidth={2} />
              <p className="text-[11px] leading-[1.5] text-[#E7F5C3]">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">What Happens Next</p>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#EAF1FF]">
            Zila sends the payout, secures settlement, updates reserve state, and creates the operational proof record.
          </p>
        </div>

        {activePayload ? (
          <div className="mt-5 rounded-[22px] border border-[#D9FF57]/14 bg-[#D9FF57]/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D9FF57]">Xaman Confirmation</p>
                <p className="mt-1 text-[12px] leading-[1.5] text-[#E7F5C3]">Approve the payout request to complete settlement.</p>
              </div>
              <span className="zila-live-dot h-2 w-2 rounded-full bg-[#D9FF57]" />
            </div>
            <Image
              src={activePayload.qrPng}
              alt="Xaman payout confirmation QR code"
              width={132}
              height={132}
              unoptimized
              className="mx-auto mt-4 rounded-[18px] border border-white/18 bg-white p-2"
            />
            <Link
              href={activePayload.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#102A4F] transition hover:-translate-y-0.5"
            >
              Open Xaman
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming || !paymentContext.railReady}
          className="zila-operational-action-soft mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[14px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
        >
          {isConfirming ? (
            <>
              <span className="zila-live-dot h-2 w-2 rounded-full bg-[#102A4F]" />
              Verifying payout checks
            </>
          ) : (
            <>
              {paymentContext.railReady ? "Confirm & Send Payout" : "Stablecoin rail required to send now"}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isConfirming}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-5 text-[13px] font-semibold text-[#DCE8FF] transition hover:bg-white/[0.075] disabled:cursor-wait disabled:opacity-55"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Review Impact
        </button>
      </aside>
    </div>
  );
}

function ProofAttachedScreen({
  settlementAssetLabel,
  paymentContext,
  txReference,
  onBack,
}: {
  settlementAssetLabel: string;
  paymentContext: ReturnType<typeof buildPaymentContext>;
  txReference: string;
  onBack: () => void;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-[30px] border border-[#D9FF57]/16 bg-[linear-gradient(180deg,rgba(217,255,87,0.09),rgba(16,42,79,0.72)_34%,rgba(9,25,50,0.86))] p-6 shadow-[0_24px_64px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.10)]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#D9FF57]/22 bg-[#D9FF57]/12 text-[#D9FF57] shadow-[0_0_30px_rgba(217,255,87,0.16)]">
              <BadgeCheck className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.02em] text-white">Payment complete. Proof attached.</h2>
            <p className="mt-2 max-w-[560px] text-[13px] leading-[1.7] text-[#C9D4F5]">
              {paymentContext.amountLabel} moved to {paymentContext.supplier.name}. Reserve state is updated, and the operational record is ready for review.
            </p>
          </div>
          <span className="rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F1FFB8]">
            Verified
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
            { label: "Proof reference", value: "ZILA-PROOF-24-1048" },
            { label: "Settlement", value: paymentContext.rail.label },
            { label: "Settlement asset", value: settlementAssetLabel },
            { label: "Transaction reference", value: txReference },
            { label: "Payout", value: `${paymentContext.amountLabel} to supplier` },
            { label: "Reserve", value: paymentContext.project.reserveAfter },
            { label: "Record", value: "Verified" },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border border-white/9 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">{item.label}</p>
              <p className="mt-2 text-[14px] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-[24px] border border-white/10 bg-[#071D38]/35 p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7EE7F6]">Operational Timeline</p>
          <div className="mt-5 space-y-4">
            {[
              { time: "Just now", label: "Payment confirmed", detail: `${paymentContext.amountLabel} supplier payout approved` },
              { time: "Just now", label: "Settlement secured", detail: `${paymentContext.rail.label} confirmed` },
              { time: "Just now", label: "Operational record verified", detail: `${paymentContext.project.name}, reserve, and supplier linked` },
              { time: "Just now", label: "Reserve updated", detail: `${paymentContext.project.reserveAfter} remains after payout` },
              { time: "Just now", label: "Operational memory updated", detail: `Proof reference ${txReference} attached` },
            ].map((event) => (
              <div key={`${event.time}-${event.label}`} className="relative border-l border-white/10 pl-5">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#D9FF57] shadow-[0_0_16px_rgba(217,255,87,0.45)]" />
                <p className="text-[11px] font-semibold text-[#9FB3D9]">{event.time}</p>
                <p className="mt-1 text-[14px] font-semibold text-white">{event.label}</p>
                <p className="mt-1 text-[12px] leading-[1.5] text-[#AFC0DD]">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(28,73,121,0.64),rgba(9,25,50,0.84))] p-6 shadow-[0_24px_54px_rgba(13,35,68,0.20),inset_0_1px_0_rgba(255,255,255,0.10)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Payout Summary</p>
        <div className="mt-5 space-y-3">
          {[
            { label: "Recipient", value: paymentContext.supplier.name },
            { label: "Amount", value: paymentContext.amountLabel },
            { label: "Settlement asset", value: settlementAssetLabel },
            { label: "Payout", value: "Completed" },
            { label: "Reserve", value: paymentContext.project.reserveAfter },
            { label: "Record", value: "Verified" },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
              <p className="text-[12px] text-[#AFC0DD]">{item.label}</p>
              <p className="text-right text-[13px] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <Link
          href="/payments"
          className="zila-operational-action-soft mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[14px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
        >
          Back to Payments
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </Link>

        <button
          type="button"
          onClick={onBack}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-5 text-[13px] font-semibold text-[#DCE8FF] transition hover:bg-white/[0.075]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Confirmation
        </button>
      </aside>
    </div>
  );
}
