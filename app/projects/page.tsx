import { ProjectListCard } from "@/components/projects/ProjectListCard";
import { AppShell } from "@/components/ui/AppShell";
import { Pill } from "@/components/ui/Pill";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { getProjects, getProjectSummary } from "@/data/projects";

export default function Projects() {
  const projects = getProjects();
  const summary = getProjectSummary();

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <SectionEyebrow label="Portfolio overview" />
        </div>

        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Your projects</p>
          <div className="flex items-end justify-between gap-3">
            <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">Built to stay on track</h1>
            <Pill tone="warning">{summary.watchProjects} watch</Pill>
          </div>
        </div>

        <SurfaceCard tone="navy" className="relative overflow-hidden rounded-[28px] p-6">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#22D3EE]/10"></div>
          <div className="relative space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] text-[#94A3B8]">Active work</p>
                <h2 className="mt-2 text-[40px] font-semibold leading-none text-white">
                  {summary.activeProjects}
                </h2>
                <p className="mt-3 text-[12px] text-[#CBD5E1]">
                  {summary.totalBudget} contracted across live builds
                </p>
              </div>
              <div className="rounded-[16px] bg-[#1E293B] p-3 text-center">
                <p className="text-[9px] text-[#94A3B8]">Receivables</p>
                <p className="mt-1 text-[15px] font-semibold text-[#22D3EE]">{summary.receivables}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[14px] border border-white/5 bg-[#1E293B]/60 p-3">
                <p className="text-[9px] text-[#94A3B8]">Watchlist</p>
                <p className="mt-2 text-[16px] font-semibold text-white">{summary.watchProjects}</p>
              </div>
              <div className="rounded-[14px] border border-white/5 bg-[#1E293B]/60 p-3">
                <p className="text-[9px] text-[#94A3B8]">Healthy</p>
                <p className="mt-2 text-[16px] font-semibold text-white">
                  {summary.activeProjects - summary.watchProjects}
                </p>
              </div>
              <div className="rounded-[14px] border border-white/5 bg-[#1E293B]/60 p-3">
                <p className="text-[9px] text-[#94A3B8]">Focus</p>
                <p className="mt-2 text-[16px] font-semibold text-white">Cash flow</p>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="white">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#6366F1]">Zila view</p>
              <p className="text-[12px] text-[#6B7280]">One project needs action this week</p>
            </div>
            <Pill tone="warning">Act today</Pill>
          </div>
          <p className="text-[14px] leading-relaxed text-[#121417]">
            Harbour Road is the only project at risk of slipping margin. Everything else is operationally healthy, so your best move is to solve the funding gap quickly.
          </p>
        </SurfaceCard>

        <div className="space-y-3 pt-1">
          <SectionEyebrow label="Active projects" dotColor="bg-[#F59E0B]" />
          {projects.map((project) => (
            <ProjectListCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
