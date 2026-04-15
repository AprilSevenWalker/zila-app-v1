import Link from "next/link";

import { IconTile } from "@/components/ui/IconTile";

interface InsightCardProps {
  quote?: string;
  meta?: string;
  ctaLabel?: string;
}

export function InsightCard({
  quote = "Infrastructure founders who review cash weekly are 3x less likely to miss a project milestone.",
  meta = "Based on your 14 days of activity · Updated daily",
  ctaLabel = "How does my business compare? →",
}: InsightCardProps) {
  return (
    <div className="rounded-[20px] border border-[rgba(18,20,23,0.07)] bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center gap-3">
        <IconTile size="md" glow="indigo">
          <span className="text-sm font-bold">Z</span>
        </IconTile>
        <div>
          <p className="text-[12px] font-semibold text-[#6366F1]">Today&apos;s founder insight</p>
          <p className="text-[11px] text-[#6B7280]">Personalised to your business</p>
        </div>
      </div>

      <div className="mb-4 border-l-2 border-[#6366F1]/65 pl-4">
        <p className="text-[13px] italic leading-relaxed text-[#121417]">&ldquo;{quote}&rdquo;</p>
      </div>

      <p className="mb-4 text-[11px] text-[#6B7280]">{meta}</p>

      <div className="flex items-center justify-between border-t border-[rgba(18,20,23,0.08)] pt-4">
        <Link href="/compare" className="text-[12px] font-semibold text-[#6366F1] transition hover:opacity-80">
          {ctaLabel}
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#6366F1]"></span>
          <span className="h-2 w-2 rounded-full bg-[#E7E5E4]"></span>
          <span className="h-2 w-2 rounded-full bg-[#E7E5E4]"></span>
        </div>
      </div>
    </div>
  );
}

export default InsightCard;
