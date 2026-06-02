"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, CreditCard, FileText, FolderKanban } from "lucide-react";

import { IconTile } from "@/components/ui/IconTile";
import { projects as seedProjects, type Project } from "@/data/projects";
import { mergeOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";
import { getProtectedMoneySummary, subscribeToProtectedMoney } from "@/lib/protectedMoneyStore";

type ProtectedMoneySummary = ReturnType<typeof getProtectedMoneySummary>;

function getInitialSummary(): ProtectedMoneySummary {
  return {
    reserves: [],
    activity: [],
    totalBalance: 0,
    protectedAmount: 0,
    committedAmount: 0,
    safeToSpend: 0,
  };
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function FlowGraph() {
  return (
    <div className="relative mt-4 h-[112px] overflow-hidden rounded-[20px] border border-white/18 bg-[radial-gradient(circle_at_76%_16%,rgba(103,232,249,0.16),transparent_28%),linear-gradient(180deg,#1D4A78_0%,#17345F_58%,#10233F_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_22px_48px_rgba(31,68,116,0.18)]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 292 126" fill="none" aria-hidden="true">
        <path
          d="M8 92C24 82 31 57 45 56C62 55 65 82 84 79C105 76 110 52 132 50C154 48 159 59 178 48C197 37 204 22 221 22C239 22 245 39 262 36C274 34 280 21 288 18L288 126L8 126Z"
          fill="url(#flowArea)"
          opacity="0.72"
        />
        <path
          d="M8 92C24 82 31 57 45 56C62 55 65 82 84 79C105 76 110 52 132 50C154 48 159 59 178 48C197 37 204 22 221 22C239 22 245 39 262 36C274 34 280 21 288 18"
          stroke="url(#flowLine)"
          strokeWidth="6.6"
          strokeLinecap="round"
        />
        <circle cx="221" cy="22" r="11" fill="rgba(56,189,248,0.20)" stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" />
        <circle cx="221" cy="22" r="7.8" fill="#C4B5FD" stroke="rgba(255,255,255,0.98)" strokeWidth="3" />
        <defs>
          <linearGradient id="flowLine" x1="8" y1="92" x2="288" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A66BFF" />
            <stop offset="0.44" stopColor="#D9B4FF" />
            <stop offset="1" stopColor="#67E8F9" />
          </linearGradient>
          <linearGradient id="flowArea" x1="148" y1="18" x2="148" y2="126" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" stopOpacity="0.18" />
            <stop offset="0.46" stopColor="#6366F1" stopOpacity="0.08" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function OperatingFlowCard() {
  const [summary, setSummary] = useState(getInitialSummary);
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);

  useEffect(() => {
    const update = () => {
      setSummary(getProtectedMoneySummary());
      setVisibleProjects(mergeOperationalProjects(seedProjects));
    };

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribeProjects = subscribeToOperationalProjects(update);

    return () => {
      unsubscribeProtected();
      unsubscribeProjects();
    };
  }, []);

  const activity = useMemo(() => {
    const first = visibleProjects[0];
    const second = visibleProjects[1];
    const rows = [
      {
        label: first ? `${first.name} added to workspace` : "Workspace created",
        amount: first?.budget ?? "Live",
        time: "Just now",
        icon: FolderKanban,
        tone: "text-[#D9FF57]",
      },
      {
        label: first ? `${first.name} budget configured` : "Starter budget configured",
        amount: first?.remaining ?? formatCurrency(summary.safeToSpend),
        time: "Just now",
        icon: CreditCard,
        tone: "text-[#67E8F9]",
      },
      {
        label: second ? `${second.name} ready for first record` : "Proof layer prepared",
        amount: "Ready",
        time: "Today",
        icon: FileText,
        tone: "text-[#AEBBDA]",
      },
    ];

    return rows;
  }, [summary.safeToSpend, visibleProjects]);

  return (
    <section className="zila-card-hover rounded-[26px] border border-[#6D5EF8]/18 bg-[radial-gradient(circle_at_82%_0%,rgba(103,232,249,0.14),transparent_26%),linear-gradient(180deg,#173D6D,#214F83_48%,#102A4F)] p-4 text-white shadow-[0_24px_62px_rgba(31,68,116,0.20),0_28px_64px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconTile size="md" glow="cyan">
            <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2} />
          </IconTile>
          <div>
            <p className="text-[18px] font-semibold tracking-[-0.035em]">Operating Flow</p>
            <p className="mt-1 text-[11px] text-[#C9D4F5]">Total Capital · {formatCurrency(summary.totalBalance)}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.065] px-3.5 py-2 text-[12px] font-semibold text-[#C4CBE0] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          This week
        </span>
      </div>

      <FlowGraph />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[16px] font-semibold tracking-[-0.03em]">Recent Operational Activity</p>
        <Link href="/proof" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#C9D4F5] transition hover:text-white">
          View all
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.1} />
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {activity.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-[17px] border border-white/10 bg-white/[0.06] px-3 py-2.5 shadow-[0_12px_26px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#173D6D] to-[#102A4F] text-[#D9FF57]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[#E5EAF6]">{item.label}</p>
                  <p className="mt-1 text-[11px] text-[#8998B2]">{item.time}</p>
                </div>
              </div>
              <p className={`shrink-0 text-[15px] font-semibold tracking-[-0.035em] ${item.tone}`}>{item.amount}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default OperatingFlowCard;
