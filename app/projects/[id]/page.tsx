import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { NextMoveCard } from "@/components/projects/NextMoveCard";
import { SafetyNetActionCard } from "@/components/projects/SafetyNetActionCard";
import { getSignalVariant, ZilaSignal } from "@/components/projects/ZilaSignal";
import { AppShell } from "@/components/ui/AppShell";
import { IconTile } from "@/components/ui/IconTile";
import { Pill } from "@/components/ui/Pill";
import { SafetyNetDisplay } from "@/components/ui/SafetyNetDisplay";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { getDefaultProject, getProjectById, getProjects } from "@/data/projects";

export function generateStaticParams() {
  return getProjects().map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id) ?? getDefaultProject();

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6B7280] transition hover:opacity-70"
          >
            <span className="text-[14px]">←</span>
            <span>Back</span>
          </Link>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-[14px] text-[#6B7280]">Project detail</p>
              <div className="flex items-center gap-2">
                <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">{project.name}</h1>
                <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} className="mt-1" />
              </div>
            </div>
            <Pill tone={project.statusTone}>{project.status}</Pill>
          </div>
        </div>

        <SurfaceCard tone="white">
          <div className="mb-4">
            <SectionEyebrow label="Project summary" className="mb-2" />
            <p className="text-[14px] leading-relaxed text-[#121417]">{project.summary}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[10px] text-[#6B7280]">Budget</p>
              <p className="mt-1 text-[18px] font-semibold text-[#121417]">{project.budget}</p>
            </div>
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[10px] text-[#6B7280]">Spent</p>
              <p className="mt-1 text-[18px] font-semibold text-[#121417]">{project.spent}</p>
            </div>
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[10px] text-[#6B7280]">Remaining</p>
              <p className="mt-1 text-[18px] font-semibold text-[#121417]">{project.remaining}</p>
            </div>
          </div>
          <SafetyNetDisplay
            amount={project.reserved}
            className="mt-3"
            description="Available to keep this project steady if revenue dips or costs rise"
          />
        </SurfaceCard>

        <SurfaceCard tone="dark" className="relative overflow-hidden rounded-[24px] p-6">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-[#6366F1]/10 via-transparent to-[#22D3EE]/10"></div>
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <ZilaSignal variant={getSignalVariant(project.statusTone, project.id)} onDark />
                  <p className="text-[12px] font-semibold text-[#22D3EE]">Funding outlook</p>
                </div>
                <p className="mt-2 text-[24px] font-semibold leading-tight text-white">{project.cashNeeded}</p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">Estimated funding move</p>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-white/5 px-3 py-2 text-right">
                <p className="text-[10px] text-[#94A3B8]">Due</p>
                <p className="mt-1 text-[13px] font-semibold text-[#F8FAFC]">Friday</p>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-white">{project.financialImpact}</p>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="white">
          <SectionEyebrow label="Recent updates" dotColor="bg-[#6366F1]" className="mb-4" />
          <div className="space-y-3">
            {project.recentUpdates.map((update) => (
              <div
                key={update.label}
                className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F8F6F1] p-4"
              >
                <p className="text-[14px] font-semibold text-[#121417]">{update.label}</p>
                <Pill tone={update.tone}>{project.status}</Pill>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <NextMoveCard
          title={project.nextMoveTitle}
          summary={project.nextMoveSummary}
          ifNoAction={project.ifNoAction}
          ifActionTaken={project.ifActionTaken}
          primaryActionLabel={project.primaryActionLabel}
          secondaryActionLabel={project.secondaryActionLabel}
          showSecondaryAction={false}
          showSafetyNetSupport={false}
          canUseSafetyNet={project.canUseSafetyNet}
          showSafetyNetAction={project.showSafetyNetAction}
          safetyNetShortfallText={project.safetyNetShortfallText}
          safetyNetAmount={project.safetyNetAmount}
          safetyNetRemaining={project.safetyNetRemaining}
          safetyNetDestination={project.safetyNetDestination}
        />

        {project.canUseSafetyNet &&
        project.safetyNetShortfallText &&
        project.safetyNetAmount &&
        project.safetyNetRemaining &&
        project.safetyNetDestination ? (
          <SafetyNetActionCard
            shortfallText={project.safetyNetShortfallText}
            supportingText="Zila can cover this using your Safety Net."
            note="If no action is taken, Zila will step in using your Safety Net."
            amount={project.safetyNetAmount}
            destination={project.safetyNetDestination}
            remaining={project.safetyNetRemaining}
          />
        ) : null}

        <SurfaceCard tone="white">
          <SectionEyebrow label="Next moves" dotColor="bg-[#F59E0B]" className="mb-4" />
          <div className="grid grid-cols-2 gap-2">
            {project.suggestedActions.map((action) => (
              <div key={action} className="rounded-[16px] bg-[#F8F6F1] p-4">
                <p className="text-[14px] font-semibold text-[#121417]">{action}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {project.lastVerifiedAction ? (
          <div className="rounded-[16px] border border-[rgba(18,20,23,0.07)] bg-white p-4 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                <IconTile size="md" className="text-[#121417]">
                  <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} />
                </IconTile>
                <div>
                  <p className="text-[12px] font-semibold text-[#6366F1]">Last verified action</p>
                  <p className="text-[13px] text-[#121417]">{project.lastVerifiedAction}</p>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#8DA99A]"></span>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
