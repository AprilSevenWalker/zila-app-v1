import Link from "next/link";

import { IconTile } from "@/components/ui/IconTile";

interface ZilaSaysCardProps {
  message?: string;
  ctaLabel?: string;
}

export function ZilaSaysCard({
  message = "Project Horizon needs $4,300 by Thursday. Move from your wallet now to stay on track.",
  ctaLabel = "Sort this now →",
}: ZilaSaysCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/20 bg-[linear-gradient(135deg,#214F83,#173D6D_46%,#102A4F)] p-5 shadow-[0_22px_48px_rgba(31,68,116,0.22),inset_0_1px_0_rgba(234,241,255,0.12)]">
      <div className="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_12%_0%,rgba(103,232,249,0.15),transparent_32%)]"></div>

      <div className="relative z-10 flex items-start gap-3">
        <IconTile size="sm" glow="none" className="flex-shrink-0 bg-[#F3F5F9] text-[#0F172A]">
          <span className="text-sm font-bold">Z</span>
        </IconTile>
        <div className="flex-1">
          <div className="mb-1 flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.28)]"></span>
            <p className="text-[12px] font-semibold text-[#67E8F9]">Operational signal</p>
          </div>
          <p className="mb-3 text-[13px] leading-relaxed text-white">{message}</p>
          <Link
            href="/projects/harbour-road"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#67E8F9] transition hover:opacity-80"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ZilaSaysCard;
