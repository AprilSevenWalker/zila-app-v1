import type { ReactNode } from "react";

interface IconTileProps {
  children: ReactNode;
  className?: string;
  glow?: "none" | "indigo" | "cyan" | "mint";
  shape?: "square" | "pill";
  size?: "sm" | "md";
}

const glowClasses = {
  none: "",
  indigo: "shadow-[0_0_18px_rgba(99,102,241,0.08)]",
  cyan: "shadow-[0_0_18px_rgba(34,211,238,0.07)]",
  mint: "shadow-[0_0_18px_rgba(134,176,155,0.10)]",
};

const shapeClasses = {
  square: "rounded-[12px]",
  pill: "rounded-[14px]",
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

export function IconTile({
  children,
  className = "",
  glow = "none",
  shape = "square",
  size = "sm",
}: IconTileProps) {
  return (
    <span
      className={`inline-flex items-center justify-center border border-[rgba(15,23,42,0.08)] bg-[#F7F4EF] text-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.04)] ${shapeClasses[shape]} ${sizeClasses[size]} ${glowClasses[glow]} ${className}`}
    >
      {children}
    </span>
  );
}

export default IconTile;
