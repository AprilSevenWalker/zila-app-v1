"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  FileCheck2,
  GitBranch,
  Landmark,
  Network,
  Route,
  ShieldCheck,
  Smartphone,
  WalletCards,
  Workflow,
} from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { CurrencyAmount, getFxHelperText } from "@/components/ui/CurrencyAmount";
import { PaymentsActionPanel } from "@/components/payments/PaymentsActionPanel";
import { IconTile } from "@/components/ui/IconTile";
import { getCashflowOverview } from "@/data/payments";
import {
  getLatestPaymentTransaction,
  subscribeToLatestPaymentTransaction,
  type LatestPaymentTransaction,
} from "@/lib/paymentTransactionStore";

const connectedRails = [
  {
    id: "bank",
    label: "Bank",
    detail: "Operating account",
    amount: "$18,000",
    status: "Connected",
    icon: Landmark,
    tone: "text-[#7EE7F6]",
  },
  {
    id: "mobile-money",
    label: "Mobile money",
    detail: "Field payouts",
    amount: "$6,300",
    status: "Ready",
    icon: Smartphone,
    tone: "text-[#D9FF57]",
  },
  {
    id: "stablecoin-wallet",
    label: "Stablecoin wallet",
    detail: "XRPL / Xaman",
    amount: "$18,000",
    status: "Proof rail",
    icon: WalletCards,
    tone: "text-[#AFC0FF]",
  },
  {
    id: "reserve",
    label: "Protected reserve",
    detail: "Locked allocation",
    amount: "$24,220",
    status: "Protected",
    icon: ShieldCheck,
    tone: "text-[#EAFFB4]",
  },
];

const liveMovements = [
  {
    id: "bank-stable-mobile",
    label: "Bank to mobile money",
    path: ["Bank", "Stablecoin", "Mobile money"],
    amount: "$1,450",
    state: "FX conversion prepared",
    proof: "Payout ready",
    insight: "Mobile money payout will not affect supplier reserve.",
    details: ["FX path: Bank to stablecoin to mobile money", "Timing: 8 minutes", "Risk: Low"],
  },
  {
    id: "client-reserve",
    label: "Client payment to reserve",
    path: ["Client payment", "Protected reserve"],
    amount: "$2,000",
    state: "Money protected before payout",
    proof: "Reserve protected",
    insight: "Protected reserve remains above threshold.",
    details: ["Reserve impact: +18% protected", "Proof record: Receipt linked", "Risk: None"],
  },
  {
    id: "stablecoin-supplier",
    label: "Stablecoin to supplier",
    path: ["XRPL/Xaman", "Supplier payout"],
    amount: "$4,300",
    state: "Supplier payout prepared",
    proof: "Ready to send",
    insight: "Cheaper routing available through stablecoin.",
    details: ["Cheapest rail: Stablecoin", "Timing: Same day", "Release: Safe today"],
  },
];

const movementCapabilities = ["Pay with stablecoins", "Route to mobile money", "Bank payout", "Receive into reserve", "XRPL proof attached"];

const operationalInsights = [
  "$4,300 supplier payout is safe to release today.",
  "18% of incoming cash is protected for upcoming obligations.",
  "Friday supplier reserve remains protected after mobile money payout.",
  "Stablecoin route prepared before supplier settlement.",
];

const recentOperations = [
  {
    time: "10:42 AM",
    label: "Supplier payout prepared",
    detail: "Stablecoin wallet to Project Horizon supplier",
    status: "FX prepared • Record ready",
  },
  {
    time: "10:47 AM",
    label: "Client payment received",
    detail: "Incoming funds moved into protected reserve",
    status: "Reserve protected",
  },
  {
    time: "10:51 AM",
    label: "Mobile money payout queued",
    detail: "Field team payment awaiting approval",
    status: "Ready to send",
  },
];

