import Link from "next/link";

import type { Project } from "@/data/projects";
import { Pill } from "@/components/ui/Pill";

interface ProjectListCardProps {
  project: Project;
}

export function ProjectListCard({ project }: ProjectListCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-[rgba(18,20,23,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-medium text-[#6B7280]">
            {project.client} · {project.location}
          </p>
          <h3 className="text-[20px] font-semibold text-[#121417]">{project.name}</h3>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            {project.category} · {project.stage}
          </p>
        </div>
        <Pill tone={project.healthTone}>{project.health}</Pill>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[11px] font-semibold text-[#334155]">
          {project.status}
        </span>
        <span className="text-[11px] font-medium text-[#6B7280]">{project.updatedAt}</span>
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[#6B7280]">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE]"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[16px] bg-[#F8FAFC] p-3">
          <p className="text-[10px] text-[#6B7280]">Budget</p>
          <p className="mt-1 text-[14px] font-semibold text-[#121417]">{project.budget}</p>
        </div>
        <div className="rounded-[16px] bg-[#F8FAFC] p-3">
          <p className="text-[10px] text-[#6B7280]">Spent</p>
          <p className="mt-1 text-[14px] font-semibold text-[#121417]">{project.spent}</p>
        </div>
        <div className="rounded-[16px] bg-[#F8FAFC] p-3">
          <p className="text-[10px] text-[#6B7280]">Next</p>
          <p className="mt-1 text-[14px] font-semibold text-[#121417]">{project.dueLabel}</p>
        </div>
      </div>
    </Link>
  );
}
