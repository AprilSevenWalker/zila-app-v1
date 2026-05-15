"use client";

import { useEffect, useState } from "react";
import { Brain, CreditCard, FolderKanban, ShieldCheck } from "lucide-react";

import { ChapterRow } from "@/components/home/ChapterRow";
import { IconTile } from "@/components/ui/IconTile";
import { getProtectedMoneyState, subscribeToProtectedMoney, type ReserveActivity } from "@/lib/protectedMoneyStore";
import {
  getAskOperationalUpdates,
  subscribeToAskOperationalUpdates,
  type AskOperationalUpdate,
} from "@/lib/askOperationalStore";

export function BusinessList() {
  const [latestReserveActivity, setLatestReserveActivity] = useState<ReserveActivity | null>(null);
  const [latestAskUpdate, setLatestAskUpdate] = useState<AskOperationalUpdate | null>(null);

  useEffect(() => {
    const update = () => {
      setLatestReserveActivity(getProtectedMoneyState().activity[0] ?? null);
      setLatestAskUpdate(getAskOperationalUpdates()[0] ?? null);
    };

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribeAsk = subscribeToAskOperationalUpdates(update);

    return () => {
      unsubscribeProtected();
      unsubscribeAsk();
    };
  }, []);

  return (
    <div className="pt-2">
      <h3 className="mb-3 px-1 text-[12px] font-semibold text-[#C9D4F5]">Recent operational activity</h3>
      <div className="space-y-2">
        {latestReserveActivity ? (
          <ChapterRow
            icon={
              <IconTile
                glow="mint"
                size="md"
                className="border-[#D7FF4F]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(215,255,79,0.12)]"
              >
                <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.75} />
              </IconTile>
            }
            title={latestReserveActivity.action}
            subtitle={latestReserveActivity.context}
            badge="Protected"
            badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
            href="/proof"
          />
        ) : null}
        {latestAskUpdate ? (
          <ChapterRow
            icon={
              <IconTile
                glow="indigo"
                size="md"
                className="border-[#8F7CFF]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(143,124,255,0.12)]"
              >
                <Brain className="h-[17px] w-[17px]" strokeWidth={1.75} />
              </IconTile>
            }
            title={latestAskUpdate.change}
            subtitle={`${latestAskUpdate.project} · ${latestAskUpdate.recommendation}`}
            badge={latestAskUpdate.pressureLevel}
            badgeColor="border border-[#8F7CFF]/24 bg-[#8F7CFF]/12 text-[#DCD6FF]"
            href="/proof"
          />
        ) : null}
        <ChapterRow
          icon={
            <IconTile
              glow="indigo"
              size="md"
              className="border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_14px_rgba(143,124,255,0.12)]"
            >
              <FolderKanban className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </IconTile>
          }
          title="Project Horizon"
          subtitle="Supplier payment due Friday"
          badge="Watch"
          badgeColor="border border-[#8F7CFF]/24 bg-[#8F7CFF]/12 text-[#DCD6FF]"
          href="/projects"
        />
        <ChapterRow
          icon={
            <IconTile
              glow="cyan"
              size="md"
              className="border-[#7CF3FF]/14 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(89,225,255,0.12)]"
            >
              <CreditCard className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </IconTile>
          }
          title="Payment activity"
          subtitle="$4.3K linked to Project Horizon"
          badge="Due soon"
          badgeColor="border border-[#2F80FF]/24 bg-[#2F80FF]/12 text-[#BFD9FF]"
          href="/payments"
        />
        <ChapterRow
          icon={
            <IconTile
              glow="mint"
              size="md"
              className="border-[#D7FF4F]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(215,255,79,0.12)]"
            >
              <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </IconTile>
          }
          title="Proof of Operations"
          subtitle="13 days of verified project activity"
          badge="Verified"
          badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
          href="/proof"
        />
      </div>
    </div>
  );
}

export default BusinessList;
