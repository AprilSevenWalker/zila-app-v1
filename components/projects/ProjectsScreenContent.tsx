"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, ArrowRight, CircleDollarSign, ReceiptText } from "lucide-react";

import type { Project } from "@/data/projects";
import { getSignalVariant, ZilaSignal } from "@/components/projects/ZilaSignal";
import { Pill } from "@/components/ui/Pill";

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
      person: "Amara",
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
      person: "Amara",
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
      person: "Amara",
      action: "checked balance release",
      impact: "Next payment ready",
      impactTone: "neutral",
      avatar: "amara",
    },
  ],
  "north-block": [
    {
      person: "Amara",
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
    person: "Amara",
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
    person: "Amara",
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
      label: project.id === "harbour-road" ? "Supplier pressure detected" : "Due soon",
      detail: project.id === "harbour-road" ? "Safe-to-use recalculated" : "Payment sequence needs review",
      toneClass: "border-[#B98B4A]/48 bg-[linear-gradient(180deg,rgba(79,51,21,0.62),rgba(18,30,48,0.82))] text-[#F0C777]",
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
    return "!border-[#B98B4A]/58 !bg-[#3A2A18] !text-[#F0C777] shadow-[0_0_14px_rgba(185,139,74,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]";
  }

  if (tone === "success") {
    return "!border-[#67E8F9]/48 !bg-[#0B2A3A] !text-[#D9FAFF] shadow-[0_0_14px_rgba(103,232,249,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]";
  }

  return "!border-[#7E93B4]/42 !bg-[#13233A] !text-[#D7E3F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
}

function projectAccentClass(tone: Project["statusTone"]) {
  if (tone === "warning") {
    return "from-[#B98B4A] via-[#8A6738] to-transparent";
  }

  if (tone === "success") {
    return "from-[#67E8F9] via-[#2F80FF] to-transparent";
  }

  return "from-[#8FA7C7] via-[#486784] to-transparent";
}

function projectProgressClass(tone: Project["statusTone"]) {
  if (tone === "warning") {
    return "bg-[linear-gradient(90deg,#8A6738,#D0A15B)] shadow-[0_0_10px_rgba(185,139,74,0.22)]";
  }

  if (tone === "success") {
    return "bg-[linear-gradient(90deg,#2F80FF,#67E8F9)] shadow-[0_0_12px_rgba(103,232,249,0.22)]";
  }

  return "bg-[linear-gradient(90deg,#486784,#9FB7D6)] shadow-[0_0_10px_rgba(159,183,214,0.14)]";
}

