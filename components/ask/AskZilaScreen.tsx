"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  CheckCircle2,
  Landmark,
  Mic,
  Send,
  Square,
  TimerReset,
} from "lucide-react";

import { MockInvoiceUpload } from "@/components/documents/MockInvoiceUpload";
import { AppShell } from "@/components/ui/AppShell";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";

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
  applySteps: string[];
  completionLines: string[];
  nextActionPrimary: string;
  nextActionFallback: string;
  proofText: string;
  detectedAmount?: string | null;
  needsAmountClarification?: boolean;
}

const prompts = [
  "Project Horizon costs went up by £2000. Are we still okay this week?",
  "I paid £2000 for materials on Project Horizon.",
  "Can I pay this supplier today?",
];

function extractAmount(input: string) {
  const match = input.match(/([£$])?\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?/);

  if (!match) {
    return null;
  }

  const currency = match[1] ?? "";
  const rawNumber = match[2].replace(/,/g, "");
  const numericValue = Number(rawNumber);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return {
    currency,
    numericValue,
    formatted: currency ? `${currency}${match[2]}` : match[2],
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
    guidanceHeadline: "I can do that. What amount should I use?",
    guidanceText: "Share the amount from the update and Zila will use that same value for the interpretation, recorded state, next move, and Proof.",
    applySteps: [
      "Capture the amount",
      "Refresh project outlook",
      "Prepare the next move",
    ],
    completionLines: [
      "Waiting for amount",
      "Project ready to update",
      "Outlook ready to refresh",
      "Proof ready to save",
    ],
    nextActionPrimary: "Add the amount",
    nextActionFallback: "Reply with the payment or cost amount",
    proofText: "Zila is ready to save this update to Proof as soon as the amount is confirmed.",
    detectedAmount: null,
    needsAmountClarification: true,
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

function getFlowData(input: string): FlowData {
  const lower = input.toLowerCase();
  const extractedAmount = extractAmount(input);
  const amountText = extractedAmount?.formatted;
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
      proofText: `Recorded. Decision review for ${amountText} saved to Proof with the current recommendation and time stamp.`,
      detectedAmount: amountText,
      needsAmountClarification: false,
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
        ? `This brings Project Horizon closer to a funding gap this week.`
        : "This payment can be absorbed cleanly today.",
      guidanceText: lower.includes("cost")
        ? "A small adjustment now keeps the project steady and updates the next move clearly."
        : "Your week stays steady, and recording it now keeps the project view accurate.",
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
        ? `Recorded. Cost increase of ${amountText} added to Project Horizon. Time stamped and saved to Proof.`
        : `Recorded. Payment of ${amountText} added to Project Horizon. Time stamped and saved to Proof.`,
      detectedAmount: amountText,
      needsAmountClarification: false,
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
      proofText: `Recorded. Supplier payment check for ${amountText} saved to Proof with time stamp.`,
      detectedAmount: amountText,
      needsAmountClarification: false,
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
    guidanceHeadline: `${amountText} puts Project Horizon close to a funding gap in about 6 days.`,
    guidanceText: `A small adjustment around ${amountText} now keeps everything on track for the week ahead.`,
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
    proofText: `Recorded. Cost increase of ${amountText} added to Project Horizon. Time stamped and saved to Proof.`,
    detectedAmount: amountText,
    needsAmountClarification: false,
  };
}

export function AskZilaScreen() {
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
  const quickAction = searchParams.get("action");

  const flow = useMemo(() => getFlowData(submittedMessage), [submittedMessage]);

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

  const resetExecutionState = () => {
    setHasApplied(false);
    setIsApplying(false);
    setApplyStage("idle");
    setConfirmedAction(null);
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

    applyStageTimeoutRef.current = window.setTimeout(() => {
      setApplyStage("updating");
    }, 450);

    applyCompleteTimeoutRef.current = window.setTimeout(() => {
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

  const quickActionLabel =
    quickAction === "upload-document"
      ? "Upload document"
      : quickAction === "record-payment"
        ? "Record payment"
        : quickAction === "add-update"
          ? "Add update"
          : null;

  return (
    <AppShell>
      <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(160deg,#0D142B_0%,#171E46_42%,#1F2559_72%,#15374F_100%)] px-6 pb-28 pt-8 text-white">
        <div className="absolute inset-x-0 top-14 h-96 bg-[radial-gradient(circle_at_22%_18%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.18),transparent_22%),linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
        <div className="absolute left-[8%] top-[18%] h-52 w-36 rotate-[18deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.018)_38%,rgba(255,255,255,0)_82%)] blur-2xl opacity-65" />
        <div className="absolute right-[-2rem] top-[24%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.14),rgba(129,140,248,0.08)_48%,rgba(129,140,248,0)_78%)] blur-3xl opacity-80" />

        <div className="relative flex flex-1 flex-col">
          <div className="max-w-[318px]">
            <div className="mb-5 inline-flex h-8 w-8 items-center justify-center">
              <span className="insight-signal-pulse relative inline-flex h-3 w-3 rounded-full bg-[#7EE7F6] shadow-[0_0_18px_rgba(126,231,246,0.32)]">
                <span className="insight-signal-ripple absolute inset-0 rounded-full border border-[#A5B4FC]/55"></span>
              </span>
            </div>
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#B7C2E0]">
              Ask Zila
            </p>
            <h1 className="mt-4 text-[42px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              Update it once. Zila handles the rest.
            </h1>
            <p className="mt-5 max-w-[292px] text-[16px] leading-[1.68] text-[#D4DCEF]/84">
              Speak or type an update and Zila turns it into guidance, execution, and proof automatically.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePrompt(prompt)}
                className={`rounded-full border px-4 py-2.5 text-left text-[13px] font-medium transition ${
                  activePrompt === prompt
                    ? "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(129,140,248,0.08))] text-[#F7FBFF] shadow-[0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]"
                    : "border-white/10 bg-white/[0.05] text-[#D6E1F3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.045))] p-5 shadow-[0_0_32px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">
                Input
              </p>
              {isRecording ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium text-[#DDFBFF]">
                  <span className="insight-signal-pulse relative inline-flex h-2 w-2 rounded-full bg-[#7EE7F6] shadow-[0_0_12px_rgba(126,231,246,0.28)]" />
                  Listening
                </span>
              ) : null}
            </div>
            {quickActionLabel ? (
              <div className="mt-4 inline-flex items-center rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DDFBFF]">
                Quick action: {quickActionLabel}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <textarea
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetExecutionState();
                }}
                placeholder="Tell Zila what changed"
                rows={3}
                className="min-h-[112px] flex-1 resize-none bg-transparent text-[16px] leading-[1.65] text-white outline-none placeholder:text-[#B9C7DF]/56"
              />
              <button
                type="button"
                onClick={() => submitMessage(query)}
                className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] text-[#F7FAFF] shadow-[0_0_24px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.14)] transition hover:bg-white/10"
                aria-label="Send message"
              >
                <Send className="h-[16px] w-[16px]" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={handleRecordingToggle}
                className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border transition ${
                  isRecording
                    ? "border-cyan-300/24 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(129,140,248,0.1))] text-[#EAF8FF] shadow-[0_0_26px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "border-white/10 bg-white/[0.06] text-[#D8E3F7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                }`}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <Square className="h-[16px] w-[16px]" strokeWidth={2} /> : <Mic className="h-[18px] w-[18px]" strokeWidth={2} />}
              </button>
              <MockInvoiceUpload inlineInFlexRow />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-end">
              <section className="max-w-[86%] rounded-[26px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(129,140,248,0.1))] px-5 py-4 text-right shadow-[0_0_26px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#DDFBFF]">
                  You
                </p>
                <p className="mt-3 text-[16px] leading-[1.72] text-white">{submittedMessage}</p>
              </section>
            </div>

            {isThinking ? (
              <section className="max-w-[86%] rounded-[26px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(129,140,248,0.06))] p-5 shadow-[0_0_28px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="insight-signal-pulse relative inline-flex h-3 w-3 rounded-full bg-[#7EE7F6] shadow-[0_0_18px_rgba(126,231,246,0.32)]">
                    <span className="insight-signal-ripple absolute inset-0 rounded-full border border-[#A5B4FC]/55"></span>
                  </span>
                  <p className="text-[16px] font-semibold text-white">Zila is thinking…</p>
                </div>
              </section>
            ) : null}

            {hasResponse ? (
              <>
                {visibleSteps >= 1 ? (
                  <section className="max-w-[86%] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.58),rgba(15,23,42,0.32))] p-5 shadow-[0_20px_48px_rgba(5,10,24,0.24),0_0_28px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2">
                      <AudioLines className="h-[14px] w-[14px] text-[#7EE7F6]" strokeWidth={1.9} />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">
                        Interpretation
                      </p>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {flow.interpretation.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-4 rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3"
                        >
                          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#AFC0FF]">
                            {item.label}
                          </p>
                          {item.label === "Amount" && item.value !== "Not provided yet" ? (
                            <CurrencyAmount
                              amount={item.value}
                              align="right"
                              primaryClassName="text-[15px] font-semibold text-white"
                              secondaryClassName="mt-0.5 text-[11px] font-medium text-[#AFC0DD]"
                            />
                          ) : (
                            <p className="text-[15px] font-semibold text-white">{item.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {visibleSteps >= 2 ? (
                  <section className="max-w-[86%] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.58),rgba(15,23,42,0.32))] p-5 shadow-[0_20px_48px_rgba(5,10,24,0.24),0_0_28px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">
                      Guidance
                    </p>
                    {flow.answerLabel ? (
                      <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DDFBFF]">
                        {flow.answerLabel}
                      </div>
                    ) : null}
                    <h2 className="mt-4 text-[24px] font-semibold leading-[1.14] tracking-[-0.04em] text-white">
                      {flow.guidanceHeadline}
                    </h2>
                    <p className="mt-3 max-w-[292px] text-[15px] leading-[1.72] text-[#D7E3F8]">
                      {flow.guidanceText}
                    </p>
                  </section>
                ) : null}

                {visibleSteps >= 3 ? (
                  <section className="max-w-[86%] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.58),rgba(15,23,42,0.32))] p-5 shadow-[0_20px_48px_rgba(5,10,24,0.24),0_0_28px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">
                      Ready to apply
                    </p>
                    <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="text-[15px] font-semibold text-white">
                        {flow.needsAmountClarification
                          ? "Add the amount to continue"
                          : "Update Project Horizon with this change"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={isApplying || Boolean(flow.needsAmountClarification)}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB] disabled:cursor-wait"
                    >
                      {applyStage === "applying"
                        ? "Applying…"
                        : applyStage === "updating"
                          ? "Updating project…"
                          : "Apply update"}
                    </button>
                  </section>
                ) : null}

                {hasApplied ? (
                  <>
                    <section className="max-w-[86%] rounded-[24px] border border-emerald-200/10 bg-[linear-gradient(180deg,rgba(110,231,183,0.06),rgba(110,231,183,0.025))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 h-[18px] w-[18px] flex-shrink-0 text-[#BEEFD9]" strokeWidth={1.9} />
                        <div>
                          {[
                            ...flow.completionLines,
                          ].map((line) => (
                            <p key={line} className="text-[15px] font-medium leading-[1.7] text-[#D7F4E7]">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="max-w-[86%] rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">
                        Keep going
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href="/projects/harbour-road"
                          className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-[#F4F8FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.08]"
                        >
                          Open project
                        </Link>
                        <Link
                          href="/payments"
                          className="inline-flex items-center justify-center rounded-full border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(129,140,248,0.08))] px-4 py-2.5 text-[13px] font-semibold text-[#EAFBFF] shadow-[0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:opacity-90"
                        >
                          View payments
                        </Link>
                      </div>
                    </section>

                    <section className="max-w-[86%] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.58),rgba(15,23,42,0.32))] p-5 shadow-[0_20px_48px_rgba(5,10,24,0.24),0_0_28px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">
                        Next move
                      </p>
                      <div className="mt-5 space-y-3">
                        <button
                          type="button"
                          onClick={() => setConfirmedAction(flow.nextActionPrimary)}
                          className="flex w-full items-center rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(129,140,248,0.08))] text-[#EAF8FF] shadow-[0_0_24px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]">
                              <Landmark className="h-[16px] w-[16px]" strokeWidth={1.9} />
                            </span>
                            <p className="text-[15px] font-semibold text-white">
                              {flow.nextActionPrimary}
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmedAction(flow.nextActionFallback)}
                          className="inline-flex w-fit items-center justify-center rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-4 py-2.5 text-[13px] font-medium text-[#F7FAFF] shadow-[0_0_24px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.14)]"
                        >
                          {flow.nextActionFallback}
                        </button>
                      </div>
                      {confirmedAction ? (
                        <div className="mt-5 rounded-[20px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(129,140,248,0.08))] px-4 py-4 shadow-[0_0_24px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DDFBFF]">
                            Action ready
                          </p>
                          <p className="mt-2 text-[16px] font-semibold text-white">{confirmedAction}</p>
                        </div>
                      ) : null}
                    </section>

                    <section className="max-w-[86%] rounded-[24px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9FB3D9]">
                        Saved to Proof
                      </p>
                      <div className="mt-5 flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.035] text-[#D8E7F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                          <TimerReset className="h-[16px] w-[16px]" strokeWidth={1.9} />
                        </span>
                        <div>
                          <p className="whitespace-pre-line text-[15px] leading-[1.72] text-[#C5D3E9]">
                            {flow.proofText
                              .replace("Recorded. ", "")
                              .replace(" Time stamped and saved to Proof.", "\nTime stamped and saved.")
                              .replace(" saved to Proof with the current recommendation and time stamp.", "\nTime stamped and saved.")}
                          </p>
                          {flow.detectedAmount ? (
                            <div className="mt-3">
                              <CurrencyAmount
                                amount={flow.detectedAmount}
                                primaryClassName="text-[13px] font-semibold text-[#E5EFFD]"
                                secondaryClassName="mt-0.5 text-[11px] font-medium text-[#9FB3D9]"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </section>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
