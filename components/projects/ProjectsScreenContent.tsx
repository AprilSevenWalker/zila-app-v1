import Image from "next/image";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, CircleDollarSign, ReceiptText } from "lucide-react";

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

function impactClass(tone: HumanActivity["impactTone"]) {
  if (tone === "positive") {
    return "text-[#7DD3C7]";
  }

  if (tone === "negative") {
    return "text-[#FB7185]";
  }

  return "text-[#AEBBDA]";
}

function Avatar({ person, avatar, dark = false }: { person: string; avatar?: "amara"; dark?: boolean }) {
  if (avatar === "amara") {
    return (
      <span className="relative inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/18 bg-[#111827] shadow-[0_12px_22px_rgba(15,23,42,0.18)]">
        <Image src="/zila-profile-amara.png" alt={person} fill unoptimized sizes="36px" className="object-cover object-center" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold shadow-[0_12px_22px_rgba(15,23,42,0.12)] ${
        dark
          ? "border-white/12 bg-[linear-gradient(135deg,rgba(99,102,241,0.34),rgba(34,211,238,0.14))] text-white"
          : "border-white/70 bg-[linear-gradient(135deg,#EEF2FF,#E0F7FF)] text-[#4F46E5]"
      }`}
    >
      {person.charAt(0)}
    </span>
  );
}

function MoneyMetric({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  const Icon = label === "Budget" ? CircleDollarSign : ReceiptText;

  return (
    <div className="min-w-0 flex-1">
      <div className={`flex items-center gap-1.5 ${dark ? "text-[#96A6C4]" : "text-[#667085]"}`}>
        <Icon className="h-[12px] w-[12px]" strokeWidth={1.9} />
        <p className="text-[10px] font-medium">{label}</p>
      </div>
      <p className={`mt-2 font-semibold leading-none tracking-[-0.04em] ${dark ? "text-[22px] text-white" : "text-[18px] text-[#121417]"}`}>
        {value}
      </p>
    </div>
  );
}

function ActivityLine({ activity, dark = false }: { activity: HumanActivity; dark?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[18px] border px-3.5 py-3.5 ${
        dark
          ? "border-white/8 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-white/70 bg-white/70 shadow-[0_14px_28px_rgba(99,102,241,0.07),inset_0_1px_0_rgba(255,255,255,0.82)]"
      }`}
    >
      <Avatar person={activity.person} avatar={activity.avatar} dark={dark} />
      <p className={`min-w-0 text-[13px] leading-[1.55] ${dark ? "text-[#E5EAF6]" : "text-[#334155]"}`}>
        <span className={dark ? "font-semibold text-white" : "font-semibold text-[#121417]"}>{activity.person}</span>{" "}
        {activity.action} <span className="text-[#8EA0B8]">→</span>{" "}
        <span className={`font-semibold ${impactClass(activity.impactTone)}`}>{activity.impact}</span>
      </p>
    </div>
  );
}

