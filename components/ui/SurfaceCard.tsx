import type { ReactNode } from "react";

interface SurfaceCardProps {
  children: ReactNode;
  tone?: "white" | "navy" | "dark";
  className?: string;
}

const toneClasses = {
  white: "bg-white border border-[rgba(18,20,23,0.08)] shadow-sm text-[#121417]",
  navy: "bg-[#0F172A] text-[#F5F0E8] shadow-lg border border-white/5",
  dark: "bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white shadow-lg border border-[#6366F1]/20",
};

export function SurfaceCard({
  children,
  tone = "white",
  className = "",
}: SurfaceCardProps) {
  return <div className={`rounded-[20px] p-5 ${toneClasses[tone]} ${className}`}>{children}</div>;
}
