import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CircleDollarSign,
  FolderKanban,
  Landmark,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";

import type { Project } from "@/data/projects";
import { Pill } from "@/components/ui/Pill";

interface ProjectListCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectListCard({ project, featured = false }: ProjectListCardProps) {
  const titleIcon =
    project.id === "harbour-road" ? (
      <AlertCircle className="h-[14px] w-[14px]" strokeWidth={1.8} />
    ) : project.id === "palm-estate" ? (
      <Building2 className="h-[14px] w-[14px]" strokeWidth={1.8} />
    ) : project.id === "buildops-site-a" ? (
      <ShieldAlert className="h-[14px] w-[14px]" strokeWidth={1.8} />
    ) : (
      <FolderKanban className="h-[14px] w-[14px]" strokeWidth={1.8} />
    );

  return (
    <Link
      href={`/projects/${project.id}`}
      className={`block rounded-[20px] border transition-transform duration-200 hover:-translate-y-0.5 ${
        featured
          ? "relative overflow-hidden border-white/5 bg-gradient-to-br from-[#18233A] via-[#1A2144] to-[#13273A] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.16)] hover:shadow-[0_22px_44px_rgba(15,23,42,0.20)]"
          : "border-[rgba(18,20,23,0.07)] bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_22px_rgba(15,23,42,0.07)]"
      }`}
    >
      {featured ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/16 via-transparent via-50% to-[#22D3EE]/12" />
      ) : null}

      <div className={`relative flex items-start justify-between gap-3 ${featured ? "mb-5" : "mb-4"}`}>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                featured
                  ? "bg-[#6366F1] text-white shadow-[0_0_18px_rgba(99,102,241,0.28)]"
                  : "border border-[#6366F1]/14 bg-[#6366F1] text-white shadow-[0_0_14px_rgba(99,102,241,0.20)]"
              }`}
            >
              {titleIcon}
            </span>
            <h2 className={`font-semibold ${featured ? "text-[24px] text-white" : "text-[20px] text-[#121417]"}`}>
              {project.name}
            </h2>
          </div>
          <p className={`mt-2 text-[12px] ${featured ? "text-[#DCE8F2]" : "text-[#334155]"}`}>
            {project.stateSignal}
          </p>
          <p className={`mt-1 text-[12px] ${featured ? "text-[#A8B4C7]" : "text-[#6B7280]"}`}>{project.stage}</p>
        </div>
        <Pill tone={project.statusTone} className={`mt-0.5 ${featured ? "bg-white/10 text-white border-white/10" : ""}`}>
          {project.status}
        </Pill>
      </div>

      <div className={`relative ${featured ? "mb-5" : "mb-4"}`}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className={`flex items-center gap-1.5 ${featured ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>
              <CircleDollarSign className="h-[11px] w-[11px]" strokeWidth={1.8} />
              <p className="text-[10px]">Budget</p>
            </div>
            <p className={`mt-1 font-semibold ${featured ? "text-[20px] text-white" : "text-[18px] text-[#121417]"}`}>
              {project.budget}
            </p>
          </div>
          <div className={`h-10 w-px ${featured ? "bg-white/10" : "bg-[rgba(18,20,23,0.08)]"}`} />
          <div className="flex-1">
            <div className={`flex items-center gap-1.5 ${featured ? "text-[#94A3B8]" : "text-[#6B7280]"}`}>
              <ReceiptText className="h-[11px] w-[11px]" strokeWidth={1.8} />
              <p className="text-[10px]">Spent</p>
            </div>
            <p className={`mt-1 font-semibold ${featured ? "text-[20px] text-white" : "text-[18px] text-[#121417]"}`}>
              {project.spent}
            </p>
          </div>
        </div>
        {featured ? (
          <div className="mt-4 h-px w-full bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
        ) : null}
      </div>

      <div className={`relative ${featured ? "" : "border-l-2 border-[#D9DEE8] pl-4"}`}>
        {featured ? (
          <div className="rounded-[16px] border border-white/8 bg-gradient-to-r from-white/[0.05] to-white/[0.03] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_24px_rgba(99,102,241,0.04)]">
            <p className="mb-2 text-[11px] font-semibold text-[#9FB4FF]">Insight</p>
            <p className="text-[13px] leading-relaxed text-[#F8FAFC]">
              {project.insight}
            </p>
            <div className="mt-4 flex items-start gap-2 border-t border-white/8 pt-4">
              <Landmark className="mt-0.5 h-[12px] w-[12px] flex-shrink-0 text-[#7EE7F6]" strokeWidth={1.9} />
              <div>
                <p className="text-[11px] font-semibold text-[#7EE7F6]">Zila suggests</p>
                <p className="mt-1 text-[13px] text-[#F8FAFC]">{project.zilaSuggestionShort}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-[11px] font-semibold text-[#6366F1]">Insight</p>
            <p className="text-[13px] leading-relaxed text-[#121417]">
              {project.insight}
            </p>
          </>
        )}
        {!featured ? (
          <p className="mt-4 text-[11px] text-[#6B7280]">{project.updatedAt}</p>
        ) : (
          <p className="mt-4 text-[11px] text-[#8FA0B6]">{project.updatedAt}</p>
        )}
      </div>
    </Link>
  );
}
