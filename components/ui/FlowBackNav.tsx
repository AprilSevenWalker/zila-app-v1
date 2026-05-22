"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FlowBackNavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}

interface FlowBackNavProps {
  items: FlowBackNavItem[];
  surface?: "dark" | "light";
}

export function FlowBackNav({ items, surface = "dark" }: FlowBackNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => {
        const toneClass =
          surface === "light"
            ? item.primary
              ? "border-[#17345F]/22 bg-white/78 text-[#102A4F] shadow-[0_10px_24px_rgba(31,68,116,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] hover:border-[#17345F]/30 hover:bg-white/90"
              : "border-[#17345F]/18 bg-white/58 text-[#17345F] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] hover:border-[#17345F]/26 hover:bg-white/76"
            : item.primary
              ? "border-[#7EE7F6]/22 bg-[#102A4F]/88 text-white shadow-[0_14px_30px_rgba(6,16,31,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-[#7EE7F6]/34 hover:bg-[#173D6D]/92"
              : "border-[#7EE7F6]/16 bg-[#102A4F]/68 text-[#EAF1FF] shadow-[0_10px_22px_rgba(6,16,31,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#7EE7F6]/28 hover:bg-[#173D6D]/82 hover:text-white";
        const className = `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12px] font-bold transition duration-200 hover:-translate-y-0.5 ${
          toneClass
        }`;

        if (item.href) {
          return (
            <Link key={`${item.href}-${item.label}`} href={item.href} className={className}>
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            className={`${className} disabled:cursor-wait disabled:opacity-55`}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
