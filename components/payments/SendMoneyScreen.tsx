"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { clearPaymentDraft, getPaymentDraft } from "@/lib/paymentDraftStore";
import { FlowBackNav } from "@/components/ui/FlowBackNav";
import { getMoneySourceState, saveMoneySourceState, subscribeToMoneySource } from "@/lib/moneySourceStore";
import {
  getProtectedMoneySummary,
  recordPaymentReserveRecalculation,
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
import { createOperationalProofRecord, saveOperationalProofRecord } from "@/lib/proof";
import { OperationalWalletStatus } from "@/components/ui/OperationalWalletStatus";

type FlowState = "details" | "review" | "awaiting-signature" | "signing" | "processing" | "success" | "failed";

interface XamanPayloadRequest {
  uuid: string;
  qrUrl: string;
  deepLink: string;
  websocketStatusUrl: string;
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

const projects = ["Project Horizon", "Atlas Project", "Northstar Project", "Helix Project"];
const reasons = ["Supplier payment", "Contractor payment", "Send project funds", "Move operational funds"];
const payoutTimings = ["Ready today", "Due this week", "After invoice approval", "Milestone release", "Schedule manually"];
const milestones = ["Foundation phase", "Delivery window", "Production milestone", "Final supplier release", "No linked milestone"];
const payoutCurrencies: PayoutCurrency[] = ["USD", "KES", "USDT", "USDC", "RLUSD", "XRP"];
const projectOptions = ["General operations", ...projects];
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
  const draft = getPaymentDraft();
  const [moneySource, setMoneySource] = useState(getMoneySourceState);
  const [summary, setSummary] = useState(getProtectedMoneySummary);
  const [suppliers, setSuppliers] = useState(getStoredSuppliers);
  const [payoutMode, setPayoutMode] = useState<PayoutMode>("manual");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [recipient, setRecipient] = useState(draft.recipientName || "");
  const [projectName, setProjectName] = useState(draft.projectName || projectOptions[0]);
  const [sourceId, setSourceId] = useState("recommend");
  const [amount, setAmount] = useState(draft.amountValue ? String(draft.amountValue) : "");
  const [reason, setReason] = useState(draft.paymentType || reasons[0]);
  const [payoutTiming, setPayoutTiming] = useState(payoutTimings[0]);
  const [linkedMilestone, setLinkedMilestone] = useState(milestones[0]);
  const [payoutNotes, setPayoutNotes] = useState(draft.notes || "");
  const [payoutCurrency, setPayoutCurrency] = useState<PayoutCurrency>((draft.currency as PayoutCurrency) || "XRP");
  const [preferredRail, setPreferredRail] = useState<PayoutRail>((draft.paymentRail as PayoutRail) || "Stablecoin");
  const [destinationAddress, setDestinationAddress] = useState(defaultDestinationAddress);
  const [flowState, setFlowState] = useState<FlowState>("details");
  const [paymentRecord, setPaymentRecord] = useState<PaymentMovementRecord | null>(null);
  const [activePayload, setActivePayload] = useState<XamanPayloadRequest | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
  const supplierProjectHint = selectedSupplier?.linkedProjects.includes(projectName)
    ? `${selectedSupplier.supplierName} is already linked to ${projectName}.`
    : `${projectName} selected. Zila will use this context without locking payout details.`;
  const projectSuggestions = suggestedPayouts.filter((suggestion) => projectName === "General operations" || suggestion.projectName === projectName);

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

    const websocket = new WebSocket(activePayload.websocketStatusUrl);

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
          void finalizePayment(activePayload.uuid).catch((error) => {
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
    setProjectName(projectOptions[0]);
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
    if (!amountValue || flowState === "processing") {
      return "Enter the amount you want to pay before approval.";
    }

    if (!recipient.trim()) {
      return "Add who you are paying before approval.";
    }

    if (!destinationAddress.trim()) {
      return "Add the recipient XRPL address before approval.";
    }

    if (!payoutCurrency) {
      return "Choose the payment currency before approval.";
    }

    if (!sourceId) {
      return "Choose where the money should come from before approval.";
    }

    if (!preferredRail) {
      return "Choose the payment rail before approval.";
    }

    if (!moneySource.connected || !moneySource.walletAddress) {
      return "Connect your Xaman wallet before approving this payment.";
    }

    if (!canApproveInXaman) {
      return `${payoutCurrency} via ${preferredRail} is coming soon. Use XRP through Stablecoin for the first real mainnet test.`;
    }

    return null;
  };

  const handleConfirm = async () => {
    const validationMessage = validatePaymentReadiness();
    if (validationMessage) {
      setPaymentMessage(validationMessage);
      if (validationMessage.includes("XRPL address")) {
        setAdvancedOpen(true);
      }
      return;
    }

    if (flowState !== "review") {
      setFlowState("review");
      setPaymentMessage("Review carefully. The next action opens Xaman for a real mainnet transaction.");
      return;
    }

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
          destinationAddress,
          memo: [reason, projectName, linkedMilestone, payoutNotes].filter(Boolean).join(" · "),
          projectId: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          projectName,
          senderAddress: moneySource.walletAddress,
          currency: "XRP",
          returnPath: "/payments/make-payment",
        }),
      });
      const body = (await response.json()) as XamanPayloadRequest & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "Unable to prepare signing request.");
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
        destinationAddress,
        safeBefore,
        safeAfter,
        protectedAfter,
        walletAddress: moneySource.walletAddress,
      });
      setActivePayload(body);
      setFlowState("awaiting-signature");
      setPaymentMessage("Open Xaman to approve this operational payout.");
    } catch (error) {
      setFlowState("failed");
      setPaymentMessage(error instanceof Error ? error.message : "Unable to prepare payment.");
    }
  };

  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.24),transparent_30%),radial-gradient(ellipse_at_84%_8%,rgba(103,232,249,0.18),transparent_28%),linear-gradient(160deg,#12325A_0%,#173D6D_44%,#102A4F_100%)] px-6 pb-28 pt-8 text-white md:-mx-6 md:rounded-[36px] md:px-8 md:pb-12 lg:-mx-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-12 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(103,232,249,0.18),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(109,94,248,0.14),transparent_24%)]" />
      <div className="relative flex flex-1 flex-col">
        <FlowBackNav
          items={[
            { label: "Payments", href: "/payments", primary: true },
            { label: "Dashboard", href: "/home" },
          ]}
        />

        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[560px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#BFEFFF]">Create operational payout</p>
            <h1 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">Coordinate a payout safely.</h1>
            <p className="mt-5 max-w-[440px] text-[16px] leading-[1.68] text-[#DCE8FF]/88">
              Enter who needs to be paid, choose the project, and let Zila show what the payment changes before money moves.
            </p>
          </div>
          <OperationalWalletStatus />
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
          <form onSubmit={(event) => event.preventDefault()} className="mt-8 space-y-5">
            {flowState === "review" ? (
              <section className="rounded-[28px] border border-[#D9FF57]/22 bg-[linear-gradient(180deg,rgba(217,255,87,0.12),rgba(16,42,79,0.56))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),0_0_24px_rgba(217,255,87,0.06),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F1FFB8]">Step 4 · Confirm payout</p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.045em] text-white">Confirm and send this payout.</h2>
                <p className="mt-2 max-w-[620px] text-[13px] leading-[1.65] text-[#E8F7D1]">
                  The next action opens Xaman for approval and creates a real XRPL Mainnet transaction. Use a very small XRP amount for your first test.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Recipient", recipient],
                    ["Sending from", moneySource.walletAddressShort || "Xaman wallet"],
                    ["Project", projectName],
                    ["Amount", formatPayoutAmount(amountValue, payoutCurrency)],
                    ["Currency", payoutCurrency],
                    ["Reserve source", sourceLabel],
                    ["Payment reason", reason],
                    ["Reserve impact", `${formatCurrency(protectedAfter)} protected after payout`],
                    ["Proof record", `${projectName}, ${recipient}, amount, reserve source, and XRPL reference`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[16px] border border-white/10 bg-white/[0.08] px-3.5 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9D4F5]">{label}</p>
                      <p className="mt-1 text-[13px] font-semibold leading-[1.4] text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setFlowState("details")} className="h-11 rounded-full border border-white/14 bg-white/[0.08] px-4 text-[13px] font-semibold text-[#EAF1FF]">
                    Edit details
                  </button>
                  <button type="button" onClick={handleConfirm} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#111827] shadow-[0_18px_36px_rgba(217,255,87,0.16)]">
                    Confirm and send payout
                    <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2} />
                  </button>
                </div>
                {paymentMessage ? <p className="mt-3 text-[12px] font-medium text-[#FFE8B0]">{paymentMessage}</p> : null}
              </section>
            ) : null}

            <section className="rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(15,42,79,0.72),rgba(12,31,58,0.56))] p-6 shadow-[0_24px_58px_rgba(31,68,116,0.22),inset_0_1px_0_rgba(255,255,255,0.11)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">Step 1 · Create payout</p>
                  <h2 className="mt-3 text-[28px] font-semibold leading-[1.05] tracking-[-0.055em] text-white">Create the payout first.</h2>
                  <p className="mt-3 max-w-[520px] text-[13px] leading-[1.65] text-[#DCE8FF]/82">
                    You stay in control of the supplier, project, amount, rail, and timing. Zila helps you understand the impact before money moves.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/[0.08] px-5 py-4 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9D4F5]">Amount</p>
                  <p className="mt-1 text-[36px] font-semibold tracking-[-0.06em] text-white">{formatPayoutAmount(amountValue, payoutCurrency)}</p>
                  <p className="mt-1 text-[12px] font-medium text-[#D9FF57]">{payoutCurrency} payout · {suggestedTiming}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[
                  {
                    id: "manual" as PayoutMode,
                    title: "Create manual payout",
                    copy: "Start blank. You choose the supplier, project, amount, rail, and reason.",
                    action: startManualPayout,
                  },
                  {
                    id: "existing" as PayoutMode,
                    title: "Select existing payment due",
                    copy: "Use a due payment as a starting point, then edit anything before sending.",
                    action: startExistingPaymentMode,
                  },
                ].map((mode) => {
                  const active = payoutMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={mode.action}
                      className={`rounded-[20px] border p-4 text-left transition ${active ? "border-[#D9FF57]/34 bg-[#D9FF57]/10 shadow-[0_0_24px_rgba(217,255,87,0.08)]" : "border-white/10 bg-white/[0.055] hover:border-white/20 hover:bg-white/[0.08]"}`}
                    >
                      <span className="block text-[15px] font-semibold text-white">{mode.title}</span>
                      <span className="mt-2 block text-[12px] leading-[1.55] text-[#C9D4F5]/78">{mode.copy}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-white">Supplier</p>
                    <p className="mt-1 text-[12px] text-[#C9D4F5]/76">Reusable payee profiles help Zila remember payout methods and project context.</p>
                  </div>
                  <button type="button" onClick={openAddSupplier} className="inline-flex h-10 items-center justify-center rounded-full border border-[#D9FF57]/22 bg-[#D9FF57]/12 px-4 text-[12px] font-semibold text-[#F1FFB8] transition hover:bg-[#D9FF57]/18">
                    Add supplier
                  </button>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Choose saved supplier</span>
                    <select value={selectedSupplierId} onChange={(event) => handleSelectSupplier(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                      <option value="">No saved supplier selected</option>
                      {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.supplierName} · {supplier.companyName}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Supplier / recipient name</span>
                    <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Who are you paying?" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50 transition hover:border-white/22 focus:border-[#D9FF57]/44" />
                  </label>
                  {selectedSupplier ? (
                    <button type="button" onClick={() => openEditSupplier(selectedSupplier)} className="h-12 self-end rounded-full border border-white/14 bg-white/[0.08] px-4 text-[12px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.12]">
                      Edit supplier
                    </button>
                  ) : null}
                </div>

                {selectedSupplier ? (
                  <div className="mt-3 grid gap-3 rounded-[18px] border border-white/10 bg-white/[0.05] p-3.5 md:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">Preferred payout</p>
                      <p className="mt-1 text-[13px] font-semibold text-white">{selectedSupplier.preferredRail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">Recipient information</p>
                      <p className="mt-1 text-[13px] font-semibold text-white">
                        {selectedSupplier.walletAddress ? `Wallet address ${shortenWalletAddress(selectedSupplier.walletAddress)}` : "Payout details needed"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">Payout memory</p>
                      <p className="mt-1 text-[13px] font-semibold text-white">{selectedSupplier.historySummary}</p>
                    </div>
                  </div>
                ) : null}

                {supplierFormOpen ? (
                  <div className="mt-4 rounded-[22px] border border-white/12 bg-[#102A4F]/82 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-white">{editingSupplierId ? "Edit supplier" : "Add supplier"}</p>
                        <p className="mt-1 text-[12px] text-[#C9D4F5]/76">Create a reusable supplier profile for future payouts.</p>
                      </div>
                      <button type="button" onClick={() => setSupplierFormOpen(false)} className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-[#EAF1FF]">
                        Close
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input value={supplierForm.supplierName} onChange={(event) => setSupplierForm((form) => ({ ...form, supplierName: event.target.value }))} placeholder="Supplier name" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                      <input value={supplierForm.companyName} onChange={(event) => setSupplierForm((form) => ({ ...form, companyName: event.target.value }))} placeholder="Business / company" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                      <input value={supplierForm.walletAddress} onChange={(event) => setSupplierForm((form) => ({ ...form, walletAddress: event.target.value }))} placeholder="Recipient wallet address" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                      <select value={supplierForm.preferredRail} onChange={(event) => setSupplierForm((form) => ({ ...form, preferredRail: event.target.value as PayoutRail }))} className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none">
                        <option>Stablecoin</option>
                        <option>Bank transfer</option>
                        <option>Mobile money</option>
                      </select>
                      <select value={supplierForm.currency} onChange={(event) => setSupplierForm((form) => ({ ...form, currency: event.target.value as PayoutCurrency }))} className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none">
                        {payoutCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                      </select>
                      <input value={supplierForm.notes} onChange={(event) => setSupplierForm((form) => ({ ...form, notes: event.target.value }))} placeholder="Payout notes" className="h-11 rounded-[15px] border border-white/12 bg-[#0C2343] px-3 text-[13px] text-white outline-none placeholder:text-[#C9D4F5]/48" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {projectOptions.map((project) => {
                        const active = supplierForm.linkedProjects.includes(project);

                        return (
                          <button
                            key={project}
                            type="button"
                            onClick={() => setSupplierForm((form) => ({
                              ...form,
                              linkedProjects: active
                                ? form.linkedProjects.filter((item) => item !== project)
                                : [...form.linkedProjects, project],
                            }))}
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${active ? "border-[#D9FF57]/28 bg-[#D9FF57]/12 text-[#F1FFB8]" : "border-white/12 bg-white/[0.06] text-[#C9D4F5]"}`}
                          >
                            {project}
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" onClick={handleSaveSupplier} className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[12px] font-semibold text-[#111827]">
                      Save supplier
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_160px_170px]">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Project</span>
                  <select value={projectName} onChange={(event) => setProjectName(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                    {projectOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <span className="mt-2 block text-[11px] leading-[1.5] text-[#C9D4F5]/72">{supplierProjectHint}</span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Amount</span>
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Currency</span>
                  <select value={payoutCurrency} onChange={(event) => setPayoutCurrency(event.target.value as PayoutCurrency)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                    {payoutCurrencies.map((currency) => <option key={currency} value={currency}>{currency}{currency === "XRP" ? " · available for mainnet test" : " · coming soon"}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payment rail</span>
                  <select value={preferredRail} onChange={(event) => setPreferredRail(event.target.value as PayoutRail)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                    <option>Stablecoin</option>
                    <option>Bank transfer</option>
                    <option>Mobile money</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payout timing</span>
                  <select value={payoutTiming} onChange={(event) => setPayoutTiming(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition hover:border-white/22 focus:border-[#D9FF57]/44">
                    {payoutTimings.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payout reason</span>
                  <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {reasons.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">What is this payment for?</span>
                  <select value={linkedMilestone} onChange={(event) => setLinkedMilestone(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {milestones.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block lg:col-span-3">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payout notes</span>
                  <input value={payoutNotes} onChange={(event) => setPayoutNotes(event.target.value)} placeholder="Optional context for this payout" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50" />
                </label>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/12 bg-white/[0.055] p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">Step 2 · Choose payment rail</p>
                  <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-white">Choose how this payout should move.</h3>
                </div>
                <p className="text-[12px] text-[#C9D4F5]/76">Stablecoin is available now. Bank and mobile money are prepared for later.</p>
              </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ["Stablecoin", "Available now", "Fast settlement for cross-border payout coordination."],
                  ["Bank transfer", "Coming soon", "Multi-currency bank payouts with operational tracking."],
                  ["Mobile money", "Coming soon", "Regional and field payouts for mobile-first corridors."],
                ].map(([rail, status, copy]) => {
                  const active = preferredRail === rail;

                  return (
                    <button
                      key={rail}
                      type="button"
                      onClick={() => setPreferredRail(rail as PayoutRail)}
                      className={`rounded-[20px] border p-4 text-left transition ${active ? "border-[#D9FF57]/34 bg-[#D9FF57]/10 shadow-[0_0_24px_rgba(217,255,87,0.08)]" : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.08]"}`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[15px] font-semibold text-white">{rail}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === "Available now" ? "bg-[#D9FF57]/14 text-[#F1FFB8]" : "bg-white/[0.08] text-[#C9D4F5]"}`}>{status}</span>
                      </span>
                      <span className="mt-3 block text-[12px] leading-[1.55] text-[#C9D4F5]/78">{copy}</span>
                    </button>
                  );
                })}
                </div>
                <p className="mt-3 text-[12px] leading-[1.55] text-[#FFE8B0]">
                  XRP is available for the first real test payment. Other currencies stay visible so teams can see what is coming next.
                </p>
              </section>

            {payoutMode === "existing" ? (
              <section className="rounded-[26px] border border-white/12 bg-white/[0.045] p-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">Existing payments due</p>
                  <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-white">Choose a starting point, then edit it.</h3>
                  <p className="mt-2 max-w-[560px] text-[13px] leading-[1.65] text-[#C9D4F5]/78">
                    These are suggestions from project activity. They never lock the supplier, amount, currency, rail, or reason.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {projectSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="rounded-[18px] border border-white/10 bg-white/[0.06] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09]"
                    >
                      <span className="block text-[14px] font-semibold text-white">{suggestion.title}</span>
                      <span className="mt-2 block text-[12px] text-[#C9D4F5]/78">{suggestion.projectName} · suggested {formatPayoutAmount(Number(suggestion.amount), suggestion.currency)}</span>
                      <span className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-[#EAF1FF]">
                        Fill form
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)]">
              <div className="rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(103,232,249,0.12),rgba(16,42,79,0.48))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/12 bg-white/10 text-[#D9FF57]">
                    <Sparkles className="h-[16px] w-[16px]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFEFFF]">Step 3 · Review operational impact</p>
                    <p className="mt-2 text-[19px] font-semibold leading-[1.35] tracking-[-0.035em] text-white">{recommendation}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        railSupported ? "Expected to arrive within 1 minute" : `${preferredRail} coming soon`,
                        currencySupported ? "Payment ready" : `${payoutCurrency} coming soon`,
                        safeAfter > 0 ? "Reserve still protected" : "Review reserves first",
                        `Protected balance after payout ${formatCurrency(protectedAfter)}`,
                      ].map((item) => (
                        <span key={item} className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-[#EAF1FF]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/14 bg-[#F3F5F9]/94 p-5 text-[#111827] shadow-[0_20px_48px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.72)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">Operational impact</p>
                <div className="mt-4 space-y-2.5">
                  {[
                    ["Reserve remaining after payout", formatCurrency(protectedAfter)],
                    ["Safe to spend after payout", formatCurrency(safeAfter)],
                    ["Runway remaining", runwayRemaining],
                    ["Payment status", risk.label],
                    ["Proof", proofStatus],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-[14px] bg-white/72 px-3.5 py-3">
                      <span className="text-[12px] font-medium text-[#65738B]">{label}</span>
                      <strong className="text-right text-[13px] font-semibold text-[#111827]">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/12 bg-white/[0.06] p-4">
              <button
                type="button"
                onClick={() => setAdvancedOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[13px] font-semibold text-white">More payout details</span>
                  <span className="mt-1 block text-[12px] text-[#C9D4F5]/76">Recipient wallet address, money source, and proof settings.</span>
                </span>
                <ChevronDown className={`h-[18px] w-[18px] text-[#C9D4F5] transition ${advancedOpen ? "rotate-180" : ""}`} strokeWidth={2} />
              </button>

              {advancedOpen ? (
                <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Recipient wallet address</span>
                    <input value={destinationAddress} onChange={(event) => setDestinationAddress(event.target.value)} placeholder="Recipient XRPL address" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#C9D4F5]/50" />
                    <span className="mt-2 block text-[11px] leading-[1.5] text-[#C9D4F5]/72">Compatible XRPL wallet address (Xaman or any XRPL-supported wallet).</span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Money source</span>
                    <select value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                      {reserveOptions.map((reserve) => (
                        <option key={reserve.id} value={reserve.id}>
                          {reserve.name} · {formatCurrency(reserve.amount)} available
                        </option>
                      ))}
                    </select>
                    <span className="mt-2 block text-[11px] leading-[1.5] text-[#C9D4F5]/72">{selectedReserveOption.explanation}</span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Manual proof settings</span>
                    <select value="Attach automatically" disabled className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F]/80 px-4 text-[14px] text-white outline-none opacity-90">
                      <option>Attach automatically</option>
                    </select>
                    <span className="mt-2 block text-[11px] leading-[1.5] text-[#C9D4F5]/72">Zila creates the proof record after settlement confirmation.</span>
                  </label>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-[#D9FF57]/18 bg-[linear-gradient(180deg,rgba(217,255,87,0.10),rgba(16,42,79,0.52))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),0_0_24px_rgba(217,255,87,0.05),inset_0_1px_0_rgba(255,255,255,0.10)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F1FFB8]">Approval</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.045em] text-white">Review this payout before sending.</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ["Payee", recipient],
                      ["Connected wallet", moneySource.connected ? moneySource.walletAddressShort || "Connected" : "Not connected"],
                      ["Amount", formatPayoutAmount(amountValue, payoutCurrency)],
                      ["Estimated arrival", estimatedArrival],
                      ["Money source", sourceLabel],
                      ["Proof history", "Appears after payment"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[16px] border border-white/10 bg-white/[0.08] px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9D4F5]">{label}</p>
                        <p className="mt-1 text-[13px] font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  {!currencySupported || !railSupported ? (
                    <p className="mt-3 text-[12px] font-medium text-[#FFE8B0]">
                      {payoutCurrency} via {preferredRail} is coming soon. XRP through Stablecoin is available for the first real test payment.
                    </p>
                  ) : paymentMessage ? <p className="mt-3 text-[12px] font-medium text-[#FFE8B0]">{paymentMessage}</p> : null}
                </div>
                <button type="button" onClick={handleConfirm} disabled={flowState === "processing"} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#111827] shadow-[0_18px_36px_rgba(217,255,87,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(217,255,87,0.22)] disabled:cursor-not-allowed disabled:opacity-50">
                  Review payout
                  <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2} />
                </button>
              </div>
            </section>
          </form>
        )}

        {activePayload && (flowState === "awaiting-signature" || flowState === "signing") ? (
          <section className="mt-6 rounded-[26px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.12),rgba(16,42,79,0.62))] p-5 shadow-[0_20px_48px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src={activePayload.qrUrl}
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
                  href={activePayload.deepLink}
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
                setFlowState("details");
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
