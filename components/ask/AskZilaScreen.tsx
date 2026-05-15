"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Activity,
  CheckCheck,
  FileCheck2,
  LockKeyhole,
  Mic,
  Send,
  Square,
} from "lucide-react";

import { MockInvoiceUpload } from "@/components/documents/MockInvoiceUpload";
import { AppShell } from "@/components/ui/AppShell";
import { savePaymentDraft } from "@/lib/paymentDraftStore";
import { simulateIncomingPayment, subscribeToMoneyMovement } from "@/lib/moneyMovementStore";
import {
  getProtectedMoneySummary,
  subscribeToProtectedMoney,
} from "@/lib/protectedMoneyStore";
import {
  savePaymentMovement,
  subscribeToLatestPaymentTransaction,
} from "@/lib/paymentTransactionStore";
import {
  buildXrplExplorerUrl,
  generateMockTransactionHash,
  saveProofTransaction,
} from "@/lib/proofTransactionStore";
import { saveAskOperationalUpdate } from "@/lib/askOperationalStore";

type FlowType = "cost-increase" | "payment-recorded" | "supplier-check" | "decision-question";

interface InterpretationItem {
  label: string;
  value: string;
}

interface FlowData {
  type: FlowType;
  interpretation: InterpretationItem[];
  answerLabel?: string;
  guidanceHeadline: string;
  guidanceText: string;
  memoryPattern: string;
  applySteps: string[];
  completionLines: string[];
  nextActionPrimary: string;
  nextActionFallback: string;
  proofText: string;
  detectedAmount?: string | null;
  detectedAmountValue?: number;
  needsAmountClarification?: boolean;
  impactedProject: string;
  pressureLevel: "Low" | "Watch" | "High";
  reserveImpact: string;
  operationalConsequence: string;
  actionLabels: string[];
}

const prompts = [
  "Supplier cost increased by $2k on Project Horizon.",
  "Client payment delayed for Atlas Project.",
  "Received $5k from client for Project Horizon.",
];