const proofStream = [
  {
    time: "10:42 AM",
    event: "Reserve verified",
    detail: "Supplier payout keeps protected reserve above threshold.",
    source: "Reserve state",
  },
  {
    time: "10:43 AM",
    event: "FX route confirmed",
    detail: "Cheapest active rail selected for Project Horizon payout.",
    source: "Routing engine",
  },
  {
    time: "10:44 AM",
    event: "Supplier verified",
    detail: "Destination account matches saved operational profile.",
    source: "Payout control",
  },
  {
    time: "10:45 AM",
    event: "Settlement secured",
    detail: "Stablecoin route ready for confirmation.",
    source: "Settlement rail",
  },
  {
    time: "10:46 AM",
    event: "Proof attached",
    detail: "Payment reason, project, reserve state, and route linked.",
    source: "Proof of Operations",
  },
];

export default function PaymentsPage() {
  const overview = getCashflowOverview();
  const [activeMovementId, setActiveMovementId] = useState(liveMovements[2].id);
  const [activeProofIndex, setActiveProofIndex] = useState(0);
  const [latestPayment, setLatestPayment] = useState<LatestPaymentTransaction | null>(null);
  const activeMovement = liveMovements.find((movement) => movement.id === activeMovementId) ?? liveMovements[0];
  const activeTopologyLabels = activeMovement.path.join(" ").toLowerCase();
  const liveOperationalInsights = useMemo(() => {
    if (!latestPayment) {
      return operationalInsights;
    }

    const recipient = latestPayment.recipientName ?? "supplier";
    const project = latestPayment.projectName || "project";

    return [
      `${latestPayment.amountLabel} ${latestPayment.transferStatus === "Completed" ? "cleared" : "is processing"} for ${recipient}.`,
      `${project} reserve and proof state updated from payment movement.`,
      "Supplier obligation reduced and runway recalculated.",
      "Verified record is ready in Proof of Operations.",
    ];
  }, [latestPayment]);
  const liveRecentOperations = useMemo(() => {
    if (!latestPayment) {
      return recentOperations;
    }

    return [
      {
        time: "Just now",
        label: `${latestPayment.transferStatus === "Completed" ? "Supplier payout completed" : "Supplier payout processing"}`,
        detail: `${latestPayment.amountLabel} for ${latestPayment.projectName} moved through ${latestPayment.network}.`,
        status: "Reserve updated • Proof synced",
      },
      {
        time: "1m ago",
        label: "Runway recalculated",
        detail: `${latestPayment.projectName} operating state updated after payout movement.`,
        status: "Project state refreshed",
      },
      ...recentOperations.slice(0, 2),
    ];
  }, [latestPayment]);
  const proofSequence = useMemo(
    () =>
      proofStream.map((item, index) => {
        if (latestPayment && index === 0) {
          return {
            ...item,
            event: "Payment consequence recorded",
            detail: `${latestPayment.amountLabel} ${latestPayment.transferStatus === "Completed" ? "cleared" : "is processing"} for ${latestPayment.projectName}.`,
            source: "Payment movement",
          };
        }

        if (index === 1) {
          return {
            ...item,
            detail: latestPayment
              ? `Reserve and runway recalculated after ${latestPayment.amountLabel} movement.`
              : `${activeMovement.path.join(" to ")} route confirmed for ${activeMovement.amount}.`,
          };
        }

        if (index === 3) {
          return {
            ...item,
            detail: latestPayment
              ? `${latestPayment.network} settlement is linked to the operational record.`
              : `${activeMovement.label} settlement state is secured before release.`,
          };
        }

        if (index === 4) {
          return {
            ...item,
            detail: latestPayment
              ? `${latestPayment.paymentReason ?? "Payment reason"}, project, reserve state, and settlement reference linked.`
              : `${activeMovement.state}, reserve state, and payout reason linked.`,
          };
        }

        return item;
      }),
    [activeMovement, latestPayment],
  );

  useEffect(() => {
    const update = () => setLatestPayment(getLatestPaymentTransaction());

    update();
    return subscribeToLatestPaymentTransaction(update);
  }, []);

  useEffect(() => {
    setActiveProofIndex(0);
    const timers = proofSequence.slice(1).map((_, index) =>
      window.setTimeout(() => {
        setActiveProofIndex(index + 1);
      }, (index + 1) * 820),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activeMovementId, proofSequence]);

  return (
    <AppShell>
      <div className="relative text-white">
        <div className="pointer-events-none absolute inset-x-[-2rem] top-[-1rem] h-80 rounded-[36px] bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.20),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.16),transparent_24%)]" />

        <div className="relative flex flex-col space-y-5 md:space-y-6">
          <section className="zila-unified-panel-soft relative overflow-hidden rounded-[26px] p-4 md:p-4.5 lg:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_78%_10%,rgba(103,232,249,0.14),transparent_28%)]" />
            <div className="pointer-events-none absolute left-[8%] right-[8%] top-[45%] hidden h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(126,231,246,0.34),rgba(255,255,255,0))] md:block" />
            <div className="pointer-events-none absolute bottom-[18%] left-[16%] right-[18%] hidden h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(217,255,87,0.22),rgba(255,255,255,0))] lg:block" />

            <div className="relative z-10">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 md:mb-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Payments</p>
                  <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.45] text-[#D7E3F8] md:text-[14px] md:leading-[1.55]">
                    Coordinate supplier payouts, reserves, and settlement across connected rails.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/24 bg-[#D9FF57]/12 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4] md:px-3 md:py-2 md:text-[11px] md:tracking-[0.14em]">
                  <span className="zila-live-dot h-2 w-2 rounded-full bg-[#D9FF57]" />
                  System Active
                </span>
              </div>

              <div className="mb-4 md:hidden">
                <PaymentsActionPanel />
              </div>

              <div className="mb-5 hidden gap-2 md:grid lg:grid-cols-4">
                {liveOperationalInsights.map((insight, index) => (
                  <div key={insight} className={`rounded-[16px] border px-4 py-3 text-[12px] font-medium leading-[1.45] text-[#E7EEFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-200 hover:border-white/18 hover:bg-white/[0.085] ${
                    latestPayment && index === 0 ? "zila-recalc-pulse border-[#D9FF57]/20 bg-[#D9FF57]/[0.07]" : "border-white/12 bg-white/[0.065]"
                  }`}>
                    {insight}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(320px,1.1fr)_minmax(220px,0.72fr)_minmax(220px,0.72fr)]">
                <section className="rounded-[30px] border border-white/30 bg-[linear-gradient(180deg,rgba(28,73,121,0.96),rgba(13,35,68,0.98))] p-4 shadow-[0_24px_56px_rgba(13,35,68,0.30),inset_0_1px_0_rgba(255,255,255,0.16)] md:p-6">
                  <div className="flex items-start gap-3">
                    <IconTile size="md" glow="cyan" className="flex-shrink-0 border-white/12 bg-white/10 text-white/95">
                      <WalletCards className="h-[18px] w-[18px]" strokeWidth={2} />
                    </IconTile>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Available Across Rails</p>
                      <div className="relative mt-3.5">
                        <div className="absolute left-[-1.5rem] top-1/2 h-24 w-52 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.22),rgba(59,130,246,0.14)_42%,rgba(59,130,246,0)_74%)] blur-2xl opacity-80" />
                        <CurrencyAmount
                          amount={overview.totalAvailable}
                          primaryClassName="relative text-[36px] md:text-[46px] font-semibold leading-none tracking-[-0.075em] text-transparent bg-[linear-gradient(90deg,#7EE7F6_0%,#67E8F9_34%,#93C5FD_68%,#C4B5FD_100%)] bg-clip-text [text-shadow:0_0_24px_rgba(34,211,238,0.14)]"
                          secondaryClassName="mt-2 text-[14px] font-medium tracking-[0.02em] text-[#9EC5E8]"
                        />
                      </div>
                      <p className="mt-3 text-[14px] leading-relaxed text-[#CBD5E1]">Total operational liquidity visible across connected money rails.</p>
                      <p className="mt-2 text-[12px] text-[#89A3C6]">{getFxHelperText()}</p>
                    </div>
                  </div>
                </section>

                <div className="rounded-[24px] border border-white/46 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(220,232,255,0.42))] p-4 text-[#17345F] shadow-[0_18px_42px_rgba(31,68,116,0.16),inset_0_1px_0_rgba(255,255,255,0.60)]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] border border-white/70 bg-white/58 text-[#1D4ED8]">
                      <GitBranch className="h-[16px] w-[16px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#245C93]">Money Protected</p>
                      <p className="mt-1 text-[15px] font-semibold">{latestPayment ? "Protected after payout" : "Protected before payout"}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#BBD2EA]/72">
                    <div className="h-full w-[58%] rounded-full bg-[linear-gradient(90deg,#67E8F9,#D9FF57)]" />
                  </div>
                  <p className="mt-3 text-[12px] leading-[1.55] text-[#4F6688]">
                    {latestPayment
                      ? `${latestPayment.reserveAfter ?? "$24,220"} remains protected after ${latestPayment.recipientName ?? "supplier"} settled.`
                      : "$24,220 held aside before any payout is released."}
                  </p>
                </div>

                <div className="rounded-[22px] border border-cyan-200/28 bg-[linear-gradient(180deg,rgba(23,61,109,0.78),rgba(16,42,79,0.90))] p-4 shadow-[0_18px_38px_rgba(13,35,68,0.22),inset_0_1px_0_rgba(255,255,255,0.10)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">{latestPayment ? "Completed Movement" : "Upcoming Movement"}</p>
                    <Route className="h-4 w-4 text-[#7EE7F6]" strokeWidth={2} />
                  </div>
                  <p className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white">{latestPayment?.amountLabel ?? "$4,300"}</p>
                  <p className="mt-1 text-[12px] text-[#C9D4F5]">
                    {latestPayment
                      ? `${latestPayment.recipientName ?? "Supplier"} settled. Runway ${latestPayment.runwayAfter ?? "recalculated"} and proof synced.`
                      : "Stablecoin wallet to supplier payout. Record ready."}
                  </p>
                </div>
              </div>

              <div className="my-7 hidden md:block md:my-8">
                <PaymentsActionPanel />
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_286px]">
                <div className="relative overflow-hidden rounded-[30px] border border-white/18 bg-[linear-gradient(135deg,rgba(9,25,50,0.80),rgba(23,61,109,0.74)_48%,rgba(16,42,79,0.92))] p-5 shadow-[0_24px_52px_rgba(13,35,68,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
                  <div className="pointer-events-none absolute inset-x-8 top-[7.7rem] hidden h-px bg-[linear-gradient(90deg,rgba(126,231,246,0),rgba(126,231,246,0.38),rgba(217,255,87,0.34),rgba(126,231,246,0))] md:block" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Payment Flow</p>
                      <p className="mt-2 max-w-[560px] text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white">Project pressure becomes payment movement.</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#EAF1FF]">
                      <Activity className="zila-live-dot h-[13px] w-[13px] text-[#D9FF57]" strokeWidth={2} />
                      Live
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {liveMovements.map((movement) => {
                      const isActiveMovement = movement.id === activeMovementId;

                      return (
                      <button
                        key={movement.id}
                        type="button"
                        onClick={() => setActiveMovementId(movement.id)}
                        onMouseEnter={() => setActiveMovementId(movement.id)}
                        className={`group relative w-full rounded-[24px] border p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/18 hover:bg-white/[0.07] hover:shadow-[0_18px_34px_rgba(13,35,68,0.18),0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.10)] ${
                          isActiveMovement
                            ? "border-[#D9FF57]/18 bg-[#D9FF57]/[0.055] shadow-[0_0_24px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.09)]"
                            : "border-white/10 bg-white/[0.045]"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-[15px] font-semibold text-white">{movement.label}</p>
                            <p className="mt-2 text-[12px] text-[#AFC0DD]">{movement.state}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[20px] font-semibold tracking-[-0.04em] text-white">{movement.amount}</p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D9FF57]">{movement.proof}</p>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-2.5">
                          {movement.path.map((step, index) => (
                            <div key={`${movement.id}-${step}`} className="flex items-center gap-2">
                              <span className="rounded-full border border-white/12 bg-[#102A4F]/76 px-3 py-2 text-[12px] font-semibold text-[#F4FBFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">{step}</span>
                              {index < movement.path.length - 1 ? (
                                <span className="zila-flow-line relative h-px w-10 overflow-hidden rounded-full bg-white/14 md:w-16">
                                  <span className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(126,231,246,0),rgba(217,255,87,0.95))]" />
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 rounded-[16px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.055] px-4 py-3 opacity-90 transition duration-200 group-hover:border-[#D9FF57]/18 group-hover:bg-[#D9FF57]/[0.075]">
                          <p className="text-[11px] font-medium leading-[1.45] text-[#E7F5C3]">{movement.insight}</p>
                        </div>
                        <div className="grid max-h-0 gap-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-4 group-hover:max-h-32 group-hover:opacity-100 sm:grid-cols-3">
                          {movement.details.map((detail) => (
                            <div key={detail} className="rounded-[14px] border border-white/8 bg-[#102A4F]/40 px-3 py-2">
                              <p className="text-[11px] leading-[1.45] text-[#C9D4F5]">{detail}</p>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                    })}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-[#D9FF57]/18 bg-[radial-gradient(circle_at_28%_0%,rgba(217,255,87,0.12),transparent_30%),linear-gradient(180deg,rgba(16,42,79,0.82),rgba(9,25,50,0.92))] p-5 shadow-[0_20px_44px_rgba(13,35,68,0.22),0_0_24px_rgba(217,255,87,0.06),inset_0_1px_0_rgba(255,255,255,0.10)] md:p-6">
                  <div className="pointer-events-none absolute inset-x-6 top-[4.8rem] h-px bg-[linear-gradient(90deg,rgba(217,255,87,0),rgba(217,255,87,0.24),rgba(126,231,246,0.18),rgba(217,255,87,0))]" />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] border border-[#D9FF57]/24 bg-[#D9FF57]/14 text-[#EAFFB4]">
                        <Workflow className="h-[16px] w-[16px]" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Live Proof Stream</p>
                        <p className="mt-1 text-[15px] font-semibold text-white">Operational verification</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
                      <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
                      Live
                    </span>
                  </div>

                  <div className="mt-5 rounded-[18px] border border-white/8 bg-white/[0.035] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB3D9]">Tracking</p>
                    <p className="mt-1 text-[12px] font-semibold text-white">
                      {latestPayment ? `${latestPayment.projectName} payout consequence` : activeMovement.label}
                    </p>
                  </div>

                  <div className="relative mt-6 space-y-1 before:absolute before:bottom-3 before:left-[4.1rem] before:top-3 before:w-px before:bg-[linear-gradient(180deg,rgba(217,255,87,0.34),rgba(126,231,246,0.16),rgba(217,255,87,0))]">
                    {proofSequence.map((item, index) => {
                      const isComplete = index < activeProofIndex;
                      const isActive = index === activeProofIndex;
                      const isPending = index > activeProofIndex;

                      return (
                      <div
                        key={`${activeMovementId}-${item.event}`}
                        className={`zila-proof-entry group grid grid-cols-[4rem_1fr] gap-3 py-2.5 transition duration-500 hover:translate-x-0.5 ${
                          isPending ? "translate-y-1 opacity-[0.42]" : "translate-y-0 opacity-100"
                        }`}
                        style={{ animationDelay: `${index * 130}ms` }}
                      >
                        <p className={`pt-1 text-[10px] font-semibold transition duration-300 ${isPending ? "text-[#667A9F]" : "text-[#AFC0DD]"}`}>{item.time}</p>
                        <div
                          className={`relative rounded-[16px] border px-3 py-3 transition duration-300 group-hover:border-[#D9FF57]/16 group-hover:bg-white/[0.055] ${
                            isActive
                              ? "zila-proof-active border-[#D9FF57]/22 bg-[#D9FF57]/[0.07]"
                              : isComplete
                                ? "border-white/8 bg-white/[0.035]"
                                : "border-white/6 bg-white/[0.02]"
                          }`}
                        >
                          <span
                            className={`absolute left-[-0.95rem] top-4 h-2 w-2 rounded-full ${
                              isActive ? "zila-live-dot bg-[#D9FF57]" : isComplete ? "bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.24)]" : "bg-[#506A8E]"
                            }`}
                          />
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[12px] font-semibold ${isPending ? "text-[#8EA2C5]" : "text-white"}`}>{item.event}</p>
                            <BadgeCheck className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isPending ? "text-[#506A8E]" : "text-[#D9FF57]"}`} strokeWidth={2} />
                          </div>
                          <p className="mt-1 text-[11px] leading-[1.45] text-[#AFC0DD]">{item.detail}</p>
                          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#D9FF57]">{item.source}</p>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                  <Link
                    href="/proof"
                    className="mt-5 flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/[0.035] px-3.5 py-3 text-[12px] font-semibold text-[#E7EEFF] transition duration-300 hover:-translate-y-0.5 hover:border-[#D9FF57]/18 hover:bg-[#D9FF57]/[0.065]"
                  >
                    <span>{latestPayment ? "Open generated proof record" : "View operational proof history"}</span>
                    <BadgeCheck className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="zila-unified-panel-soft relative overflow-hidden rounded-[28px] p-5 md:p-6">
            <div className="pointer-events-none absolute inset-x-8 top-[45%] hidden h-px bg-[linear-gradient(90deg,rgba(126,231,246,0),rgba(126,231,246,0.20),rgba(217,255,87,0.16),rgba(126,231,246,0))] lg:block" />
            <div className="pointer-events-none absolute inset-y-8 left-[58%] hidden w-px bg-[linear-gradient(180deg,rgba(126,231,246,0),rgba(126,231,246,0.14),rgba(217,255,87,0.12),rgba(126,231,246,0))] lg:block" />
            <div className="relative grid gap-9 md:grid-cols-[minmax(0,1.24fr)_minmax(320px,0.76fr)] md:items-start lg:gap-11">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <IconTile glow="cyan" className="bg-white/6 text-[#DCE8F8]">
                        <Network className="h-3.5 w-3.5" strokeWidth={2} />
                      </IconTile>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Connected Rails</p>
                    </div>
                    <p className="mt-3 max-w-[620px] text-[15px] leading-[1.65] text-[#D7E3F8]">
                      Connect bank, mobile money, and XRPL/Xaman so supplier payouts, reserves, and proof stay coordinated.
                    </p>
                  </div>
                  <Link href="/payments/connect-account" className="inline-flex h-11 items-center justify-center rounded-[16px] border border-white/14 bg-white/8 px-4 text-[13px] font-semibold text-[#EAF1FF] transition hover:bg-white/12">
                    Connect money
                  </Link>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {connectedRails.map((rail) => {
                    const RailIcon = rail.icon;
                    return (
                      <div key={rail.id} className="group rounded-[20px] border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.055]">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.06] transition group-hover:scale-[1.03] ${rail.tone}`}>
                            <RailIcon className="h-[14px] w-[14px]" strokeWidth={2} />
                          </span>
                          <span className="inline-flex h-10 min-w-[82px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-[#102A4F]/56 px-3 text-center text-[9px] font-semibold uppercase leading-none tracking-[0.1em] text-[#C9D4F5] sm:min-w-[90px] sm:text-[10px] sm:tracking-[0.12em]">
                            {rail.status}
                          </span>
                        </div>
                        <p className="mt-3 text-[13px] font-semibold text-white">{rail.label}</p>
                        <p className="mt-1 text-[12px] text-[#AFC0DD]">{rail.detail}</p>
                        <p className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-white">{rail.amount}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_24%_0%,rgba(126,231,246,0.08),transparent_30%),rgba(16,42,79,0.28)] p-5 md:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Live Rail Topology</p>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
                      <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
                      Routes Open
                    </span>
                  </div>
                  <div className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-[24px] border border-white/6 bg-white/[0.025] p-4 md:p-5">
                    <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-[linear-gradient(90deg,rgba(126,231,246,0),rgba(126,231,246,0.20),rgba(217,255,87,0.18),rgba(126,231,246,0))]" />
                    {["Bank", "Stablecoin", "Mobile Money", "Protected Reserve"].map((rail, index) => {
                      const isActiveRail =
                        activeTopologyLabels.includes(rail.toLowerCase()) ||
                        (rail === "Stablecoin" && activeTopologyLabels.includes("xrpl")) ||
                        (rail === "Mobile Money" && activeTopologyLabels.includes("mobile money"));

                      return (
                      <div key={rail} className="relative z-10 flex items-center gap-2">
                        <span className={`relative rounded-full border px-4 py-2.5 text-[12px] font-semibold text-[#F4FBFF] shadow-[0_0_20px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:border-cyan-200/22 hover:shadow-[0_0_24px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] ${
                          isActiveRail ? "zila-rail-node-active border-[#D9FF57]/28 bg-[#16365F]" : "border-white/12 bg-[#102A4F]/88"
                        }`}>
                          <span className="zila-live-dot absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
                          {rail}
                        </span>
                        {index < 3 ? (
                          <span className="zila-flow-line relative h-px w-14 overflow-hidden rounded-full bg-white/14 md:w-24">
                            <span className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(126,231,246,0),rgba(217,255,87,0.95))]" />
                          </span>
                        ) : null}
                      </div>
                    );
                    })}
                  </div>
                </div>

                <div className="mt-8 rounded-[26px] border border-white/6 bg-white/[0.025] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Ways To Move Money</p>
                      <p className="mt-2 text-[14px] leading-[1.55] text-[#D7E3F8]">Choose the right rail for each obligation while Zila protects reserves and records proof.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {movementCapabilities.map((option) => (
                        <span key={option} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-semibold text-[#D7E3F8]">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-7">
              <section className="rounded-[28px] border border-white/9 bg-[linear-gradient(180deg,rgba(16,42,79,0.56),rgba(9,25,50,0.62))] p-6 shadow-[0_18px_38px_rgba(13,35,68,0.14),inset_0_1px_0_rgba(255,255,255,0.07)]">
                <div className="flex items-center gap-3">
                  <IconTile glow="mint" className="border-[#D9FF57]/22 bg-[#D9FF57]/14 text-[#EAFFB4]">
                    <FileCheck2 className="h-[14px] w-[14px]" strokeWidth={2} />
                  </IconTile>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">What Needs Action</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">Upcoming Movement</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[20px] border border-white/9 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFDDA0]">Payouts Queued</p>
                    <div className="mt-2">
                      <CurrencyAmount
                        amount={overview.commitmentsThisWeek}
                        primaryClassName="text-[30px] font-semibold tracking-[-0.05em] text-white"
                        secondaryClassName="mt-1 text-[12px] font-medium text-[#F4CD93]"
                      />
                    </div>
                    <p className="mt-1 text-[13px] text-[#FCE6BE]">Ready for bank, mobile money, or stablecoin routing.</p>
                  </div>

                  {overview.needsAttention ? (
                    <Link href="/projects/harbour-road" className="block rounded-[20px] border border-orange-300/16 bg-[linear-gradient(180deg,rgba(251,146,60,0.14),rgba(244,63,94,0.07))] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-orange-200/30">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFD39A]">Needs Action</p>
                      <p className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-white">{overview.needsAttention.project}</p>
                      <p className="mt-1 text-[14px] leading-[1.55] text-[#FFE1C4]">{overview.needsAttention.detail}</p>
                    </Link>
                  ) : null}

                  <div className="rounded-[20px] border border-white/9 bg-white/[0.04] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9F8FF]">Payment Checks</p>
                    <div className="mt-3 space-y-2">
                      {[
                        latestPayment ? "Payout synced" : "Source selected",
                        "Amount verified",
                        latestPayment ? "Proof generated" : "Project updated",
                      ].map((item) => (
                        <div key={item} className="flex items-center justify-between gap-3">
                          <span className="text-[12px] text-[#D7E3F8]">{item}</span>
                          <BadgeCheck className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/7 bg-white/[0.025] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Latest Movement</h2>
                <div className="relative mt-5 space-y-0 before:absolute before:bottom-2 before:left-[4.15rem] before:top-2 before:w-px before:bg-[linear-gradient(180deg,rgba(126,231,246,0.18),rgba(217,255,87,0.14),rgba(126,231,246,0))]">
                  {liveRecentOperations.map((operation) => (
                    <div key={operation.label} className="grid grid-cols-[4rem_1fr] gap-4 py-3.5 transition duration-300 hover:translate-x-0.5">
                      <p className="pt-0.5 text-[11px] font-semibold text-[#AFC0DD]">{operation.time}</p>
                      <div className="relative rounded-[18px] border border-white/6 bg-white/[0.025] px-4 py-3.5 transition duration-300 hover:border-white/12 hover:bg-white/[0.045]">
                        <span className="zila-live-dot absolute left-[-1.1rem] top-4 h-2 w-2 rounded-full bg-[#D9FF57]" />
                        <p className="text-[13px] font-semibold text-white">{operation.label}</p>
                        <p className="mt-1 text-[12px] leading-[1.45] text-[#AFC0DD]">{operation.detail}</p>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D9FF57]">{operation.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
