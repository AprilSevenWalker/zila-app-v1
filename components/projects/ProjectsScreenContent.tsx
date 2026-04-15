import Link from "next/link";
import { CircleDollarSign, ReceiptText, Sparkles } from "lucide-react";

import { QuickUpdateMenu } from "@/components/actions/QuickUpdateMenu";
import type { Project } from "@/data/projects";
import { NextMoveCard } from "@/components/projects/NextMoveCard";
import { SafetyNetActionCard } from "@/components/projects/SafetyNetActionCard";
import { getSignalVariant, ZilaSignal } from "@/components/projects/ZilaSignal";
import { Pill } from "@/components/ui/Pill";

function MetricInline({
  label,
  value,
  featured = false,
  compact = false,
}: {
  label: string;
  value: string;
  featured?: boolean;
  compact?: boolean;
}) {
  const icon =
    label === "Budget" ? (
      <CircleDollarSign className="h-[11px] w-[11px]" strokeWidth={1.8} />
    ) : (
      <ReceiptText className="h-[11px] w-[11px]" strokeWidth={1.8} />
    );

  return (
    <div className="min-w-0 flex-1">
      <div className={`flex items-center gap-1.5 ${featured ? "text-[#9EACC3]" : "text-[#6B7280]"}`}>
        {icon}
        <p className="text-[10px]">{label}</p>
      </div>
      <p
        className={`mt-2 font-semibold leading-none ${
          featured ? "text-[21px] text-white" : compact ? "text-[16px] text-[#121417]" : "text-[17px] text-[#121417]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function ProjectsScreenContent({ projects }: { projects: Project[] }) {
  const featured = projects[0];
  const secondary = projects.slice(1, 3);
  const calm = projects[3];

  return (
    <div className="space-y-6">
      <div className="mt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[12px] font-semibold text-[#6B7280]">Project portfolio</p>
            <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">Your Projects</h1>
          </div>
          <QuickUpdateMenu align="right" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/30 bg-gradient-to-br from-[#24295A] via-[#2B2D71] to-[#1E586C] p-6 shadow-[0_18px_38px_rgba(15,23,42,0.13)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_72%_68%,rgba(34,211,238,0.16),transparent_18%),radial-gradient(circle_at_88%_34%,rgba(129,140,248,0.16),transparent_18%)] opacity-80" />
        <div className="absolute inset-x-6 bottom-0 h-[2px] bg-gradient-to-r from-[#A78BFA]/75 via-[#7C3AED]/65 to-[#67E8F9]/70 shadow-[0_0_18px_rgba(129,140,248,0.26)]" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#F59E0B]/18 bg-[radial-gradient(circle_at_50%_50%,rgba(255,190,96,0.96),rgba(255,153,0,0.18)_38%,rgba(255,153,0,0)_82%)] text-[#FFE0B6] shadow-[0_0_18px_rgba(255,154,41,0.28)]">
              <Sparkles className="h-[15px] w-[15px]" strokeWidth={2.1} />
            </span>
            <p className="text-[15px] font-semibold text-[#F5F4FF]">Zila Insight</p>
          </div>
          <p className="max-w-[310px] text-[18px] leading-[1.55] text-[#FBFBFF]">
            Project Horizon is about 6 days from a funding gap. A small move now keeps the week on track.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-white/6 bg-gradient-to-br from-[#171F3A] via-[#1C214B] to-[#14405A] p-6 shadow-[0_26px_52px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/16 via-transparent via-45% to-[#22D3EE]/14" />
        <div className="absolute inset-x-5 bottom-0 h-[2px] bg-gradient-to-r from-[#8B5CF6]/65 via-[#6366F1]/60 to-[#22D3EE]/70 shadow-[0_0_18px_rgba(99,102,241,0.3)]" />
        <div className="absolute left-0 top-18 h-32 w-24 bg-[#6366F1]/16 blur-2xl" />
        <div className="absolute bottom-0 left-10 h-10 w-32 rounded-full bg-[#8B5CF6]/55 blur-2xl" />
        <div className="absolute bottom-0 right-8 h-10 w-32 rounded-full bg-[#22D3EE]/48 blur-2xl" />

        <div className="relative">
          <Link href={`/projects/${featured.id}`} className="block">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-3">
                  <ZilaSignal
                    variant={getSignalVariant(featured.statusTone, featured.id)}
                    onDark
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                  />
                  <h2 className="min-w-0 break-words text-[24px] font-semibold text-white">{featured.name}</h2>
                </div>
                <p className="mt-5 max-w-[290px] text-[13px] leading-[1.6] text-[#E2E8F0]">{featured.stateSignal}</p>
              </div>
              <Pill tone={featured.statusTone} className="mt-1 shrink-0 border-white/10 bg-white/8 text-white">
                {featured.status}
              </Pill>
            </div>

            <div className="mb-5 flex items-start gap-4">
              <MetricInline label="Budget" value={featured.budget} featured />
              <div className="mt-2 h-18 w-px bg-white/12" />
              <MetricInline label="Spent" value={featured.spent} featured />
              <div className="mt-2 h-18 w-px bg-white/12" />
              <MetricInline label="Remaining" value={featured.remaining} featured />
            </div>

            <div className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="mb-2 flex items-center gap-1.5">
                <ZilaSignal variant={getSignalVariant(featured.statusTone, featured.id)} onDark />
                <p className="text-[11px] font-semibold text-[#A7B8FF]">Insight</p>
              </div>
              <p className="text-[15px] leading-[1.55] text-[#F8FAFC]">{featured.insight}</p>
            </div>

            <p className="mt-5 text-[11px] text-[#9BAAC2]">{featured.updatedAt}</p>
          </Link>

          <div className="mt-4 border-t border-white/10 pt-4">
            <NextMoveCard
              title={featured.nextMoveTitle}
              summary={featured.nextMoveSummary}
              ifNoAction={featured.ifNoAction}
              ifActionTaken={featured.ifActionTaken}
              primaryActionLabel={featured.primaryActionLabel}
              secondaryActionLabel={featured.secondaryActionLabel}
              showSecondaryAction={false}
              showSafetyNetSupport={false}
              canUseSafetyNet={featured.canUseSafetyNet}
              showSafetyNetAction={featured.showSafetyNetAction}
              safetyNetShortfallText={featured.safetyNetShortfallText}
              safetyNetAmount={featured.safetyNetAmount}
              safetyNetRemaining={featured.safetyNetRemaining}
              safetyNetDestination={featured.safetyNetDestination}
              dark
            />
          </div>
        </div>
      </div>

      {featured.canUseSafetyNet &&
      featured.safetyNetShortfallText &&
      featured.safetyNetAmount &&
      featured.safetyNetRemaining &&
      featured.safetyNetDestination ? (
        <SafetyNetActionCard
          shortfallText={featured.safetyNetShortfallText}
          supportingText="Zila can cover this if no action is taken."
          note="If you don't act, Zila will step in using your Safety Net."
          amount={featured.safetyNetAmount}
          destination={featured.safetyNetDestination}
          remaining={featured.safetyNetRemaining}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {secondary.map((project, index) => {
          const tinted = index === 1;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`relative block w-full overflow-hidden rounded-[22px] border p-5 ${
                tinted
                  ? "border-white/6 bg-gradient-to-br from-[#232448] via-[#23335A] to-[#173D55] shadow-[0_16px_32px_rgba(15,23,42,0.12)]"
                  : "border-[rgba(18,20,23,0.07)] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
              }`}
            >
              {tinted ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#22D3EE]/10" />
                  <div className="absolute bottom-0 left-5 h-5 w-16 rounded-full bg-[#F59E0B]/42 blur-xl" />
                  <div className="absolute bottom-0 right-3 h-5 w-16 rounded-full bg-[#22D3EE]/32 blur-xl" />
                </>
              ) : null}

              <div className="relative">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start gap-2">
                      <ZilaSignal
                        variant={getSignalVariant(project.statusTone, project.id)}
                        onDark={tinted}
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                      />
                      <h3
                        className={`min-w-0 flex-1 break-words text-[15px] font-semibold leading-[1.3] ${
                          tinted ? "text-white" : "text-[#121417]"
                        }`}
                      >
                        {project.name}
                      </h3>
                    </div>
                    <p className={`mt-3 text-[12px] leading-[1.45] ${tinted ? "text-[#D8E2EE]" : "text-[#526173]"}`}>
                      {project.stateSignal}
                    </p>
                  </div>
                  {tinted ? (
                    <Pill tone={project.statusTone} className="shrink-0 border-white/10 bg-white/8 text-white">
                      {project.status}
                    </Pill>
                  ) : null}
                </div>

                <div className="flex items-start gap-4">
                  <MetricInline label="Budget" value={project.budget} featured={tinted} compact />
                  <div className={`mt-1 h-12 w-px ${tinted ? "bg-white/12" : "bg-[rgba(18,20,23,0.08)]"}`} />
                  <MetricInline label="Spent" value={project.spent} featured={tinted} compact />
                </div>

                <p className={`mt-4 text-[11px] ${tinted ? "text-[#A8B4C7]" : "text-[#6B7280]"}`}>{project.updatedAt}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href={`/projects/${calm.id}`}
        className="block w-full rounded-[24px] border border-[rgba(18,20,23,0.07)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <ZilaSignal variant={getSignalVariant(calm.statusTone, calm.id)} className="h-5 w-5 flex-shrink-0" />
              <h3 className="min-w-0 break-words text-[20px] font-semibold text-[#121417]">{calm.name}</h3>
            </div>
            <p className="mt-3 text-[12px] text-[#526173]">{calm.stateSignal}</p>
          </div>
          <Pill tone={calm.statusTone}>{calm.status}</Pill>
        </div>

        <div className="flex items-start gap-6">
          <MetricInline label="Budget" value={calm.budget} />
          <div className="mt-1 h-12 w-px bg-[rgba(18,20,23,0.08)]" />
          <MetricInline label="Spent" value={calm.spent} />
        </div>

        <p className="mt-5 text-[11px] text-[#6B7280]">{calm.updatedAt}</p>
      </Link>
    </div>
  );
}
