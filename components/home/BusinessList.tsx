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
import { projects as seedProjects, type Project } from "@/data/projects";
import { mergeOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";

export function BusinessList() {
  const [latestReserveActivity, setLatestReserveActivity] = useState<ReserveActivity | null>(null);
  const [latestAskUpdate, setLatestAskUpdate] = useState<AskOperationalUpdate | null>(null);
  const [latestPayment, setLatestPayment] = useState<LatestPaymentTransaction | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [selectedRails, setSelectedRails] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      setLatestReserveActivity(getProtectedMoneyState().activity[0] ?? null);
      setLatestAskUpdate(getAskOperationalUpdates()[0] ?? null);
      setLatestPayment(getLatestPaymentTransaction());
      setIsDemo(getZilaUserProfile().isDemo);
      setVisibleProjects(mergeOperationalProjects(seedProjects));
      try {
        const rails = JSON.parse(window.localStorage.getItem("zila-onboarding-payment-rails") || "[]") as string[];
        setSelectedRails(Array.isArray(rails) ? rails : []);
      } catch {
        setSelectedRails([]);
      }
    };

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribeAsk = subscribeToAskOperationalUpdates(update);
    const unsubscribePayment = subscribeToLatestPaymentTransaction(update);
    const unsubscribeSession = subscribeToZilaSession(update);
    const unsubscribeProjects = subscribeToOperationalProjects(update);

    return () => {
      unsubscribeProtected();
      unsubscribeAsk();
      unsubscribePayment();
      unsubscribeSession();
      unsubscribeProjects();
    };
  }, []);

  const firstProject = visibleProjects[0];
  const projectListLabel =
    visibleProjects.length > 1
      ? `${firstProject?.name} and ${visibleProjects.length - 1} other project${visibleProjects.length === 2 ? "" : "s"}`
      : firstProject?.name ?? "Workspace";

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
        ) : (
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
            <ChapterRow
              icon={
                <IconTile glow="mint" size="md" className="border-[#D7FF4F]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC]">
                  <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </IconTile>
              }
              title="Workspace created"
              subtitle={`${getZilaUserProfile().workspace} is ready for operational coordination`}
              badge="Ready"
              badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
              href="/settings"
            />
            {firstProject ? (
              <>
                <ChapterRow
                  icon={
                    <IconTile glow="indigo" size="md" className="border-[#8F7CFF]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC]">
                      <FolderKanban className="h-[17px] w-[17px]" strokeWidth={1.75} />
                    </IconTile>
                  }
                  title={`${firstProject.name} added to workspace`}
                  subtitle={`${firstProject.stage} stage · ${firstProject.budget} budget configured`}
                  badge="Project"
                  badgeColor="border border-[#8F7CFF]/24 bg-[#8F7CFF]/12 text-[#DCD6FF]"
                  href="/projects"
                />
                <ChapterRow
                  icon={
                    <IconTile glow="cyan" size="md" className="border-[#7CF3FF]/14 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC]">
                      <CreditCard className="h-[17px] w-[17px]" strokeWidth={1.75} />
                    </IconTile>
                  }
                  title={`${firstProject.name} budget configured`}
                  subtitle={`${firstProject.remaining} safe to use after starter protection and commitments`}
                  badge="Budget"
                  badgeColor="border border-[#2F80FF]/24 bg-[#2F80FF]/12 text-[#BFD9FF]"
                  href="/projects"
                />
              </>
            ) : null}
            <ChapterRow
              icon={
                <IconTile glow="cyan" size="md" className="border-[#7CF3FF]/14 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC]">
                  <CreditCard className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </IconTile>
              }
              title={selectedRails.length > 0 ? "Payment rails selected" : "Connect payment rail"}
              subtitle={selectedRails.length > 0 ? selectedRails.join(" + ") : `Set up payouts for ${projectListLabel}`}
              badge={selectedRails.length > 0 ? "Selected" : "Next"}
              badgeColor="border border-[#2F80FF]/24 bg-[#2F80FF]/12 text-[#BFD9FF]"
              href="/payments"
            />
            <ChapterRow
              icon={
                <IconTile glow="mint" size="md" className="border-[#D7FF4F]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC]">
                  <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </IconTile>
              }
              title="Proof layer prepared"
              subtitle="Proof history starts when payments, approvals, reserves, and updates are recorded"
              badge="Prepared"
              badgeColor="border border-[#D7FF4F]/24 bg-[#D7FF4F]/10 text-[#F1FFB8]"
              href="/proof"
            />
            <ChapterRow
              icon={
                <IconTile glow="indigo" size="md" className="border-[#8F7CFF]/16 bg-gradient-to-br from-[#21457A] to-[#102347] text-[#F8FAFC]">
                  <Brain className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </IconTile>
              }
              title="Operational memory activated"
              subtitle={`Zila is ready to learn patterns across ${projectListLabel}`}
              badge="Memory"
              badgeColor="border border-[#8F7CFF]/24 bg-[#8F7CFF]/12 text-[#DCD6FF]"
              href="/compare"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default BusinessList;
