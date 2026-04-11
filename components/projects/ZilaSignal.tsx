import { Activity, CircleAlert, Dot } from "lucide-react";

import type { ProjectTone } from "@/data/projects";

type SignalVariant = "stable" | "attention" | "pressure";

interface ZilaSignalProps {
  variant: SignalVariant;
  onDark?: boolean;
  className?: string;
}

function signalVariantFromTone(tone: ProjectTone): SignalVariant {
  if (tone === "success") return "stable";
  if (tone === "warning") return "attention";

  return "pressure";
}

export function getSignalVariant(tone: ProjectTone, projectId?: string): SignalVariant {
  if (projectId === "buildops-site-a") return "pressure";
  if (projectId === "harbour-road") return "attention";

  return signalVariantFromTone(tone);
}

export function ZilaSignal({ variant, onDark = false, className = "" }: ZilaSignalProps) {
  if (variant === "stable") {
    return (
      <span
        className={`relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
          onDark
            ? "border-[#9DC2AD]/38 bg-[radial-gradient(circle_at_50%_45%,rgba(214,241,224,0.85),rgba(126,158,139,0.12)_58%,rgba(126,158,139,0)_100%)] shadow-[0_0_10px_rgba(126,158,139,0.14)]"
            : "border-[#A8B7AE]/55 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.95),rgba(234,240,235,1)_68%)]"
        } ${className}`}
      >
        <Dot
          className={`h-[11px] w-[11px] ${onDark ? "text-[#C7E4D4]" : "text-[#7E9E8B]"}`}
          strokeWidth={2.2}
        />
      </span>
    );
  }

  if (variant === "attention") {
    return (
      <span
        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ${
          onDark
            ? "border border-[#F2A65A]/22 bg-[radial-gradient(circle_at_50%_50%,rgba(255,189,96,0.95),rgba(255,143,31,0.2)_45%,rgba(255,143,31,0)_85%)] text-[#FFD19A] shadow-[0_0_14px_rgba(255,154,41,0.25)]"
            : "border border-[#EBCBA0]/55 bg-[radial-gradient(circle_at_50%_50%,rgba(255,191,103,0.3),rgba(244,236,227,1)_72%)] text-[#C6762C]"
        } ${className}`}
      >
        <CircleAlert className="h-[11px] w-[11px]" strokeWidth={1.9} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ${
        onDark
          ? "border border-[#8AB2F8]/16 bg-[radial-gradient(circle_at_50%_50%,rgba(136,174,255,0.28),rgba(99,102,241,0.08)_55%,rgba(99,102,241,0)_100%)] text-[#9EDBFF] shadow-[0_0_12px_rgba(99,102,241,0.16)]"
          : "border border-[#D8DFF7]/70 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.96),rgba(238,241,255,1)_74%)] text-[#6671D8]"
      } ${className}`}
    >
      <Activity className="zila-signal-pulse h-[11px] w-[11px]" strokeWidth={1.9} />
    </span>
  );
}
