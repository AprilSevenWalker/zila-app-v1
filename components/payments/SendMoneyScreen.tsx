"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { clearPaymentDraft, getDefaultPaymentDraft, getPaymentDraft, savePaymentDraft } from "@/lib/paymentDraftStore";
import { FlowBackNav } from "@/components/ui/FlowBackNav";
import { getMoneySourceState, saveMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";
import { connectOperatingBalance } from "@/lib/moneyMovementStore";
import {
  getProtectedMoneySummary,
  applyReserveForPayment,
  recordPaymentReserveRecalculation,
  subscribeToProtectedMoney,
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
import { createOperationalProofRecord, saveOperationalProofRecord } from "@/lib/proof";
import { OperationalWalletStatus } from "@/components/ui/OperationalWalletStatus";
import { getProjects } from "@/data/projects";
import { mergeOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";

type FlowState = "details" | "review" | "connecting-wallet" | "awaiting-signature" | "signing" | "processing" | "success" | "failed";

interface XamanPayloadRequest {
  kind: "connect" | "payment";
  uuid: string;
  qrUrl: string;
  deepLink: string;
  websocketStatusUrl: string;
}

interface XamanConnectionResponse {
  uuid?: string;
  id?: string;
  qr_png?: string;
  qrPng?: string;
  deeplink?: string;
  url?: string;
  websocket_status?: string;
  websocketStatus?: string;
  error?: string;
}

interface PayloadStatusResponse {
  signed: boolean;
  rejected: boolean;
  txHash: string | null;
  account?: string | null;
  validated?: boolean;
  ledgerIndex?: number;
  timestamp?: string;
  error?: string;
}

interface XamanPayloadStatusResponse {
  meta: {
    signed: boolean;
  };
  response: {
    account: string | null;
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
  destinationAddress: string;
  safeBefore: number;
  safeAfter: number;
  protectedAfter: number;
  walletAddress: string;
}

interface PaymentSuccessRecord extends PaymentMovementRecord {
  ledgerIndex?: number;
  validated?: boolean;
  settlementRail: string;
  reserveAfterLabel: string;
}

type PayoutRail = "Stablecoin" | "Bank transfer" | "Mobile money";
type PayoutCurrency = "USD" | "KES" | "USDT" | "USDC" | "RLUSD" | "XRP";
type PayoutMode = "manual" | "existing";

interface SupplierProfile {
  id: string;
  supplierName: string;
  companyName: string;
  preferredRail: PayoutRail;
  currency: PayoutCurrency;
  walletAddress: string;
  bankPlaceholder: string;
  mobileMoneyPlaceholder: string;
  notes: string;
  linkedProjects: string[];
  historySummary: string;
}

const pendingPaymentStorageKey = "zila-xaman-operational-payment";
const supplierStorageKey = "zila-operational-suppliers";

const reasons = ["Supplier payment", "Contractor payment", "Send project funds", "Move operational funds"];
const payoutTimings = ["Ready today", "Due this week", "After invoice approval", "Milestone release", "Schedule manually"];
const milestones = ["Foundation phase", "Delivery window", "Production milestone", "Final supplier release", "No linked milestone"];
const payoutCurrencies: PayoutCurrency[] = ["USD", "KES", "USDT", "USDC", "RLUSD", "XRP"];
const defaultProjectOption = "General operations";
const defaultDestinationAddress = "";
const reserveOptions = [
  { id: "recommend", name: "Let Zila recommend", amount: 24220, explanation: "Zila suggests the safest source based on reserves and payout size." },
  { id: "supplier", name: "Supplier reserve", amount: 4300, explanation: "Money already set aside for supplier and vendor payouts." },
  { id: "payroll", name: "Payroll reserve", amount: 7200, explanation: "Protected money for staff, contractors, and payroll timing." },
  { id: "operations", name: "Operations buffer", amount: 8600, explanation: "Flexible operating money for day-to-day project movement." },
  { id: "safety", name: "Safety net", amount: 4100, explanation: "Backup funds for unexpected pressure before money moves." },
  { id: "available", name: "Available operating balance", amount: 36100, explanation: "Unprotected operating funds available for general payouts." },
];
const emptySupplierForm: Omit<SupplierProfile, "id" | "historySummary"> = {
  supplierName: "",
  companyName: "",
  preferredRail: "Stablecoin",
  currency: "USDT",
  walletAddress: "",
  bankPlaceholder: "",
  mobileMoneyPlaceholder: "",
  notes: "",
  linkedProjects: [],
};
const initialSuppliers: SupplierProfile[] = [
  {
    id: "northline",
    supplierName: "Northline Suppliers",
    companyName: "Northline Materials Ltd",
    preferredRail: "Stablecoin",
    currency: "USDT",
    walletAddress: "",
    bankPlaceholder: "Bank payout details can be added when bank rails are ready.",
    mobileMoneyPlaceholder: "Mobile money payout details can be added when mobile money is ready.",
    notes: "Primary materials supplier. Usually paid before Friday delivery windows.",
    linkedProjects: ["Project Horizon", "Atlas Project"],
    historySummary: "4 payouts recorded",
  },
  {
    id: "mara-contractors",
    supplierName: "Mara Contractors",
    companyName: "Mara Contractor Studio",
    preferredRail: "Stablecoin",
    currency: "USDC",
    walletAddress: "",
    bankPlaceholder: "Bank payout details pending.",
    mobileMoneyPlaceholder: "Mobile payout details pending.",
    notes: "Contractor payout for milestone-based production work.",
    linkedProjects: ["Atlas Project"],
    historySummary: "2 payouts recorded",
  },
  {
    id: "atlas-logistics",
    supplierName: "Atlas Logistics",
    companyName: "Atlas Regional Logistics",
    preferredRail: "Mobile money",
    currency: "KES",
    walletAddress: "",
    bankPlaceholder: "Bank payout details pending.",
    mobileMoneyPlaceholder: "M-Pesa payout details coming soon.",
    notes: "Regional delivery and transport support.",
    linkedProjects: ["Northstar Project"],
    historySummary: "Payment rail pending",
  },
];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatPayoutAmount(amount: number, currency: PayoutCurrency) {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: currency === "XRP" ? 6 : 0 })} ${currency}`;
}

const suggestedPayouts = [
  {
    id: "steel-friday",
    title: "Steel supplier due Friday",
    supplierId: "northline",
    projectName: "Project Horizon",
    amount: "4300",
    currency: "USDT" as PayoutCurrency,
    rail: "Stablecoin" as PayoutRail,
    reason: "Supplier payment",
    timing: "Due this week",
    milestone: "Foundation phase",
    note: "Materials release before Friday delivery window.",
  },
  {
    id: "contractor-pending",
    title: "Contractor payout pending",
    supplierId: "mara-contractors",
    projectName: "Atlas Project",
    amount: "1800",
    currency: "USDC" as PayoutCurrency,
    rail: "Stablecoin" as PayoutRail,
    reason: "Contractor payment",
    timing: "Milestone release",
    milestone: "Production milestone",
    note: "Pending milestone payment for approved work.",
  },
  {
    id: "logistics-deposit",
    title: "Logistics deposit approaching",
    supplierId: "atlas-logistics",
    projectName: "Northstar Project",
    amount: "62000",
    currency: "KES" as PayoutCurrency,
    rail: "Mobile money" as PayoutRail,
    reason: "Supplier payment",
    timing: "After invoice approval",
    milestone: "Delivery window",
    note: "Mobile money route coming soon; keep the obligation visible.",
  },
];


function formatTime(dateIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateIso));
}

function looksLikeXrplAddress(address: string) {
  const trimmed = address.trim();
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(trimmed);
}

function isDraftReadyForReview(draft: ReturnType<typeof getPaymentDraft>) {
  return Boolean(
    draft.recipientName?.trim()
      && draft.destinationAddress?.trim()
      && draft.amountValue > 0
      && draft.currency
      && draft.projectName
      && draft.paymentRail,
  );
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="mt-2 block text-[12px] font-medium text-[#FFE8B0]">{message}</span>;
}

function buildRecommendation(input: {
  amount: number;
  safeBefore: number;
  safeAfter: number;
  selectedReserve?: ProtectedReserve;
  projectName: string;
}) {
  if (input.selectedReserve && input.amount <= input.selectedReserve.amount) {
    return `Zila recommends using ${input.selectedReserve.name} for this payout. Protected reserves remain accounted for.`;
  }

  if (input.safeAfter <= 0) {
    return "Coordination needed before approval. This payout should wait for reserve review or incoming funds.";
  }

  if (input.amount > input.safeBefore * 0.6) {
    return `Zila recommends a reserve-safe payout route so ${input.projectName} keeps enough liquidity after payment.`;
  }

  if (input.safeAfter < 10000) {
    return "Timing sensitive. Approve when the next incoming payment is clear or use a protected reserve.";
  }

  return "Zila recommends stablecoin settlement for this payout because it arrives faster and preserves project liquidity.";
}

function riskLevel(safeAfter: number, amount: number, safeBefore: number) {
  if (safeAfter <= 0 || amount > safeBefore) {
    return { label: "Coordination needed", tone: "border-rose-200/24 bg-rose-300/[0.10] text-[#FFD6DA]" };
  }

  if (safeAfter < 10000 || amount > safeBefore * 0.6) {
    return { label: "Timing sensitive", tone: "border-amber-200/24 bg-amber-300/[0.10] text-[#FFE8B0]" };
  }

  return { label: "Ready to approve", tone: "border-[#D9FF57]/24 bg-[#D9FF57]/10 text-[#F1FFB8]" };
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

function getStoredSuppliers() {
  if (typeof window === "undefined") {
    return initialSuppliers;
  }

  const raw = window.localStorage.getItem(supplierStorageKey);
  if (!raw) {
    return initialSuppliers;
  }

  try {
    const parsed = JSON.parse(raw) as SupplierProfile[];
    return parsed.length ? parsed : initialSuppliers;
  } catch {
    return initialSuppliers;
  }
}

function storeSuppliers(suppliers: SupplierProfile[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(supplierStorageKey, JSON.stringify(suppliers));
}

export function SendMoneyScreen() {
  const searchParams = useSearchParams();
  const [visibleProjects, setVisibleProjects] = useState(() => mergeOperationalProjects(getProjects()));
  const projectOptions = useMemo(
    () => [defaultProjectOption, ...visibleProjects.map((project) => project.name)],
    [visibleProjects],
  );
  const [draft, setDraft] = useState(getDefaultPaymentDraft);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [moneySource, setMoneySource] = useState(getMoneySourceState);
  const [summary, setSummary] = useState(getProtectedMoneySummary);
  const [suppliers, setSuppliers] = useState(getStoredSuppliers);
  const [payoutMode, setPayoutMode] = useState<PayoutMode>("manual");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [recipient, setRecipient] = useState(draft.recipientName || "");
  const [projectName, setProjectName] = useState(draft.projectName || defaultProjectOption);
  const [sourceId, setSourceId] = useState(draft.reserveSourceId || "recommend");
  const [amount, setAmount] = useState(draft.amountValue ? String(draft.amountValue) : "");
  const [reason, setReason] = useState(draft.paymentType || reasons[0]);
  const [payoutTiming, setPayoutTiming] = useState(payoutTimings[0]);
  const [linkedMilestone, setLinkedMilestone] = useState(draft.milestone || milestones[0]);
  const [payoutNotes, setPayoutNotes] = useState(draft.notes || "");
  const [payoutCurrency, setPayoutCurrency] = useState<PayoutCurrency>((draft.currency as PayoutCurrency) || "XRP");
  const [preferredRail, setPreferredRail] = useState<PayoutRail>((draft.paymentRail as PayoutRail) || "Stablecoin");
  const [destinationAddress, setDestinationAddress] = useState(draft.destinationAddress || defaultDestinationAddress);
  const [flowState, setFlowState] = useState<FlowState>(() => (isDraftReadyForReview(draft) ? "review" : "details"));
  const [paymentRecord, setPaymentRecord] = useState<PaymentSuccessRecord | null>(null);
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [copiedTxHash, setCopiedTxHash] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedDraft = getPaymentDraft();

    setDraft(storedDraft);
    setRecipient(storedDraft.recipientName || "");
    setProjectName(storedDraft.projectName || defaultProjectOption);
    setSourceId(storedDraft.reserveSourceId || "recommend");
    setAmount(storedDraft.amountValue ? String(storedDraft.amountValue) : "");
    setReason(storedDraft.paymentType || reasons[0]);
    setLinkedMilestone(storedDraft.milestone || milestones[0]);
    setPayoutNotes(storedDraft.notes || "");
    setPayoutCurrency((storedDraft.currency as PayoutCurrency) || "XRP");
    setPreferredRail((storedDraft.paymentRail as PayoutRail) || "Stablecoin");
    setDestinationAddress(storedDraft.destinationAddress || defaultDestinationAddress);
    setFlowState(isDraftReadyForReview(storedDraft) ? "review" : "details");
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    const update = () => setSummary(getProtectedMoneySummary());

    update();
    return subscribeToProtectedMoney(update);
  }, []);

  useEffect(() => {
    const update = () => setVisibleProjects(mergeOperationalProjects(getProjects()));

    update();
    return subscribeToOperationalProjects(update);
  }, []);

  useEffect(() => {
    const update = () => setMoneySource(getMoneySourceState());

    update();
    return subscribeToMoneySource(update);
  }, []);

  useEffect(() => {
    storeSuppliers(suppliers);
  }, [suppliers]);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId);

  const amountValue = useMemo(() => {
    const parsed = Number(amount.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [amount]);

  const selectedReserve = summary.reserves.find((reserve) => reserve.id === sourceId);
  const selectedReserveOption = reserveOptions.find((reserve) => reserve.id === sourceId) ?? reserveOptions[0];
  const sourceLabel = selectedReserve?.name ?? selectedReserveOption.name;
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
  const suggestedTiming = payoutTiming === "Ready today" && safeAfter < 10000 ? "After next incoming payment" : payoutTiming;
  const estimatedArrival = preferredRail === "Stablecoin" ? "Expected to arrive within 1 minute" : "Coming soon";
  const runwayRemaining = safeAfter < 10000 ? "Attention needed soon" : "This payout keeps runway healthy";
  const proofStatus = preferredRail === "Stablecoin" ? "This payment will appear in project proof history" : "Proof history will be ready when this rail is available";
  const payoutMethodLabel = destinationAddress.trim()
    ? `Linked payout method ${shortenWalletAddress(destinationAddress)}`
    : "Recipient information can be added before approval";
  const currencySupported = payoutCurrency === "XRP";
  const railSupported = preferredRail === "Stablecoin";
  const canApproveInXaman = currencySupported && railSupported;
  const walletConnected = moneySource.connected && Boolean(moneySource.walletAddress);
  const isConnectingWallet = flowState === "connecting-wallet" || activePayload?.kind === "connect";
  const isAwaitingXamanApproval = activePayload?.kind === "payment" && (flowState === "awaiting-signature" || flowState === "signing");
  const approvalStatusLabel = (() => {
    if (flowState === "success") {
      return "Payment approved";
    }
    if (flowState === "failed") {
      return "Payment failed or cancelled";
    }
    if (isAwaitingXamanApproval) {
      return "Awaiting approval in Xaman";
    }
    if (isConnectingWallet) {
      return "Connecting wallet";
    }
    if (!walletConnected) {
      return "Wallet not connected";
    }
    if (canApproveInXaman) {
      return "Payment ready for Xaman";
    }
    return "Wallet connected";
  })();
  const approvalStatusDetail = (() => {
    if (!walletConnected) {
      return "Connect Xaman here, then approve this payout without leaving Payments.";
    }
    if (isAwaitingXamanApproval) {
      return "Scan the QR code or open Xaman to approve this payout.";
    }
    if (flowState === "success") {
      return "Zila recorded proof and updated operational history.";
    }
    if (flowState === "failed") {
      return paymentMessage ?? "Review the details and try again.";
    }
    return moneySource.walletAddressShort ? `Connected wallet ${moneySource.walletAddressShort}` : "Connected wallet ready for approval.";
  })();
  const approvalButtonLabel = !walletConnected
    ? isConnectingWallet
      ? "Connecting Xaman"
      : "Connect Xaman Wallet"
    : flowState === "processing"
      ? "Preparing Xaman..."
      : "Approve in Xaman";
  const supplierProjectHint = selectedSupplier?.linkedProjects.includes(projectName)
    ? `${selectedSupplier.supplierName} is already linked to ${projectName}.`
    : `${projectName} selected. Zila will use this context without locking payout details.`;
  const projectSuggestions = suggestedPayouts.filter((suggestion) => projectName === "General operations" || suggestion.projectName === projectName);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    savePaymentDraft({
      projectName,
      amountValue,
      paymentType: reason,
      recipientName: recipient,
      destinationAddress,
      currency: payoutCurrency,
      paymentRail: preferredRail,
      notes: payoutNotes,
      milestone: linkedMilestone,
      reserveSourceId: sourceId,
      reserveSourceLabel: sourceLabel,
      sourceLabel,
    });
  }, [amountValue, destinationAddress, draftLoaded, linkedMilestone, payoutCurrency, payoutNotes, preferredRail, projectName, reason, recipient, sourceId, sourceLabel]);

  const finalizeWalletConnection = async (payloadId: string, options: { allowPending?: boolean } = {}) => {
    const response = await fetch(`/api/xaman/payload/${payloadId}`, { cache: "no-store" });
    const body = (await response.json()) as XamanPayloadStatusResponse;

    if (!response.ok) {
      throw new Error(body.error || "Unable to verify Xaman connection.");
    }

    if (!body.meta.signed || !body.response.account) {
      if (options.allowPending) {
        return;
      }

      setFlowState("failed");
      setPaymentMessage("Wallet connection was cancelled.");
      setActivePayload(null);
      return;
    }

    saveMoneySourceState({
      connected: true,
      sourceLabel: "Xaman wallet",
      walletAddress: body.response.account,
      walletAddressShort: shortenWalletAddress(body.response.account),
      status: "ready",
      network: "XRPL Mainnet",
      proofEnabled: true,
    });
    connectOperatingBalance();
    setActivePayload(null);
    setFlowState("review");
    setPaymentMessage("Wallet connected. Payment is ready for Xaman approval.");
  };

  const finalizePayment = async (payloadId: string) => {
    const pending = getPendingPayment();
    const response = await fetch(`/api/payments/status/${payloadId}`, { cache: "no-store" });
    const body = (await response.json()) as PayloadStatusResponse;

    if (!response.ok) {
      throw new Error(body.error || "Unable to verify payment.");
    }

    if (!body.signed || !body.txHash || !pending) {
      clearPendingPayment();
      setFlowState("failed");
      setPaymentMessage(body.rejected ? "Payment was rejected in Xaman." : "Payment was not completed.");
      setActivePayload(null);
      return;
    }

    const createdAtIso = body.timestamp ?? new Date().toISOString();
    const txHash = body.txHash;
    saveMoneySourceState({
      ...getMoneySourceState(),
      connected: true,
      sourceLabel: "Xaman wallet",
      walletAddress: body.account || pending.walletAddress,
      walletAddressShort: shortenWalletAddress(body.account || pending.walletAddress),
      status: "transaction-confirmed",
      network: "XRPL Mainnet",
      proofEnabled: true,
    });
    const movementRecord: PaymentMovementRecord = {
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
    const successRecord: PaymentSuccessRecord = {
      ...movementRecord,
      ledgerIndex: body.ledgerIndex,
      validated: body.validated ?? true,
      settlementRail: "XRPL settlement through Xaman",
      reserveAfterLabel: formatCurrency(pending.protectedAfter),
    };

    savePaymentMovement(movementRecord);
    if (pending.reserveId) {
      applyReserveForPayment({
        reserveId: pending.reserveId,
        amount: pending.amountValue,
        paymentLabel: pending.reason,
        projectName: pending.projectName,
        recipientName: pending.recipient,
      });
    }
    recordPaymentReserveRecalculation({
      amount: pending.amountValue,
      amountLabel: pending.amountLabel,
      projectName: pending.projectName,
      recipientName: pending.recipient,
      txHash,
      reserveAfterLabel: formatCurrency(pending.protectedAfter),
    });
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
      reserveAfter: formatCurrency(pending.protectedAfter),
      obligationStatus: "Settled",
      walletAddress: body.account || pending.walletAddress,
      network: "XRPL Mainnet",
      createdAtIso,
    });
    saveProofTransaction({
      id: `outgoing-payment-${Date.now()}`,
      walletAddress: body.account || pending.walletAddress,
      walletAddressShort: shortenWalletAddress(body.account || pending.walletAddress),
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
    saveOperationalProofRecord(createOperationalProofRecord({
      projectName: pending.projectName,
      supplier: pending.recipient,
      paymentAmount: pending.amountLabel,
      paymentRail: "XRPL settlement through Xaman",
      xrplTransactionHash: txHash,
      ledgerIndex: body.ledgerIndex,
      operationalCategory: pending.reason,
      reserveImpact: `Protected reserves updated to ${formatCurrency(pending.protectedAfter)}.`,
      safeToSpendImpact: `Safe to Spend changed from ${formatCurrency(pending.safeBefore)} to ${formatCurrency(pending.safeAfter)}.`,
      timestamp: createdAtIso,
    }));
    clearPaymentDraft();
    clearPendingPayment();
    setPaymentRecord(successRecord);
    setActivePayload(null);
    setPaymentMessage("Payment confirmed and proof record updated.");
    setFlowState("success");
  };

  const handleCopyTxHash = async () => {
    if (!paymentRecord?.txHash) {
      return;
    }

    await navigator.clipboard.writeText(paymentRecord.txHash);
    setCopiedTxHash(true);
    window.setTimeout(() => setCopiedTxHash(false), 1400);
  };

  useEffect(() => {
    const payloadId = searchParams.get("payload");

    if (!payloadId) {
      return;
    }

    const pending = getPendingPayment();
    if (pending?.payloadId === payloadId) {
      setFlowState("processing");
      void finalizePayment(payloadId).catch((error) => {
        setFlowState("failed");
        setPaymentMessage(error instanceof Error ? error.message : "Unable to confirm payment.");
      });
      return;
    }

    setFlowState("connecting-wallet");
    void finalizeWalletConnection(payloadId).catch((error) => {
      setFlowState("failed");
      setPaymentMessage(error instanceof Error ? error.message : "Unable to complete wallet connection.");
    });
  }, [searchParams]);

  useEffect(() => {
    if (!activePayload) {
      return;
    }

    const websocket = new WebSocket(activePayload.websocketStatusUrl);

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { opened?: boolean; signed?: boolean; dispatched?: boolean; expired?: boolean };

        if (data.opened) {
          if (activePayload.kind === "connect") {
            setFlowState("connecting-wallet");
            setPaymentMessage("Approve the wallet connection in Xaman.");
          } else {
            setFlowState("signing");
            setPaymentMessage("Review the payment in Xaman.");
          }
        }

        if (data.dispatched && activePayload.kind === "payment") {
          setFlowState("processing");
          setPaymentMessage("Payment submitted. Waiting for confirmation.");
        }

        if (data.expired) {
          if (activePayload.kind === "payment") {
            clearPendingPayment();
          }
          setFlowState("failed");
          setPaymentMessage(activePayload.kind === "connect" ? "Wallet connection request expired. Try again." : "Signing request expired. Try again.");
          setActivePayload(null);
        }

        if (typeof data.signed === "boolean") {
          if (!data.signed) {
            if (activePayload.kind === "payment") {
              clearPendingPayment();
            }
            setFlowState("failed");
            setPaymentMessage(activePayload.kind === "connect" ? "Wallet connection was cancelled." : "Payment was cancelled.");
            setActivePayload(null);
            return;
          }

          if (activePayload.kind === "connect") {
            setFlowState("connecting-wallet");
            void finalizeWalletConnection(activePayload.uuid).catch((error) => {
              setFlowState("failed");
              setPaymentMessage(error instanceof Error ? error.message : "Unable to complete wallet connection.");
            });
          } else {
            setFlowState("processing");
            void finalizePayment(activePayload.uuid).catch((error) => {
              setFlowState("failed");
              setPaymentMessage(error instanceof Error ? error.message : "Unable to confirm payment.");
            });
          }
        }
      } catch {
        // Xaman websocket sends keepalive frames that are safe to ignore.
      }
    };

    return () => websocket.close();
  }, [activePayload]);

  const openAddSupplier = () => {
    setEditingSupplierId(null);
    setSupplierForm({
      ...emptySupplierForm,
      linkedProjects: [projectName],
      preferredRail,
      currency: payoutCurrency,
    });
    setSupplierFormOpen(true);
  };

  const openEditSupplier = (supplier: SupplierProfile) => {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      supplierName: supplier.supplierName,
      companyName: supplier.companyName,
      preferredRail: supplier.preferredRail,
      currency: supplier.currency,
      walletAddress: supplier.walletAddress,
      bankPlaceholder: supplier.bankPlaceholder,
      mobileMoneyPlaceholder: supplier.mobileMoneyPlaceholder,
      notes: supplier.notes,
      linkedProjects: supplier.linkedProjects,
    });
    setSupplierFormOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!supplierForm.supplierName.trim()) {
      setPaymentMessage("Add a supplier name before saving.");
      return;
    }

    const profile: SupplierProfile = {
      id: editingSupplierId ?? `supplier-${Date.now()}`,
      supplierName: supplierForm.supplierName.trim(),
      companyName: supplierForm.companyName.trim() || supplierForm.supplierName.trim(),
      preferredRail: supplierForm.preferredRail,
      currency: supplierForm.currency,
      walletAddress: supplierForm.walletAddress.trim(),
      bankPlaceholder: supplierForm.bankPlaceholder.trim() || "Bank payout details can be added later.",
      mobileMoneyPlaceholder: supplierForm.mobileMoneyPlaceholder.trim() || "Mobile money payout details can be added later.",
      notes: supplierForm.notes.trim(),
      linkedProjects: supplierForm.linkedProjects.length ? supplierForm.linkedProjects : [projectName],
      historySummary: editingSupplierId ? selectedSupplier?.historySummary ?? "Reusable supplier profile" : "New supplier profile",
    };

    setSuppliers((current) => {
      if (editingSupplierId) {
        return current.map((supplier) => (supplier.id === editingSupplierId ? profile : supplier));
      }

      return [profile, ...current];
    });
    setSelectedSupplierId(profile.id);
    setRecipient(profile.supplierName);
    setDestinationAddress(profile.walletAddress);
    setSupplierFormOpen(false);
    setPaymentMessage("Supplier saved and ready for future payouts.");
  };

  const applySuggestion = (suggestion: (typeof suggestedPayouts)[number]) => {
    const supplier = suppliers.find((item) => item.id === suggestion.supplierId);

    setPayoutMode("existing");
    if (supplier) {
      setSelectedSupplierId(supplier.id);
      setRecipient(supplier.supplierName);
      setDestinationAddress(supplier.walletAddress);
    }

    setProjectName(suggestion.projectName);
    setAmount(suggestion.amount);
    setPayoutCurrency(suggestion.currency);
    setPreferredRail(suggestion.rail);
    setReason(suggestion.reason);
    setPayoutTiming(suggestion.timing);
    setLinkedMilestone(suggestion.milestone);
    setPayoutNotes(suggestion.note);
    setPaymentMessage("Suggested payout loaded. You can edit every field before approval.");
  };

  const startManualPayout = () => {
    setPayoutMode("manual");
    setSelectedSupplierId("");
    setRecipient("");
    setProjectName(defaultProjectOption);
    setAmount("");
    setPayoutCurrency("XRP");
    setPreferredRail("Stablecoin");
    setReason(reasons[0]);
    setPayoutTiming(payoutTimings[0]);
    setLinkedMilestone(milestones[0]);
    setPayoutNotes("");
    setDestinationAddress("");
    setSourceId("recommend");
    setFlowState("details");
    setPaymentMessage("Manual payout started. Enter the supplier, project, and amount you want to pay.");
  };

  const startExistingPaymentMode = () => {
    setPayoutMode("existing");
    setFlowState("details");
    setPaymentMessage("Choose a payment due below if useful. You can edit every field before approval.");
  };

  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);

    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) {
      return;
    }

    setRecipient(supplier.supplierName);
    setDestinationAddress(supplier.walletAddress);
    setPaymentMessage("Supplier loaded. Amount, project, currency, rail, and reason remain editable.");
  };

  const validatePaymentReadiness = () => {
    const nextErrors: Record<string, string> = {};

    if (!amountValue || flowState === "processing") {
      nextErrors.amount = "Enter the payout amount.";
    }

    if (!recipient.trim()) {
      nextErrors.recipient = "Add a supplier or payee before continuing.";
    }

    if (!destinationAddress.trim()) {
      nextErrors.destination = "Add the recipient wallet address before sending.";
    } else if (!looksLikeXrplAddress(destinationAddress)) {
      nextErrors.destination = "Enter a valid recipient XRP Ledger address before approval.";
    }

    if (!projectName) {
      nextErrors.project = "Choose a project.";
    }

    if (!payoutCurrency) {
      nextErrors.currency = "Choose a currency.";
    }

    if (!preferredRail) {
      nextErrors.rail = "Choose how this payment should move.";
    }

    if (!sourceId) {
      nextErrors.source = "Choose where the money should come from before approval.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFlowState("details");
      return "Complete the required payment details before review.";
    }

    if (moneySource.walletAddress?.trim().toLowerCase() === destinationAddress.trim().toLowerCase()) {
      return "You can’t send this payout to the same wallet connected as the sender. Add a supplier or payee destination.";
    }

    if (!moneySource.connected || !moneySource.walletAddress) {
      return "Connect your Xaman wallet before approving this payment.";
    }

    if (!canApproveInXaman) {
      return `${payoutCurrency} via ${preferredRail} is coming soon. Use XRP through Stablecoin for the first real mainnet test.`;
    }

    return null;
  };

  const handleConnectWalletFromApproval = async () => {
    if (isConnectingWallet) {
      return;
    }

    setFieldErrors({});
    setFlowState("connecting-wallet");
    setPaymentMessage("Preparing Xaman wallet connection...");

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
      const body = (await response.json()) as XamanConnectionResponse;

      if (!response.ok) {
        throw new Error(body.error || "Unable to create Xaman connection.");
      }

      const uuid = body.uuid || body.id;
      const qrUrl = body.qr_png || body.qrPng;
      const deepLink = body.deeplink || body.url;
      const websocketStatusUrl = body.websocket_status || body.websocketStatus;

      if (!uuid || !qrUrl || !deepLink || !websocketStatusUrl) {
        throw new Error("Xaman connection request is missing QR or status details.");
      }

      setActivePayload({
        kind: "connect",
        uuid,
        qrUrl,
        deepLink,
        websocketStatusUrl,
      });
      setPaymentMessage("Scan the QR code or open Xaman to connect your wallet.");
    } catch (error) {
      setFlowState("failed");
      setActivePayload(null);
      setPaymentMessage(error instanceof Error ? error.message : "Unable to connect Xaman wallet.");
    }
  };

  const handleConfirm = async () => {
    const validationMessage = validatePaymentReadiness();
    if (validationMessage) {
      setPaymentMessage(validationMessage);
      if (validationMessage.includes("XRPL address") || validationMessage.includes("wallet address") || validationMessage.includes("money should come from")) {
        setAdvancedOpen(true);
      }
      return;
    }

    setFieldErrors({});

    setFlowState("processing");
    setPaymentMessage("Preparing signing request...");
    saveMoneySourceState({
      ...moneySource,
      status: "payment-pending",
      network: "XRPL Mainnet",
      proofEnabled: true,
    });

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierName: recipient,
          amount: String(amountValue),
          destinationAddress: destinationAddress.trim(),
          memo: [reason, projectName, linkedMilestone, payoutNotes].filter(Boolean).join(" · "),
          projectId: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          projectName,
          senderAddress: moneySource.walletAddress,
          currency: "XRP",
          returnPath: "/payments/send",
        }),
      });
      const body = (await response.json()) as XamanPayloadRequest & { error?: string; detail?: string };

      if (!response.ok) {
        throw new Error(body.error || body.detail || "Unable to prepare signing request.");
      }

      setPendingPayment({
        payloadId: body.uuid,
        amountLabel: formatPayoutAmount(amountValue, payoutCurrency),
        amountValue,
        projectName,
        sourceLabel,
        recipient,
        reason,
        reserveId: selectedReserve?.id,
        destinationAddress: destinationAddress.trim(),
        safeBefore,
        safeAfter,
        protectedAfter,
        walletAddress: moneySource.walletAddress,
      });
      setActivePayload({ ...body, kind: "payment" });
      setFlowState("awaiting-signature");
      setPaymentMessage("Open Xaman to approve this operational payout.");
    } catch (error) {
      setFlowState("failed");
      setPaymentMessage(error instanceof Error ? error.message : "Unable to prepare payment.");
    }
  };

  const handleApprovalPrimaryAction = () => {
    if (!walletConnected) {
      void handleConnectWalletFromApproval();
      return;
    }

    void handleConfirm();
  };

  const handleSaveDraft = () => {
    savePaymentDraft({
      projectName,
      amountValue,
      paymentType: reason,
      recipientName: recipient,
      destinationAddress,
      currency: payoutCurrency,
      paymentRail: preferredRail,
      notes: payoutNotes,
      milestone: linkedMilestone,
      reserveSourceId: sourceId,
      reserveSourceLabel: sourceLabel,
      sourceLabel,
    });
    setPaymentMessage("Draft saved.");
  };

  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.24),transparent_30%),radial-gradient(ellipse_at_84%_8%,rgba(103,232,249,0.18),transparent_28%),linear-gradient(160deg,#12325A_0%,#173D6D_44%,#102A4F_100%)] px-6 pb-16 pt-8 text-white md:-mx-6 md:rounded-[36px] md:px-8 md:pb-10 lg:-mx-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-12 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(103,232,249,0.16),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(109,94,248,0.12),transparent_24%)]" />
      <div className="relative flex flex-1 flex-col">
        <FlowBackNav
          items={[
            { label: "Payments", href: "/payments", primary: true },
            { label: "Dashboard", href: "/home" },
          ]}
        />

        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[620px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#BFEFFF]">Operational payout workspace</p>
            <h1 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">Prepare and approve a payout.</h1>
            <p className="mt-5 max-w-[500px] text-[16px] leading-[1.68] text-[#DCE8FF]/88">
              Enter the details once. Zila shows the impact and attaches proof automatically after XRPL confirmation.
            </p>
          </div>
          <OperationalWalletStatus />
        </div>

        {flowState === "success" && paymentRecord ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-[#D9FF57]/22 bg-[radial-gradient(circle_at_12%_0%,rgba(217,255,87,0.13),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(103,232,249,0.13),transparent_28%),linear-gradient(180deg,rgba(30,74,125,0.74),rgba(16,42,79,0.72))] p-6 shadow-[0_28px_68px_rgba(31,68,116,0.24),0_0_34px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.14)] md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F1FFB8]">Validated on XRPL Mainnet</p>
                <h2 className="mt-3 text-[40px] font-semibold leading-none tracking-[-0.06em]">Payment confirmed</h2>
                <p className="mt-3 max-w-[620px] text-[15px] leading-[1.7] text-[#E8F7D1]">
                  Settlement verified. Operational proof synced. This payout now has an immutable payment reference.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-[22px] border border-white/14 bg-white/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/16 bg-white/12 text-[#F1FFB8]">
                  <CheckCircle2 className="h-[20px] w-[20px]" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-white">Settlement verified</p>
                  <p className="mt-1 text-[11px] text-[#C9D4F5]">{paymentRecord.ledgerIndex ? `Ledger ${paymentRecord.ledgerIndex}` : "Ledger confirmation received"}</p>
                </div>
              </div>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Amount", paymentRecord.amountLabel],
                ["Recipient / supplier", paymentRecord.recipientName ?? "Payee"],
                ["Project", paymentRecord.project],
                ["Timestamp", new Date(paymentRecord.createdAtIso).toLocaleString()],
                ["Ledger confirmation", paymentRecord.ledgerIndex ? `Ledger ${paymentRecord.ledgerIndex}` : "Confirmed"],
                ["Settlement rail", paymentRecord.settlementRail],
                ["Validation status", paymentRecord.validated ? "Validated on XRPL Mainnet" : "Settlement verified"],
                ["Proof", "Proof attached automatically"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9D4F5]">{label}</p>
                  <p className="mt-2 break-words text-[15px] font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[20px] border border-[#67E8F9]/18 bg-[#102A4F]/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFEFFF]">XRPL transaction hash</p>
              <p className="mt-2 break-all font-mono text-[13px] font-semibold leading-[1.6] text-white">{paymentRecord.txHash}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/proof" className="inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                View proof
              </Link>
              <a href={paymentRecord.explorerUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-[#111827]">
                View on XRPL
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
              </a>
              <button type="button" onClick={handleCopyTxHash} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                <Copy className="h-[13px] w-[13px]" strokeWidth={2} />
                {copiedTxHash ? "Copied" : "Copy tx hash"}
              </button>
              <Link href="/payments" className="inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                Back to payments
              </Link>
              <Link href="/home" className="inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                Back to dashboard
              </Link>
              <Link href="/home" className="inline-flex h-11 items-center justify-center rounded-full bg-[#D9FF57] px-4 text-[13px] font-semibold text-[#102A4F] shadow-[0_16px_34px_rgba(217,255,87,0.14)]">
                Done
              </Link>
            </div>
          </section>
        ) : (
          <form onSubmit={(event) => event.preventDefault()} className="mt-8">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.52fr)]">
              <section className="rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(15,42,79,0.72),rgba(12,31,58,0.56))] p-6 shadow-[0_24px_58px_rgba(31,68,116,0.22),inset_0_1px_0_rgba(255,255,255,0.11)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">Payment details</p>
                    <h2 className="mt-3 text-[28px] font-semibold leading-[1.05] tracking-[-0.055em] text-white">Enter payout details once.</h2>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-white/[0.08] px-4 py-3 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9D4F5]">Amount</p>
                    <p className="mt-1 text-[30px] font-semibold tracking-[-0.06em] text-white">{formatPayoutAmount(amountValue, payoutCurrency)}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-white">Supplier / payee</p>
                      <p className="mt-1 text-[12px] text-[#C9D4F5]/76">Use a saved supplier or enter a payee for this payout.</p>
                    </div>
                    <button type="button" onClick={supplierFormOpen ? () => setSupplierFormOpen(false) : openAddSupplier} className="inline-flex h-10 items-center justify-center rounded-full border border-[#D9FF57]/22 bg-[#D9FF57]/12 px-4 text-[12px] font-semibold text-[#F1FFB8] transition hover:bg-[#D9FF57]/18">
                      {supplierFormOpen ? "Close" : "Add supplier"}
                    </button>
                  </div>

                  {supplierFormOpen ? (
                    <div className="mt-4 rounded-[22px] border border-white/12 bg-[#102A4F]/82 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-white">{editingSupplierId ? "Edit supplier" : "Add supplier"}</p>
                          <p className="mt-1 text-[12px] text-[#C9D4F5]/76">You can cancel, close, or clear this draft anytime.</p>
                        </div>
                        <button type="button" onClick={() => setSupplierFormOpen(false)} className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-[#EAF1FF]">
                          Close
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input value={supplierForm.supplierName} onChange={(event) => setSupplierForm((form) => ({ ...form, supplierName: event.target.value }))} placeholder="Supplier name" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                        <input value={supplierForm.companyName} onChange={(event) => setSupplierForm((form) => ({ ...form, companyName: event.target.value }))} placeholder="Business / company" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                        <input value={supplierForm.walletAddress} onChange={(event) => setSupplierForm((form) => ({ ...form, walletAddress: event.target.value }))} placeholder="Recipient wallet address" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                        <input value={supplierForm.notes} onChange={(event) => setSupplierForm((form) => ({ ...form, notes: event.target.value }))} placeholder="Notes optional" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={handleSaveSupplier} className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[12px] font-semibold text-[#111827]">
                          Save supplier
                        </button>
                        <button type="button" onClick={() => setSupplierFormOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-4 text-[12px] font-semibold text-[#EAF1FF]">
                          Cancel
                        </button>
                        <button type="button" onClick={() => setSupplierForm(emptySupplierForm)} className="inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-4 text-[12px] font-semibold text-[#EAF1FF]">
                          Remove draft supplier
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <label className="block">
                      <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Saved supplier optional</span>
                      <select value={selectedSupplierId} onChange={(event) => handleSelectSupplier(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                        <option value="">No saved supplier selected</option>
                        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.supplierName} · {supplier.companyName}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Supplier / payee *</span>
                      <input value={recipient} onChange={(event) => {
                        setRecipient(event.target.value);
                        setFieldErrors((errors) => ({ ...errors, recipient: "" }));
                      }} placeholder="Who are you paying?" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50 transition hover:border-white/22 focus:border-[#D9FF57]/44" />
                      <FieldMessage message={fieldErrors.recipient} />
                    </label>
                    {selectedSupplier ? (
                      <button type="button" onClick={() => openEditSupplier(selectedSupplier)} className="h-12 self-end rounded-full border border-white/14 bg-white/[0.08] px-4 text-[12px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.12]">
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_150px]">
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Recipient wallet address *</span>
                    <input value={destinationAddress} onChange={(event) => {
                      setDestinationAddress(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, destination: "" }));
                    }} placeholder="Recipient XRPL address" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50" />
                    <FieldMessage message={fieldErrors.destination} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Amount *</span>
                    <input value={amount} onChange={(event) => {
                      setAmount(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, amount: "" }));
                    }} inputMode="decimal" placeholder="0.000001" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50 transition hover:border-white/22 focus:border-[#D9FF57]/44" />
                    <FieldMessage message={fieldErrors.amount} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Project *</span>
                    <select value={projectName} onChange={(event) => {
                      setProjectName(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, project: "" }));
                    }} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                      {projectOptions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <FieldMessage message={fieldErrors.project} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Currency *</span>
                    <select value={payoutCurrency} onChange={(event) => {
                      setPayoutCurrency(event.target.value as PayoutCurrency);
                      setFieldErrors((errors) => ({ ...errors, currency: "" }));
                    }} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                      {payoutCurrencies.map((currency) => <option key={currency} value={currency}>{currency}{currency === "XRP" ? " · available now" : " · later"}</option>)}
                    </select>
                    <FieldMessage message={fieldErrors.currency} />
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payment rail *</span>
                    <select value={preferredRail} onChange={(event) => {
                      setPreferredRail(event.target.value as PayoutRail);
                      setFieldErrors((errors) => ({ ...errors, rail: "" }));
                    }} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                      <option>Stablecoin</option>
                      <option>Bank transfer</option>
                      <option>Mobile money</option>
                    </select>
                    <FieldMessage message={fieldErrors.rail} />
                  </label>
                  <label className="block lg:col-span-3">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Notes optional</span>
                    <input value={payoutNotes} onChange={(event) => setPayoutNotes(event.target.value)} placeholder="Optional context for this payout" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50" />
                  </label>
                </div>
              </section>

              <aside className="space-y-5">
                <section className="rounded-[28px] border border-white/14 bg-[#F3F5F9]/94 p-5 text-[#111827] shadow-[0_20px_48px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.72)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">Live operational impact</p>
                  <div className="mt-4 space-y-2.5">
                    {[
                      ["Reserve remaining after payout", formatCurrency(protectedAfter)],
                      ["Payment readiness", canApproveInXaman ? "Ready for Xaman" : "Use XRP and Stablecoin rail"],
                      ["Cross-border route status", preferredRail === "Stablecoin" ? "XRPL route ready" : "Route preview only"],
                      ["Estimated settlement speed", preferredRail === "Stablecoin" ? "Usually under 1 minute" : "Coming later"],
                      ["Proof attached automatically", "Yes"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 rounded-[14px] bg-white/72 px-3.5 py-3">
                        <span className="text-[12px] font-medium text-[#65738B]">{label}</span>
                        <strong className="text-right text-[13px] font-semibold text-[#111827]">{value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[22px] border border-[#D9FF57]/18 bg-[#102A4F]/92 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F1FFB8]">Ready to approve</p>
                    <p className="mt-2 text-[14px] leading-[1.6] text-[#DCE8FF]">
                      {recipient || "Supplier"} · {formatPayoutAmount(amountValue, payoutCurrency)} · {projectName}
                    </p>
                    <div className="mt-3 rounded-[16px] border border-white/12 bg-white/[0.07] px-3.5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9D4F5]">Xaman status</span>
                        <strong className="text-right text-[12px] font-semibold text-[#D9FF57]">{approvalStatusLabel}</strong>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-[1.55] text-[#C9D4F5]">{approvalStatusDetail}</p>
                    </div>
                    {paymentMessage ? <p className="mt-2 text-[12px] font-medium text-[#FFE8B0]">{paymentMessage}</p> : null}
                    <div className="mt-4 grid gap-2">
                      <button type="button" onClick={handleApprovalPrimaryAction} disabled={flowState === "processing" || isConnectingWallet} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#111827] shadow-[0_18px_36px_rgba(217,255,87,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(217,255,87,0.22)] disabled:cursor-not-allowed disabled:opacity-50">
                        {approvalButtonLabel}
                        {isConnectingWallet || flowState === "processing" ? <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={2} /> : <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2} />}
                      </button>
                      <button type="button" onClick={handleSaveDraft} className="inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] px-5 text-[13px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.12]">
                        Save draft
                      </button>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </form>
        )}

        {activePayload && (flowState === "connecting-wallet" || flowState === "awaiting-signature" || flowState === "signing") ? (
          <section className="mt-6 rounded-[26px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.12),rgba(16,42,79,0.62))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image src={activePayload.qrUrl} alt="Xaman signing QR code" width={136} height={136} unoptimized className="h-36 w-36 rounded-[18px] border border-white/18 bg-white p-2" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">
                  {activePayload.kind === "connect" ? "Connecting wallet" : flowState === "signing" ? "Signing" : "Awaiting approval"}
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-white">{activePayload.kind === "connect" ? "Connect Xaman Wallet" : "Approve in Xaman"}</h2>
                <p className="mt-2 max-w-[420px] text-[13px] leading-[1.65] text-[#DCE8FF]">
                  {activePayload.kind === "connect"
                    ? "Scan or open Xaman. Once approved, this wallet becomes your active payment source."
                    : "Scan or open Xaman. Zila records proof automatically after confirmation."}
                </p>
                <Link href={activePayload.deepLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#111827]">
                  Open Xaman
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {flowState === "failed" ? (
          <section className="mt-6 rounded-[22px] border border-rose-200/20 bg-rose-300/[0.09] p-4">
            <p className="text-[14px] font-semibold text-[#FFD6DA]">{paymentMessage ?? "Payment could not be completed."}</p>
            <button type="button" onClick={() => {
              setFlowState("details");
              setPaymentMessage(null);
              setActivePayload(null);
            }} className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.10] px-4 text-[12px] font-semibold text-[#F4F8FF]">
              Review details
            </button>
          </section>
        ) : null}

        {flowState === "processing" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06101F]/68 px-4 backdrop-blur-sm">
            <section className="w-full max-w-[380px] rounded-[26px] border border-white/16 bg-[linear-gradient(180deg,rgba(16,42,79,0.98),rgba(7,17,31,0.96))] p-6 text-center shadow-[0_28px_68px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#67E8F9]" strokeWidth={2} />
              <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.045em] text-white">Processing payment</h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#C9D4F5]">{paymentMessage ?? "Waiting for Xaman and XRPL confirmation."}</p>
            </section>
          </div>
        ) : null}

        {flowState !== "success" ? (
          <div className="mt-auto flex items-center gap-3 pt-10 text-[12px] text-[#C9D4F5]">
            <ShieldCheck className="h-[14px] w-[14px] text-[#D9FF57]" strokeWidth={2} />
            Confirmed payments create proof automatically.
          </div>
        ) : null}
      </div>
    </div>
  );

}

export default SendMoneyScreen;
