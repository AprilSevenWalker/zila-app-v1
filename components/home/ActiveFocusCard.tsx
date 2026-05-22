import Link from "next/link";
import { ArrowRight, FolderKanban, ShieldCheck } from "lucide-react";

export function ActiveFocusCard() {
  return (
    <section className="zila-card-hover rounded-[28px] border border-white/22 bg-[linear-gradient(180deg,#214F83,#173D6D_50%,#102A4F)] p-5 shadow-[0_28px_68px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(234,241,255,0.14)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">Active focus</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/16 bg-white/[0.10] text-[#EAF1FF] shadow-[inset_0_1px_0_rgba(234,241,255,0.12)]">
              <FolderKanban className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </span>
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-[#EAF1FF]">Project Horizon</h2>
              <p className="mt-1 text-[13px] font-medium text-[#C9D4F5]">Supplier payment due Friday</p>
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#6D5EF8]/24 bg-[#6D5EF8]/12 px-3 py-1.5 text-[11px] font-semibold text-[#DCD6FF]">
          Watch
        </span>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/14 bg-[#102A4F]/50 px-4 py-4 shadow-[0_14px_28px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(234,241,255,0.10)]">
        <p className="text-[18px] font-semibold tracking-[-0.035em] text-[#EAF1FF]">$4,300 needs resolving this week</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#C9D4F5]">
          This project is approaching pressure due to upcoming commitments.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <Link
          href="/projects/harbour-road"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_14px_28px_rgba(29,78,216,0.18)] transition hover:opacity-90"
        >
          Review project
          <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
        </Link>
        <Link
          href="/payments/choose-method"
          className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.10] px-4 py-2.5 text-[12px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.14]"
        >
          Coordinate payout
        </Link>
        <Link
          href="/move-funds"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9FF57]/24 bg-[#D9FF57]/10 px-4 py-2.5 text-[12px] font-semibold text-[#F1FFB8] transition hover:bg-[#D9FF57]/14"
        >
          <ShieldCheck className="h-[12px] w-[12px]" strokeWidth={2} />
          Protect money
        </Link>
      </div>
    </section>
  );
}

export default ActiveFocusCard;