function LivePulse({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/34 bg-[#67E8F9]/14 px-3 py-1.5 text-[11px] font-semibold text-[#E8FCFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#67E8F9] shadow-[0_0_14px_rgba(103,232,249,0.34)]">
        <span className="insight-signal-ripple absolute inset-0 rounded-full bg-[#67E8F9]" />
      </span>
      {label}
    </span>
  );
}

function FeaturedProjectCard({ project, isActive }: { project: Project; isActive: boolean }) {
  const latestUpdate = activityByProject[project.id]?.[0];

  return (
    <article className={`zila-surface-grain relative min-h-[430px] overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(145deg,#030815_0%,#0D1731_46%,#172D58_100%)] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15),0_34px_86px_rgba(15,23,42,0.34),0_0_44px_rgba(34,211,238,0.10),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl transition-all duration-700 ease-out md:p-7 ${isActive ? "scale-100 opacity-100" : "scale-[0.94] opacity-65"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.22),transparent_32%),radial-gradient(circle_at_84%_6%,rgba(217,255,87,0.08),transparent_24%)]" />
      <div className="relative flex min-h-[382px] flex-col">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#1D4ED8,#0EA5E9)] text-[#F8FBFF] shadow-[0_0_28px_rgba(103,232,249,0.20),inset_0_1px_0_rgba(255,255,255,0.14)]">
                <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} onDark className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#DCE7FA]">Live project</p>
                <h2 className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.07em] text-white md:text-[44px]">{project.name}</h2>
              </div>
            </div>
            <p className="mt-6 max-w-[620px] text-[24px] font-semibold leading-[1.24] tracking-[-0.045em] text-white">{project.stateSignal}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <LivePulse label="Updating live" />
            <Pill tone={project.statusTone} className={`w-fit ${projectPillClass(project.statusTone)}`}>
              {project.status === "Watch" ? "Pressure" : project.status}
            </Pill>
          </div>
        </div>

        <div className="mt-auto grid gap-6 pt-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,0.78fr)] lg:items-end">
          <div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-x-8 gap-y-5">
              <MoneyMetric label="Budget" value={project.budget} dark />
              <MoneyMetric label="Remaining" value={project.remaining} dark />
              <MoneyMetric label="Spent" value={project.spent} dark />
            </div>

            <div className="mt-6">
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

            <div className="mt-6 rounded-[22px] border border-[#67E8F9]/28 bg-[#071526]/68 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D9FAFF]">Next recommendation</p>
              <p className="mt-2 text-[17px] font-semibold leading-[1.35] tracking-[-0.025em] text-white">{project.nextMoveSummary}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/12 bg-[#071526]/54 p-4 shadow-[0_20px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DCE7FA]">Activity snippet</p>
              <span className="text-[11px] font-semibold text-[#E8FCFF]">{project.updatedAt}</span>
            </div>
            <div className="space-y-3">
              <div className="relative flex gap-3">
                <span className="mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#67E8F9] shadow-[0_0_14px_rgba(103,232,249,0.34)]" />
                <div>
                  <p className="text-[14px] font-semibold text-white">{latestUpdate?.action ?? "Operational activity recorded"}</p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.55] text-[#E0EAF8]">{latestUpdate?.impact ?? project.lastVerifiedAction ?? "Project state refreshed"}</p>
                </div>
              </div>
              <div className="relative flex gap-3">
                <span className={`mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
                  project.statusTone === "warning"
                    ? "bg-[#B98B4A] shadow-[0_0_14px_rgba(185,139,74,0.24)]"
                    : "bg-[#67E8F9] shadow-[0_0_14px_rgba(103,232,249,0.24)]"
                }`} />
                <div>
                  <p className="text-[14px] font-semibold text-white">{getOperationalSignal(project).label}</p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.55] text-[#E0EAF8]">{getOperationalSignal(project).detail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturedProjectCarousel({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const moveTo = (nextIndex: number) => {
    setActiveIndex((nextIndex + projects.length) % projects.length);
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) {
      return;
    }

    const delta = clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 42) {
      return;
    }

    moveTo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="overflow-hidden px-1 py-1 md:px-8"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
        }}
      >
        <div
          className="flex gap-5 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(calc(${activeIndex === 0 ? "0%" : "7%"} - ${activeIndex * 88}%))` }}
        >
          {projects.map((project, index) => (
            <div key={project.id} className="w-[86%] shrink-0">
              <FeaturedProjectCard project={project} isActive={index === activeIndex} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 px-1 md:px-8">
        <div className="flex items-center gap-2">
          {projects.map((project, index) => (
            <button
              key={`${project.id}-dot`}
              type="button"
              onClick={() => moveTo(index)}
              className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-8 bg-[#10233F]" : "w-2 bg-[#7FA9D1]"}`}
              aria-label={`Show ${project.name}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => moveTo(activeIndex - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#BFD5EF] bg-white/70 text-[#10233F] shadow-[0_12px_24px_rgba(31,68,116,0.08)] transition hover:-translate-y-0.5"
            aria-label="Previous project"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => moveTo(activeIndex + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#BFD5EF] bg-white/70 text-[#10233F] shadow-[0_12px_24px_rgba(31,68,116,0.08)] transition hover:-translate-y-0.5"
            aria-label="Next project"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ProjectSmartCard({ project }: { project: Project }) {
  const signal = getOperationalSignal(project);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="zila-card-hover relative block overflow-hidden rounded-[28px] border border-white/14 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.08),transparent_28%),linear-gradient(180deg,#142947,#0B1729_72%,#07111F)] p-5 shadow-[0_28px_64px_rgba(6,16,31,0.34),0_0_26px_rgba(103,232,249,0.055),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl"
    >
      <span className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r ${projectAccentClass(project.statusTone)}`} />
      <span className={`pointer-events-none absolute right-[-18%] top-[-24%] h-40 w-40 rounded-full blur-3xl ${
        project.statusTone === "warning" ? "bg-[#B98B4A]/12" : project.statusTone === "success" ? "bg-[#67E8F9]/10" : "bg-[#8FA7C7]/10"
      }`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#67E8F9]/18 bg-[linear-gradient(135deg,#132A48,#0D1B31)] text-[#BFEFFF] shadow-[0_10px_22px_rgba(1,8,20,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} onDark className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-[20px] font-semibold tracking-[-0.045em] text-white">{project.name}</h3>
              <p className="mt-1 text-[12px] font-medium text-[#AFC0DD]">{project.stage}</p>
            </div>
          </div>
        </div>
        <Pill tone={project.statusTone} className={projectPillClass(project.statusTone)}>
          {project.status}
        </Pill>
      </div>

      <div className={`relative mt-5 rounded-[18px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_24px_rgba(1,8,20,0.12)] ${signal.toneClass}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold">{signal.label}</p>
          <span className="insight-signal-pulse h-2 w-2 rounded-full bg-current opacity-80" />
        </div>
        <p className="mt-1 text-[12px] font-semibold text-[#DCE7FA]">{signal.detail}</p>
      </div>

      <div className="mt-5">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-[#1C3351]">
          <div className={`rounded-full ${projectProgressClass(project.statusTone)}`} style={{ width: `${Math.min(project.progress, 100)}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-[#C7D2EA]">
          <span>{project.remaining} remaining</span>
          <span>{project.progress}% active</span>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="text-[13px] font-semibold leading-[1.45] text-[#EAF1FF]">
          {project.nextMoveSummary}
        </p>
      </div>
    </Link>
  );
}

export function ProjectsScreenContent({ projects }: { projects: Project[] }) {
  const remainingProjects = projects.slice(1);
  const attentionProjects = projects.filter((project) => project.statusTone === "warning").slice(0, 2);

  return (
    <div className="zila-unified-page -mx-4 -mt-2 space-y-5 px-4 pb-28 pt-5 md:-mx-6 md:rounded-[36px] md:px-6 md:pb-10 lg:-mx-8 lg:px-8 md:space-y-6">
      <section className="zila-surface-grain zila-unified-panel relative overflow-hidden rounded-[32px] p-6 md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_72%_8%,rgba(103,232,249,0.18),transparent_34%),linear-gradient(100deg,rgba(33,79,131,0.20),rgba(23,61,109,0.14),rgba(255,255,255,0))]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#67E8F9]/24 bg-[linear-gradient(135deg,#10233F,#1D4ED8_58%,#0EA5E9)] shadow-[0_18px_34px_rgba(16,35,63,0.22),0_0_20px_rgba(103,232,249,0.16),inset_0_1px_0_rgba(255,255,255,0.16)]">
                <span className="relative h-[18px] w-[18px]">
                  <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="18px" className="object-contain brightness-0 invert" />
                </span>
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#BFF7FF]">Live operating portfolio</p>
                <p className="mt-1 text-[12px] font-medium text-[#E0EAF8]">Refreshing pressure, runway, and next moves</p>
              </div>
            </div>
            <h1 className="mt-6 text-[40px] font-semibold leading-none tracking-[-0.07em] text-white md:text-[48px]">Projects in motion</h1>
            <p className="mt-4 max-w-[720px] text-[15px] font-medium leading-[1.8] text-[#E0EAF8]">
              See which projects are healthy, where pressure is building, and what Zila recommends next.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/14 bg-[#071526]/34 px-4 py-3 shadow-[0_18px_36px_rgba(1,8,20,0.18),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-5">
              <LivePulse label="Portfolio live" />
              <p className="text-[12px] font-semibold text-[#E0EAF8]">7 updates today</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                ["2", "healthy"],
                ["2", "pressure"],
                ["1", "move ready"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-[22px] font-semibold leading-none tracking-[-0.05em] text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#DCE7FA]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <FeaturedProjectCarousel projects={projects} />

          <section className="grid gap-4 lg:grid-cols-[1fr_1.05fr_0.95fr]">
            {remainingProjects.map((project) => (
              <ProjectSmartCard key={project.id} project={project} />
            ))}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="zila-card-hover rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,#040916,#0E172D_58%,#17213F)] p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-amber-200/16 bg-amber-300/12 text-[#FDE68A] shadow-[0_0_24px_rgba(251,191,36,0.16),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <AlertTriangle className="h-[19px] w-[19px]" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="text-[16px] font-semibold tracking-[-0.025em]">Needs attention</p>
                  <p className="mt-1 text-[12px] font-medium text-[#E0EAF8]">Actionable pressure</p>
                </div>
              </div>
              <span className="insight-signal-pulse mt-1 h-2.5 w-2.5 rounded-full bg-[#FDE68A] shadow-[0_0_16px_rgba(253,230,138,0.38)]" />
            </div>
            <div className="space-y-3">
              {attentionProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block rounded-[22px] border border-white/10 bg-[#071526]/42 px-4 py-4 transition hover:-translate-y-0.5 hover:border-white/16 hover:bg-[#0B1A2F]/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#E9EEF9]">{project.name}</p>
                      <p className="mt-2 text-[15px] font-semibold leading-[1.35] tracking-[-0.025em] text-white">{project.nextMoveSummary}</p>
                      <p className="mt-2 text-[12px] font-medium leading-[1.55] text-[#E0EAF8]">{project.ifNoAction}</p>
                    </div>
                    <ArrowRight className="mt-1 h-[14px] w-[14px] shrink-0 text-[#FDE68A] transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="zila-card-hover rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(237,246,255,0.90))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.07),0_24px_58px_rgba(31,68,116,0.10),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#C8DEF4] bg-[linear-gradient(135deg,#FFFFFF,#EAF9FF)] text-[#1D4ED8] shadow-[0_12px_24px_rgba(31,68,116,0.12),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <Activity className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#121417]">System pulse</p>
                <p className="mt-0.5 text-[12px] text-[#475569]">Coordinated movement</p>
              </div>
              </div>
              <span className="rounded-full border border-[#67E8F9]/45 bg-[#DDFBFF] px-2.5 py-1 text-[10px] font-semibold text-[#0E5B73] shadow-[inset_0_1px_0_rgba(255,255,255,0.70)]">Live</span>
            </div>
            <div className="space-y-0">
              {crossProjectFeed.map((item, index) => (
                <div key={`${item.person}-${item.project}-${item.action}`} className="relative flex gap-3 pb-5 last:pb-0">
                  <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                    item.tone === "positive"
                      ? "bg-[#67E8F9] shadow-[0_0_12px_rgba(103,232,249,0.24)]"
                      : item.tone === "negative"
                        ? "bg-[#B98B4A] shadow-[0_0_12px_rgba(185,139,74,0.24)]"
                        : "bg-[#9FB7D6] shadow-[0_0_12px_rgba(159,183,214,0.16)]"
                  }`} />
                  {index < crossProjectFeed.length - 1 ? <span className="absolute left-[4.5px] top-6 h-[calc(100%-1.25rem)] w-px bg-[#B6CBE2]" /> : null}
                  <div className="min-w-0">
                    <p className="text-[13px] leading-[1.55] text-[#1F2A44]">
                      <span className="font-semibold text-[#121417]">{item.project}</span> {item.action.replace("updated", "recalculated").replace("recorded", "synchronized")}
                    </p>
                    <p
                      className={`mt-1 text-[12px] font-semibold ${
                        item.tone === "positive" ? "text-[#0E5B73]" : item.tone === "negative" ? "text-[#8A5A22]" : "text-[#475569]"
                      }`}
                    >
                      {item.impact} · {item.tone === "positive" ? "runway protected" : item.tone === "negative" ? "pressure detected" : "safe-to-use recalculated"}
                    </p>
                    </div>
                </div>
              ))}
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
