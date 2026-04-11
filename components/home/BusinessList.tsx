import { CreditCard, FolderKanban, ShieldCheck } from "lucide-react";

import { ChapterRow } from "@/components/home/ChapterRow";
import { IconTile } from "@/components/ui/IconTile";

export function BusinessList() {
  return (
    <div className="pt-2">
      <h3 className="mb-3 px-1 text-[12px] font-semibold text-[#6B7280]">Your business</h3>
      <div className="space-y-2">
        <ChapterRow
          icon={
            <IconTile
              glow="indigo"
              size="md"
              className="border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[#243354] to-[#162238] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_14px_rgba(99,102,241,0.10)]"
            >
              <FolderKanban className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </IconTile>
          }
          title="Projects"
          subtitle="3 active · 1 needs attention"
          badge="Watch"
          badgeColor="border border-[rgba(140,112,70,0.10)] bg-[#F3EDE5] text-[#5F5142]"
          href="/projects"
        />
        <ChapterRow
          icon={
            <IconTile
              glow="cyan"
              size="md"
              className="border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[#1E3B4E] to-[#162238] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_14px_rgba(34,211,238,0.09)]"
            >
              <CreditCard className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </IconTile>
          }
          title="Payments"
          subtitle="$4.3K due this week"
          badge="Due soon"
          badgeColor="border border-[rgba(145,103,47,0.12)] bg-[#EEE4D6] text-[#5B4B3A]"
          href="/payments"
        />
        <ChapterRow
          icon={
            <IconTile
              glow="mint"
              size="md"
              className="border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[#223547] to-[#162238] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_14px_rgba(134,176,155,0.10)]"
            >
              <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </IconTile>
          }
          title="Proof of Operations"
          subtitle="BuildOps · 13 days, verified"
          badge="Verified"
          badgeColor="border border-[rgba(92,130,110,0.12)] bg-[#E8F0EA] text-[#466253]"
        />
      </div>
    </div>
  );
}

export default BusinessList;
