import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectMetricCard } from "@/components/projects/ProjectMetricCard";
import { AppShell } from "@/components/ui/AppShell";
import { Pill } from "@/components/ui/Pill";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { getProjectBySlug, getProjects } from "@/data/projects";

export function generateStaticParams() {
  return getProjects().map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2 flex items-center justify-between gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6B7280] transition hover:opacity-70"
          >
            <span className="text-[14px]">←</span>
            <span>Back to projects</span>
          </Link>
          <Pill tone={project.healthTone}>{project.health}</Pill>
        </div>

        <SurfaceCard tone="navy" className="relative overflow-hidden rounded-[28px] p-6">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#22D3EE]/10"></div>
          <div className="relative space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] text-[#94A3B8]">
                  {project.client} · {project.location}
                </p>
                <h1 className="mt-2 text-[32px] font-semibold leading-tight text-white">{project.name}</h1>
                <p className="mt-2 text-[12px] text-[#CBD5E1]">
                  {project.category} · {project.stage} · {project.updatedAt}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#1E293B] p-3 text-center">
                <p className="text-[9px] text-[#94A3B8]">Progress</p>
                <p className="mt-1 text-[17px] font-semibold text-[#22D3EE]">{project.progress}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ProjectMetricCard label="Budget" value={project.budget} detail={project.status} />
              <ProjectMetricCard label="Spent" value={project.spent} detail={project.nextMilestone} />
              <ProjectMetricCard
                label="Reserved"
                value={project.reserved}
                detail={`${project.verifiedDays} verified days`}
              />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="white">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <SectionEyebrow label="Project summary" className="mb-2" />
              <p className="text-[20px] font-semibold text-[#121417]">{project.status}</p>
            </div>
            <Pill tone={project.statusTone}>{project.dueLabel}</Pill>
          </div>
          <p className="text-[14px] leading-relaxed text-[#121417]">{project.summary}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-[16px] bg-[#F8FAFC] p-4">
              <p className="text-[10px] text-[#6B7280]">Cash needed</p>
              <p className="mt-1 text-[18px] font-semibold text-[#121417]">{project.cashNeeded}</p>
            </div>
            <div className="rounded-[16px] bg-[#F8FAFC] p-4">
              <p className="text-[10px] text-[#6B7280]">Owner</p>
              <p className="mt-1 text-[18px] font-semibold text-[#121417]">{project.owner}</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="dark" className="relative overflow-hidden">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[#6366F1]/10 via-transparent to-[#22D3EE]/10"></div>
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#6366F1]/30 bg-[#6366F1]/25 text-sm font-bold text-[#22D3EE]">
                Z
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#22D3EE]">Zila says</p>
                <p className="text-[11px] text-[#94A3B8]">Best next move for this project</p>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-white">{project.zilaSays}</p>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="white">
          <SectionEyebrow label="Priority actions" dotColor="bg-[#F59E0B]" className="mb-4" />
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F8FAFC] p-4"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#121417]">{task.title}</p>
                  <p className="text-[12px] text-[#6B7280]">{task.due}</p>
                </div>
                <Pill tone="neutral">{task.status}</Pill>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard tone="white">
          <SectionEyebrow label="Project timeline" dotColor="bg-[#22D3EE]" className="mb-4" />
          <div className="space-y-3">
            {project.timeline.map((item, index) => (
              <div key={item.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#6366F1]"></span>
                  {index < project.timeline.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-[#E5E7EB]"></span>
                  ) : null}
                </div>
                <div className="pb-3">
                  <p className="text-[12px] font-semibold text-[#6366F1]">{item.label}</p>
                  <p className="mt-1 text-[14px] text-[#121417]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
