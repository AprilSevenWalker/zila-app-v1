import type { ReactNode } from "react";

import type { ProjectTone } from "@/data/projects";

interface PillProps {
  children: ReactNode;
  tone?: ProjectTone;
  className?: string;
}

const toneClasses: Record<ProjectTone, string> = {
  neutral: "border border-[rgba(15,23,42,0.08)] bg-[#F4F1EB] text-[#121417]",
  warning: "border border-[rgba(146,100,41,0.10)] bg-[#F3ECE2] text-[#121417]",
  success: "border border-[rgba(46,94,74,0.10)] bg-[#EAF0EB] text-[#121417]",
  info: "border border-[rgba(90,99,126,0.10)] bg-[#ECEFF5] text-[#121417]",
};

export function Pill({ children, tone = "neutral", className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.01em] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
