import Link from "next/link";

import { IconTile } from "@/components/ui/IconTile";

interface InsightCardProps {
  quote?: string;
  meta?: string;
  ctaLabel?: string;
}

export function InsightCard({
  quote = "Your business usually keeps a 21 day safety cushion. Supplier-heavy weeks tend to reduce that range first.",
  meta = "Learned from your verified activity history · Updated daily",
  ctaLabel = "View operating pattern →",
}: InsightCardProps) {
  return (
    <div className="rounded-[20px] border border-[#8F7CFF]/18 bg-[radial-gradient(circle_at_84%_0%,rgba(143,124,255,0.16),transparent_30%),linear-gradient(180deg,#102347,#193765_48%,#06101F)] p-5 shadow-[0_24px_56px_rgba(1,8,20,0.40),0_0_28px_rgba(143,124,255,0.10),inset_0_1px_0_rgba(234,241,255,0.10)]">
      <div className="mb-4 flex items-center gap-3">
        <IconTile size="md" glow="indigo">
          <span className="text-sm font-bold">Z</span>
        </IconTile>
        <div>
          <p className="text-[12px] font-semibold text-[#BFB5FF]">Business memory</p>
          <p className="text-[11px] text-[#C9D4F5]">Based on recorded operating patterns</p>
        </div>
      </div>

      <div className="mb-4 border-l-2 border-[#8F7CFF]/65 pl-4">
        <p className="text-[13px] italic leading-relaxed text-[#EAF1FF]">&ldquo;{quote}&rdquo;</p>
      </div>

      <p className="mb-4 text-[11px] text-[#C9D4F5]">{meta}</p>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <Link href="/compare" className="text-[12px] font-semibold text-[#8F7CFF] transition hover:opacity-80">
          {ctaLabel}
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#8F7CFF]"></span>
          <span className="h-2 w-2 rounded-full bg-white/14"></span>
          <span className="h-2 w-2 rounded-full bg-white/14"></span>
        </div>
      </div>
    </div>
  );
}

export default InsightCard;