function extractAmount(input: string) {
  const match = input.match(/([£$])?\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?\s?(k|thousand)?/i);

  if (!match) {
    return null;
  }

  const currency = match[1] ?? "";
  const rawNumber = match[2].replace(/,/g, "");
  const multiplier = match[3]?.toLowerCase() === "k" || match[3]?.toLowerCase() === "thousand" ? 1000 : 1;
  const numericValue = Number(rawNumber) * multiplier;

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return {
    currency,
    numericValue,
    formatted: `${currency || "$"}${numericValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  };
}

function createAmountClarificationFlow(detectedLabel: string): FlowData {
  return {
    type: "payment-recorded",
    interpretation: [
      { label: "Got it", value: "Project Horizon" },
      { label: "Detected", value: detectedLabel },
      { label: "Amount", value: "Not provided yet" },
    ],
    guidanceHeadline: "Amount needed before this can be recorded.",
    guidanceText: "Share the amount from the update and Zila will use that same value for the interpretation, recorded state, next move, and verified history.",
    memoryPattern: "Zila is waiting for the amount before adding this to your business activity history.",
    applySteps: [
      "Capture the amount",
      "Refresh project outlook",
      "Prepare the next move",
    ],
    completionLines: [
      "Waiting for amount",
      "Project ready to update",
      "Outlook ready to refresh",
      "Verified history ready",
    ],
    nextActionPrimary: "Add the amount",
    nextActionFallback: "Reply with the payment or cost amount",
    proofText: "Zila is ready to add this update to verified history as soon as the amount is confirmed.",
    detectedAmount: null,
    detectedAmountValue: 0,
    needsAmountClarification: true,
    impactedProject: "Project Horizon",
    pressureLevel: "Watch",
    reserveImpact: "Waiting for amount before reserve impact can be calculated.",
    operationalConsequence: "Zila needs the amount before updating the operating record.",
    actionLabels: ["Record commitment", "Create reserve"],
  };
}

function formatProjectMoveAmount(currency: string) {
  const symbol = currency || "£";

  return `${symbol}4300`;
}

function getCostNextMove(numericValue: number, currency: string) {
  const projectMoveAmount = formatProjectMoveAmount(currency);

  if (numericValue >= 1800) {
    return {
      primary: `Move ${projectMoveAmount} to stay on track`,
      fallback: "Use Safety Net only if collections slip",
    };
  }

  return {
    primary: "No immediate action needed",
    fallback: `Move ${projectMoveAmount} if costs keep climbing this week`,
  };
}

function getPaymentNextMove(numericValue: number, currency: string) {
  const projectMoveAmount = formatProjectMoveAmount(currency);

  if (numericValue >= 2500) {
    return {
      primary: "No immediate action needed",
      fallback: `Move ${projectMoveAmount} later this week if the buffer tightens`,
    };
  }

  return {
    primary: "No immediate action needed",
    fallback: "Review cash buffer again tomorrow",
  };
}

function getDecisionNextMove(answerLabel: string, currency: string) {
  const projectMoveAmount = formatProjectMoveAmount(currency);

  if (answerLabel === "Yes") {
    return {
      primary: "No immediate action needed",
      fallback: `Move ${projectMoveAmount} if the buffer tightens`,
    };
  }

  if (answerLabel === "No") {
    return {
      primary: "Adjust the payment timing by 2 days",
      fallback: `Move ${projectMoveAmount} if timing cannot shift`,
    };
  }

  return {
    primary: "Watch the buffer for 48 hours",
    fallback: `Move ${projectMoveAmount} if another cost lands this week`,
  };
}

function getSupplierNextMove(currency: string) {
  const projectMoveAmount = formatProjectMoveAmount(currency);

  return {
    primary: "Pay today and monitor the buffer",
    fallback: `Move ${projectMoveAmount} if you want more headroom`,
  };
}

function createOperationalContextFlow(input: {
  project: string;
  detected: string;
  headline: string;
  guidance: string;
  memory: string;
  reserveImpact: string;
  consequence: string;
  pressure: "Low" | "Watch" | "High";
  actions: string[];
}): FlowData {
  return {
    type: "decision-question",
    interpretation: [
      { label: "Got it", value: input.project },
      { label: "Detected", value: input.detected },
      { label: "Pressure", value: input.pressure === "High" ? "Increased" : input.pressure === "Watch" ? "Watch timing" : "Low" },
    ],
    answerLabel: input.pressure === "High" ? "Pressure" : input.pressure,
    guidanceHeadline: input.headline,
    guidanceText: input.guidance,
    memoryPattern: input.memory,
    applySteps: ["Record operational change", "Refresh project pressure", "Prepare next move"],
    completionLines: ["All done", `${input.project} updated`, `${input.detected} recorded`, "Proof record created"],
    nextActionPrimary: input.actions[0] ?? "Record commitment",
    nextActionFallback: input.actions[1] ?? "Review project allocation",
    proofText: `Recorded. ${input.detected} added to ${input.project}. Time stamped and added to verified history.`,
    detectedAmount: null,
    detectedAmountValue: 0,
    needsAmountClarification: false,
    impactedProject: input.project,
    pressureLevel: input.pressure,
    reserveImpact: input.reserveImpact,
    operationalConsequence: input.consequence,
    actionLabels: input.actions,
  };
}

function getFlowData(input: string): FlowData {
  const lower = input.toLowerCase();
  const extractedAmount = extractAmount(input);
  const amountText = extractedAmount?.formatted;
  const amountValue = extractedAmount?.numericValue ?? 0;
  const project = lower.includes("atlas")
    ? "Atlas Project"
    : lower.includes("northstar")
      ? "Northstar Project"
      : lower.includes("helix")
        ? "Helix Project"
        : "Project Horizon";
  const isIncoming =
    lower.includes("received") ||
    lower.includes("invoice paid") ||
    lower.includes("client paid") ||
    lower.includes("payment landed");
  const isDelayed =
    lower.includes("delayed") ||
    lower.includes("late") ||
    lower.includes("moved to friday") ||
    lower.includes("payroll moved");
  const isHiring =
    lower.includes("hire") ||
    lower.includes("contractor") ||
    lower.includes("freelancer") ||
    lower.includes("extra help");
  const isMaterialsMore =
    lower.includes("materials cost more") ||
    lower.includes("materials cost") ||
    lower.includes("more than expected");
  const paymentLanguage =
    lower.includes("paid") ||
    lower.includes("spent") ||
    lower.includes("cost") ||
    lower.includes("payment");
  const decisionQuestion =
    lower.includes("can i") ||
    lower.includes("should i") ||
    lower.includes("am i") ||
    lower.includes("what happens");

  if (isHiring && !amountText) {
    return createOperationalContextFlow({
      project,
      detected: "New contractor need",
      headline: "This adds delivery capacity, but it needs a commitment buffer.",
      guidance: "Record the contractor need now, then protect money before confirming the work.",
      memory: "This project usually requires additional supplier and contractor buffer near delivery.",
      reserveImpact: "Project Reserve or Payroll reserve should be reviewed before hiring.",
      consequence: "Project pressure increases until the contractor commitment is covered.",
      pressure: "Watch",
      actions: ["Record commitment", "Create reserve", "Adjust project allocation"],
    });
  }

  if (isMaterialsMore && !amountText) {
    return createOperationalContextFlow({
      project,
      detected: "Materials cost pressure",
      headline: "Materials are trending above plan.",
      guidance: "Zila can record the pressure now and prepare a supplier buffer before the next payment lands.",
      memory: "Supplier-heavy weeks usually reduce your safe range before delivery completes.",
      reserveImpact: "Supplier reserve should be increased or created.",
      consequence: "Available operating cushion may tighten once the final amount is confirmed.",
      pressure: "Watch",
      actions: ["Create reserve", "Protect money", "Record commitment"],
    });
  }

  if (decisionQuestion) {
    if (!amountText) {
      return createAmountClarificationFlow("Decision question");
    }

    const cautionAnswer = lower.includes("what happens") || lower.includes("am i");
    const answerLabel = cautionAnswer ? "Caution" : lower.includes("should i") ? "No" : "Yes";
    const guidanceHeadline =
      answerLabel === "Yes"
        ? `Yes, you can make that ${amountText} move.`
        : answerLabel === "No"
          ? `Not yet. Adjust before committing ${amountText}.`
          : `Caution. ${amountText} works, but your buffer gets tighter.`;
    const guidanceText =
      answerLabel === "Yes"
        ? `${amountText} keeps your projects stable but reduces your buffer slightly.`
        : answerLabel === "No"
          ? `A quick timing adjustment keeps the week steadier before you commit ${amountText}.`
          : `${amountText} is still workable, though one payment should shift slightly to protect the week.`;
    const nextMove = getDecisionNextMove(answerLabel, extractedAmount.currency);

    return {
      type: "decision-question",
      interpretation: [
        { label: "Got it", value: "Decision question" },
        { label: "Detected", value: "Cash flow check" },
        { label: "Amount", value: amountText },
        { label: "Focus", value: "Near-term project stability" },
      ],
      answerLabel,
      guidanceHeadline,
      guidanceText,
      memoryPattern:
        answerLabel === "Yes"
          ? "Client payments usually land 4-6 days after invoice, so this stays inside your normal operating range."
          : "Zila recognised a similar pressure pattern from last month when supplier timing moved before income landed.",
      applySteps: [
        "Review near-term payment impact",
        "Refresh project outlook",
        "Prepare recommended next move",
      ],
      completionLines: [
        "All done",
        "Decision checked",
        `${amountText} reviewed`,
        "Impact reviewed",
        "Next move prepared",
      ],
      nextActionPrimary: nextMove.primary,
      nextActionFallback: nextMove.fallback,
      proofText: `Recorded. Decision review for ${amountText} added to verified history with the current recommendation and time stamp.`,
      detectedAmount: amountText,
      detectedAmountValue: amountValue,
      needsAmountClarification: false,
      impactedProject: project,
      pressureLevel: answerLabel === "Yes" ? "Low" : answerLabel === "No" ? "High" : "Watch",
      reserveImpact: answerLabel === "Yes" ? "No reserve movement needed." : "Protected money may need a timing buffer.",
      operationalConsequence: answerLabel === "Yes" ? "Decision stays inside your current safe range." : "The project may create pressure before incoming money lands.",
      actionLabels: ["Send payment", "Move funds", "Record commitment"],
    };
  }

  if (isIncoming) {
    if (!amountText) {
      return createAmountClarificationFlow("Incoming payment");
    }

    return {
      type: "payment-recorded",
      interpretation: [
        { label: "Got it", value: project },
        { label: "Detected", value: "Incoming payment" },
        { label: "Amount", value: amountText },
      ],
      guidanceHeadline: `${amountText} received and ready to assign.`,
      guidanceText: "This improves your operating cushion and gives the project more room for upcoming commitments.",
      memoryPattern: "Client payments typically arrive 3-5 days late, so this strengthens the current operating window.",
      applySteps: ["Record incoming payment", "Refresh safe to spend", "Update project activity"],
      completionLines: ["All done", `${project} updated`, `${amountText} received`, "Proof record created"],
      nextActionPrimary: "Protect part of this money",
      nextActionFallback: "Review project allocation",
      proofText: `Recorded. Incoming payment of ${amountText} added to ${project}. Time stamped and added to verified history.`,
      detectedAmount: amountText,
      detectedAmountValue: amountValue,
      needsAmountClarification: false,
      impactedProject: project,
      pressureLevel: "Low",
      reserveImpact: "No reserve used. Available operating balance increases.",
      operationalConsequence: "Safe to Spend improves after this payment is recorded.",
      actionLabels: ["Protect money", "Create reserve", "Adjust project allocation"],
    };
  }

  if (isDelayed) {
    return {
      type: "decision-question",
      interpretation: [
        { label: "Got it", value: project },
        { label: "Detected", value: lower.includes("payroll") ? "Commitment timing change" : "Client payment delay" },
        { label: "Pressure", value: "Timing risk" },
      ],
      answerLabel: "Watch",
      guidanceHeadline: lower.includes("payroll") ? "Payroll timing now needs a protected buffer." : "This delay increases pressure before the next incoming payment.",
      guidanceText: lower.includes("payroll") ? "Recording the Friday payroll movement keeps commitments and Safe to Spend aligned." : "Delaying outgoing payments until Friday reduces operational pressure.",
      memoryPattern: lower.includes("payroll") ? "Payroll pressure often increases near delivery week." : "Client payments typically arrive 3-5 days late.",
      applySteps: ["Record timing change", "Refresh project pressure", "Prepare reserve recommendation"],
      completionLines: ["All done", `${project} pressure updated`, "Timing change recorded", "Recommendation prepared"],
      nextActionPrimary: "Record commitment",
      nextActionFallback: "Create reserve",
      proofText: `Recorded. Timing change added to ${project}. Time stamped and added to verified history.`,
      detectedAmount: amountText ?? null,
      detectedAmountValue: amountValue,
      needsAmountClarification: false,
      impactedProject: project,
      pressureLevel: "Watch",
      reserveImpact: "Supplier or payroll reserve may need more cover.",
      operationalConsequence: "Upcoming commitments should be watched until the delayed money lands.",
      actionLabels: ["Record commitment", "Create reserve", "Protect money"],
    };
  }

  if (paymentLanguage) {
    if (!amountText) {
      return createAmountClarificationFlow("Payment or spend update");
    }

    const nextMove = lower.includes("cost")
      ? getCostNextMove(extractedAmount.numericValue, extractedAmount.currency)
      : getPaymentNextMove(extractedAmount.numericValue, extractedAmount.currency);

    return {
      type: "payment-recorded",
      interpretation: [
        { label: "Got it", value: "Project Horizon" },
        {
          label: "Detected",
          value: lower.includes("cost") ? "Cost or payment update" : "Payment recorded",
        },
        { label: "Amount", value: amountText },
      ],
      guidanceHeadline: lower.includes("cost")
        ? "Project Horizon is approaching a funding pressure point this week."
        : "This payment can be absorbed cleanly today.",
      guidanceText: lower.includes("cost")
        ? "A small adjustment now keeps the project steady and updates the next move clearly."
        : "Your week stays steady, and recording it now keeps the project view accurate.",
      memoryPattern: lower.includes("cost")
        ? "Supplier-heavy weeks usually reduce your safe range before delivery completes."
        : "This project typically creates payment pressure near delivery, so the record strengthens the next forecast.",
      applySteps: [
        lower.includes("cost") ? "Update project costs" : "Record payment",
        "Refresh project outlook",
        "Update next move recommendation",
      ],
      completionLines: [
        "All done",
        "Project Horizon updated",
        lower.includes("cost") ? `${amountText} cost change recorded` : `${amountText} payment recorded`,
        "Next move prepared",
      ],
      nextActionPrimary: nextMove.primary,
      nextActionFallback: nextMove.fallback,
      proofText: lower.includes("cost")
        ? `Recorded. Cost increase of ${amountText} added to Project Horizon. Time stamped and added to verified history.`
        : `Recorded. Payment of ${amountText} added to Project Horizon. Time stamped and added to verified history.`,
      detectedAmount: amountText,
      detectedAmountValue: amountValue,
      needsAmountClarification: false,
      impactedProject: project,
      pressureLevel: lower.includes("cost") && amountValue >= 1800 ? "High" : "Watch",
      reserveImpact: lower.includes("cost") ? "Supplier reserve should be reviewed before the next payment." : "No reserve change unless this payment should be matched against protected money.",
      operationalConsequence: lower.includes("cost") ? "This reduces your available operating cushion." : "Project activity is updated and the operating record stays aligned.",
      actionLabels: lower.includes("cost") ? ["Create reserve", "Protect money", "Move funds"] : ["Send payment", "Record commitment"],
    };
  }

  if (lower.includes("supplier")) {
    if (!amountText) {
      return createAmountClarificationFlow("Supplier payment check");
    }

    const nextMove = getSupplierNextMove(extractedAmount.currency);

    return {
      type: "supplier-check",
      interpretation: [
        { label: "Got it", value: "Supplier payment" },
        { label: "Project", value: "Project Horizon" },
        { label: "Check", value: "Pay today" },
        { label: "Amount", value: amountText },
      ],
      guidanceHeadline: `You can pay ${amountText} to this supplier today.`,
      guidanceText: `${amountText} keeps delivery stable, though your buffer narrows slightly for the next few days.`,
      memoryPattern: "Supplier-heavy weeks usually reduce your safe range, especially before the next client payment clears.",
      applySteps: [
        "Confirm payment impact",
        "Refresh project outlook",
        "Prepare next move recommendation",
      ],
      completionLines: [
        "All done",
        "Supplier payment checked",
        `${amountText} impact confirmed`,
        "Next move prepared",
      ],
      nextActionPrimary: nextMove.primary,
      nextActionFallback: nextMove.fallback,
      proofText: `Recorded. Supplier payment check for ${amountText} added to verified history with time stamp.`,
      detectedAmount: amountText,
      detectedAmountValue: amountValue,
      needsAmountClarification: false,
      impactedProject: project,
      pressureLevel: amountValue >= 2500 ? "Watch" : "Low",
      reserveImpact: "Supplier Reserve can absorb this if you want to avoid reducing available balance.",
      operationalConsequence: "Delivery stays steady, with a narrower safe range for the next few days.",
      actionLabels: ["Send payment", "Protect money", "Move funds"],
    };
  }

  if (!amountText) {
    return createAmountClarificationFlow("Cost increase");
  }

  const nextMove = getCostNextMove(extractedAmount.numericValue, extractedAmount.currency);

  return {
    type: "cost-increase",
    interpretation: [
      { label: "Got it", value: "Project Horizon" },
      { label: "Detected", value: "Cost increase" },
      { label: "Amount", value: amountText },
    ],
    guidanceHeadline: "Project Horizon is approaching a funding pressure point this week.",
    guidanceText: `A small adjustment around ${amountText} now keeps everything on track for the week ahead.`,
    memoryPattern: "Zila recognised a similar pressure pattern from last month.",
    applySteps: [
      "Update project costs",
      "Refresh project outlook",
      "Adjust next move recommendation",
    ],
    completionLines: [
      "All done",
      "Project Horizon updated",
      `${amountText} cost increase recorded`,
      "Next move prepared",
    ],
    nextActionPrimary: nextMove.primary,
    nextActionFallback: nextMove.fallback,
    proofText: `Recorded. Cost increase of ${amountText} added to Project Horizon. Time stamped and added to verified history.`,
    detectedAmount: amountText,
    detectedAmountValue: amountValue,
    needsAmountClarification: false,
    impactedProject: project,
    pressureLevel: amountValue >= 1800 ? "High" : "Watch",
    reserveImpact: "Supplier reserve should be increased or created.",
    operationalConsequence: "This reduces your available operating cushion.",
    actionLabels: ["Create reserve", "Protect money", "Record commitment"],
  };
}

export function AskZilaScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyStageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState(prompts[0]);
  const [activePrompt, setActivePrompt] = useState(prompts[0]);
  const [submittedMessage, setSubmittedMessage] = useState(prompts[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasResponse, setHasResponse] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState(3);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStage, setApplyStage] = useState<"idle" | "applying" | "updating">("idle");
  const [confirmedAction, setConfirmedAction] = useState<string | null>(null);
  const [summary, setSummary] = useState(getProtectedMoneySummary);
  const [recordedProofReference, setRecordedProofReference] = useState<string | null>(null);
  const quickAction = searchParams.get("action");

  const flow = useMemo(() => getFlowData(submittedMessage || query), [query, submittedMessage]);
  const safeBefore = summary.safeToSpend;
  const amountImpact = flow.detectedAmountValue ?? 0;
  const isIncomingUpdate =
    flow.guidanceHeadline.toLowerCase().includes("received") ||
    flow.interpretation.some((item) => item.value.toLowerCase().includes("incoming"));
  const isFinancialImpact = amountImpact > 0 && !flow.needsAmountClarification;
  const safeAfter = isFinancialImpact
    ? isIncomingUpdate
      ? safeBefore + amountImpact
      : Math.max(safeBefore - amountImpact, 0)
    : safeBefore;
  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
      if (applyStageTimeoutRef.current) {
        clearTimeout(applyStageTimeoutRef.current);
      }
      if (applyCompleteTimeoutRef.current) {
        clearTimeout(applyCompleteTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const update = () => setSummary(getProtectedMoneySummary());

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribePayments = subscribeToLatestPaymentTransaction(update);
    const unsubscribeMovement = subscribeToMoneyMovement(update);

    return () => {
      unsubscribeProtected();
      unsubscribePayments();
      unsubscribeMovement();
    };
  }, []);

  const resetExecutionState = () => {
    setHasApplied(false);
    setIsApplying(false);
    setApplyStage("idle");
    setConfirmedAction(null);
    setRecordedProofReference(null);
  };

  const recordOperationalUpdate = () => {
    if (flow.needsAmountClarification || recordedProofReference) {
      return;
    }

    const createdAtIso = new Date().toISOString();
    const txHash = `ASK-${generateMockTransactionHash()}`;
    const amountValue = flow.detectedAmountValue ?? 0;
    const amountLabel = flow.detectedAmount ?? (amountValue ? `$${amountValue.toLocaleString("en-US")}` : "$0");
    const movementType = isIncomingUpdate ? "incoming" : "operational-movement";

    if (isIncomingUpdate && amountValue > 0) {
      simulateIncomingPayment({
        amount: amountValue,
        from: "Client",
        project: flow.impactedProject,
      });
    } else if (amountValue > 0) {
      savePaymentMovement({
        id: `ask-movement-${Date.now()}`,
        type: movementType,
        title:
          flow.type === "supplier-check"
            ? "Supplier commitment recorded"
            : flow.type === "payment-recorded"
              ? "Operational cost recorded"
              : "Operational update recorded",
        amountLabel,
        amountValue,
        status: "Verified",
        project: flow.impactedProject,
        sourceLabel: "Ask Zila",
        reason: flow.guidanceHeadline,
        txHash,
        explorerUrl: buildXrplExplorerUrl(txHash),
        createdAtIso,
      });
    }

    saveProofTransaction({
      id: `ask-proof-${Date.now()}`,
      walletAddress: "operational-memory",
      walletAddressShort: "Ask Zila",
      status: "Confirmed",
      amountLabel,
      amountValue,
      network: "XRPL Mainnet",
      linkedType: "project",
      linkedLabel: flow.impactedProject,
      project: flow.impactedProject,
      actionLabel: "recorded",
      contextLabel: `${flow.interpretation[1]?.value ?? "Operational update"} recorded`,
      summary: `${flow.operationalConsequence} Recommendation generated: ${flow.nextActionPrimary}.`,
      hash: txHash,
      createdAtIso,
      displayTimestamp: new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(createdAtIso)),
    });

    const proofReference = `OPS-${txHash.slice(-8)}`;

    saveAskOperationalUpdate({
      id: `ask-update-${Date.now()}`,
      project: flow.impactedProject,
      change: flow.interpretation[1]?.value ?? "Operational update",
      consequence: flow.operationalConsequence,
      recommendation: flow.nextActionPrimary,
      pressureLevel: flow.pressureLevel,
      proofReference,
      amountLabel: flow.detectedAmount,
      createdAtIso,
    });

    setRecordedProofReference(proofReference);
    setSummary(getProtectedMoneySummary());
  };

  const submitMessage = (message: string) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
    }
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }

    setActivePrompt(trimmed);
    setSubmittedMessage(trimmed);
    setIsThinking(true);
    setHasResponse(false);
    setVisibleSteps(0);
    resetExecutionState();

    thinkingTimeoutRef.current = setTimeout(() => {
      setIsThinking(false);
      setHasResponse(true);
      setVisibleSteps(1);

      revealTimeoutRef.current = setTimeout(() => {
        setVisibleSteps(2);

        revealTimeoutRef.current = setTimeout(() => {
          setVisibleSteps(3);
        }, 300);
      }, 300);
    }, 1400);
  };

  const handleApply = () => {
    if (isApplying) {
      return;
    }

    setIsApplying(true);
    setApplyStage("applying");
    setHasApplied(false);
    setConfirmedAction(null);

    applyStageTimeoutRef.current = setTimeout(() => {
      setApplyStage("updating");
    }, 450);

    applyCompleteTimeoutRef.current = setTimeout(() => {
      recordOperationalUpdate();
      setIsApplying(false);
      setApplyStage("idle");
      setHasApplied(true);
    }, 1200);
  };

  const handlePrompt = (prompt: string) => {
    setQuery(prompt);
    submitMessage(prompt);
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      const spokenPrompt = "I paid 2000 for materials on Project Horizon.";
      setIsRecording(false);
      setQuery(spokenPrompt);
      submitMessage(spokenPrompt);
      return;
    }

    setIsRecording(true);
    setConfirmedAction(null);
  };

  const handleMoveFunds = () => {
    const fullAmount = flow.detectedAmountValue && flow.detectedAmountValue > 0 ? flow.detectedAmountValue : 4300;
    const recommendedAmount = Math.max(Math.round(fullAmount * 0.6), 500);

    savePaymentDraft({
      projectId: flow.impactedProject.toLowerCase().replace(/\s+/g, "-"),
      projectName: flow.impactedProject,
      amountValue: recommendedAmount,
      amountLabel: `$${recommendedAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      paymentType: "Supplier payment",
      selectedAction: "recommended-partial",
      sourceLabel: "Available balance",
      availableBalanceLabel: "$42,300",
    });

    router.push("/payments/make-payment");
  };

  const handleActionCta = (label: string) => {
    if (label === "Send payment" || label === "Move funds") {
      handleMoveFunds();
      return;
    }

    if (label === "Create reserve" || label === "Protect money") {
      router.push("/move-funds");
      return;
    }

    if (label === "Adjust project allocation") {
      router.push("/projects");
      return;
    }

    handleApply();
  };

  const quickActionLabel =
    quickAction === "upload-document"
      ? "Upload document"
      : quickAction === "record-payment"
        ? "Record payment"
        : quickAction === "add-update"
          ? "Add update"
          : null;

  const operationalStatusClasses =
    "border-[#67E8F9]/30 bg-[linear-gradient(180deg,rgba(103,232,249,0.16),rgba(255,255,255,0.07))] text-[#E8FCFF] shadow-[0_0_24px_rgba(103,232,249,0.10),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl";

  const isProjectHorizonExample = submittedMessage === prompts[0];
  const displayedSafeBefore = isProjectHorizonExample ? 41200 : safeBefore;
  const displayedSafeAfter = isProjectHorizonExample ? 39200 : safeAfter;
  const safeDelta = Math.abs(displayedSafeAfter - displayedSafeBefore);
  const safeDeltaLabel = `${isIncomingUpdate ? "+" : "-"}$${safeDelta.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const hasConversation = Boolean(submittedMessage);
  const responseVisible = hasConversation && hasResponse && !isThinking;
  const shouldShowReaction = responseVisible && visibleSteps >= 1;
  const shouldShowAction = responseVisible && visibleSteps >= 2;
  const shouldShowProof = responseVisible && visibleSteps >= 3;

  return (
    <AppShell>
      <div className="relative -mx-4 -mt-2 min-h-[calc(100vh-7rem)] overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.78),transparent_30%),radial-gradient(ellipse_at_82%_4%,rgba(103,232,249,0.22),transparent_28%),linear-gradient(180deg,#DCEEFF_0%,#C9DFF8_48%,#A8C9ED_100%)] px-4 pb-24 pt-4 text-[#10233F] md:-mx-6 md:rounded-[36px] md:px-7 md:pb-12 md:pt-6 lg:-mx-8 lg:px-9">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.32),transparent_38%,rgba(29,78,216,0.055)_72%,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-20 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#67E8F9]/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-9rem)] max-w-[1060px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1D4ED8]">Ask Zila</p>
              <h1 className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.045em] text-[#10233F] md:text-[36px]">
                Tell Zila what changed.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#D9FF57]/60 bg-[#F1FFC2]/90 px-3 py-1.5 text-[11px] font-semibold text-[#476022] shadow-[0_10px_24px_rgba(217,255,87,0.12)]">
                Day 14 streak
              </span>
              <Link
                href="/proof"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#BFD5EF] bg-white/70 px-3 text-[12px] font-semibold text-[#17345F] transition hover:-translate-y-0.5 hover:border-[#1D4ED8]/30"
              >
                <FileCheck2 className="h-3.5 w-3.5" strokeWidth={2} />
                Proof
              </Link>
            </div>
          </div>

          <section className="mt-5 flex flex-1 flex-col overflow-hidden rounded-[32px] border border-[#17345F]/18 bg-[linear-gradient(180deg,#183B6A_0%,#10233F_50%,#081525_100%)] text-white shadow-[0_34px_90px_rgba(16,35,63,0.34),inset_0_1px_0_rgba(255,255,255,0.16)]">
            <div className="relative flex min-h-[680px] flex-1 flex-col px-4 py-5 md:px-7 md:py-7">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,232,249,0.20),transparent_62%)]" />
              <div className="pointer-events-none absolute inset-x-8 top-24 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.42),transparent)]" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Live operational conversation</p>
                  <p className="mt-2 max-w-[640px] text-[22px] font-semibold leading-[1.14] tracking-[-0.04em] text-white md:text-[30px]">
                    Speak once. Zila updates money, projects, actions, and proof.
                  </p>
                </div>
                <span className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] md:inline-flex ${operationalStatusClasses}`}>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#67E8F9] shadow-[0_0_12px_rgba(103,232,249,0.36)]">
                    <span className="insight-signal-ripple absolute inset-0 rounded-full bg-[#67E8F9]" />
                  </span>
                  Operations updating
                </span>
              </div>

              <div className="relative mt-6 flex-1 overflow-y-auto pb-4 pr-0 md:pr-2">
                <div className="mx-auto max-w-[820px] space-y-6">
                  {!hasConversation ? (
                    <div className="pt-6 md:pt-10">
                      <div className="max-w-[620px] rounded-[28px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_24px_58px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Zila</p>
                        <p className="mt-3 text-[25px] font-semibold leading-[1.14] tracking-[-0.045em] text-white md:text-[34px]">
                          Tell me what changed. I&apos;ll update money, projects, next moves, and proof in one flow.
                        </p>
                        <p className="mt-4 text-[15px] leading-[1.75] text-[#D7E3F8]">
                          Speak naturally, type a quick update, or upload a document. The operating response will appear here as it is generated.
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {prompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handlePrompt(prompt)}
                            className={`rounded-full border px-4 py-2.5 text-left text-[12px] font-semibold transition ${
                              activePrompt === prompt
                                ? "border-[#67E8F9]/28 bg-[#67E8F9]/12 text-white"
                                : "border-white/10 bg-white/[0.05] text-[#D7E3F8] hover:bg-white/[0.08]"
                            }`}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {hasConversation ? (
                    <div className="ml-auto max-w-[690px] rounded-[26px] border border-white/10 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">You</p>
                          <p className="mt-2 text-[18px] font-semibold leading-[1.45] tracking-[-0.02em] text-white">{submittedMessage}</p>
                        </div>
                        {quickActionLabel ? (
                          <span className="shrink-0 rounded-full border border-[#67E8F9]/24 bg-[#67E8F9]/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C7F7FF]">
                            {quickActionLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {hasConversation ? (
                    <div className="max-w-[680px] rounded-[28px] border border-[#67E8F9]/20 bg-[#67E8F9]/10 p-5 shadow-[0_18px_46px_rgba(103,232,249,0.08)]">
                      <div className="flex items-start gap-4">
                        <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#67E8F9]/28 bg-[#67E8F9]/14 text-[#DDFBFF]">
                          {isThinking ? <span className="insight-signal-ripple absolute h-8 w-8 rounded-full bg-[#67E8F9]" /> : null}
                          <Activity className="relative h-[19px] w-[19px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7F7FF]">Zila</p>
                          <p className="mt-2 text-[22px] font-semibold leading-[1.18] tracking-[-0.04em] text-white">
                            Understood. Recalculating {flow.impactedProject}&apos;s operating range...
                          </p>
                          <div className="mt-4 flex h-10 items-end gap-1.5">
                            {[12, 26, 18, 34, 24, 30, 16, 28, 20, 32].map((height, index) => (
                              <span
                                key={`${height}-${index}`}
                                className={`w-1.5 rounded-full transition-all ${isThinking ? "bg-[#67E8F9]/85" : "bg-[#67E8F9]/38"}`}
                                style={{ height: `${isThinking ? height : Math.max(7, height * 0.38)}px` }}
                              />
                            ))}
                          </div>
                          {!isThinking ? (
                            <p className="mt-2 text-[12px] font-semibold text-[#C7F7FF]">Operating range recalculated</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {responseVisible ? (
                    <div className="max-w-[760px] rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]">
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#D9FF57]/24 bg-[#D9FF57]/14 text-[#EAFFB4]">
                          <Activity className="h-[19px] w-[19px]" strokeWidth={2} />
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Zila</p>
                          <h2 className="mt-2 text-[25px] font-semibold leading-[1.12] tracking-[-0.045em] text-white md:text-[35px]">{flow.guidanceHeadline}</h2>
                          <p className="mt-3 max-w-[640px] text-[15px] leading-[1.75] text-[#D7E3F8]">{flow.guidanceText}</p>
                          <p className="mt-4 inline-flex rounded-full border border-[#67E8F9]/18 bg-[#67E8F9]/10 px-3 py-1.5 text-[12px] font-semibold text-[#DDFBFF]">
                            {flow.memoryPattern}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {flow.interpretation.slice(0, 3).map((item) => (
                              <span key={item.label} className="rounded-full border border-white/10 bg-[#071526]/32 px-3 py-1.5 text-[11px] font-semibold text-[#D7E3F8]">
                                {item.label}: <span className="text-white">{item.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {shouldShowReaction ? (
                    <div className="ml-10 max-w-[650px] rounded-[24px] border border-[#67E8F9]/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.13),rgba(255,255,255,0.06))] p-4 shadow-[0_18px_46px_rgba(103,232,249,0.08)] transition-all">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7F7FF]">Live update</p>
                      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[18px] font-semibold text-white">Safe to spend updated</p>
                          <p className="mt-2 text-[13px] leading-[1.65] text-[#D7E3F8]">{flow.operationalConsequence}</p>
                        </div>
                        <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#071526]/34 px-4 py-3">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Before</p>
                            <p className="mt-1 text-[22px] font-semibold tracking-[-0.05em] text-[#D7E3F8]">${displayedSafeBefore.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[#7EE7F6]" strokeWidth={2} />
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#EAFFB4]">After</p>
                            <p className="mt-1 text-[26px] font-semibold tracking-[-0.05em] text-white">${displayedSafeAfter.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                          </div>
                        </div>
                      </div>
                      {safeDelta > 0 ? (
                        <p className="mt-3 text-[12px] font-semibold text-[#DDFBFF]">{safeDeltaLabel} operating movement detected</p>
                      ) : null}
                    </div>
                  ) : null}

                  {shouldShowAction ? (
                    <div className="ml-10 max-w-[610px] rounded-[24px] border border-white/12 bg-white/[0.08] p-4 transition-all">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#D9FF57]/24 bg-[#D9FF57]/14 text-[#EAFFB4]">
                          <LockKeyhole className="h-[16px] w-[16px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Recommended</p>
                          <p className="mt-2 text-[22px] font-semibold leading-[1.18] tracking-[-0.04em] text-white">Move $4,300 to stabilize {flow.impactedProject}.</p>
                          <p className="mt-2 text-[13px] leading-[1.65] text-[#D7E3F8]">{flow.reserveImpact}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleMoveFunds}
                              disabled={Boolean(flow.needsAmountClarification)}
                              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-white px-4 text-[13px] font-semibold text-[#10233F] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Move funds
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActionCta("Protect money")}
                              disabled={isApplying || Boolean(flow.needsAmountClarification)}
                              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-white/14 bg-white/[0.07] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Protect money
                            </button>
                            <button
                              type="button"
                              onClick={handleApply}
                              disabled={isApplying || Boolean(flow.needsAmountClarification)}
                              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-white/14 bg-white/[0.07] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Record only
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {shouldShowProof ? (
                    <div className="ml-10 max-w-[610px] rounded-[24px] border border-[#D9FF57]/20 bg-[linear-gradient(180deg,rgba(217,255,87,0.12),rgba(255,255,255,0.06))] p-4 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#EAFFB4]">Proof prepared</p>
                          <p className="mt-2 text-[18px] font-semibold text-white">Operational history updated</p>
                          <p className="mt-2 text-[13px] leading-[1.65] text-[#D7E3F8]">XRPL-ready reference created for {flow.impactedProject}. {flow.proofText.replace("Recorded. ", "")}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/22 bg-[#D9FF57]/12 px-3 py-1.5 text-[11px] font-semibold text-[#F1FFB8]">
                          <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                          {recordedProofReference ?? "OPS-ready"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href="/proof"
                          className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#D9FF57]/42 bg-[#F1FFC2] px-4 text-[13px] font-semibold text-[#476022] transition hover:-translate-y-0.5"
                        >
                          View proof
                        </Link>
                      </div>
                      {hasApplied ? (
                        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                          {flow.completionLines.map((line) => (
                            <p key={line} className="inline-flex items-center gap-2 text-[13px] font-medium text-[#F1FFB8]">
                              <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="relative mt-5 border-t border-white/10 pt-5">
                <div className="rounded-[28px] border border-white/14 bg-[#071526]/62 p-3 shadow-[0_24px_58px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:items-stretch">
                    <button
                      type="button"
                      onClick={handleRecordingToggle}
                      className={`relative flex min-h-[88px] items-center justify-center overflow-hidden rounded-[22px] border transition hover:-translate-y-0.5 ${
                        isRecording
                          ? "border-[#D9FF57]/44 bg-[#D9FF57]/18 text-[#F1FFB8] shadow-[0_0_0_10px_rgba(217,255,87,0.04),0_20px_44px_rgba(217,255,87,0.13)]"
                          : "border-[#67E8F9]/24 bg-[#67E8F9]/12 text-[#DDFBFF] shadow-[0_0_0_10px_rgba(103,232,249,0.035),0_20px_44px_rgba(103,232,249,0.10)]"
                      }`}
                      aria-label={isRecording ? "Stop listening" : "Start voice input"}
                    >
                      <span className={`insight-signal-ripple absolute h-12 w-12 rounded-full ${isRecording ? "bg-[#D9FF57]" : "bg-[#67E8F9]"}`} />
                      <span className="absolute inset-3 rounded-[18px] border border-white/10" />
                      {isRecording ? <Square className="relative h-9 w-9" strokeWidth={1.8} /> : <Mic className="relative h-10 w-10" strokeWidth={1.8} />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">
                          {isRecording ? "Listening..." : "Speak or type an operational change"}
                        </p>
                        <div className="flex h-7 items-end gap-1.5">
                          {[13, 24, 18, 30, 20, 26, 15, 28, 17, 22].map((height, index) => (
                            <span
                              key={`${height}-${index}`}
                              className={`w-1 rounded-full ${isRecording ? "bg-[#D9FF57]" : "bg-[#67E8F9]/60"}`}
                              style={{ height: `${isRecording ? height : Math.max(7, height * 0.42)}px` }}
                            />
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          resetExecutionState();
                        }}
                        placeholder="Supplier cost increased by $2k on Project Horizon..."
                        rows={2}
                        className="min-h-[82px] w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] leading-[1.6] text-white outline-none placeholder:text-[#8FA4C3] focus:border-[#67E8F9]/38"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <MockInvoiceUpload
                        tone="dark"
                        inlineInFlexRow
                        buttonClassName="!h-11 !rounded-[15px] !border-white/12 !bg-white/[0.06] !text-[#D7E3F8]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => submitMessage(query)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-white px-5 text-[14px] font-semibold text-[#10233F] shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
                    >
                      <Send className="h-[15px] w-[15px]" strokeWidth={2} />
                      Coordinate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
