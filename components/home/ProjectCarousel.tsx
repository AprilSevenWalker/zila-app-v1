import Link from "next/link";
import { ArrowRight, Clock3, FolderKanban, ShieldCheck } from "lucide-react";

import { projects } from "@/data/projects";

const actionByTone = {
  warning: "Move funds",
  success: "Review spend",
  info: "Refresh forecast",
  neutral: "Review project",
};

const stateStyles = {
  warning: {
    card: "border-[#D9FF57]/24 bg-[linear-gradient(180deg,#214F83,#173D6D_52%,#102A4F)] text-white shadow-[0_26px_58px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]",
    status: "text-[#D9FF57]",
    icon: "border-[#D9FF57]/20 bg-[#D9FF57]/10 text-[#F7FFC8]",
    panel: "border-white/12 bg-[#102A4F]/54",
    action: "bg-[#D9FF57] text-[#111827] shadow-[0_12px_24px_rgba(217,255,87,0.12)]",
    label: "Needs attention",
  },
  success: {
    card: "border-white/80 bg-[linear-gradient(180deg,#F9FBFF,#E6F0FF)] text-[#121417] shadow-[0_24px_54px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.94)]",
    status: "text-[#476022]",
    icon: "border-white/80 bg-white/74 text-[#476022]",
    panel: "border-white/70 bg-white/64",
    action: "bg-[#121417] text-white",
    label: "Healthy",
  },
  info: {
    card: "border-[#67E8F9]/20 bg-[linear-gradient(180deg,#2B5F94,#1E4A7D_54%,#17345F)] text-white shadow-[0_26px_58px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]",
    status: "text-[#67E8F9]",
    icon: "border-[#67E8F9]/18 bg-[#67E8F9]/10 text-[#EAFBFF]",
    panel: "border-white/12 bg-[#102A4F]/48",
    action: "bg-[#1D4ED8] text-white",
    label: "Due soon",
  },
  neutral: {
    card: "border-white/80 bg-[linear-gradient(180deg,#F9FBFF,#E6F0FF)] text-[#121417] shadow-[0_24px_54px_rgba(31,68,116,0.14),inset_0_1px_0_rgba(255,255,255,0.94)]",
    status: "text-[#526173]",
    icon: "border-white/80 bg-white/74 text-[#1D4ED8]",
    panel: "border-white/70 bg-white/64",
    action: "bg-[#121417] text-white",
    label: "Review",
  },
};

export function ProjectCarousel() {
  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between gap-4 px-1">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">Project focus</p>
          <p className="mt-1 text-[13px] text-[#46607F]">See what needs attention and what money is safe to use.</p>
        </div>
        <Link href="/projects" className="hidden items-center gap-1.5 text-[12px] font-semibold text-[#1D4ED8] transition hover:text-[#102A4F] md:inline-flex">
          View all
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>

      <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 pt-1 scroll-smooth [scrollbar-width:none] md:mx-0 md:px-1 [&::-webkit-scrollbar]:hidden">
        {projects.map((project) => {
          const style = stateStyles[project.statusTone];
          const isDark = project.statusTone === "warning" || project.statusTone === "info";
          const action = actionByTone[project.statusTone];

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`group min-w-[276px] snap-start rounded-[24px] border p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_64px_rgba(31,68,116,0.22)] md:min-w-[296px] ${style.card}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border ${
                        style.icon
                      }`}
                    >
                      <FolderKanban className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                      <h3 className={`truncate text-[18px] font-semibold tracking-[-0.045em] ${isDark ? "text-white" : "text-[#121417]"}`}>{project.name}</h3>
                      <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${style.status}`}>
                        {style.label}
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                    isDark
                      ? "border-[#D9FF57]/22 bg-[#D9FF57]/10 text-[#F7FFC8]"
                      : "border-[#D9FF57]/22 bg-[#D9FF57]/14 text-[#476022]"
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                  Safe view
                </span>
              </div>

              <div className={`mt-4 rounded-[18px] border px-3.5 py-3 ${style.panel}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${isDark ? "text-[#C9D4F5]" : "text-[#667085]"}`}>
                  Safe to use
                </p>
                <p className={`mt-1 text-[24px] font-semibold tracking-[-0.055em] ${isDark ? "text-[#F7FFC8]" : "text-[#121417]"}`}>{project.remaining}</p>
              </div>

              <div className="mt-4 space-y-2">
                <p className={`flex items-center gap-2 text-[12px] leading-[1.45] ${isDark ? "text-[#DCE8FF]" : "text-[#526173]"}`}>
                  <Clock3 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                  <span className="font-semibold">{project.cashNeeded}</span> {project.statusTone === "warning" ? "due soon" : "available for current commitments"}
                </p>
                <p className={`text-[12px] leading-[1.45] ${isDark ? "text-[#C9D4F5]" : "text-[#667085]"}`}>
                  {project.nextMilestone}
                </p>
              </div>

              <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold transition group-hover:translate-x-0.5 ${style.action}`}>
                Action: {action}
                <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default ProjectCarousel;
