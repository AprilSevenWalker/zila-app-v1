"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Landmark, ShieldCheck, Wallet } from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";

type FundingSource = "Main account" | "Another project" | "Safety Net";

const sourceOptions: Array<{
  label: FundingSource;
  description: string;
  icon: typeof Landmark;
}> = [
  {
    label: "Main account",
    description: "Use available operating funds first",
    icon: Landmark,
  },
  {
    label: "Another project",
    description: "Rebalance from a steadier project",
    icon: Wallet,
  },
  {
    label: "Safety Net",
    description: "Use backup cover if timing stays tight",
    icon: ShieldCheck,
  },
];

export function MoveFundsScreen() {
  const [amount, setAmount] = useState("4300");
  const [source, setSource] = useState<FundingSource>("Main account");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const formattedAmount = useMemo(() => {
    const numeric = Number(amount.replace(/[^\d]/g, ""));

    if (!Number.isFinite(numeric) || numeric <= 0) {
      return "$0";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numeric);
  }, [amount]);

  const handleMoveFunds = () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
    }, 1400);
  };

  return (
    <AppShell>
      <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(162deg,#0B1121_0%,#141A36_34%,#241F48_66%,#1A3348_100%)] px-6 pb-28 pt-6 text-white">
        <div className="absolute inset-x-0 top-16 h-96 bg-[radial-gradient(circle_at_24%_20%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
        <div className="absolute left-[8%] top-[20%] h-56 w-40 rotate-[18deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.018)_38%,rgba(255,255,255,0)_82%)] blur-2xl opacity-65" />
        <div className="absolute left-[14%] top-[16%] h-36 w-44 bg-[radial-gradient(circle_at_40%_40%,rgba(103,232,249,0.14),rgba(129,140,248,0.08)_48%,rgba(129,140,248,0)_78%)] blur-3xl opacity-80" />

        <div className="relative flex flex-1 flex-col">
          <Link
            href="/insight"
            className="inline-flex w-fit items-center gap-2 text-[12px] font-semibold text-[#C9D5EA] transition hover:opacity-80"
          >
            <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2} />
            Back
          </Link>

          <div className="mt-7 max-w-[320px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#B8C1DE]">
              Move funds to Project Horizon
            </p>
            <h1 className="mt-4 text-[38px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#FBFCFF]">
              Move funds to Project Horizon
            </h1>
            <p className="mt-5 max-w-[286px] text-[16px] leading-[1.68] text-[#D4DCEF]/84">
              This keeps your project on track this week.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                Amount
              </p>
              <div className="mt-3 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] px-5 py-5 shadow-[0_0_30px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
                <div className="flex items-end justify-between gap-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formattedAmount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full bg-transparent text-[42px] font-semibold leading-none tracking-[-0.06em] text-white outline-none placeholder:text-white/40"
                    aria-label="Amount"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                Source
              </p>
              <div className="mt-3 space-y-3">
                {sourceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = source === option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSource(option.label)}
                      className={`flex w-full items-center justify-between rounded-[20px] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-cyan-300/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(16,42,79,0.88))] shadow-[0_14px_28px_rgba(13,35,68,0.20),inset_0_1px_0_rgba(255,255,255,0.12)]"
                          : "border-white/16 bg-[#102A4F]/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 text-[#EAF4FF]">
                          <Icon className="h-[16px] w-[16px]" strokeWidth={1.9} />
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold text-white">{option.label}</p>
                          <p className="mt-1 text-[12px] leading-[1.45] text-[#C6D1E4]">{option.description}</p>
                        </div>
                      </div>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSelected ? "bg-[#7EE7F6] shadow-[0_0_14px_rgba(126,231,246,0.32)]" : "bg-white/18"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/16 bg-[#102A4F]/62 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">Destination</p>
              <p className="mt-2 text-[20px] font-semibold text-white">Project Horizon</p>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <p className="mb-4 text-[14px] leading-[1.65] text-[#D8E0F2]/84">
              This action stabilises your next 7 days.
            </p>
            <button
              type="button"
              onClick={handleMoveFunds}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/60 bg-white px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB] disabled:cursor-wait"
            >
              {isSubmitting ? (
                <>
                  <span className="insight-signal-pulse relative inline-flex h-2.5 w-2.5 rounded-full bg-[#5EEAD4] shadow-[0_0_14px_rgba(94,234,212,0.35)]">
                    <span className="insight-signal-ripple absolute inset-0 rounded-full border border-[#5EEAD4]/40"></span>
                  </span>
                  Moving funds
                </>
              ) : isComplete ? (
                <>
                  Funds ready
                  <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
                </>
              ) : (
                "Move funds"
              )}
            </button>
            {isComplete ? (
              <p className="mt-4 text-[13px] leading-[1.6] text-[#C9F5E3]">
                Project Horizon is covered for the week and your timing is steady again.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
