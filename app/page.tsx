import { CapitalCard } from "@/components/home/CapitalCard";
import { FounderInsight } from "@/components/home/FounderInsight";
import { FocusCard } from "@/components/home/FocusCard";
import { ChapterRow } from "@/components/home/ChapterRow";
import { AppShell } from "@/components/ui/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#6366F1]"></span>
          <span className="text-[12px] font-medium text-[#6B7280]">Monday, 23 March</span>
        </div>

        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Good morning,</p>
          <h1 className="mb-3 text-[32px] font-semibold leading-tight text-[#121417]">
            Amara
            <span className="ml-2 inline-block h-2.5 w-2.5 align-text-top rounded-full bg-[#6366F1]"></span>
          </h1>
        </div>

        <div className="mt-4">
          <CapitalCard />
        </div>

        <FounderInsight />

        <FocusCard />

        <div className="pt-2">
          <h3 className="mb-3 px-1 text-[12px] font-semibold text-[#6B7280]">Your business</h3>
          <div className="space-y-2">
            <ChapterRow
              icon="📋"
              iconBgColor="bg-[#FEF3C7]"
              title="Projects"
              subtitle="3 active · 1 needs attention"
              badge="Watch"
              badgeColor="bg-[#FEF3C7] text-[#92400E] font-semibold"
              href="/projects"
            />
            <ChapterRow
              icon="💳"
              iconBgColor="bg-[#CFFAFE]"
              title="Payments"
              subtitle="$4.3K due this week"
              badge="Due soon"
              badgeColor="bg-[#FEF3C7] text-[#92400E] font-semibold"
            />
            <ChapterRow
              icon="🛡️"
              iconBgColor="bg-[#1E293B]"
              title="Proof of Operations"
              subtitle="BuildOps · 13 days, verified"
              badge="Verified"
              badgeColor="bg-[#D1FAE5] text-[#065F46] font-semibold"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
