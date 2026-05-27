"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, CreditCard, ReceiptText } from "lucide-react";

import type { Project } from "@/data/projects";
import { getSignalVariant, ZilaSignal } from "@/components/projects/ZilaSignal";
import { Pill } from "@/components/ui/Pill";
import {
  getLatestPaymentTransaction,
  subscribeToLatestPaymentTransaction,
  type LatestPaymentTransaction,
} from "@/lib/paymentTransactionStore";
import { mergeOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";

type HumanActivity = {
  person: string;
  action: string;
  impact: string;
  impactTone: "positive" | "negative" | "neutral";
  avatar?: "amara";
};

const activityByProject: Record<string, HumanActivity[]> = {
  "harbour-road": [
    {
      person: "Kevin",
      action: "logged a supplier payment",
      impact: "Remaining budget decreased by $2,000",
      impactTone: "negative",
      avatar: "amara",
    },
    {
      person: "James",
      action: "updated material costs",
      impact: "+$1,200 expenses added",
      impactTone: "negative",
    },
  ],
  "palm-estate": [
    {
      person: "Kevin",
      action: "recorded client payment",
      impact: "+$3,000 received",
      impactTone: "positive",
      avatar: "amara",
    },
    {
      person: "James",
      action: "confirmed weekly costs",
      impact: "Runway remains healthy",
      impactTone: "positive",
    },
  ],
  "buildops-site-a": [
    {
      person: "James",
      action: "updated close-out costs",
      impact: "+$800 payment due",
      impactTone: "negative",
    },
    {
      person: "Kevin",
      action: "checked balance release",
      impact: "Next payment ready",
      impactTone: "neutral",
      avatar: "amara",
    },
  ],
  "north-block": [
    {
      person: "Kevin",
      action: "refreshed the forecast",
      impact: "$4,400 runway protected",
      impactTone: "positive",
      avatar: "amara",
    },
    {
      person: "James",
      action: "reviewed supplier balances",
      impact: "No urgent move needed",
      impactTone: "neutral",
    },
  ],
};

const crossProjectFeed = [
  {
    person: "Kevin",
    action: "recorded payment",
    project: "Project Horizon",
    impact: "+$2,400",
    tone: "positive",
    avatar: "amara",
  },
  {
    person: "James",
    action: "updated costs",
    project: "Northstar Project",
    impact: "+$800 due",
    tone: "negative",
  },
  {
    person: "Kevin",
    action: "refreshed forecast",
    project: "Helix Project",
    impact: "stable",
    tone: "neutral",
    avatar: "amara",
  },
];

function MoneyMetric({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  const Icon = label === "Budget" ? CircleDollarSign : ReceiptText;

  return (
    <div className="min-w-[128px] flex-1">
      <div className={`flex items-center gap-1.5 ${dark ? "text-[#DCE7FA]" : "text-[#334155]"}`}>
        <Icon className="h-[12px] w-[12px]" strokeWidth={2.1} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">{label}</p>
      </div>
      <p className={`mt-2 whitespace-nowrap font-semibold leading-none tracking-[-0.04em] ${dark ? "text-[22px] text-white" : "text-[18px] text-[#121417]"}`}>
        {value}
      </p>
    </div>
  );
}

function getOperationalSignal(project: Project) {
  if (project.statusTone === "warning") {
    return {
      label: project.id === "harbour-road" ? "Supplier timing in focus" : "Upcoming payment window",
      detail: project.id === "harbour-road" ? "Safe-to-use recalculated" : "Payment sequence is being monitored",
      toneClass: "border-[#D9FF57]/18 bg-[linear-gradient(180deg,rgba(217,255,87,0.10),rgba(27,70,116,0.42))] text-[#EAFFB4]",
    };
  }

  if (project.statusTone === "success") {
    return {
      label: project.id === "north-block" ? "Runway protected" : "Healthy",
      detail: project.id === "north-block" ? "Commitments covered" : "Operating range clear",
      toneClass: "border-[#67E8F9]/40 bg-[linear-gradient(180deg,rgba(11,57,78,0.62),rgba(16,35,63,0.82))] text-[#D9FAFF]",
    };
  }

  return {
    label: "Monitoring",
    detail: "Activity updating",
    toneClass: "border-[#7E93B4]/40 bg-[linear-gradient(180deg,rgba(24,44,70,0.72),rgba(12,27,48,0.84))] text-[#E0EAF8]",
  };
}

function projectPillClass(tone: Project["statusTone"]) {
  if (tone === "warning") {
    return "!border-[#D9FF57]/24 !bg-[#D9FF57]/[0.08] !text-[#EAFFB4] shadow-[0_0_18px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.10)]";
  }

  if (tone === "success") {
    return "!border-[#67E8F9]/48 !bg-[#0B2A3A] !text-[#D9FAFF] shadow-[0_0_14px_rgba(103,232,249,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]";
  }

  return "!border-[#7E93B4]/42 !bg-[#13233A] !text-[#D7E3F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
}

function projectAccentClass(tone: Project["statusTone"]) {
  if (tone === "warning") {
    return "from-[#D9FF57] via-[#67E8F9] to-transparent";
  }

  if (tone === "success") {
    return "from-[#67E8F9] via-[#2F80FF] to-transparent";
  }

  return "from-[#8FA7C7] via-[#486784] to-transparent";
}

function getProjectOperations(project: Project) {
  const pressure = project.statusTone === "warning";

  return {
    runway: pressure ? (project.id === "harbour-road" ? "Runway tight by Friday" : "Close-out runway tight") : project.id === "north-block" ? "Runway stable for 15 days" : "Runway stable for 12 days",
    payout: pressure ? (project.id === "harbour-road" ? "Supplier payout overlaps Friday" : "Payment clearance due next") : "No payout cluster detected",
    reserve: pressure ? "Reserve review recommended" : "Reserve remains protected",
    activity: pressure ? "Pressure building" : "Normal operating rhythm",
    recommendation: pressure ? project.nextMoveSummary : project.zilaSuggestionShort,
  };
}

function getOperationalConfidence(project: Project, paymentSynced = false, latestPayment: LatestPaymentTransaction | null = null) {
  if (paymentSynced) {
    return {
      label: "RESERVE PROTECTED",
      detail: `${latestPayment?.amountLabel ?? "Supplier payout"} settled. Reserve, proof, and operational memory synced.`,
      pressure: "Updated now",
      action: "Open project",
      toneClass: "border-[#D9FF57]/22 bg-[#D9FF57]/[0.09] text-[#EAFFB4]",
      panelClass: "border-[#D9FF57]/18 bg-[linear-gradient(180deg,rgba(217,255,87,0.10),rgba(255,255,255,0.055))]",
    };
  }

  if (project.id === "harbour-road") {
    return {
      label: "SAFE TO APPROVE",
      detail: "Supplier payout will not affect operational runway.",
      pressure: "Northline payout due Friday",
      action: "Coordinate payout",
      toneClass: "border-[#D9FF57]/22 bg-[#D9FF57]/[0.09] text-[#EAFFB4]",
      panelClass: "border-[#D9FF57]/18 bg-[linear-gradient(180deg,rgba(217,255,87,0.10),rgba(255,255,255,0.055))]",
    };
  }

  if (project.id === "palm-estate") {
    return {
      label: "SAFE TO SPEND",
      detail: "$10,500 available after protected reserve.",
      pressure: "Weekly delivery review",
      action: "Review spend",
      toneClass: "border-[#67E8F9]/24 bg-[#67E8F9]/[0.10] text-[#DDFBFF]",
      panelClass: "border-[#67E8F9]/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.10),rgba(255,255,255,0.055))]",
    };
  }

  if (project.id === "buildops-site-a") {
    return {
      label: "REVIEW BEFORE APPROVAL",
      detail: "Client settlement delay affects available balance.",
      pressure: "Payment clearance due next",
      action: "Review approval",
      toneClass: "border-[#D9FF57]/22 bg-[#D9FF57]/[0.085] text-[#EAFFB4]",
      panelClass: "border-[#D9FF57]/18 bg-[linear-gradient(180deg,rgba(217,255,87,0.09),rgba(255,255,255,0.05))]",
    };
  }

  if (project.id === "north-block") {
    return {
      label: "RESERVE PROTECTED",
      detail: "Current commitments remain covered after reserve recalculation.",
      pressure: "Runway stable for 15 days",
      action: "Open project",
      toneClass: "border-[#67E8F9]/24 bg-[#67E8F9]/[0.10] text-[#DDFBFF]",
      panelClass: "border-[#67E8F9]/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.10),rgba(255,255,255,0.055))]",
    };
  }

  return {
    label: "WATCH RUNWAY",
    detail: "Upcoming obligations may tighten reserves.",
    pressure: "Reserve recalculated",
    action: "Protect reserve",
    toneClass: "border-[#67E8F9]/24 bg-[#67E8F9]/[0.10] text-[#DDFBFF]",
    panelClass: "border-[#67E8F9]/18 bg-[linear-gradient(180deg,rgba(103,232,249,0.10),rgba(255,255,255,0.055))]",
  };
}

const portfolioInsights = [
  "2 supplier payouts overlap Friday.",
  "Reserve remains protected after delivery payout.",
  "Northstar approaching pressure threshold.",
  "Atlas runway stable for 12 days.",
];

function getProjectInsights(project: Project) {
  const operations = getProjectOperations(project);

  return [
    operations.recommendation,
    operations.reserve,
  ];
}

function paymentMatchesProject(payment: LatestPaymentTransaction | null, project: Project) {
  if (!payment) {
    return false;
  }

  return [project.name, project.client, project.id].some((value) => value.toLowerCase() === payment.projectName.toLowerCase());
}

function getPaymentProjectId(payment: LatestPaymentTransaction | null, projects: Project[]) {
  if (!payment) {
    return null;
  }

  return projects.find((project) => paymentMatchesProject(payment, project))?.id ?? null;
}

function pageAtmosphereClass(tone: Project["statusTone"]) {
  if (tone === "warning") {
    return "before:bg-[radial-gradient(circle_at_78%_24%,rgba(217,255,87,0.08),transparent_28%),radial-gradient(circle_at_18%_64%,rgba(103,232,249,0.14),transparent_36%),radial-gradient(circle_at_48%_8%,rgba(255,255,255,0.08),transparent_34%)]";
  }

  if (tone === "success") {
    return "before:bg-[radial-gradient(circle_at_78%_28%,rgba(217,255,87,0.08),transparent_28%),radial-gradient(circle_at_18%_64%,rgba(103,232,249,0.16),transparent_36%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]";
  }

  return "before:bg-[radial-gradient(circle_at_78%_30%,rgba(103,232,249,0.13),transparent_32%),radial-gradient(circle_at_18%_64%,rgba(143,167,199,0.12),transparent_36%),radial-gradient(circle_at_48%_4%,rgba(255,255,255,0.07),transparent_34%)]";
}

function LivePulse({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/28 bg-[#67E8F9]/10 px-3 py-1.5 text-[11px] font-semibold text-[#E8FCFF] shadow-[0_10px_24px_rgba(103,232,249,0.08),inset_0_1px_0_rgba(255,255,255,0.10)]">
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#67E8F9] shadow-[0_0_16px_rgba(103,232,249,0.28)]">
        <span className="insight-signal-ripple absolute inset-0 rounded-full bg-[#67E8F9]" />
      </span>
      {label}
    </span>
  );
}

function FeaturedProjectCard({ project, isActive, latestPayment }: { project: Project; isActive: boolean; latestPayment: LatestPaymentTransaction | null }) {
  const latestUpdate = activityByProject[project.id]?.[0];
  const operations = getProjectOperations(project);
  const paymentSynced = paymentMatchesProject(latestPayment, project);
  const confidence = getOperationalConfidence(project, paymentSynced, latestPayment);
  const operationChips = paymentSynced
    ? ["Supplier payout completed", "Reserve recalculated", "Proof generated"]
    : [confidence.pressure, operations.payout, operations.reserve];
  const actionLabels = [confidence.action, project.secondaryActionLabel, "View proof history"];

  return (
    <Link href={`/projects/${project.id}`} className={`group zila-surface-grain zila-hero-system-glow relative block min-h-[350px] cursor-pointer overflow-hidden rounded-[30px] border border-white/18 bg-[linear-gradient(145deg,#173D6D_0%,#1E4A7D_46%,#102A4F_100%)] p-5 text-white shadow-[0_22px_62px_rgba(31,68,116,0.18),0_34px_86px_rgba(15,23,42,0.22),0_0_46px_rgba(103,232,249,0.08),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-1 hover:border-[#D9FF57]/18 hover:shadow-[0_26px_70px_rgba(31,68,116,0.20),0_40px_96px_rgba(15,23,42,0.24),0_0_56px_rgba(217,255,87,0.07),inset_0_1px_0_rgba(255,255,255,0.16)] md:p-6 ${isActive ? "scale-100 opacity-100" : "scale-[0.96] opacity-75"}`}>
      <div className="zila-hero-ambient absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.18),transparent_34%),radial-gradient(circle_at_84%_6%,rgba(217,255,87,0.06),transparent_24%),radial-gradient(circle_at_52%_100%,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),transparent_52%,rgba(7,21,38,0.10))]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(217,255,87,0.36),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex min-h-[304px] flex-col">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#1D4ED8,#0EA5E9)] text-[#F8FBFF] shadow-[0_0_28px_rgba(103,232,249,0.20),inset_0_1px_0_rgba(255,255,255,0.14)]">
                <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} onDark className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#DCE7FA]">Live project</p>
                <h2 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.07em] text-white md:text-[36px]">{project.name}</h2>
              </div>
            </div>
              <div className={`mt-4 max-w-[620px] rounded-[24px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${confidence.panelClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] ${confidence.toneClass}`}>
                    {confidence.label}
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold text-[#D7E3F8]">
                    <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
                    Updated now
                  </span>
                </div>
                <p className="mt-3 text-[18px] font-semibold leading-[1.3] tracking-[-0.04em] text-white">{confidence.detail}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {operationChips.map((item, index) => (
                  <span key={item} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                    index === 0
                      ? "border-[#D9FF57]/18 bg-[#D9FF57]/[0.075] text-[#EAFFB4]"
                      : "border-white/10 bg-white/[0.055] text-[#D7E3F8]"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "zila-live-dot bg-[#D9FF57]" : "bg-[#67E8F9]/70"}`} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <LivePulse label="Updating live" />
            <Pill tone={project.statusTone} className={`w-fit ${projectPillClass(project.statusTone)}`}>
              {project.status === "Watch" ? "Pressure" : project.status}
            </Pill>
          </div>
        </div>

        <div className="mt-auto grid gap-5 pt-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(260px,0.74fr)] lg:items-end">
          <div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-x-8 gap-y-5">
              <MoneyMetric label="Budget" value={project.budget} dark />
              <MoneyMetric label="Remaining" value={project.remaining} dark />
              <MoneyMetric label="Spent" value={project.spent} dark />
            </div>

            <div className="mt-5">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="rounded-full bg-[linear-gradient(90deg,#2F80FF,#67E8F9)] shadow-[0_0_18px_rgba(103,232,249,0.30)]"
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-semibold text-[#C7D2EA]">
                <span>Operating load</span>
                <span>{project.progress}% active</span>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-[#67E8F9]/22 bg-white/[0.075] px-4 py-4 shadow-[0_16px_34px_rgba(1,8,20,0.10),inset_0_1px_0_rgba(255,255,255,0.09)] transition group-hover:border-[#D9FF57]/18 group-hover:bg-white/[0.095]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D9FAFF]">Next recommendation</p>
              <p className="mt-2 text-[15px] font-semibold leading-[1.35] tracking-[-0.025em] text-white">
                {paymentSynced
                  ? `${latestPayment?.amountLabel} payout cleared. Runway and proof history are now synced.`
                  : operations.recommendation}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                {actionLabels.map((action) => (
                  <span key={action} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-semibold text-[#D7E3F8]">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/14 bg-white/[0.075] p-4 shadow-[0_20px_42px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DCE7FA]">Activity snippet</p>
              <span className="text-[11px] font-semibold text-[#E8FCFF]">{project.updatedAt}</span>
            </div>
            <div className="space-y-3">
              <div className="relative flex gap-3">
                <span className="zila-live-dot mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.28)]" />
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {paymentSynced ? "completed supplier payout" : latestUpdate?.action ?? "Operational activity recorded"}
                  </p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.55] text-[#E0EAF8]">
                    {paymentSynced ? `${latestPayment?.amountLabel} moved · reserve and proof updated` : latestUpdate?.impact ?? project.lastVerifiedAction ?? "Project state refreshed"}
                  </p>
                </div>
              </div>
              <div className="relative flex gap-3">
                <span className={`mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
                  project.statusTone === "warning"
                    ? "bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.22)]"
                    : "bg-[#67E8F9] shadow-[0_0_14px_rgba(103,232,249,0.24)]"
                }`} />
                <div>
                  <p className="text-[14px] font-semibold text-white">{getOperationalSignal(project).label}</p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.55] text-[#E0EAF8]">{getOperationalSignal(project).detail}</p>
                </div>
              </div>
              <div className="relative flex gap-3">
                <span className="mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#67E8F9]/80 shadow-[0_0_14px_rgba(103,232,249,0.20)]" />
                <div>
                  <p className="text-[14px] font-semibold text-white">Treasury coordination signal</p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.55] text-[#E0EAF8]">{operations.activity} · {operations.reserve}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProjectRailTile({
  project,
  isSelected,
  onSelect,
  latestPayment,
  isDuplicate = false,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: (projectId: string) => void;
  latestPayment: LatestPaymentTransaction | null;
  isDuplicate?: boolean;
}) {
  const operations = getProjectOperations(project);
  const pressure = project.statusTone === "warning";
  const paymentSynced = paymentMatchesProject(latestPayment, project);
  const confidence = getOperationalConfidence(project, paymentSynced, latestPayment);

  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      tabIndex={isDuplicate ? -1 : 0}
      className={`group relative min-w-[270px] flex-1 overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-500 hover:-translate-y-0.5 ${
        isSelected
          ? "border-[#D9FF57]/28 bg-[linear-gradient(180deg,rgba(217,255,87,0.10),rgba(30,74,125,0.58))] shadow-[0_20px_46px_rgba(217,255,87,0.07),0_0_34px_rgba(103,232,249,0.06),inset_0_1px_0_rgba(255,255,255,0.12)]"
          : pressure
            ? "border-[#D9FF57]/16 bg-[linear-gradient(180deg,rgba(217,255,87,0.07),rgba(30,74,125,0.44))] shadow-[0_18px_40px_rgba(31,68,116,0.10),inset_0_1px_0_rgba(255,255,255,0.09)]"
            : "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(30,74,125,0.38))] shadow-[0_14px_32px_rgba(31,68,116,0.10),inset_0_1px_0_rgba(255,255,255,0.09)]"
      }`}
      aria-pressed={isSelected}
    >
      <span className={`absolute inset-x-4 top-0 h-px bg-gradient-to-r ${isSelected ? "from-transparent via-[#D9FF57] to-transparent" : projectAccentClass(project.statusTone)}`} />
      <span className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${isSelected ? "opacity-100" : "opacity-0"} bg-[radial-gradient(circle_at_22%_0%,rgba(217,255,87,0.10),transparent_34%)]`} />
      <div className="relative flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="truncate text-[18px] font-semibold tracking-[-0.045em] text-white">{project.name}</p>
          <p className="mt-2 text-[13px] font-semibold leading-[1.45] text-[#D7E3F8]">
            {confidence.detail}
          </p>
        </div>
        <span className={`inline-flex min-h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-3 text-center text-[9px] font-semibold uppercase leading-none tracking-[0.11em] ${isSelected ? confidence.toneClass : pressureClass(project.statusTone)}`}>
          {confidence.label}
        </span>
      </div>

      <div className="relative mt-4 flex items-start gap-3 rounded-[17px] border border-white/8 bg-white/[0.035] px-3 py-2.5">
        <span className={`${isSelected || pressure ? "zila-live-dot bg-[#D9FF57]" : "bg-[#67E8F9]/70"} mt-1.5 h-2 w-2 shrink-0 rounded-full`} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8FA4C3]">Operational signal</p>
          <p className="mt-1 text-[12px] font-semibold leading-[1.45] text-[#D7E3F8]">
            {paymentSynced ? `${latestPayment?.amountLabel} proof generated` : confidence.pressure}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <p className="text-[11px] font-semibold text-[#D9FF57]">{project.remaining} remaining</p>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#AFC0DD] transition group-hover:text-white">
          {confidence.action}
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </div>
    </button>
  );
}

function pressureClass(tone: Project["statusTone"]) {
  if (tone === "warning") {
    return "border-[#D9FF57]/18 bg-[#D9FF57]/[0.075] text-[#EAFFB4]";
  }

  if (tone === "success") {
    return "border-[#D9FF57]/18 bg-[#D9FF57]/[0.075] text-[#EAFFB4]";
  }

  return "border-white/10 bg-white/[0.055] text-[#D7E3F8]";
}

function OperationalRail({
  projects,
  selectedProjectId,
  onSelectProject,
  latestPayment,
}: {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  latestPayment: LatestPaymentTransaction | null;
}) {
  const railProjects = projects.length > 0 ? projects : [];

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.12),transparent_34%),linear-gradient(180deg,rgba(30,74,125,0.28),rgba(16,42,79,0.46))] p-5 shadow-[0_24px_58px_rgba(31,68,116,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.24),rgba(217,255,87,0.14),transparent)]" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Operational rail</p>
          <p className="mt-1 text-[15px] font-semibold tracking-[-0.025em] text-white">Projects moving through the coordination system.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.065] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
          <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
          Coordinated
        </span>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,rgba(16,42,79,0.90),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,rgba(16,42,79,0.90),transparent)]" />
        <div className="zila-operational-rail-track flex w-max gap-4 pb-1">
          {[...railProjects, ...railProjects].map((project, index) => (
            <div key={`${project.id}-${index}`} aria-hidden={index >= railProjects.length ? "true" : undefined}>
              <ProjectRailTile
                project={project}
                isSelected={project.id === selectedProjectId}
                onSelect={onSelectProject}
                latestPayment={latestPayment}
                isDuplicate={index >= railProjects.length}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioIntelligencePanel({
  selectedProject,
  attentionProjects,
  latestPayment,
}: {
  selectedProject: Project;
  attentionProjects: Project[];
  latestPayment: LatestPaymentTransaction | null;
}) {
  const paymentSynced = paymentMatchesProject(latestPayment, selectedProject);
  const selectedInsights = paymentSynced
    ? [
        `${latestPayment?.amountLabel} supplier payout cleared and reduced active obligation pressure.`,
        "Reserve, runway, and proof history refreshed together.",
      ]
    : getProjectInsights(selectedProject);
  const selectedActivity = activityByProject[selectedProject.id] ?? [];
  const selectedSignal = getOperationalSignal(selectedProject);
  const pulseItems = [
    ...(latestPayment
      ? [
          {
            project: latestPayment.projectName,
            action: "payment synchronized",
            impact: `${latestPayment.amountLabel} · proof generated`,
            tone: "positive" as const,
          },
        ]
      : []),
    {
      project: selectedProject.name,
      action: selectedActivity[0]?.action ?? "refreshed operating state",
      impact: selectedActivity[0]?.impact ?? selectedSignal.detail,
      tone: selectedProject.statusTone === "warning" ? "negative" as const : selectedProject.statusTone === "success" ? "positive" as const : "neutral" as const,
    },
    ...crossProjectFeed.slice(0, latestPayment ? 0 : 1),
  ];

  return (
    <aside key={selectedProject.id} className="zila-flow-step relative overflow-hidden rounded-[32px] border border-white/14 bg-[radial-gradient(circle_at_100%_0%,rgba(217,255,87,0.07),transparent_30%),radial-gradient(circle_at_0%_18%,rgba(103,232,249,0.10),transparent_34%),linear-gradient(180deg,rgba(30,74,125,0.52),rgba(16,42,79,0.42),rgba(13,35,68,0.58))] p-5 text-white shadow-[0_24px_58px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl xl:sticky xl:top-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(217,255,87,0.22),transparent)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Coordination intelligence</p>
          <h3 className="mt-3 text-[21px] font-semibold leading-[1.14] tracking-[-0.05em]">{selectedProject.name} is in focus.</h3>
        </div>
        <span className="zila-live-dot mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9FF57] shadow-[0_0_16px_rgba(217,255,87,0.34)]" />
      </div>

      <div className="mt-6 space-y-6">
        <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {selectedInsights.map((insight, index) => (
            <div key={insight} className="flex gap-3">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${index === 0 ? "zila-live-dot bg-[#D9FF57]" : "bg-[#67E8F9]/70"}`} />
              <p className="text-[13px] font-semibold leading-[1.55] text-[#D7E3F8]">{insight}</p>
            </div>
          ))}
        </div>

        <Link
          href="/payments/send"
          className="group flex items-center justify-between gap-4 rounded-[24px] border border-[#D9FF57]/16 bg-[#D9FF57]/[0.075] px-4 py-4 transition hover:-translate-y-0.5 hover:bg-[#D9FF57]/[0.10] hover:shadow-[0_18px_36px_rgba(217,255,87,0.08)]"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-[#D9FF57]/18 bg-[#D9FF57]/[0.09] text-[#EAFFB4]">
              <CreditCard className="h-[16px] w-[16px]" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-[#F1FFB8]">Make payment</span>
              <span className="mt-1 block text-[12px] leading-[1.45] text-[#B9C8DF]">
                {paymentSynced ? "Payment moved. Proof and project state are synced." : "Turn project pressure into a clear supplier payout."}
              </span>
            </span>
          </span>
          <ArrowRight className="h-[14px] w-[14px] shrink-0 text-[#EAFFB4] transition group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>

        <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Recommended focus</p>
          <div className="mt-3 space-y-3">
            {(selectedProject.statusTone === "warning" ? [selectedProject, ...attentionProjects.filter((project) => project.id !== selectedProject.id)] : attentionProjects).slice(0, 2).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block rounded-[24px] border border-white/10 bg-white/[0.045] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[#D9FF57]/18 hover:bg-white/[0.065]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#E9EEF9]">{project.name}</p>
                    <p className="mt-2 text-[15px] font-semibold leading-[1.35] tracking-[-0.025em] text-white">{project.nextMoveSummary}</p>
                  </div>
                  <ArrowRight className="mt-1 h-[14px] w-[14px] shrink-0 text-[#EAFFB4] transition group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">System pulse</p>
            <span className="rounded-full border border-[#67E8F9]/24 bg-[#67E8F9]/10 px-2.5 py-1 text-[10px] font-semibold text-[#D9FAFF]">Live</span>
          </div>
          <div className="space-y-0">
            {pulseItems.map((item, index) => (
              <div key={`${item.project}-${item.action}`} className="relative flex gap-3 pb-4 last:pb-0">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                  item.tone === "positive"
                    ? "bg-[#67E8F9] shadow-[0_0_12px_rgba(103,232,249,0.24)]"
                    : item.tone === "negative"
                      ? "bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.20)]"
                      : "bg-[#9FB7D6] shadow-[0_0_12px_rgba(159,183,214,0.16)]"
                }`} />
                {index < crossProjectFeed.length - 1 ? <span className="absolute left-[3.5px] top-6 h-[calc(100%-1rem)] w-px bg-white/12" /> : null}
                <div className="min-w-0">
                  <p className="text-[12px] leading-[1.55] text-[#D7E3F8]">
                    <span className="font-semibold text-white">{item.project}</span> {item.action.replace("updated", "recalculated").replace("recorded", "synchronized")}
                  </p>
                  <p className={`mt-1 text-[11px] font-semibold ${item.tone === "positive" ? "text-[#D9FAFF]" : item.tone === "negative" ? "text-[#EAFFB4]" : "text-[#AFC0DD]"}`}>
                    {item.impact} · {item.tone === "positive" ? "runway protected" : item.tone === "negative" ? "timing monitored" : "safe-to-use recalculated"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ProjectsScreenContent({ projects }: { projects: Project[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [latestPayment, setLatestPayment] = useState<LatestPaymentTransaction | null>(null);
  const [visibleProjects, setVisibleProjects] = useState(() => mergeOperationalProjects(projects));
  const attentionProjects = visibleProjects.filter((project) => project.statusTone === "warning").slice(0, 2);
  const healthyCount = visibleProjects.filter((project) => project.statusTone === "success").length;
  const pressureCount = visibleProjects.filter((project) => project.statusTone === "warning").length;
  const moveReadyCount = visibleProjects.filter((project) => project.cashNeeded !== "$0").length;
  const paymentProjectId = useMemo(() => getPaymentProjectId(latestPayment, visibleProjects), [latestPayment, visibleProjects]);
  const activeProjectId = selectedProjectId ?? paymentProjectId ?? visibleProjects[0]?.id ?? "";
  const selectedProject = visibleProjects.find((project) => project.id === activeProjectId) ?? visibleProjects[0];
  const livePortfolioInsights = latestPayment
    ? [
        `${latestPayment.amountLabel} payout synced to ${latestPayment.projectName}.`,
        "Reserve and runway recalculated.",
        "Proof generated automatically.",
      ]
    : portfolioInsights;

  useEffect(() => {
    const update = () => setLatestPayment(getLatestPaymentTransaction());

    update();
    return subscribeToLatestPaymentTransaction(update);
  }, []);

  useEffect(() => {
    const update = () => setVisibleProjects(mergeOperationalProjects(projects));

    update();
    return subscribeToOperationalProjects(update);
  }, [projects]);

  if (!selectedProject) {
    return (
      <div className="zila-unified-page relative -mx-4 -mt-2 overflow-hidden px-4 pb-[4.5rem] pt-4 md:-mx-5 md:rounded-[32px] md:px-5 md:pb-7 lg:-mx-6 lg:px-6">
        <section className="relative overflow-hidden rounded-[30px] border border-white/16 bg-[linear-gradient(145deg,#214F83,#173D6D_55%,#102A4F)] p-6 text-white shadow-[0_26px_66px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">Project focus</p>
          <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.06em]">No projects yet.</h1>
          <p className="mt-2 max-w-xl text-[14px] leading-[1.7] text-[#C9D4F5]">
            Create your first project to connect payments, reserves, proof, and operational activity in one live workspace.
          </p>
          <Link href="/onboarding" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F]">
            Create project
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className={`zila-unified-page relative -mx-4 -mt-2 space-y-5 overflow-hidden px-4 pb-[4.5rem] pt-4 before:pointer-events-none before:absolute before:inset-0 before:opacity-100 before:transition before:duration-700 md:-mx-5 md:rounded-[32px] md:px-5 md:pb-7 lg:-mx-6 lg:px-6 md:space-y-6 ${pageAtmosphereClass(selectedProject.statusTone)}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_30%,rgba(7,17,31,0.08))]" />
      <section className="zila-surface-grain zila-unified-panel relative overflow-hidden rounded-[28px] border border-white/16 p-5 shadow-[0_26px_66px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_72%_8%,rgba(103,232,249,0.16),transparent_36%),linear-gradient(100deg,rgba(75,118,159,0.22),rgba(23,61,109,0.12),rgba(255,255,255,0.04))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#67E8F9]/24 bg-[linear-gradient(135deg,#10233F,#1D4ED8_58%,#0EA5E9)] shadow-[0_18px_34px_rgba(16,35,63,0.22),0_0_20px_rgba(103,232,249,0.16),inset_0_1px_0_rgba(255,255,255,0.16)]">
                <span className="relative h-[18px] w-[18px]">
                  <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="18px" className="object-contain brightness-0 invert" />
                </span>
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BFF7FF]">Live operating portfolio</p>
              <p className="mt-1 text-[12px] font-medium text-[#E0EAF8]">
                {latestPayment ? "Payment, reserve, and proof state synchronized" : "Refreshing pressure, runway, and next moves"}
              </p>
              </div>
            </div>
            <h1 className="mt-4 text-[34px] font-semibold leading-none tracking-[-0.07em] text-white md:text-[40px]">Projects in motion</h1>
            <p className="mt-3 max-w-[720px] text-[14px] font-medium leading-[1.7] text-[#E0EAF8]">
              Real-time operational intelligence across reserves, supplier timing, proof records, and project runway.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {livePortfolioInsights.slice(0, 3).map((insight, index) => (
                <span key={insight} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold ${index === 0 ? "border-[#D9FF57]/18 bg-[#D9FF57]/[0.075] text-[#EAFFB4]" : "border-white/10 bg-white/[0.055] text-[#D7E3F8]"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "zila-live-dot bg-[#D9FF57]" : "bg-[#67E8F9]/70"}`} />
                  {insight}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-white/16 bg-white/[0.075] px-4 py-4 shadow-[0_18px_36px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-5">
              <LivePulse label="Portfolio live" />
              <p className="text-[12px] font-semibold text-[#E0EAF8]">{latestPayment ? "Synced just now" : "7 updates today"}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                [String(healthyCount), "healthy"],
                [String(pressureCount), "pressure"],
                [String(moveReadyCount), "move ready"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p key={`${label}-${value}`} className="zila-number-shift text-[22px] font-semibold leading-none tracking-[-0.05em] text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#DCE7FA]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div>
          <section className="relative">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4 px-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7EE7F6]">Primary operating focus</p>
                <p className="mt-1 text-[15px] font-semibold text-[#E0EAF8]">Selected from the live project rail below.</p>
              </div>
              <LivePulse label="Coordinating" />
            </div>
            <div key={selectedProject.id} className="zila-flow-step">
              <FeaturedProjectCard project={selectedProject} isActive latestPayment={latestPayment} />
            </div>
          </section>
        </div>

        <PortfolioIntelligencePanel selectedProject={selectedProject} attentionProjects={attentionProjects} latestPayment={latestPayment} />
      </div>

      <OperationalRail projects={visibleProjects} selectedProjectId={selectedProject.id} onSelectProject={setSelectedProjectId} latestPayment={latestPayment} />
    </div>
  );
}
