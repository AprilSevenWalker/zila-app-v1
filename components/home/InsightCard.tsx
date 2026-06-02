"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { IconTile } from "@/components/ui/IconTile";
import { projects as seedProjects, type Project } from "@/data/projects";
import { getZilaUserProfile, subscribeToZilaSession } from "@/lib/demoSession";
import { mergeOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";

interface InsightCardProps {
  quote?: string;
  meta?: string;
  ctaLabel?: string;
}

export function InsightCard({
  quote,
  meta,
  ctaLabel = "View operating pattern →",
}: InsightCardProps) {
  const [isDemo, setIsDemo] = useState(false);
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);

  useEffect(() => {
    const update = () => {
      setIsDemo(getZilaUserProfile().isDemo);
      setVisibleProjects(mergeOperationalProjects(seedProjects));
    };

    update();
    const unsubscribeSession = subscribeToZilaSession(update);
    const unsubscribeProjects = subscribeToOperationalProjects(update);

    return () => {
      unsubscribeSession();
      unsubscribeProjects();
    };
  }, []);

  const starterQuote = useMemo(() => {
    if (quote) {
      return quote;
    }

    if (isDemo) {
      return "Your business usually keeps a 21 day safety cushion. Supplier-heavy weeks tend to reduce that range first.";
    }

    if (visibleProjects.length > 1) {
      return `Zila is ready to track operating patterns across ${visibleProjects[0].name} and your other projects.`;
    }

    if (visibleProjects[0]) {
      return `Zila is ready to track operating patterns across ${visibleProjects[0].name} as payments, approvals, reserves, and updates are recorded.`;
    }

    return "Zila will start learning operating patterns as payments, approvals, reserves, and project updates are recorded.";
  }, [isDemo, quote, visibleProjects]);

  const metaLabel = meta ?? (isDemo ? "Learned from your verified activity history · Updated daily" : "Operational memory prepared · Waiting for first recorded activity");

  return (
    <div className="rounded-[20px] border border-[#8F7CFF]/18 bg-[radial-gradient(circle_at_84%_0%,rgba(143,124,255,0.16),transparent_30%),linear-gradient(180deg,#102347,#193765_48%,#06101F)] p-5 shadow-[0_24px_56px_rgba(1,8,20,0.40),0_0_28px_rgba(143,124,255,0.10),inset_0_1px_0_rgba(234,241,255,0.10)]">
      <div className="mb-4 flex items-center gap-3">
        <IconTile size="md" glow="indigo">
          <span className="text-sm font-bold">Z</span>
        </IconTile>
        <div>
          <p className="text-[12px] font-semibold text-[#BFB5FF]">Business memory</p>
          <p className="text-[11px] text-[#C9D4F5]">{isDemo ? "Based on recorded operating patterns" : "Ready to learn from your operating patterns"}</p>
        </div>
      </div>

      <div className="mb-4 border-l-2 border-[#8F7CFF]/65 pl-4">
        <p className="text-[13px] italic leading-relaxed text-[#EAF1FF]">&ldquo;{starterQuote}&rdquo;</p>
      </div>

      <p className="mb-4 text-[11px] text-[#C9D4F5]">{metaLabel}</p>

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
