"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, TimerReset, Upload } from "lucide-react";

const mockInvoice = {
  amount: "£4300",
  due: "Friday",
  suggestedMove: "Schedule payment or adjust timing",
};

type UploadStage = "idle" | "parsing" | "detected" | "applying" | "applied";

interface MockInvoiceUploadProps {
  assignedProject?: string;
  buttonLabel?: string;
  inlineInFlexRow?: boolean;
  tone?: "light" | "dark";
  buttonClassName?: string;
}

export function MockInvoiceUpload({
  assignedProject = "Project Horizon",
  buttonLabel = "Upload document",
  inlineInFlexRow = false,
  tone = "dark",
  buttonClassName = "",
}: MockInvoiceUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const parseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    return () => {
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }

      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
      }
    };
  }, []);

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setStage("parsing");

    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }

    if (applyTimeoutRef.current) {
      clearTimeout(applyTimeoutRef.current);
    }

    parseTimeoutRef.current = setTimeout(() => {
      setStage("detected");
    }, 900);

    event.target.value = "";
  };

  const handleApply = () => {
    if (stage !== "detected") {
      return;
    }

    setStage("applying");

    if (applyTimeoutRef.current) {
      clearTimeout(applyTimeoutRef.current);
    }

    applyTimeoutRef.current = setTimeout(() => {
      setStage("applied");
    }, 950);
  };

  return (
    <div className={inlineInFlexRow ? "contents" : "mt-4"}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.heic"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleUploadClick}
        className={`${
          tone === "light"
            ? "inline-flex h-12 items-center gap-2 rounded-full border border-[#121417]/12 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#121417] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#F8F6F1]"
            : "inline-flex h-12 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-[#E4EBF9] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.08]"
        } ${buttonClassName}`.trim()}
      >
        <Upload className="h-[14px] w-[14px]" strokeWidth={1.9} />
        {buttonLabel}
      </button>

      {stage === "parsing" ? (
        <section
          className={`mt-4 max-w-[86%] rounded-[22px] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(129,140,248,0.05))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
            inlineInFlexRow ? "basis-full" : ""
          }`}
        >
          <p className="text-[15px] font-semibold text-white">Uploading…</p>
          <p className="mt-2 text-[14px] leading-[1.7] text-[#C8D4E8]">{fileName}</p>
        </section>
      ) : null}

      {stage === "detected" || stage === "applying" || stage === "applied" ? (
        <div className={`mt-4 space-y-4 ${inlineInFlexRow ? "basis-full" : ""}`}>
          <section className="max-w-[86%] rounded-[24px] border border-white/18 bg-[linear-gradient(180deg,rgba(16,42,79,0.94),rgba(9,25,50,0.96))] p-5 shadow-[0_24px_54px_rgba(13,35,68,0.36),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="flex items-center gap-2">
              <FileText className="h-[14px] w-[14px] text-[#7EE7F6]" strokeWidth={1.9} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">
                Invoice detected
              </p>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/12 bg-[#173D6D]/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#AFC0FF]">Amount</p>
                <p className="text-[15px] font-semibold text-white">{mockInvoice.amount}</p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/12 bg-[#173D6D]/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#AFC0FF]">Due</p>
                <p className="text-[15px] font-semibold text-white">{mockInvoice.due}</p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/12 bg-[#173D6D]/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#AFC0FF]">Assigned to</p>
                <p className="text-[15px] font-semibold text-white">{assignedProject}</p>
              </div>
            </div>
            <div className="mt-5 rounded-[18px] border border-white/12 bg-[#173D6D]/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">
                Suggested move
              </p>
              <p className="mt-2 text-[15px] font-semibold text-white">{mockInvoice.suggestedMove}</p>
            </div>
            <button
              type="button"
              onClick={handleApply}
              disabled={stage !== "detected"}
              className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB] disabled:cursor-wait"
            >
              {stage === "applying" ? "Applying…" : "Apply"}
            </button>
          </section>

          {stage === "applied" ? (
            <>
              <section className="max-w-[86%] rounded-[24px] border border-emerald-200/22 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(15,72,64,0.34))] p-4 shadow-[0_18px_38px_rgba(13,35,68,0.26),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-[18px] w-[18px] flex-shrink-0 text-[#BEEFD9]" strokeWidth={1.9} />
                  <div>
                    {["Invoice recorded", "Project updated", "Next move prepared"].map((line) => (
                      <p key={line} className="text-[15px] font-medium leading-[1.7] text-[#D7F4E7]">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section className="max-w-[86%] rounded-[24px] border border-white/16 bg-[linear-gradient(180deg,rgba(23,61,109,0.70),rgba(16,42,79,0.86))] p-4 shadow-[0_18px_38px_rgba(13,35,68,0.22),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9FB3D9]">
                  Added to verified history
                </p>
                <div className="mt-4 flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/14 bg-[#173D6D]/74 text-[#D8E7F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <TimerReset className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </span>
                  <p className="text-[15px] leading-[1.72] text-[#C5D3E9]">
                    Invoice for {mockInvoice.amount} assigned to {assignedProject}. Time stamped and saved.
                  </p>
                </div>
              </section>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
