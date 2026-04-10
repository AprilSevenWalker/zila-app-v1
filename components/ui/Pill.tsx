import type { ReactNode } from "react";

import type { ProjectTone } from "@/data/projects";

interface PillProps {
  children: ReactNode;
  tone?: ProjectTone;
  className?: string;
}

const toneClasses: Record<ProjectTone, string> = {
  neutral: "bg-[#F3F4F6] text-[#4B5563]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
  success: "bg-[#D1FAE5] text-[#065F46]",
  info: "bg-[#DBEAFE] text-[#1D4ED8]",
};

export function Pill({ children, tone = "neutral", className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
