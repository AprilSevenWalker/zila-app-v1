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
type ImpactLevel = "Minor" | "Medium" | "High";
type VoiceStatus =
  | "idle"
  | "recording"
  | "processing"
  | "sending"
  | "applied"
  | "error";

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
  impactLevel: ImpactLevel;
  reserveImpact: string;
  operationalConsequence: string;
  actionLabels: string[];
}

interface VoiceMessage {
  id: string;
  audioUrl: string;
  durationSeconds: number;
  transcript: string;
  transcriptLabel: "Demo transcription" | "Transcription";
}

const prompts = [
  "Can we still pay Northline Friday?",
  "What changed after the supplier payout?",
  "Which projects are under pressure?",
  "Show reserve movement",
  "What affects runway most this week?",
];

const operationalFocus = [
  {
    label: "Reserve",
    title: "Northline payout can settle without drawing protected reserve.",
    state: "Healthy",
  },
  {
    label: "Payouts",
    title: "1 supplier payout due Friday.",
    state: "Scheduled",
  },
  {
    label: "Pressure",
    title: "Project Horizon is the only watch point.",
    state: "Watch",
  },
];

const liveSystemStates = ["Operations updating", "Reserve recalculating", "Proof record syncing", "Cashflow impact recalculated"];
const operationalProcessingSteps = [
  "Updating project state",
  "Recalculating reserve impact",
  "Evaluating payout pressure",
  "Syncing proof history",
  "Updating operational memory",
];
const demoVoiceTranscript = "Move 300 dollars from operations reserve to delivery for Helix Project";

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

function getImpactLevel(numericValue: number): ImpactLevel {
  if (numericValue <= 100) {
    return "Minor";
  }

  if (numericValue < 1800) {
    return "Medium";
  }

  return "High";
}

