"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart3, LockKeyhole, Plus, ShieldCheck, TrendingUp, X } from "lucide-react";

import { IconTile } from "@/components/ui/IconTile";
import {
  BASE_PROTECTED,
  COMMITTED,
  createReserve,
  getProtectedMoneySummary,
  releaseReserveAmount,
  subscribeToProtectedMoney,
  TOTAL_BALANCE,
  type ReserveCategory,
} from "@/lib/protectedMoneyStore";
import { subscribeToLatestPaymentTransaction } from "@/lib/paymentTransactionStore";
import { projects as seedProjects } from "@/data/projects";
import { mergeOperationalProjects, subscribeToOperationalProjects } from "@/lib/projectStore";

const categories: ReserveCategory[] = [
  "Tax",
  "Payroll",
  "Supplier",
  "Emergency",
  "Project Reserve",
  "Travel",
  "Equipment",
];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

type ProtectedMoneySummary = ReturnType<typeof getProtectedMoneySummary>;

function getInitialProtectedMoneySummary(): ProtectedMoneySummary {
  return {
    reserves: [],
    activity: [],
    totalBalance: TOTAL_BALANCE,
    protectedAmount: BASE_PROTECTED,
    committedAmount: COMMITTED,
    safeToSpend: Math.max(TOTAL_BALANCE - BASE_PROTECTED - COMMITTED, 0),
  };
}

