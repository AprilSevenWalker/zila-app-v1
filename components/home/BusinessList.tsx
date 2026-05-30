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
import {
  getLatestPaymentTransaction,
  subscribeToLatestPaymentTransaction,
  type LatestPaymentTransaction,
} from "@/lib/paymentTransactionStore";
import { getZilaUserProfile, subscribeToZilaSession } from "@/lib/demoSession";

export function BusinessList() {
  const [latestReserveActivity, setLatestReserveActivity] = useState<ReserveActivity | null>(null);
  const [latestAskUpdate, setLatestAskUpdate] = useState<AskOperationalUpdate | null>(null);
  const [latestPayment, setLatestPayment] = useState<LatestPaymentTransaction | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const update = () => {
      setLatestReserveActivity(getProtectedMoneyState().activity[0] ?? null);
      setLatestAskUpdate(getAskOperationalUpdates()[0] ?? null);
      setLatestPayment(getLatestPaymentTransaction());
      setIsDemo(getZilaUserProfile().isDemo);
    };

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribeAsk = subscribeToAskOperationalUpdates(update);
    const unsubscribePayment = subscribeToLatestPaymentTransaction(update);
    const unsubscribeSession = subscribeToZilaSession(update);

    return () => {
      unsubscribeProtected();
      unsubscribeAsk();
      unsubscribePayment();
      unsubscribeSession();
    };
  }, []);

  const hasRealActivity = Boolean(latestReserveActivity || latestAskUpdate || latestPayment);

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
        {isDemo ? (
          <>
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
              title={latestPayment?.projectName ?? "Project Horizon"}
              subtitle={latestPayment ? `${latestPayment.recipientName ?? "Supplier"} payout settled` : "Supplier payment due Friday"}
              badge={latestPayment ? "Settled" : "Watch"}
              badgeColor={latestPayment ? "border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]" : "border border-[#8F7CFF]/24 bg-[#8F7CFF]/12 text-[#DCD6FF]"}
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
              subtitle={latestPayment ? `${latestPayment.amountLabel} synced to Proof` : "$4.3K linked to Project Horizon"}
              badge={latestPayment ? "Synced" : "Due soon"}
              badgeColor={latestPayment ? "border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]" : "border border-[#2F80FF]/24 bg-[#2F80FF]/12 text-[#BFD9FF]"}
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
              subtitle={latestPayment ? "Latest payout generated verified history" : "13 days of verified project activity"}
              badge="Verified"
              badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
              href="/proof"
            />
          </>
        ) : hasRealActivity ? (
          <>
            {latestPayment ? (
              <>
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
                  title={latestPayment.projectName}
                  subtitle={`${latestPayment.recipientName ?? "Supplier"} payout settled`}
                  badge="Settled"
                  badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
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
                  subtitle={`${latestPayment.amountLabel} synced to Proof`}
                  badge="Synced"
                  badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
                  href="/payments"
                />
              </>
            ) : null}
          </>
        ) : (
          <div className="rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(25,55,101,0.72),rgba(16,35,71,0.64)_52%,rgba(11,23,48,0.62))] p-4 text-[#C9D4F5] shadow-[0_14px_30px_rgba(1,8,20,0.24),inset_0_1px_0_rgba(234,241,255,0.07)]">
            <p className="text-[14px] font-semibold text-[#EAF1FF]">No activity recorded yet</p>
            <p className="mt-1 text-[12px]">Payments, approvals, supplier updates, and project updates will appear here as your team works.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessList;
