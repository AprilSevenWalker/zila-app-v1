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
    <div className="relative overflow-hidden rounded-[20px] border border-[rgba(99,102,241,0.16)] bg-gradient-to-br from-[#1A2540] via-[#171F35] to-[#122231] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[#6366F1]/12 via-transparent to-[#22D3EE]/10"></div>

      <div className="relative z-10 flex items-start gap-3">
        <IconTile size="sm" glow="cyan" className="flex-shrink-0 bg-[#F3F0EA] text-[#0F172A]">
          <span className="text-sm font-bold">Z</span>
        </IconTile>
        <div className="flex-1">
          <div className="mb-1 flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7EE7F6] shadow-[0_0_8px_rgba(34,211,238,0.25)]"></span>
            <p className="text-[12px] font-semibold text-[#22D3EE]">Zila says</p>
          </div>
          <p className="mb-3 text-[13px] leading-relaxed text-white">{message}</p>
          <Link
            href="/projects/harbour-road"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#22D3EE] transition hover:opacity-80"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ZilaSaysCard;
