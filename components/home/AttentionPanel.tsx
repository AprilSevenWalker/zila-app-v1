import Link from "next/link";
import { ArrowRight, Brain, CircleAlert } from "lucide-react";

export function AttentionPanel() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/20 bg-[linear-gradient(180deg,#214F83,#173D6D_48%,#102A4F)] p-5 shadow-[0_26px_62px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(234,241,255,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(103,232,249,0.16),transparent_32%),linear-gradient(180deg,rgba(234,241,255,0.07),transparent_42%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">Operational signal</p>
            <h2 className="mt-3 text-[20px] font-semibold tracking-[-0.04em] text-[#EAF1FF]">Supplier payout needs attention</h2>
          </div>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[#D9FF57]/20 bg-[#D9FF57]/10 text-[#F1FFB8]">
            <CircleAlert className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
        </div>

        <div className="mt-4 rounded-[20px] border border-white/13 bg-[#102A4F]/54 p-4 shadow-[inset_0_1px_0_rgba(234,241,255,0.08)]">
          <div className="flex gap-3">
            <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] border border-white/12 bg-white/[0.08] text-[#67E8F9]">
              <Brain className="h-[15px] w-[15px]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#EAF1FF]">Why it matters</p>
              <p className="mt-1 text-[13px] leading-[1.6] text-[#C9D4F5]">
                Project Horizon has a $4,300 supplier obligation due Friday. Coordinating the payout keeps committed money separate from the safe range.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/projects/harbour-road"
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-4 py-2.5 text-[12px] font-semibold text-[#111827] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:opacity-90"
        >
          Review next action
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}

export default AttentionPanel;