function getCostImpactCopy(project: string, amountText: string, impactLevel: ImpactLevel) {
  if (impactLevel === "Minor") {
    return {
      headline: "Minor expense increase recorded.",
      guidance: `${project} updated successfully. Operating range adjusted slightly.`,
      memory: "Small expenses are recorded without creating operational pressure.",
      reserveImpact: "Reserve impact minimal. Protected money does not need to move.",
      consequence: "Operating range adjusted slightly.",
      pressure: "Low" as const,
      actions: ["Record only"],
      nextPrimary: "Record update",
      nextFallback: "No money movement needed",
    };
  }

  if (impactLevel === "Medium") {
    return {
      headline: "Operating cushion reduced.",
      guidance: `${amountText} has been added to ${project}. Cash coordination adjusted.`,
      memory: "Medium cost changes can tighten the operating range if more supplier activity lands this week.",
      reserveImpact: "Reserve threshold tightening. Review again if another commitment lands.",
      consequence: "Cash coordination adjusted.",
      pressure: "Watch" as const,
      actions: ["Record only", "Protect money"],
      nextPrimary: "Keep reserve under watch",
      nextFallback: "Protect money if costs keep climbing",
    };
  }

  return {
    headline: `${project} is approaching a funding pressure point.`,
    guidance: `${amountText} materially reduces the operating range. Zila prepared a safer next move.`,
    memory: "Supplier-heavy weeks usually reduce your safe range before delivery completes.",
    reserveImpact: "Upcoming payout may affect reserve stability.",
    consequence: "Operational pressure increasing.",
    pressure: "High" as const,
    actions: ["Move funds", "Protect money", "Record only"],
    nextPrimary: "Move funds to protect the week",
    nextFallback: "Delay noncritical payout until cash lands",
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
    impactLevel: "Medium",
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
    impactLevel: input.pressure === "High" ? "High" : input.pressure === "Watch" ? "Medium" : "Minor",
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
    lower.includes("expense") ||
    lower.includes("food") ||
    lower.includes("bought") ||
    lower.includes("payment");
  const decisionQuestion =
    lower.includes("can i") ||
    lower.includes("can we") ||
    lower.includes("should i") ||
    lower.includes("am i") ||
    lower.includes("what happens");

  if (lower.includes("northline")) {
    return createOperationalContextFlow({
      project: "Project Horizon",
      detected: "Northline payout due Friday",
      headline: "Yes. The Northline payout can be safely coordinated.",
      guidance: "Stablecoin settlement is ready, the supplier reserve remains protected, and proof will attach automatically after confirmation.",
      memory: "Zila linked the supplier obligation, reserve state, and payment route before recommending execution.",
      reserveImpact: "Protected reserve remains above threshold after payout.",
      consequence: "Supplier obligation clears without weakening next week's operating range.",
      pressure: "Watch",
      actions: ["Send payment", "Review reserve", "View proof"],
    });
  }

  if (lower.includes("under pressure") || lower.includes("pressure")) {
    return createOperationalContextFlow({
      project: "Portfolio",
      detected: "Project pressure check",
      headline: "Project Horizon is the only active watch point.",
      guidance: "Northline Suppliers are due Friday. Atlas and Northstar remain inside their current operating ranges.",
      memory: "Supplier timing is the main pressure source this week.",
      reserveImpact: "Reserve protection remains active across upcoming obligations.",
      consequence: "One coordinated payout should keep the portfolio stable.",
      pressure: "Watch",
      actions: ["Open Payments", "Review Projects", "View proof"],
    });
  }

  if (lower.includes("affect reserves") || lower.includes("affected reserves") || lower.includes("reserve")) {
    if (amountText && lower.includes("move") && lower.includes("delivery")) {
      return {
        type: "payment-recorded",
        interpretation: [
          { label: "Got it", value: project },
          { label: "Detected", value: "Reserve transfer" },
          { label: "Amount", value: amountText },
        ],
        guidanceHeadline: `${amountText} reserve movement prepared for ${project}.`,
        guidanceText: "Zila will move the operating context from Operations Reserve into Delivery and keep the reserve impact visible.",
        memoryPattern: "Reserve movements update project pressure, payment readiness, and operational memory together.",
        applySteps: ["Record reserve movement", "Refresh delivery allocation", "Sync operational record"],
        completionLines: ["All done", `${project} updated`, `${amountText} reserve movement recorded`, "Operational record created"],
        nextActionPrimary: "Record commitment",
        nextActionFallback: "Review project allocation",
        proofText: `Recorded. Reserve movement of ${amountText} added to ${project}. Time stamped and added to verified history.`,
        detectedAmount: amountText,
        detectedAmountValue: amountValue,
        needsAmountClarification: false,
        impactedProject: project,
        pressureLevel: "Watch",
        impactLevel: "Medium",
        reserveImpact: "Operations Reserve decreases while Delivery allocation gains coverage.",
        operationalConsequence: "Delivery gets more working room while reserve protection remains visible.",
        actionLabels: ["Record commitment", "Move funds", "Review Projects"],
      };
    }

    return createOperationalContextFlow({
      project: "Project Horizon",
      detected: "Reserve impact check",
      headline: "The payout does not draw down protected reserve.",
      guidance: "After the Northline payout, the supplier reserve remains protected and runway stays inside the current operating range.",
      memory: "Zila keeps payout routing separate from money reserved for upcoming obligations.",
      reserveImpact: "Protected balance remains at $24,220 before settlement.",
      consequence: "Treasury remains stable after payment coordination.",
      pressure: "Low",
      actions: ["Review payout", "Open Proof", "Record update"],
    });
  }

  if (lower.includes("verified operations") || lower.includes("investor")) {
    return createOperationalContextFlow({
      project: "Portfolio",
      detected: "Verified operational record",
      headline: "Verified operational records are ready to review.",
      guidance: "Zila uses supplier payouts, reserve movements, settlement records, and project updates already synced to operational memory.",
      memory: "Proof attaches automatically from activity recorded across Projects and Payments.",
      reserveImpact: "Reserve protection, payout timing, and verified settlement records will be included.",
      consequence: "External verification can be shared without rebuilding the history manually.",
      pressure: "Low",
      actions: ["Open Proof", "Review timeline", "Record update"],
    });
  }

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
      impactLevel: answerLabel === "Yes" ? "Minor" : answerLabel === "No" ? "High" : "Medium",
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
      impactLevel: "Minor",
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
      impactLevel: "Medium",
      reserveImpact: "Supplier or payroll reserve may need more cover.",
      operationalConsequence: "Upcoming commitments should be watched until the delayed money lands.",
      actionLabels: ["Record commitment", "Create reserve", "Protect money"],
    };
  }

  if (paymentLanguage) {
    if (!amountText) {
      return createAmountClarificationFlow("Payment or spend update");
    }

    const isCostLike =
      lower.includes("cost") ||
      lower.includes("expense") ||
      lower.includes("spent") ||
      lower.includes("food") ||
      lower.includes("bought");
    const impactLevel = getImpactLevel(amountValue);
    const impactCopy = isCostLike ? getCostImpactCopy(project, amountText, impactLevel) : null;
    const nextMove = isCostLike
      ? impactLevel === "High"
        ? getCostNextMove(extractedAmount.numericValue, extractedAmount.currency)
        : { primary: impactCopy?.nextPrimary ?? "Record update", fallback: impactCopy?.nextFallback ?? "No immediate action needed" }
      : getPaymentNextMove(extractedAmount.numericValue, extractedAmount.currency);

    return {
      type: "payment-recorded",
      interpretation: [
        { label: "Got it", value: project },
        {
          label: "Detected",
          value: isCostLike ? "Expense update" : "Payment recorded",
        },
        { label: "Amount", value: amountText },
      ],
      guidanceHeadline: impactCopy?.headline ?? "This payment can be absorbed cleanly today.",
      guidanceText: impactCopy?.guidance ?? "Your week stays steady, and recording it now keeps the project view accurate.",
      memoryPattern: impactCopy?.memory ?? "This project typically creates payment pressure near delivery, so the record strengthens the next forecast.",
      applySteps: [
        isCostLike ? "Update project costs" : "Record payment",
        "Refresh project outlook",
        "Update next move recommendation",
      ],
      completionLines: [
        "All done",
        `${project} updated`,
        isCostLike ? `${amountText} expense recorded` : `${amountText} payment recorded`,
        "Next move prepared",
      ],
      nextActionPrimary: nextMove.primary,
      nextActionFallback: nextMove.fallback,
      proofText: isCostLike
        ? `Recorded. Expense update of ${amountText} added to ${project}. Time stamped and added to verified history.`
        : `Recorded. Payment of ${amountText} added to ${project}. Time stamped and added to verified history.`,
      detectedAmount: amountText,
      detectedAmountValue: amountValue,
      needsAmountClarification: false,
      impactedProject: project,
      pressureLevel: impactCopy?.pressure ?? "Watch",
      impactLevel: isCostLike ? impactLevel : "Minor",
      reserveImpact: impactCopy?.reserveImpact ?? "No reserve change unless this payment should be matched against protected money.",
      operationalConsequence: impactCopy?.consequence ?? "Project activity is updated and the operating record stays aligned.",
      actionLabels: impactCopy?.actions ?? ["Send payment", "Record commitment"],
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
      impactLevel: amountValue >= 2500 ? "Medium" : "Minor",
      reserveImpact: "Supplier Reserve can absorb this if you want to avoid reducing available balance.",
      operationalConsequence: "Delivery stays steady, with a narrower safe range for the next few days.",
      actionLabels: ["Send payment", "Protect money", "Move funds"],
    };
  }

  if (!amountText) {
    return createAmountClarificationFlow("Cost increase");
  }

  const impactLevel = getImpactLevel(amountValue);
  const impactCopy = getCostImpactCopy(project, amountText, impactLevel);
  const nextMove =
    impactLevel === "High"
      ? getCostNextMove(extractedAmount.numericValue, extractedAmount.currency)
      : { primary: impactCopy.nextPrimary, fallback: impactCopy.nextFallback };

  return {
    type: "cost-increase",
    interpretation: [
      { label: "Got it", value: project },
      { label: "Detected", value: "Expense update" },
      { label: "Amount", value: amountText },
    ],
    guidanceHeadline: impactCopy.headline,
    guidanceText: impactCopy.guidance,
    memoryPattern: impactCopy.memory,
    applySteps: [
      "Update project costs",
      "Refresh project outlook",
      "Adjust next move recommendation",
    ],
    completionLines: [
      "All done",
      `${project} updated`,
      `${amountText} expense recorded`,
      "Next move prepared",
    ],
    nextActionPrimary: nextMove.primary,
    nextActionFallback: nextMove.fallback,
    proofText: `Recorded. Expense update of ${amountText} added to ${project}. Time stamped and added to verified history.`,
    detectedAmount: amountText,
    detectedAmountValue: amountValue,
    needsAmountClarification: false,
    impactedProject: project,
    pressureLevel: impactCopy.pressure,
    impactLevel,
    reserveImpact: impactCopy.reserveImpact,
    operationalConsequence: impactCopy.consequence,
    actionLabels: impactCopy.actions,
  };
}

