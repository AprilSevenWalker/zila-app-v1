import type { ReactNode } from "react";

import type { ProjectTone } from "@/data/projects";

interface PillProps {
  children: ReactNode;
  tone?: ProjectTone;
  className?: string;
}

const toneClasses: Record<ProjectTone, string> = {
  neutral: "border border-[rgba(15,35,63,0.24)] bg-[#E8EEF6] text-[#10233F]",
  warning: "border border-[rgba(138,90,34,0.30)] bg-[#E8D3B0] text-[#4A2A10]",
  success: "border border-[rgba(14,91,115,0.24)] bg-[#D7EFF4] text-[#0E4052]",
  info: "border border-[rgba(29,78,216,0.22)] bg-[#DDE8F8] text-[#17345F]",
};

export function Pill({ children, tone = "neutral", className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