function FeaturedProjectCard({ project }: { project: Project }) {
  const latestUpdate = activityByProject[project.id]?.[0];

  return (
    <section className="zila-card-hover zila-surface-grain zila-animated-gradient-slow relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,#030815_0%,#0D1731_42%,#21145E_100%)] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15),0_34px_86px_rgba(15,23,42,0.36),0_0_52px_rgba(99,102,241,0.20),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl md:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(99,102,241,0.38),transparent_30%),radial-gradient(circle_at_84%_6%,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_70%_100%,rgba(124,58,237,0.18),transparent_34%)]" />
      <div className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#4338CA,#0EA5E9)] text-[#F8FBFF] shadow-[0_0_28px_rgba(99,102,241,0.28),inset_0_1px_0_rgba(255,255,255,0.14)]">
                <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} onDark className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[12px] font-medium text-[#AEBBDA]">Featured project</p>
                <h2 className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.07em] text-white">{project.name}</h2>
              </div>
            </div>
            <p className="mt-5 max-w-[640px] text-[14px] leading-[1.7] text-[#C7D2EA]">{project.stateSignal}</p>
          </div>
          <Pill tone={project.statusTone} className="w-fit shrink-0 border-white/10 bg-white/10 text-white">
            {project.status === "Watch" ? "At risk" : project.status}
          </Pill>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <MoneyMetric label="Budget" value={project.budget} dark />
          <MoneyMetric label="Spent" value={project.spent} dark />
          <MoneyMetric label="Remaining" value={project.remaining} dark />
        </div>

        <div className="mt-6">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="rounded-full bg-[linear-gradient(90deg,#7C3AED,#22D3EE)] shadow-[0_0_20px_rgba(99,102,241,0.55)]"
              style={{ width: `${Math.min(project.progress, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-[#8FA0BC]">
            <span>Budget used</span>
            <span>{project.progress}% spent</span>
          </div>
        </div>

        {latestUpdate ? (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_20px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Latest update</p>
            <ActivityLine activity={latestUpdate} dark />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProjectSmartCard({ project, index }: { project: Project; index: number }) {
  const activities = activityByProject[project.id] ?? [];
  const isDark = index === 1;

  return (
    <Link
      href={`/projects/${project.id}`}
      className={`zila-card-hover block overflow-hidden rounded-[28px] border p-5 backdrop-blur-xl ${
        isDark
          ? "border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,#050A17,#111936)] text-white shadow-[0_24px_54px_rgba(15,23,42,0.24),0_0_28px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/76 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,246,255,0.78))] shadow-[0_20px_60px_rgba(0,0,0,0.08),0_24px_58px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.88)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-[16px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
                isDark
                  ? "border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.30),rgba(34,211,238,0.12))]"
                  : "border-white/80 bg-[linear-gradient(135deg,#FFFFFF,#EAF9FF)] text-[#4F46E5]"
              }`}
            >
              <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} onDark={isDark} className="h-5 w-5" />
            </span>
            <div>
              <h3 className={`text-[20px] font-semibold tracking-[-0.045em] ${isDark ? "text-white" : "text-[#121417]"}`}>{project.name}</h3>
              <p className={`mt-1 text-[12px] ${isDark ? "text-[#8EA0B8]" : "text-[#667085]"}`}>{project.stage}</p>
            </div>
          </div>
        </div>
        <Pill tone={project.statusTone} className={isDark ? "border-white/10 bg-white/10 text-white" : ""}>
          {project.status}
        </Pill>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <MoneyMetric label="Budget" value={project.budget} dark={isDark} />
        <MoneyMetric label="Spent" value={project.spent} dark={isDark} />
      </div>

      <div className="mt-5">
        <div className={isDark ? "flex h-2 overflow-hidden rounded-full bg-white/10" : "flex h-2 overflow-hidden rounded-full bg-[#E5E9F4]"}>
          <div
            className="rounded-full bg-[linear-gradient(90deg,#7C3AED,#22D3EE)] shadow-[0_0_18px_rgba(99,102,241,0.32)]"
            style={{ width: `${Math.min(project.progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-[#8EA0B8]" : "text-[#7A8498]"}`}>
          Recent activity
        </p>
        {activities.slice(0, 2).map((activity) => (
          <ActivityLine key={`${project.id}-${activity.person}-${activity.action}`} activity={activity} dark={isDark} />
        ))}
      </div>
    </Link>
  );
}

export function ProjectsScreenContent({ projects }: { projects: Project[] }) {
  const featured = projects[0];
  const remainingProjects = projects.slice(1);
  const attentionProjects = projects.filter((project) => project.statusTone === "warning").slice(0, 2);

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="zila-card-hover zila-surface-grain zila-animated-gradient relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#EFE7FF_0%,#DDEBFF_42%,#C9DDFF_100%)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.13),0_36px_90px_rgba(99,102,241,0.20),0_0_42px_rgba(120,100,255,0.14),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl md:p-8">
        <div className="zila-hero-breathing-gradient absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(124,58,237,0.14),transparent_30%),radial-gradient(circle_at_72%_8%,rgba(34,211,238,0.14),transparent_34%),linear-gradient(100deg,rgba(248,246,255,0.64),rgba(235,243,255,0.36),rgba(255,255,255,0))]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/75 bg-[linear-gradient(135deg,#FFFFFF,#E0F7FF_48%,#EDE9FE)] shadow-[0_18px_34px_rgba(99,102,241,0.18),0_0_24px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <span className="relative h-[18px] w-[18px]">
                  <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="18px" className="object-contain" />
                </span>
              </span>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#5B5DE8]">Live operations</p>
            </div>
            <h1 className="mt-7 text-[42px] font-semibold leading-none tracking-[-0.07em] text-[#080F1F]">Projects</h1>
            <p className="mt-4 max-w-[680px] text-[15px] leading-[1.8] text-[#526173]">
              Track delivery, decisions, and what&apos;s changing in real time
            </p>
          </div>
          <div className="rounded-[22px] border border-white/76 bg-white/70 px-4 py-3 shadow-[0_18px_36px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A8498]">Active impact</p>
            <p className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-[#121417]">4 projects · 7 updates today</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FeaturedProjectCard project={featured} />

          <section className="grid gap-4 lg:grid-cols-3">
            {remainingProjects.map((project, index) => (
              <ProjectSmartCard key={project.id} project={project} index={index} />
            ))}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="zila-card-hover rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#040916,#0E172D_58%,#151044)] p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.28),0_0_36px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#4338CA,#0EA5E9)] text-[#F8FBFF] shadow-[0_0_24px_rgba(99,102,241,0.26),inset_0_1px_0_rgba(255,255,255,0.14)]">
                <AlertTriangle className="h-[19px] w-[19px]" strokeWidth={1.9} />
              </span>
              <p className="text-[16px] font-semibold tracking-[-0.025em]">Needs attention</p>
            </div>
            <div className="space-y-2.5">
              {attentionProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block rounded-[19px] border border-white/7 bg-white/[0.055] px-3.5 py-3.5 transition hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#E9EEF9]">{project.name}</p>
                      <p className="mt-1 text-[11px] leading-[1.5] text-[#8998B2]">{project.nextMoveSummary}</p>
                    </div>
                    <ArrowRight className="mt-1 h-[13px] w-[13px] shrink-0 text-[#69758B] transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="zila-card-hover rounded-[30px] border border-white/76 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,246,255,0.78))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08),0_24px_58px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/80 bg-[linear-gradient(135deg,#FFFFFF,#EAF9FF)] text-[#4F46E5] shadow-[0_12px_24px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <Activity className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#121417]">Recent activity</p>
                <p className="mt-0.5 text-[12px] text-[#667085]">Across projects</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {crossProjectFeed.map((item) => (
                <div key={`${item.person}-${item.project}-${item.action}`} className="rounded-[18px] border border-white/70 bg-white/72 px-3.5 py-3.5 shadow-[0_12px_24px_rgba(99,102,241,0.06),inset_0_1px_0_rgba(255,255,255,0.84)]">
                  <div className="flex items-start gap-3">
                    <Avatar person={item.person} avatar={item.avatar === "amara" ? "amara" : undefined} />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-[1.5] text-[#334155]">
                        <span className="font-semibold text-[#121417]">{item.person}</span> → {item.action} →{" "}
                        <span className="font-semibold text-[#121417]">{item.project}</span>
                      </p>
                      <p
                        className={`mt-1 text-[12px] font-semibold ${
                          item.tone === "positive" ? "text-[#059669]" : item.tone === "negative" ? "text-[#E11D48]" : "text-[#64748B]"
                        }`}
                      >
                        {item.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="zila-card-hover rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,#050A17,#111936)] p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.26),0_0_32px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,rgba(125,211,199,0.22),rgba(99,102,241,0.22))] text-[#B9F8EA]">
                <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[17px] font-semibold tracking-[-0.035em]">Impact is updating live</p>
                <p className="mt-2 text-[13px] leading-[1.65] text-[#AEBBDA]">
                  Every human action updates budget, spend, and proof records as it happens.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
