"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";

import { ZilaSignal } from "@/components/projects/ZilaSignal";

interface SafetyNetActionCardProps {
  shortfallText: string;
  supportingText: string;
  note?: string;
  automaticMessage?: string;
  statusLabel?: string;
  buttonLabel?: string;
  amount: string;
  destination: string;
  remaining: string;
}

export function SafetyNetActionCard({
  shortfallText,
  supportingText,
  note,
  automaticMessage = "Zila will step in automatically if no action is taken",
  statusLabel = "Protection ready",
  buttonLabel = "Stay on track",
  amount,
  destination,
  remaining,
}: SafetyNetActionCardProps) {
  const [showFlow, setShowFlow] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="rounded-[20px] border border-[rgba(99,102,241,0.08)] bg-[linear-gradient(180deg,#FBFAF7,rgba(239,242,255,0.65))] px-5 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <ZilaSignal variant="pressure" />
            <Landmark className="h-[12px] w-[12px] text-[#4F5FDB]" strokeWidth={1.9} />
          </div>
          <p className="text-[12px] font-semibold text-[#4F5FDB]">Safety Net</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-[rgba(75,124,105,0.10)] bg-[#EEF4EF] px-2.5 py-1 text-[10px] font-medium text-[#4B7C69]">
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-[16px] font-semibold leading-[1.45] text-[#121417]">{shortfallText}</p>
      <p className="mt-2 text-[13px] leading-[1.55] text-[#526173]">{supportingText}</p>
      <p className="mt-2 text-[12px] leading-[1.5] text-[#4B5E71]">{automaticMessage}</p>
      {note ? <p className="mt-2 text-[12px] leading-[1.5] text-[#6B7280]">{note}</p> : null}

      <button
        type="button"
        onClick={() => {
          setShowFlow((current) => !current);
          setIsConfirmed(false);
        }}
        className="mt-4 inline-flex items-center rounded-full border border-[rgba(18,20,23,0.08)] bg-white px-4 py-2 text-[12px] font-semibold text-[#121417] transition hover:bg-[#F8F6F1]"
        data-action-id="cover-with-safety-net"
      >
        {buttonLabel}
      </button>

      {showFlow ? (
        <div className="mt-4 rounded-[16px] border border-[rgba(18,20,23,0.07)] bg-white px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <ZilaSignal variant="pressure" />
              <Landmark className="h-[12px] w-[12px] text-[#4F5FDB]" strokeWidth={1.9} />
            </div>
            <p className="text-[12px] font-semibold text-[#121417]">Use Safety Net</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <p className="text-[10px] text-[#6B7280]">Amount</p>
              <p className="mt-1 text-[16px] font-semibold text-[#121417]">{amount}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280]">Destination</p>
              <p className="mt-1 text-[16px] font-semibold text-[#121417]">{destination}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280]">Remaining Safety Net</p>
              <p className="mt-1 text-[16px] font-semibold text-[#121417]">{remaining}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmed(true)}
              className="inline-flex items-center rounded-full bg-[#121417] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#20242B]"
              data-action-id="confirm-use-safety-net"
            >
              Confirm
            </button>
            {isConfirmed ? <p className="text-[12px] text-[#4B7C69]">Safety Net is ready to keep this project covered.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