export const CapitalCard: React.FC = () => {
  const [summary, setSummary] = useState(getInitialProtectedMoneySummary);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reserveName, setReserveName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ReserveCategory>("Supplier");
  const [linkedProject, setLinkedProject] = useState("");
  const [latestInsight, setLatestInsight] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      setSummary(getProtectedMoneySummary());
      setProjectOptions(mergeOperationalProjects(seedProjects).map((project) => project.name));
    };

    update();
    const unsubscribeProtected = subscribeToProtectedMoney(update);
    const unsubscribePayments = subscribeToLatestPaymentTransaction(update);
    const unsubscribeProjects = subscribeToOperationalProjects(update);

    return () => {
      unsubscribeProtected();
      unsubscribePayments();
      unsubscribeProjects();
    };
  }, []);

  const safePercentage = useMemo(() => {
    if (summary.totalBalance <= 0) {
      return 0;
    }

    return Math.max(Math.min((summary.safeToSpend / summary.totalBalance) * 100, 100), 0);
  }, [summary.safeToSpend, summary.totalBalance]);
  const recommendations = useMemo(() => {
    const [first, second] = projectOptions;
    return [
      first ? `Coordinate the first supplier payout for ${first}` : "Set up your first supplier payout",
      second ? `Protect supplier reserve for ${second}` : first ? `Protect supplier reserve for ${first}` : "Protect supplier reserve",
      first ? `Connect payment rails for ${first}` : "Connect payment rails",
      second ? `Create first approval workflow for ${second}` : first ? `Create first approval workflow for ${first}` : "Create first approval workflow",
    ].slice(0, 4);
  }, [projectOptions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericAmount = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || summary.safeToSpend <= 0) {
      return;
    }

    const result = createReserve({
      name: reserveName,
      amount: Math.min(numericAmount, summary.safeToSpend),
      category,
      linkedProject,
    });
    setLatestInsight(result.activity.insight);
    setReserveName("");
    setAmount("");
    setCategory("Supplier");
    setLinkedProject("");
    setIsModalOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/22 bg-[linear-gradient(180deg,#214F83_0%,#173D6D_46%,#102A4F_100%)] p-6 text-[#EAF1FF] shadow-[0_30px_76px_rgba(31,68,116,0.26),inset_0_1px_0_rgba(243,245,249,0.16)]">
      <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.18),transparent_32%),linear-gradient(180deg,rgba(243,245,249,0.09),transparent_38%)]"></div>

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] text-[#C9D4F5]">Safe to spend</p>
            <h2 className="text-[42px] font-semibold leading-tight tracking-[-0.06em] text-[#EAF1FF] drop-shadow-[0_0_18px_rgba(234,241,255,0.08)]">
              {formatCurrency(summary.safeToSpend)}
            </h2>
            <div className="mt-3 flex items-center gap-1">
              <IconTile glow="cyan" className="h-4 w-4 rounded-full border-white/12 bg-[#17345F] text-[#DCEBEE] shadow-none">
                <TrendingUp className="capital-trend-pulse h-[10px] w-[10px] text-[#D7FF4F] drop-shadow-[0_0_8px_rgba(215,255,79,0.72)]" strokeWidth={2.5} />
              </IconTile>
              <span className="text-[12px] font-semibold text-[#D9FF57]">available after protected and committed money</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="rounded-[16px] border border-white/14 bg-[#102A4F]/64 p-3 text-center shadow-[0_18px_36px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(234,241,255,0.10)] backdrop-blur-sm">
              <IconTile className="mx-auto h-6 w-6 rounded-full border-white/10 bg-[#193765] text-[#E2E8F0] shadow-none">
                <BarChart3 className="capital-chart-shimmer h-[11px] w-[11px] text-[#67E8F9]" strokeWidth={2.35} />
              </IconTile>
              <span className="mt-1 block text-[13px] font-semibold text-[#D9FF57]">{Math.round(safePercentage)}%</span>
              <span className="text-[9px] text-[#C9D4F5]">safe range</span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/28 bg-[#D9FF57]/12 px-3 py-2 text-[11px] font-semibold text-[#F7FFC8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#D9FF57]/16"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={2} />
              Protect money
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-[#102A4F]/72 shadow-[inset_0_1px_0_rgba(234,241,255,0.10)]">
            <div className="bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.30)]" style={{ width: `${safePercentage}%` }} />
            <div className="bg-[#6D5EF8]/78" style={{ width: `${summary.totalBalance > 0 ? (summary.protectedAmount / summary.totalBalance) * 100 : 0}%` }} />
            <div className="flex-1 bg-[#67E8F9]/66" />
          </div>
          <div className="flex justify-between gap-2 text-[9px] text-[#C9D4F5]">
            <span>Safe</span>
            <span>Protected</span>
            <span>Committed</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["Total balance", summary.totalBalance, "text-[#EAF1FF]"],
            ["Protected", summary.protectedAmount, "text-[#DCD6FF]"],
            ["Committed", summary.committedAmount, "text-[#67E8F9]"],
            ["Safe to spend", summary.safeToSpend, "text-[#F1FFB8]"],
          ].map(([label, value, tone]) => (
            <div key={label as string} className="rounded-[14px] border border-white/13 bg-[#102A4F]/48 p-3 shadow-[inset_0_1px_0_rgba(234,241,255,0.09)] backdrop-blur-sm">
              <p className="mb-2 text-[9px] text-[#C9D4F5]">{label}</p>
              <p className={`text-[16px] font-semibold ${tone}`}>{formatCurrency(value as number)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation}
              className="rounded-[16px] border border-white/12 bg-[#102A4F]/54 px-4 py-3 shadow-[inset_0_1px_0_rgba(234,241,255,0.08)]"
            >
              <p className="text-[11px] font-semibold text-[#D9FF57]">Recommendation</p>
              <p className="mt-1 text-[12px] leading-[1.45] text-[#EAF1FF]">{recommendation}</p>
            </div>
          ))}
        </div>

        {latestInsight ? (
          <div className="mt-4 rounded-[16px] border border-[#8F7CFF]/18 bg-[linear-gradient(180deg,rgba(109,94,248,0.14),rgba(16,42,79,0.42))] px-4 py-3 shadow-[inset_0_1px_0_rgba(234,241,255,0.09)]">
            <p className="text-[11px] font-semibold text-[#DCD6FF]">Operational insight</p>
            <p className="mt-1 text-[12px] leading-[1.55] text-[#EAF1FF]">{latestInsight}</p>
          </div>
        ) : null}

        {summary.reserves.length ? (
          <div className="mt-4 space-y-2">
            {summary.reserves.slice(0, 3).map((reserve) => (
              <div key={reserve.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-white/12 bg-[#102A4F]/54 px-3 py-3 shadow-[inset_0_1px_0_rgba(234,241,255,0.08)]">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#EAF1FF]">{reserve.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-[#C9D4F5]">
                    {reserve.category}
                    {reserve.linkedProject ? ` · ${reserve.linkedProject}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-[13px] font-semibold text-[#DCD6FF]">{formatCurrency(reserve.amount)}</p>
                  <button
                    type="button"
                    onClick={() => releaseReserveAmount(reserve.id, reserve.amount)}
                    className="rounded-full border border-white/14 bg-white/[0.10] px-2.5 py-1 text-[10px] font-semibold text-[#C9D4F5] transition hover:bg-white/[0.14]"
                  >
                    Release
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] border border-white/12 bg-[#102A4F]/54 px-4 py-3 shadow-[inset_0_1px_0_rgba(234,241,255,0.08)]">
            <p className="flex items-center gap-2 text-[11px] font-medium text-[#C9D4F5]">
              <LockKeyhole className="h-[13px] w-[13px] text-[#8F7CFF]" strokeWidth={2} />
              Create reserves for tax, payroll, suppliers, or project commitments before spending.
            </p>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="absolute inset-0 z-20 flex items-end bg-[#06101F]/82 p-4 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(23,32,51,0.98),rgba(17,24,39,0.98)_46%,rgba(7,17,31,0.98))] p-5 shadow-[0_26px_64px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(234,241,255,0.10)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">Create reserve</p>
                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-[#EAF1FF]">Protect money</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 bg-[#102347]/72 p-2 text-[#C9D4F5]">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={reserveName}
                onChange={(event) => setReserveName(event.target.value)}
                placeholder="Reserve name"
                className="w-full rounded-[16px] border border-white/10 bg-[#0B1730]/72 px-4 py-3 text-[14px] text-[#EAF1FF] outline-none placeholder:text-[#C9D4F5]"
              />
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="numeric"
                placeholder="Amount"
                className="w-full rounded-[16px] border border-white/10 bg-[#0B1730]/72 px-4 py-3 text-[14px] text-[#EAF1FF] outline-none placeholder:text-[#C9D4F5]"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as ReserveCategory)}
                className="w-full rounded-[16px] border border-white/10 bg-[#102347] px-4 py-3 text-[14px] text-[#EAF1FF] outline-none"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                value={linkedProject}
                onChange={(event) => setLinkedProject(event.target.value)}
                className="w-full rounded-[16px] border border-white/10 bg-[#102347] px-4 py-3 text-[14px] text-[#EAF1FF] outline-none"
              >
                <option value="">Optional linked project</option>
                {projectOptions.map((project) => (
                  <option key={project}>{project}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#1D4ED8] text-[14px] font-semibold text-white shadow-[0_18px_34px_rgba(29,78,216,0.22)]"
            >
              <ShieldCheck className="h-[15px] w-[15px]" strokeWidth={2} />
              Protect money
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default CapitalCard;
