"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Landmark, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/ui/AppShell";
import { getPaymentDraft, savePaymentDraft } from "@/lib/paymentDraftStore";

const projectOptions = [
  { id: "project-horizon", name: "Project Horizon", status: "On track" },
  { id: "harbour-road", name: "Harbour Road", status: "Needs cover" },
  { id: "studio-refresh", name: "Studio Refresh", status: "Stable" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function MoveFundsFlowScreen() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const draft = getPaymentDraft();
    return projectOptions.some((project) => project.id === draft.projectId)
      ? draft.projectId
      : projectOptions[0].id;
  });
  const [amount, setAmount] = useState(() => String(getPaymentDraft().amountValue));

  const selectedProject = projectOptions.find((project) => project.id === selectedProjectId) ?? projectOptions[0];
  const amountValue = useMemo(() => {
    const numeric = Number(amount.replace(/[^\d]/g, ""));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
  }, [amount]);
  const formattedAmount = formatCurrency(amountValue || 0);

  const handleContinue = () => {
    if (!amountValue) {
      return;
    }

    savePaymentDraft({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      amountValue,
      amountLabel: formattedAmount,
      sourceLabel: "Available balance",
      availableBalanceLabel: "$42,300",
    });

    router.push("/payments/send");
  };

  return (
    <AppShell>
      <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(160deg,#0D142B_0%,#171E46_42%,#1F2559_72%,#15374F_100%)] px-6 pb-28 pt-6 text-white">
        <div className="absolute inset-x-0 top-14 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.18),transparent_22%),linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
        <div className="relative flex flex-1 flex-col">
          <Link
            href="/payments"
            className="inline-flex w-fit items-center gap-2 text-[12px] font-semibold text-[#C9D5EA] transition hover:opacity-80"
          >
            <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2} />
            Back
          </Link>

          <div className="mt-7 max-w-[560px]">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#B8C1DE]">Move funds</p>
            <h1 className="mt-4 text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">Move funds</h1>
            <p className="mt-5 max-w-[360px] text-[16px] leading-[1.68] text-[#D4DCEF]/84">
              Choose the project and amount first so Zila can show the outcome before you confirm the payment.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <section className="rounded-[28px] border border-white/18 bg-[linear-gradient(180deg,rgba(16,42,79,0.92),rgba(9,25,50,0.94))] p-6 shadow-[0_22px_48px_rgba(13,35,68,0.30),inset_0_1px_0_rgba(255,255,255,0.10)]">
              <div className="space-y-5">
                <div className="rounded-[22px] border border-white/16 bg-[#173D6D]/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">From</p>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[22px] font-semibold tracking-[-0.04em] text-white">Available balance</p>
                      <p className="mt-1 text-[14px] text-[#C9D5EA]">$42,300 ready to move</p>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/6 text-[#EAF4FF]">
                      <Landmark className="h-[18px] w-[18px]" strokeWidth={1.9} />
                    </span>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                    To
                  </span>
                  <div className="relative">
                    <select
                      value={selectedProjectId}
                      onChange={(event) => setSelectedProjectId(event.target.value)}
                      className="h-14 w-full appearance-none rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] px-4 pr-12 text-[16px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none"
                    >
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id} className="bg-[#161D3D] text-white">
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8C1DE]" />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                    Amount
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="4300"
                    className="h-14 w-full rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] px-4 text-[16px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none placeholder:text-[#92A0B8]"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-emerald-300/24 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(15,72,64,0.34))] p-6 shadow-[0_22px_48px_rgba(13,35,68,0.28),inset_0_1px_0_rgba(255,255,255,0.10)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFF7DA]">Impact preview</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-[20px] border border-white/16 bg-[#0F3D42]/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[18px] font-semibold text-white">Project will be secured</p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#D9F7E7]">
                    {selectedProject.name} will have enough cover to keep work and supplier timing steady.
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/16 bg-[#0F3D42]/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-[18px] font-semibold text-white">No shortfall risk</p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#D9F7E7]">
                    This move keeps the project inside a safe range for the next operating window.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-[20px] border border-white/16 bg-[#0F3D42]/48 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 text-[#E9FFF4]">
                    <ShieldCheck className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{formattedAmount}</p>
                    <p className="mt-1 text-[12px] text-[#C8ECDD]">
                      Moving into {selectedProject.name} • {selectedProject.status}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-auto flex gap-3 pt-10">
            <Link
              href="/payments"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 text-[13px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.08]"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!amountValue}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-5 text-[13px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to confirm
              <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default MoveFundsFlowScreen;
