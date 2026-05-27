"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BookOpen, Building2, CheckCircle2, Settings2, UserRound, Wallet } from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import { openProductGuide } from "@/components/guide/ProductGuideModal";
import { getMoneySourceState, subscribeToMoneySource, type MoneySourceState } from "@/lib/moneySourceStore";

interface ProfileState {
  businessName: string;
  businessType: string;
  firstProjectName: string;
  firstProjectTemplate: string;
}

function getProfileState(): ProfileState {
  if (typeof window === "undefined") {
    return {
      businessName: "Zila Operations",
      businessType: "Operations workspace",
      firstProjectName: "Project Horizon",
      firstProjectTemplate: "Client delivery",
    };
  }

  return {
    businessName: window.localStorage.getItem("zila-business-name") || "Zila Operations",
    businessType: window.localStorage.getItem("zila-business-type") || "Operations workspace",
    firstProjectName: window.localStorage.getItem("zila-first-project-name") || "Project Horizon",
    firstProjectTemplate: window.localStorage.getItem("zila-first-project-template") || "Client delivery",
  };
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="zila-unified-panel-soft rounded-[28px] p-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7CF3FF]">{title}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProfileScreen() {
  const [moneySource, setMoneySource] = useState<MoneySourceState>(getMoneySourceState);
  const [profileState, setProfileState] = useState<ProfileState>(getProfileState);

  useEffect(() => {
    const sync = () => {
      setMoneySource(getMoneySourceState());
      setProfileState(getProfileState());
    };

    sync();
    const unsubscribe = subscribeToMoneySource(sync);
    window.addEventListener("storage", sync);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <AppShell>
      <div className="zila-unified-page -mx-4 -mt-2 space-y-6 px-4 pb-28 pt-5 md:-mx-6 md:rounded-[36px] md:px-6 md:pb-10 lg:-mx-8 lg:px-8">
        <div className="zila-unified-panel rounded-[30px] p-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7CF3FF]">Profile</p>
          <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-[-0.05em] text-white">
            Account, business, and money settings
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-[1.75] text-[#C9D4F5]">
            Keep your business details, active money source, and working preferences in one place so the rest of Zila stays aligned.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_360px]">
          <div className="space-y-6">
            <InfoCard title="User details">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.14))] text-[#4F46E5]">
                      <UserRound className="h-[16px] w-[16px]" strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Name</p>
                      <p className="mt-1 text-[17px] font-semibold text-white">Kevin</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Email</p>
                  <p className="mt-2 text-[17px] font-semibold text-white">kevin@zila.demo</p>
                  <p className="mt-1 text-[13px] text-[#C9D4F5]">Operations Lead</p>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Business details">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.14))] text-[#4F46E5]">
                      <Building2 className="h-[16px] w-[16px]" strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Business</p>
                      <p className="mt-1 text-[17px] font-semibold text-white">{profileState.businessName}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Business type</p>
                  <p className="mt-2 text-[17px] font-semibold text-white">{profileState.businessType}</p>
                  <p className="mt-1 text-[13px] text-[#C9D4F5]">From onboarding</p>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">First project</p>
                  <p className="mt-2 text-[17px] font-semibold text-white">{profileState.firstProjectName}</p>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Project type</p>
                  <p className="mt-2 text-[17px] font-semibold text-white">{profileState.firstProjectTemplate}</p>
                </div>
              </div>
            </InfoCard>
          </div>

          <div className="space-y-6">
            <InfoCard title="Money connection">
              <div className="rounded-[22px] border border-[#D7D8FB] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.92))] p-5 shadow-[0_18px_32px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.84)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(34,211,238,0.16))] text-[#4F46E5]">
                    <Wallet className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4F46E5]">
                      {moneySource.connected ? "Connected" : "Not connected"}
                    </p>
                    <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-white">
                      {moneySource.connected ? moneySource.sourceLabel : "Connect your money"}
                    </p>
                    <p className="mt-2 text-[14px] leading-[1.7] text-[#C9D4F5]">
                      {moneySource.connected
                        ? moneySource.walletAddressShort || "Ready to receive money"
                        : "Set up your operating balance to receive, protect, and move funds inside Zila."}
                    </p>
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Preferences">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={openProductGuide}
                  className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-white/12 bg-white/[0.08] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition hover:bg-white/[0.11]"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(89,225,255,0.22),rgba(47,128,255,0.14))] text-[#2F80FF]">
                      <BookOpen className="h-[16px] w-[16px]" strokeWidth={1.9} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Guide</span>
                      <span className="mt-1 block text-[17px] font-semibold text-white">How Zila works</span>
                    </span>
                  </span>
                  <span className="text-[12px] font-semibold text-[#2F80FF]">Open</span>
                </button>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(34,211,238,0.14))] text-[#4F46E5]">
                      <Settings2 className="h-[16px] w-[16px]" strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Primary currency</p>
                      <p className="mt-1 text-[17px] font-semibold text-white">USD</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Secondary currency</p>
                  <p className="mt-2 text-[17px] font-semibold text-white">KES</p>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(34,197,94,0.10))] text-[#0F9F6E]">
                      <CheckCircle2 className="h-[16px] w-[16px]" strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Language</p>
                      <p className="mt-1 text-[17px] font-semibold text-white">English</p>
                      <p className="mt-1 text-[13px] text-[#C9D4F5]">Clear operational guidance enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ProfileScreen;
