"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Landmark, ShieldCheck, TriangleAlert } from "lucide-react";

import { ZilaSignal } from "@/components/projects/ZilaSignal";

interface NextMoveCardProps {
  title: string;
  summary: string;
  ifNoAction: string;
  ifActionTaken: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  showSecondaryAction?: boolean;
  showSafetyNetSupport?: boolean;
  canUseSafetyNet?: boolean;
  showSafetyNetAction?: boolean;
  safetyNetShortfallText?: string;
  safetyNetAmount?: string;
  safetyNetRemaining?: string;
  safetyNetDestination?: string;
  dark?: boolean;
  compact?: boolean;
}

export function NextMoveCard({
  title,
  summary,
  ifNoAction,
  ifActionTaken,
  primaryActionLabel,
  secondaryActionLabel,
  showSecondaryAction = true,
  showSafetyNetSupport = true,
  canUseSafetyNet = false,
  showSafetyNetAction = false,
  safetyNetShortfallText,
  safetyNetAmount,
  safetyNetRemaining,
  safetyNetDestination,
  dark = false,
  compact = false,
}: NextMoveCardProps) {
  const [showSafetyNetFlow, setShowSafetyNetFlow] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div
      className={`rounded-[18px] border ${
        dark
          ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-[rgba(18,20,23,0.07)] bg-[#FBFAF7]"
      } ${compact ? "px-4 py-4" : "px-4 py-4"}`}
      data-action-surface="project-next-move"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <ZilaSignal variant="pressure" onDark={dark} />
          <Landmark
            className={`h-[12px] w-[12px] ${dark ? "text-[#7EE7F6]" : "text-[#4F5FDB]"}`}
            strokeWidth={1.9}
          />
        </div>
        <p className={`text-[11px] font-semibold ${dark ? "text-[#7EE7F6]" : "text-[#4F5FDB]"}`}>{title}</p>
      </div>

      <p className={`mt-3 font-semibold leading-[1.5] ${dark ? "text-[15px] text-white" : "text-[15px] text-[#121417]"}`}>
        {summary}
      </p>

      <div className={`mt-4 grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1"}`}>
        <div
          className={`flex items-center gap-2 rounded-[14px] px-3 py-2.5 ${
            dark ? "border border-white/14 bg-[#102A4F]/64 text-[#E9EEF7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-white text-[#334155]"
          }`}
        >
          <TriangleAlert
            className={`h-[13px] w-[13px] flex-shrink-0 ${dark ? "text-[#F3C68E]" : "text-[#C6762C]"}`}
            strokeWidth={1.9}
          />
          <p className="text-[12px] leading-[1.4]">{ifNoAction}</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-[14px] px-3 py-2.5 ${
            dark ? "border border-white/14 bg-[#102A4F]/64 text-[#E9EEF7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-white text-[#334155]"
          }`}
        >
          <ShieldCheck
            className={`h-[13px] w-[13px] flex-shrink-0 ${dark ? "text-[#BEE7D2]" : "text-[#7E9E8B]"}`}
            strokeWidth={1.9}
          />
          <p className="text-[12px] leading-[1.4]">{ifActionTaken}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {primaryActionLabel === "Move funds" || primaryActionLabel === "Coordinate payout" ? (
          <Link
            href="/payments/choose-method"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition ${
              dark
                ? "bg-white text-[#121417] hover:bg-[#F4F6FB]"
                : "bg-[#121417] text-white hover:bg-[#20242B]"
            }`}
            data-action-id={primaryActionLabel.toLowerCase().replace(/\s+/g, "-")}
          >
            {primaryActionLabel}
            <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
          </Link>
        ) : (
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition ${
              dark
                ? "bg-white text-[#121417] hover:bg-[#F4F6FB]"
                : "bg-[#121417] text-white hover:bg-[#20242B]"
            }`}
            data-action-id={primaryActionLabel.toLowerCase().replace(/\s+/g, "-")}
          >
            {primaryActionLabel}
            <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
          </button>
        )}
        {showSecondaryAction && !canUseSafetyNet ? (
          <button
            type="button"
            className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
              dark
                ? "border-white/16 bg-[#173D6D]/66 text-white hover:bg-[#1E4A7D]"
                : "border-[rgba(18,20,23,0.08)] bg-white text-[#121417] hover:bg-[#F8F6F1]"
            }`}
            data-action-id={secondaryActionLabel.toLowerCase().replace(/\s+/g, "-")}
          >
            {secondaryActionLabel}
          </button>
        ) : null}
      </div>

      {showSafetyNetSupport && canUseSafetyNet && !showSafetyNetAction ? (
        <p className={`mt-3 text-[12px] leading-[1.45] ${dark ? "text-[#C7D2E2]" : "text-[#526173]"}`}>
          Zila can cover this using your Safety Net if needed.
        </p>
      ) : null}

      {showSafetyNetSupport && canUseSafetyNet && showSafetyNetAction ? (
        <div
          className={`mt-4 rounded-[14px] px-3 py-3 ${
            dark ? "border border-white/14 bg-[#102A4F]/64 text-[#E9EEF7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-white text-[#334155]"
          }`}
        >
          {safetyNetShortfallText ? (
            <p className={`text-[13px] font-semibold ${dark ? "text-white" : "text-[#121417]"}`}>{safetyNetShortfallText}</p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setShowSafetyNetFlow((current) => !current);
              setIsConfirmed(false);
            }}
            className={`mt-3 inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
              dark
                ? "border-white/16 bg-[#173D6D]/66 text-white hover:bg-[#1E4A7D]"
                : "border-[rgba(18,20,23,0.08)] bg-[#F8F6F1] text-[#121417] hover:bg-[#F1EEE8]"
            }`}
            data-action-id="cover-with-safety-net"
          >
            Cover with Safety Net
          </button>
        </div>
      ) : null}

      {showSafetyNetSupport &&
      canUseSafetyNet &&
      showSafetyNetAction &&
      showSafetyNetFlow &&
      safetyNetAmount &&
      safetyNetRemaining &&
      safetyNetDestination ? (
        <div
          className={`mt-4 rounded-[16px] border px-4 py-4 ${
            dark
              ? "border-white/16 bg-[#102A4F]/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "border-[rgba(18,20,23,0.07)] bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <ZilaSignal variant="pressure" onDark={dark} />
              <Landmark className={`h-[12px] w-[12px] ${dark ? "text-[#7EE7F6]" : "text-[#4F5FDB]"}`} strokeWidth={1.9} />
            </div>
            <p className={`text-[12px] font-semibold ${dark ? "text-white" : "text-[#121417]"}`}>Use Safety Net</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <p className={`text-[10px] ${dark ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>Amount</p>
              <p className={`mt-1 text-[16px] font-semibold ${dark ? "text-white" : "text-[#121417]"}`}>{safetyNetAmount}</p>
            </div>
            <div>
              <p className={`text-[10px] ${dark ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>Destination</p>
              <p className={`mt-1 text-[16px] font-semibold ${dark ? "text-white" : "text-[#121417]"}`}>{safetyNetDestination}</p>
            </div>
            <div>
              <p className={`text-[10px] ${dark ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>Remaining Safety Net</p>
              <p className={`mt-1 text-[16px] font-semibold ${dark ? "text-white" : "text-[#121417]"}`}>{safetyNetRemaining}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmed(true)}
              className={`inline-flex items-center rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                dark
                  ? "bg-white text-[#121417] hover:bg-[#F4F6FB]"
                  : "bg-[#121417] text-white hover:bg-[#20242B]"
              }`}
              data-action-id="confirm-use-safety-net"
            >
              Confirm
            </button>
            {isConfirmed ? (
              <p className={`text-[12px] ${dark ? "text-[#BEE7D2]" : "text-[#4B7C69]"}`}>
                Safety Net is ready to keep this project covered.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