export function AskZilaScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const applyStageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingSecondsRef = useRef(0);
  const voiceSequenceRef = useRef(0);
  const [query, setQuery] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<VoiceMessage | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);
  const [hasResponse, setHasResponse] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
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

  const clearProcessingTimers = () => {
    processingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    processingTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
      clearProcessingTimers();
      if (applyStageTimeoutRef.current) {
        clearTimeout(applyStageTimeoutRef.current);
      }
      if (applyCompleteTimeoutRef.current) {
        clearTimeout(applyCompleteTimeoutRef.current);
      }
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
      }
      if (voiceStatusTimeoutRef.current) {
        clearTimeout(voiceStatusTimeoutRef.current);
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
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

  const clearWorkspace = () => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
    }
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
    clearProcessingTimers();
    clearVoiceTimers();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      resetRecordingHardware();
    }
    setQuery("");
    setActivePrompt(null);
    setSubmittedMessage("");
    setIsThinking(false);
    setActiveProcessingStep(0);
    setHasResponse(false);
    setVisibleSteps(0);
    setVoiceStatus("idle");
    setVoiceError(null);
    setVoiceMessage(null);
    setRecordingSeconds(0);
    setIsRecording(false);
    resetExecutionState();
  };

  const recordOperationalUpdate = () => {
    if (flow.needsAmountClarification || recordedProofReference) {
      return;
    }

    const createdAtIso = new Date().toISOString();
    const recordId = createdAtIso.replace(/[^0-9]/g, "");
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
        id: `ask-movement-${recordId}`,
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
      id: `ask-proof-${recordId}`,
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
      id: `ask-update-${recordId}`,
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
    clearProcessingTimers();

    setActivePrompt(trimmed);
    setSubmittedMessage(trimmed);
    setQuery("");
    setIsThinking(true);
    setActiveProcessingStep(0);
    setHasResponse(false);
    setVisibleSteps(0);
    resetExecutionState();

    operationalProcessingSteps.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setActiveProcessingStep(index);
      }, index * 260);

      processingTimeoutsRef.current.push(timeout);
    });

    thinkingTimeoutRef.current = setTimeout(() => {
      clearProcessingTimers();
      setActiveProcessingStep(operationalProcessingSteps.length - 1);
      setIsThinking(false);
      setHasResponse(true);
      setVisibleSteps(1);

      revealTimeoutRef.current = setTimeout(() => {
        setVisibleSteps(2);

        revealTimeoutRef.current = setTimeout(() => {
          setVisibleSteps(3);
          revealTimeoutRef.current = setTimeout(() => {
            setVisibleSteps(4);
            revealTimeoutRef.current = setTimeout(() => {
              setVisibleSteps(5);
            }, 380);
          }, 380);
        }, 380);
      }, 420);
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
      setConfirmedAction(flow.nextActionPrimary);
    }, 1200);
  };

  const handlePrompt = (prompt: string) => {
    setQuery(prompt);
    setActivePrompt(prompt);
    submitMessage(prompt);
  };

  const clearVoiceTimers = () => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    if (voiceStatusTimeoutRef.current) {
      clearTimeout(voiceStatusTimeoutRef.current);
      voiceStatusTimeoutRef.current = null;
    }
  };

  const resetRecordingHardware = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceStatus("error");
      setVoiceError("Voice update could not be recorded. Try typing the update instead.");
      return;
    }

    try {
      clearVoiceTimers();
      setVoiceError(null);
      setVoiceMessage(null);
      setRecordingSeconds(0);
      setConfirmedAction(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordingSecondsRef.current = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        clearVoiceTimers();
        resetRecordingHardware();
        setIsRecording(false);
        setVoiceStatus("error");
        setVoiceError("Voice update could not be recorded. Try typing the update instead.");
      };

      recorder.onstop = () => {
        const durationSeconds = Math.max(1, recordingSecondsRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });

        clearVoiceTimers();
        resetRecordingHardware();
        setIsRecording(false);

        if (!audioBlob.size) {
          setVoiceStatus("error");
          setVoiceError("Voice update could not be recorded. Try typing the update instead.");
          return;
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        const transcript = demoVoiceTranscript;
        const voiceUpdate: VoiceMessage = {
          id: `voice-${voiceSequenceRef.current}`,
          audioUrl,
          durationSeconds,
          transcript,
          transcriptLabel: "Demo transcription",
        };

        setVoiceStatus("processing");
        setVoiceMessage(voiceUpdate);

        voiceStatusTimeoutRef.current = setTimeout(() => {
          setVoiceStatus("sending");
          submitMessage(transcript);

          voiceStatusTimeoutRef.current = setTimeout(() => {
            setVoiceStatus("applied");
          }, 2200);
        }, 650);
      };

      recorder.start();
      voiceSequenceRef.current += 1;
      setIsRecording(true);
      setVoiceStatus("recording");
      voiceTimerRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
      }, 1000);
    } catch {
      clearVoiceTimers();
      resetRecordingHardware();
      setIsRecording(false);
      setVoiceStatus("error");
      setVoiceError("Microphone access is needed to record a voice update.");
    }
  };

  const stopVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      setVoiceStatus("error");
      setVoiceError("Voice update could not be recorded. Try typing the update instead.");
      return;
    }

    setVoiceStatus("processing");
    recorder.stop();
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    void startVoiceRecording();
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

    router.push("/payments/send");
  };

  const handleActionCta = (label: string) => {
    if (label === "Send payment" || label === "Move funds") {
      setConfirmedAction(label);
      handleMoveFunds();
      return;
    }

    if (label === "Open Payments" || label === "Review payout") {
      router.push("/payments/send");
      return;
    }

    if (label === "Open Proof" || label === "View proof" || label === "Review timeline") {
      router.push("/proof");
      return;
    }

    if (label === "Review Projects") {
      router.push("/projects");
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
    "border-[#D9FF57]/24 bg-[linear-gradient(180deg,rgba(217,255,87,0.11),rgba(255,255,255,0.055))] text-[#F1FFB8] shadow-[0_0_24px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl";

  const isProjectHorizonExample = false;
  const displayedSafeBefore = isProjectHorizonExample ? 41200 : safeBefore;
  const displayedSafeAfter = isProjectHorizonExample ? 39200 : safeAfter;
  const safeDelta = Math.abs(displayedSafeAfter - displayedSafeBefore);
  const safeDeltaLabel = `${isIncomingUpdate ? "+" : "-"}$${safeDelta.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const hasConversation = Boolean(submittedMessage);
  const responseVisible = hasConversation && hasResponse && !isThinking;
  const shouldShowReaction = responseVisible && visibleSteps >= 2;
  const shouldShowReserve = responseVisible && visibleSteps >= 3;
  const shouldShowAction = responseVisible && visibleSteps >= 4;
  const shouldShowProof = responseVisible && visibleSteps >= 5;
  const cashflowTitle =
    flow.impactLevel === "Minor"
      ? "Operating range adjusted slightly"
      : flow.impactLevel === "Medium"
        ? "Operating cushion reduced"
        : "Funding pressure detected";
  const reserveTitle =
    flow.impactLevel === "Minor"
      ? "Reserve impact minimal"
      : flow.impactLevel === "Medium"
        ? "Reserve threshold tightening"
        : "Reserve stability checked";
  const recommendationLabel =
    flow.impactLevel === "Minor"
      ? "Recorded guidance"
      : flow.impactLevel === "Medium"
        ? "Recommended next move"
        : "Action recommended";
  const visibleActionLabels = flow.actionLabels.length ? flow.actionLabels.slice(0, 3) : ["Record only"];
  const responseToneClass =
    flow.impactLevel === "High"
      ? "border-[#FBBF24]/14 bg-[linear-gradient(180deg,rgba(251,191,36,0.075),rgba(255,255,255,0.055))] shadow-[0_22px_54px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]"
      : "border-white/12 bg-white/[0.07] shadow-[0_22px_54px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]";
  const impactToneClass =
    flow.impactLevel === "High"
      ? "border-[#FBBF24]/16 bg-[linear-gradient(180deg,rgba(251,191,36,0.09),rgba(255,255,255,0.05))] shadow-[0_18px_46px_rgba(251,191,36,0.04)]"
      : "border-[#67E8F9]/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.13),rgba(255,255,255,0.06))] shadow-[0_18px_46px_rgba(103,232,249,0.08)]";

  return (
    <AppShell>
      <div className="relative -mx-4 -mt-2 min-h-[calc(100vh-6rem)] overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.78),transparent_30%),radial-gradient(ellipse_at_82%_4%,rgba(103,232,249,0.22),transparent_28%),linear-gradient(180deg,#DCEEFF_0%,#C9DFF8_48%,#A8C9ED_100%)] px-4 pb-20 pt-4 text-[#10233F] md:-mx-6 md:rounded-[32px] md:px-6 md:pb-10 md:pt-5 lg:-mx-7 lg:px-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.32),transparent_38%,rgba(29,78,216,0.055)_72%,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-20 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#67E8F9]/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1020px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1D4ED8]">Ask Zila</p>
              <h1 className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.045em] text-[#10233F] md:text-[32px]">
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

          <section className="mt-4 flex flex-1 flex-col overflow-hidden rounded-[28px] border border-[#17345F]/18 bg-[linear-gradient(180deg,#183B6A_0%,#10233F_50%,#081525_100%)] text-white shadow-[0_30px_78px_rgba(16,35,63,0.30),inset_0_1px_0_rgba(255,255,255,0.16)]">
            <div className="relative flex min-h-[560px] flex-1 flex-col px-4 py-4 sm:min-h-[600px] md:px-6 md:py-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,232,249,0.20),transparent_62%)]" />
              <div className="pointer-events-none absolute inset-x-8 top-24 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.42),transparent)]" />

              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Operational intelligence layer</p>
                  <p className="mt-2 max-w-[640px] text-[21px] font-semibold leading-[1.14] tracking-[-0.04em] text-white md:text-[27px]">
                    Tell Zila what changed.
                  </p>
                  <p className="mt-3 max-w-[660px] text-[14px] leading-[1.7] text-[#D7E3F8]">
                    Update projects, payouts, reserves, operational pressure, and proof records in real time.
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${operationalStatusClasses}`}>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.36)]">
                    <span className="insight-signal-ripple absolute inset-0 rounded-full bg-[#D9FF57]" />
                  </span>
                  {isThinking ? "Operations updating" : "Ready for update"}
                </span>
              </div>

              <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {["New operational update", "Recent updates", "Operational history"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={label === "New operational update" ? clearWorkspace : undefined}
                      className="rounded-full border border-white/10 bg-[#071526]/34 px-3 py-2 text-[11px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/20 hover:bg-[#D9FF57]/[0.065] hover:text-white"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearWorkspace}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-[#AFC0DD] transition hover:bg-white/[0.08] hover:text-white"
                >
                  Clear workspace
                </button>
              </div>

              <div className="relative mt-4 flex-1 overflow-y-auto pb-4 pr-0 md:mt-5 md:pr-2">
                <div className="mx-auto max-w-[820px] space-y-5">
                  {!hasConversation ? (
                    <div className="pt-1 md:pt-3">
                      <div className="rounded-[30px] border border-white/12 bg-white/[0.06] p-5 shadow-[0_24px_58px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)] md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-5">
                          <div className="max-w-[560px]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Live workspace</p>
                            <p className="mt-3 text-[25px] font-semibold leading-[1.14] tracking-[-0.045em] text-white md:text-[34px]">
                              Ready to coordinate the next operational change.
                            </p>
                            <p className="mt-4 text-[15px] leading-[1.75] text-[#D7E3F8]">
                              Speak naturally, type a quick update, or upload a document. Zila will translate the change into project state, money movement, reserve impact, and proof.
                            </p>
                          </div>
                          <div className="grid min-w-[230px] gap-2">
                            {liveSystemStates.map((state, index) => (
                              <div key={state} className="flex items-center gap-2 rounded-[16px] border border-white/8 bg-[#071526]/34 px-3 py-2">
                                <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#D9FF57] zila-live-dot" : "bg-[#67E8F9]/70"}`} />
                                <p className="text-[11px] font-semibold text-[#D7E3F8]">{state}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Suggested operational updates</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {prompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handlePrompt(prompt)}
                          className={`rounded-full border px-4 py-2.5 text-left text-[12px] font-semibold transition ${
                              activePrompt === prompt
                                ? "border-[#D9FF57]/26 bg-[#D9FF57]/[0.085] text-[#F1FFB8] shadow-[0_0_18px_rgba(217,255,87,0.06)]"
                                : "border-white/10 bg-white/[0.05] text-[#D7E3F8] hover:border-[#D9FF57]/16 hover:bg-white/[0.08]"
                            }`}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>

                      <div className="mt-7 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,21,38,0.42),rgba(255,255,255,0.035))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Today&apos;s operational focus</p>
                            <p className="mt-2 text-[18px] font-semibold tracking-[-0.035em] text-white">Project ranges stable. Reserves active.</p>
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
                            <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
                            Live reserve pulse
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 md:grid-cols-3">
                          {operationalFocus.map((item) => (
                            <div key={item.title} className="rounded-[18px] border border-white/8 bg-[#071526]/32 p-3 transition hover:border-[#67E8F9]/18 hover:bg-[#071526]/42">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8FA4C3]">{item.label}</p>
                                <span className="rounded-full border border-[#D9FF57]/12 bg-[#D9FF57]/[0.055] px-2 py-0.5 text-[9px] font-semibold text-[#EAFFB4]">{item.state}</span>
                              </div>
                              <p className="mt-2 text-[13px] font-semibold leading-[1.5] text-[#EAF4FF]">{item.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {hasConversation ? (
                    <div className="ml-auto max-w-[690px] rounded-[26px] border border-white/10 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">You</p>
                          {voiceMessage ? (
                            <div className="mt-2 rounded-[18px] border border-[#D9FF57]/14 bg-[#D9FF57]/[0.06] p-3">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-[13px] font-semibold text-[#F1FFB8]">Voice update</p>
                                  <p className="mt-1 text-[11px] text-[#C9D4F5]">{voiceMessage.durationSeconds}s recording</p>
                                </div>
                                <audio controls src={voiceMessage.audioUrl} className="h-9 max-w-full" />
                              </div>
                              <div className="mt-3 rounded-[14px] border border-white/8 bg-[#071526]/32 px-3 py-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D9FF57]">{voiceMessage.transcriptLabel}</p>
                                <p className="mt-1 text-[13px] font-semibold leading-[1.45] text-white">{voiceMessage.transcript}</p>
                              </div>
                            </div>
                          ) : null}
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
                    <div
                      className="zila-flow-step max-w-[680px] rounded-[28px] border border-[#67E8F9]/22 bg-[linear-gradient(180deg,rgba(103,232,249,0.13),rgba(7,21,38,0.22))] p-5 shadow-[0_18px_46px_rgba(103,232,249,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]"
                      style={{ animationDelay: "40ms" }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#D9FF57]/22 bg-[#D9FF57]/10 text-[#EAFFB4]">
                          {isThinking ? <span className="insight-signal-ripple absolute h-8 w-8 rounded-full bg-[#D9FF57]" /> : null}
                          <Activity className="relative h-[19px] w-[19px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7F7FF]">Zila</p>
                          <p className="mt-2 text-[22px] font-semibold leading-[1.18] tracking-[-0.04em] text-white">
                            Understood. {isThinking ? `Recalculating ${flow.impactedProject}'s operating range...` : `${flow.impactedProject} is updated.`}
                          </p>
                          <div className="mt-4 flex h-10 items-end gap-1.5">
                            {[12, 26, 18, 34, 24, 30, 16, 28, 20, 32].map((height, index) => (
                              <span
                                key={`${height}-${index}`}
                                className={`w-1.5 rounded-full transition-all ${isThinking ? "zila-voice-wave-bar bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.22)]" : "bg-[#D9FF57]/34"}`}
                                data-wave-index={index}
                                style={{ height: `${isThinking ? height : Math.max(7, height * 0.38)}px` }}
                              />
                            ))}
                          </div>
                          {isThinking ? (
                            <div className="mt-5 grid gap-2">
                              {operationalProcessingSteps.map((step, index) => (
                                <div
                                  key={step}
                                  className={`flex items-center gap-2 rounded-[15px] border px-3 py-2 transition ${
                                    index <= activeProcessingStep
                                      ? "border-[#D9FF57]/18 bg-[#D9FF57]/[0.07] text-[#F1FFB8]"
                                      : "border-white/8 bg-white/[0.035] text-[#8FA4C3]"
                                  }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${index === activeProcessingStep ? "zila-live-dot bg-[#D9FF57]" : index < activeProcessingStep ? "bg-[#D9FF57]" : "bg-[#67E8F9]/40"}`} />
                                  <p className="text-[12px] font-semibold">{step}</p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {!isThinking ? (
                            <p className="mt-2 text-[12px] font-semibold text-[#EAFFB4]">Operating range recalculated</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {responseVisible ? (
                    <div
                      className={`zila-flow-step max-w-[760px] rounded-[30px] p-5 ${responseToneClass}`}
                      style={{ animationDelay: "70ms" }}
                    >
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
                    <div
                      className={`zila-flow-step ml-0 sm:ml-10 max-w-[650px] rounded-[24px] p-4 transition-all ${impactToneClass}`}
                      style={{ animationDelay: "90ms" }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C7F7FF]">Live update</p>
                      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[18px] font-semibold text-white">{cashflowTitle}</p>
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

                  {shouldShowReserve ? (
                    <div
                      className="zila-flow-step ml-0 sm:ml-10 max-w-[610px] rounded-[24px] border border-[#5EEAD4]/18 bg-[linear-gradient(180deg,rgba(94,234,212,0.09),rgba(7,21,38,0.34))] p-4 shadow-[0_18px_42px_rgba(94,234,212,0.05),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all"
                      style={{ animationDelay: "110ms" }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#67E8F9]/22 bg-[#67E8F9]/10 text-[#DDFBFF]">
                          <span className="insight-signal-ripple absolute h-6 w-6 rounded-full bg-[#D9FF57]" />
                          <LockKeyhole className="relative h-[16px] w-[16px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#EAFFB4]">Reserve update</p>
                          <p className="mt-2 text-[20px] font-semibold leading-[1.18] tracking-[-0.04em] text-white">{reserveTitle}</p>
                          <p className="mt-2 text-[13px] leading-[1.65] text-[#D7E3F8]">{flow.reserveImpact}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {shouldShowAction ? (
                    <div
                      className="zila-flow-step ml-0 sm:ml-10 max-w-[610px] rounded-[24px] border border-[#D9FF57]/16 bg-[linear-gradient(180deg,rgba(217,255,87,0.08),rgba(7,21,38,0.44))] p-4 shadow-[0_18px_44px_rgba(217,255,87,0.06),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all"
                      style={{ animationDelay: "130ms" }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#D9FF57]/24 bg-[#D9FF57]/14 text-[#EAFFB4]">
                          <LockKeyhole className="h-[16px] w-[16px]" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">{recommendationLabel}</p>
                          <p className="mt-2 text-[22px] font-semibold leading-[1.18] tracking-[-0.04em] text-white">{flow.nextActionPrimary}</p>
                          <p className="mt-2 text-[13px] leading-[1.65] text-[#D7E3F8]">{flow.nextActionFallback}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {visibleActionLabels.map((label, index) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => handleActionCta(label)}
                                disabled={isApplying || Boolean(flow.needsAmountClarification)}
                                className={`inline-flex h-11 items-center justify-center rounded-[14px] px-4 text-[13px] font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                                  index === 0 && flow.impactLevel !== "Minor"
                                    ? "bg-[#F1FFC2] text-[#476022] shadow-[0_14px_30px_rgba(217,255,87,0.12)]"
                                    : "border border-white/14 bg-white/[0.07] text-white hover:bg-white/[0.11]"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          {isApplying ? (
                            <p className="mt-3 text-[12px] font-semibold text-[#EAFFB4]">
                              {applyStage === "updating" ? "Update applied" : "Sending to Zila"}
                            </p>
                          ) : confirmedAction ? (
                            <p className="mt-3 text-[12px] font-semibold text-[#EAFFB4]">{confirmedAction} applied.</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {shouldShowProof ? (
                    <div
                      className="zila-flow-step ml-0 sm:ml-10 max-w-[610px] rounded-[24px] border border-[#9FE870]/18 bg-[linear-gradient(180deg,rgba(60,138,95,0.16),rgba(7,21,38,0.42))] p-4 shadow-[0_18px_44px_rgba(60,138,95,0.08),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all"
                      style={{ animationDelay: "150ms" }}
                    >
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

              <div className="zila-safe-bottom sticky bottom-0 z-20 mt-4 border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,21,37,0),rgba(8,21,37,0.82)_18%,#081525_100%)] pt-4">
                <div className={`rounded-[28px] border border-white/14 bg-[#071526]/72 p-3 shadow-[0_24px_58px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition focus-within:border-[#D9FF57]/24 focus-within:shadow-[0_24px_58px_rgba(0,0,0,0.16),0_0_26px_rgba(217,255,87,0.07),inset_0_1px_0_rgba(255,255,255,0.08)] ${isRecording ? "zila-voice-breathing border-[#D9FF57]/30" : ""}`}>
                  <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:items-stretch">
                    <button
                      type="button"
                      onClick={handleRecordingToggle}
                      className={`relative flex min-h-[88px] items-center justify-center overflow-hidden rounded-[22px] border transition hover:-translate-y-0.5 ${
                        isRecording
                          ? "zila-voice-breathing border-[#D9FF57]/44 bg-[#D9FF57]/18 text-[#F1FFB8] shadow-[0_0_0_10px_rgba(217,255,87,0.04),0_20px_44px_rgba(217,255,87,0.13)]"
                          : "border-[#D9FF57]/18 bg-[#D9FF57]/[0.075] text-[#F1FFB8] shadow-[0_0_0_10px_rgba(217,255,87,0.025),0_20px_44px_rgba(217,255,87,0.07)]"
                      }`}
                      aria-label={isRecording ? "Stop listening" : "Start voice input"}
                    >
                      {isRecording ? <span className="insight-signal-ripple absolute h-12 w-12 rounded-full bg-[#D9FF57]" /> : null}
                      <span className="absolute inset-3 rounded-[18px] border border-white/10" />
                      {isRecording ? <Square className="relative h-9 w-9" strokeWidth={1.8} /> : <Mic className="relative h-10 w-10" strokeWidth={1.8} />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">
                          {voiceStatus === "recording"
                            ? "Listening for operational update..."
                            : voiceStatus === "processing"
                              ? "Processing voice update"
                              : voiceStatus === "sending"
                                ? "Sending to Zila"
                                : voiceStatus === "applied"
                                  ? "Update applied"
                                  : voiceStatus === "error"
                                    ? "Could not process voice update"
                                    : "Speak or type an operational change"}
                        </p>
                        {isRecording ? (
                          <span className="rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] px-3 py-1 text-[11px] font-semibold text-[#EAFFB4]">
                            {recordingSeconds}s
                          </span>
                        ) : null}
                        <div className="flex h-7 items-end gap-1.5">
                          {[13, 24, 18, 30, 20, 26, 15, 28, 17, 22].map((height, index) => (
                            <span
                              key={`${height}-${index}`}
                              className={`w-1 rounded-full ${isRecording ? "zila-voice-wave-bar bg-[#D9FF57] shadow-[0_0_8px_rgba(217,255,87,0.26)]" : "bg-[#D9FF57]/48"}`}
                              data-wave-index={index}
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
                        className="min-h-[82px] w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] leading-[1.6] text-white outline-none placeholder:text-[#8FA4C3] transition focus:border-[#D9FF57]/34 focus:bg-white/[0.075] focus:shadow-[0_0_0_3px_rgba(217,255,87,0.055)]"
                      />
                      {voiceMessage && voiceStatus !== "recording" ? (
                        <p className="mt-2 px-1 text-[12px] font-semibold text-[#D9FF57]">
                          {voiceMessage.transcriptLabel}: voice update sent through the same Ask Zila engine.
                        </p>
                      ) : null}
                      {voiceError ? (
                        <p className="mt-2 px-1 text-[12px] font-semibold text-[#FFD6D6]">{voiceError}</p>
                      ) : null}
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
                      onClick={() => {
                        setVoiceMessage(null);
                        submitMessage(query);
                      }}
                      className="zila-operational-action-soft inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#D9FF57] px-5 text-[14px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14),0_0_18px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.32)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
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
