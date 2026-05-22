"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  CheckCheck,
  CircleDollarSign,
  Copy,
  FileOutput,
  ReceiptText,
  Route,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import type { ProofOverview, ProofTimelineItem } from "@/data/proof";

type ProofEventTone = "lime" | "cyan" | "violet" | "amber" | "blue";

interface MemoryEvent {
  item: ProofTimelineItem;
  title: string;
  description: string;
  intelligence: string;
  tone: ProofEventTone;
  scale: "expanded" | "standard" | "quiet";
}

interface ProofReport {
  title: string;
  summary: string;
  generated: string;
  primaryMetric: string;
  secondaryMetric: string;
  audience: string;
  tone: ProofEventTone;
  icon: LucideIcon;
  signals: string[];
  featured?: boolean;
}

const proofReports: ProofReport[] = [
  {
    title: "Operational Trust Summary",
    summary: "Investor-ready evidence of commitments, payments, reserves, pressure, and recovery.",
    generated: "Generated 2 minutes ago",
    primaryMetric: "31 operational events recorded",
    secondaryMetric: "92% commitments fulfilled",
    audience: "Investors and lenders",
    tone: "lime",
    icon: ShieldCheck,
    signals: ["6 reserves protected", "14 supplier payouts verified", "12 runway recalculations tracked", "4 payment rails coordinated"],
    featured: true,
  },
  {
    title: "Supplier Payments Report",
    summary: "Tracks delayed payouts, supplier timing, and active obligations.",
    generated: "Synced just now",
    primaryMetric: "14 supplier payouts verified",
    secondaryMetric: "3 delayed payments flagged",
    audience: "Operations teams",
    tone: "amber",
    icon: ReceiptText,
    signals: ["Supplier timing", "Active obligations", "Payout delays"],
  },
  {
    title: "Cash Pressure Report",
    summary: "Highlights periods where reserves tightened or payment timing became risky.",
    generated: "Pressure history updated",
    primaryMetric: "4 cash pressure periods detected",
    secondaryMetric: "2 payout timing risks flagged",
    audience: "Finance teams",
    tone: "blue",
    icon: Sparkles,
    signals: ["Reserve tightening", "Payment timing risk", "Recovery windows"],
  },
  {
    title: "Reserve & Treasury Report",
    summary: "Tracks reserves, runway shifts, and funding movement.",
    generated: "Generated from treasury memory",
    primaryMetric: "12 reserve movements tracked",
    secondaryMetric: "6 reserves protected",
    audience: "Lenders and investors",
    tone: "violet",
    icon: Route,
    signals: ["Reserve movement", "Runway shifts", "Funding movement"],
  },
  {
    title: "Commitment Tracking Report",
    summary: "Shows whether supplier, staffing, and project commitments were met on time.",
    generated: "Commitment history refreshed",
    primaryMetric: "92% commitments fulfilled",
    secondaryMetric: "18 active obligations tracked",
    audience: "Partners and suppliers",
    tone: "lime",
    icon: BadgeCheck,
    signals: ["Commitments met", "Late obligations", "Payout consistency"],
  },
  {
    title: "Business Stability Report",
    summary: "Shows stable operating windows, recovery behavior, and delivery consistency.",
    generated: "Stability record synced",
    primaryMetric: "3 recovery windows recorded",
    secondaryMetric: "12 runway recalculations tracked",
    audience: "Investors and grant providers",
    tone: "cyan",
    icon: WalletCards,
    signals: ["Stable windows", "Runway updates", "Delivery consistency"],
  },
  {
    title: "Operational Timeline Report",
    summary: "A verified record of payouts, reserves, invoices, and operational changes.",
    generated: "Built from operational memory",
    primaryMetric: "31 operational events recorded",
    secondaryMetric: "8 proof records synced",
    audience: "Internal operations",
    tone: "blue",
    icon: FileOutput,
    signals: ["Verified history", "Payment records", "Reserve updates"],
  },
];

const toneClasses: Record<ProofEventTone, { dot: string; panel: string; text: string; glow: string }> = {
  lime: {
    dot: "bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.24)]",
    panel: "border-[#D9FF57]/18 bg-[#D9FF57]/[0.055]",
    text: "text-[#EAFFB4]",
    glow: "rgba(217,255,87,0.14)",
  },
  cyan: {
    dot: "bg-[#67E8F9] shadow-[0_0_14px_rgba(103,232,249,0.22)]",
    panel: "border-[#67E8F9]/18 bg-[#67E8F9]/[0.065]",
    text: "text-[#DDFBFF]",
    glow: "rgba(103,232,249,0.14)",
  },
  violet: {
    dot: "bg-[#A78BFA] shadow-[0_0_14px_rgba(167,139,250,0.20)]",
    panel: "border-[#A78BFA]/18 bg-[#A78BFA]/[0.065]",
    text: "text-[#E9DDFF]",
    glow: "rgba(167,139,250,0.13)",
  },
  amber: {
    dot: "bg-[#FBBF24] shadow-[0_0_14px_rgba(251,191,36,0.18)]",
    panel: "border-[#FBBF24]/16 bg-[#FBBF24]/[0.055]",
    text: "text-[#FFE6B6]",
    glow: "rgba(251,191,36,0.12)",
  },
  blue: {
    dot: "bg-[#7BA7FF] shadow-[0_0_14px_rgba(123,167,255,0.18)]",
    panel: "border-[#7BA7FF]/16 bg-[#7BA7FF]/[0.055]",
    text: "text-[#D7E3FF]",
    glow: "rgba(123,167,255,0.12)",
  },
};

function getEventIcon(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("reserve")) return ShieldCheck;
  if (normalized.includes("payment") || normalized.includes("payout")) return CircleDollarSign;
  if (normalized.includes("invoice")) return ReceiptText;
  if (normalized.includes("stablecoin") || normalized.includes("xrpl")) return WalletCards;
  if (normalized.includes("funding") || normalized.includes("treasury")) return Route;
  return BadgeCheck;
}

function buildMemoryEvent(item: ProofTimelineItem, index: number): MemoryEvent {
  const source = `${item.action} ${item.context} ${item.summary}`.toLowerCase();
  const tone: ProofEventTone = source.includes("reserve")
    ? "lime"
    : source.includes("invoice")
      ? "amber"
      : source.includes("payment")
        ? "cyan"
        : source.includes("funding") || source.includes("move")
          ? "violet"
          : "blue";

  const title = source.includes("reserve")
    ? "Reserve protected after operational movement"
    : source.includes("invoice")
      ? "Invoice detected and structured"
      : source.includes("payment")
        ? "Payment synced and verified"
        : source.includes("funding") || source.includes("move")
          ? "Treasury recalculated runway"
          : item.action;

  const intelligence = source.includes("reserve")
    ? "Protected money remains visible in operational history."
    : source.includes("invoice")
      ? "Commitment recorded before pressure reaches the project."
      : source.includes("payment")
        ? "Proof record connects payment, project state, and supplier context."
        : source.includes("funding") || source.includes("move")
          ? "Zila preserved the recommendation with the operating state that created it."
          : "Operational state recorded with verification context.";

  return {
    item,
    title,
    description: item.summary || item.context,
    intelligence,
    tone,
    scale: index === 0 ? "expanded" : index % 3 === 0 ? "quiet" : "standard",
  };
}

function useCopyReference(reference: string) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return { copied, copy };
}

function MemoryTimelineEvent({
  event,
  selected,
  onSelect,
  index,
}: {
  event: MemoryEvent;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const Icon = getEventIcon(event.title);
  const tone = toneClasses[event.tone];
  const expanded = event.scale === "expanded" || selected;
  const quiet = event.scale === "quiet" && !selected;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`zila-proof-memory-event group relative grid w-full grid-cols-[2.5rem_minmax(0,1fr)] gap-3.5 text-left transition duration-500 hover:translate-x-1 ${
        quiet ? "py-2.5" : "py-4"
      }`}
      style={{ animationDelay: `${index * 95}ms` }}
    >
      <div className="relative flex justify-center">
        <span className={`mt-2 inline-flex h-4 w-4 rounded-full border border-white/40 ${tone.dot}`} />
        <span className="absolute top-8 h-[calc(100%+1.2rem)] w-px bg-[linear-gradient(180deg,rgba(215,232,255,0.28),rgba(103,232,249,0.12),rgba(215,232,255,0))]" />
      </div>

      <div
        className={`relative overflow-hidden rounded-[28px] border transition duration-500 ${
          selected
            ? `${tone.panel}`
            : quiet
              ? "border-white/8 bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "border-white/10 bg-[linear-gradient(180deg,rgba(18,42,76,0.52),rgba(7,21,38,0.62))] shadow-[0_18px_48px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/18 hover:bg-white/[0.055]"
        } ${expanded ? "p-4.5 md:p-5" : "p-3.5"}`}
        style={
          selected
            ? {
                boxShadow: `0 24px 58px rgba(0,0,0,0.24), 0 0 22px ${tone.glow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
              }
            : undefined
        }
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(115deg,rgba(103,232,249,0.04),transparent_46%)] opacity-80" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border ${tone.panel} ${tone.text}`}>
                <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#91A6C8]">
                  {event.item.day} · {event.item.timestamp}
                </p>
                <h3 className={`mt-1.5 font-semibold leading-[1.12] tracking-[-0.045em] text-white ${expanded ? "text-[22px]" : "text-[17px]"}`}>
                  {event.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-[#C9D6EA]">{event.item.context}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${tone.panel} ${tone.text}`}>
              <CheckCheck className="h-[12px] w-[12px]" strokeWidth={2} />
              Verified
            </span>
          </div>

          {expanded ? (
            <div className="zila-proof-memory-detail mt-4 grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_200px]">
              <div className="rounded-[20px] border border-white/8 bg-[#071526]/38 px-4 py-4">
                <p className="text-[13px] leading-[1.75] text-[#D7E3F8]">{event.description}</p>
                <p className={`mt-3 text-[13px] font-semibold leading-[1.55] ${tone.text}`}>{event.intelligence}</p>
              </div>
              <div className="grid gap-2 text-[12px]">
                <div className="rounded-[16px] border border-white/8 bg-white/[0.04] px-3 py-2.5">
                  <p className="uppercase tracking-[0.14em] text-[#7F91AF]">Project</p>
                  <p className="mt-1 font-semibold text-[#EAF1FF]">{event.item.project}</p>
                </div>
                <div className="rounded-[16px] border border-white/8 bg-white/[0.04] px-3 py-2.5">
                  <p className="uppercase tracking-[0.14em] text-[#7F91AF]">State shift</p>
                  <p className="mt-1 font-semibold text-[#EAF1FF]">{event.item.after ?? event.item.before ?? "Recorded"}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function VerificationRail({ overview, selected }: { overview: ProofOverview; selected: ProofTimelineItem }) {
  const reference = selected.txid ?? selected.xrplReference;
  const { copied, copy } = useCopyReference(reference);
  const indicators = [
    ["Sync", overview.operationsStatus],
    ["Reserve records", "Protected"],
    ["Verification", "XRPL linked"],
  ];

  return (
    <aside className="sticky top-5 space-y-3">
      <section className="relative overflow-hidden rounded-[24px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(12,28,52,0.58),rgba(5,14,28,0.74))] p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.055)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.06),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(217,255,87,0.04),transparent_22%)]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Verification</p>
              <h2 className="mt-1.5 text-[18px] font-semibold tracking-[-0.04em] text-white">Current record</h2>
            </div>
            <span className="zila-live-dot inline-flex h-2.5 w-2.5 rounded-full bg-[#D9FF57]" />
          </div>

          <div className="mt-3 rounded-[18px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.04] px-3 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-[16px] w-[16px] text-[#EAFFB4]" strokeWidth={2} />
              <div>
                <p className="text-[12px] font-semibold text-[#F1FFB8]">{overview.statusTitle}</p>
                <p className="mt-1 text-[11px] leading-[1.55] text-[#C9D6EA]">Synced {overview.lastUpdate}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {indicators.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-2 last:border-b-0 last:pb-0">
                <p className="text-[11px] font-medium text-[#9FB3D9]">{label}</p>
                <p className="max-w-[150px] text-right text-[11px] font-semibold text-[#EAF1FF]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[22px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(17,38,70,0.48),rgba(7,21,38,0.62))] p-3.5 shadow-[0_14px_38px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.055)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#91A6C8]">Selected proof record</p>
        <h3 className="mt-2 text-[16px] font-semibold tracking-[-0.035em] text-white">{selected.action}</h3>
        <p className="mt-1.5 text-[12px] leading-[1.6] text-[#B9C8DF]">{selected.project} · {selected.timestamp}</p>
        <div className="mt-3 rounded-[15px] border border-white/[0.06] bg-[#06101F]/46 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F91AF]">Proof ID</p>
          <p className="mt-2 break-all font-mono text-[11px] leading-[1.55] text-[#D7E3F8]">{reference}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button type="button" onClick={copy} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.09]">
            <Copy className="h-[13px] w-[13px]" strokeWidth={2} />
            {copied ? "Copied" : "Copy"}
          </button>
          <Link href={selected.xrplExplorerUrl ?? "#"} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 text-[12px] font-semibold text-[#EAFFB4] transition hover:bg-[#D9FF57]/[0.10]">
            View
            <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
          </Link>
          <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 text-[12px] font-semibold text-[#D7E3F8] transition hover:bg-white/[0.08]">
            <FileOutput className="h-[13px] w-[13px]" strokeWidth={2} />
            Export
          </button>
        </div>
      </section>
    </aside>
  );
}

function ProofReportCard({ report, index }: { report: ProofReport; index: number }) {
  const tone = toneClasses[report.tone];
  const Icon = report.icon;
  const featured = Boolean(report.featured);

  return (
    <article
      className={`zila-proof-report-card group relative overflow-hidden border transition duration-500 hover:-translate-y-1 ${tone.panel} ${
        featured ? "rounded-[34px] p-6 lg:min-h-[350px]" : "rounded-[24px] p-4"
      }`}
      style={{
        animationDelay: `${index * 90}ms`,
        boxShadow: featured
          ? `0 34px 92px rgba(0,0,0,0.34), 0 0 42px ${tone.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 18px 44px rgba(0,0,0,0.18), 0 0 18px ${tone.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.10),transparent_26%),linear-gradient(135deg,rgba(103,232,249,0.05),transparent_46%,rgba(217,255,87,0.035))]" />
      <div className="pointer-events-none absolute right-5 top-5 h-20 w-28 rounded-full bg-white/[0.035] blur-2xl transition duration-500 group-hover:bg-white/[0.06]" />
      {featured ? (
        <div className="pointer-events-none absolute bottom-6 right-6 hidden h-44 w-56 rounded-full border border-[#D9FF57]/12 bg-[radial-gradient(circle,rgba(217,255,87,0.08),transparent_68%)] lg:block" />
      ) : null}

      <div className="relative h-full">
        <div>
          <div className="flex items-start justify-between gap-4">
            <span className={`inline-flex items-center justify-center border ${tone.panel} ${tone.text} ${featured ? "h-13 w-13 rounded-[18px]" : "h-10 w-10 rounded-[15px]"}`}>
              <Icon className={featured ? "h-[20px] w-[20px]" : "h-[16px] w-[16px]"} strokeWidth={2} />
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#EAFFB4]">
              <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
              {featured ? "Flagship" : "Ready"}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#91A6C8]">{report.generated}</p>
            <h3 className={`mt-2 font-semibold leading-[1.06] tracking-[-0.055em] text-white ${featured ? "text-[34px]" : "text-[21px]"}`}>{report.title}</h3>
            <p className={`mt-3 leading-[1.62] text-[#C9D6EA] ${featured ? "max-w-[560px] text-[14px]" : "text-[12px]"}`}>{report.summary}</p>
          </div>

          <div className={`mt-5 overflow-hidden border border-white/8 bg-[#06101F]/42 ${featured ? "rounded-[24px] p-4" : "rounded-[18px] p-3"}`}>
            <div className={`${featured ? "flex items-end justify-between gap-4" : "space-y-3"}`}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F91AF]">Verified behavior</p>
                <p className={`mt-1.5 font-semibold text-[#EAF1FF] ${featured ? "text-[16px]" : "text-[13px]"}`}>{report.primaryMetric}</p>
              </div>
              <div className={featured ? "text-right" : ""}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F91AF]">Evidence</p>
                <p className={`mt-1.5 font-semibold ${tone.text} ${featured ? "text-[16px]" : "text-[13px]"}`}>{report.secondaryMetric}</p>
              </div>
            </div>
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/8">
              <span className="w-[44%] rounded-full bg-[#D9FF57]" />
              <span className="ml-1 w-[28%] rounded-full bg-[#67E8F9]" />
              <span className="ml-1 flex-1 rounded-full bg-[#A78BFA]" />
            </div>
          </div>

          {featured ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {report.signals.map((signal) => (
                <span key={signal} className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold text-[#D7E3F8]">
                  {signal}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <p className="text-[12px] font-semibold text-[#9FB3D9]">Built for {report.audience}</p>
            {featured ? (
              <div className="flex flex-wrap gap-2">
                {["Share secure link", "Download PDF"].map((label, actionIndex) => (
                  <button
                    key={label}
                    type="button"
                    className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[11px] font-semibold transition ${
                      actionIndex === 0
                        ? "border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] text-[#EAFFB4] hover:bg-[#D9FF57]/[0.12]"
                        : "border-white/10 bg-white/[0.045] text-[#D7E3F8] hover:bg-white/[0.08]"
                    }`}
                  >
                    {actionIndex === 0 ? <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2} /> : <ArrowDownToLine className="h-[12px] w-[12px]" strokeWidth={2} />}
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" className="inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-semibold text-[#D7E3F8] transition hover:bg-white/[0.075]">
                Open
                <ArrowUpRight className="h-[11px] w-[11px]" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

      </div>
    </article>
  );
}

function OperationalProofReports({ overview }: { overview: ProofOverview }) {
  const [activeModal, setActiveModal] = useState<"reports" | "builder" | null>(null);
  const categories = ["Payouts", "Reserves", "Invoices", "Runway shifts", "Proof sync"];
  const audiences = ["Investors", "Lenders", "Suppliers", "Grant providers", "Partners", "Internal operations"];
  const flagshipReport = proofReports.find((report) => report.featured) ?? proofReports[0];
  const supportingReports = proofReports.filter((report) =>
    ["Reserve & Treasury Report", "Commitment Tracking Report"].includes(report.title),
  );
  const hiddenReports = proofReports.filter((report) => report.title !== flagshipReport.title && !supportingReports.some((supporting) => supporting.title === report.title));

  return (
    <section className="mt-14">
      <div className="relative overflow-hidden rounded-[34px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(12,28,52,0.46),rgba(5,14,28,0.60))] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.055)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.075),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(217,255,87,0.045),transparent_24%)]" />
        <div className="relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7EE7F6]">Featured operational proof reports</p>
              <h2 className="mt-2 max-w-[620px] text-[28px] font-semibold leading-[1.05] tracking-[-0.055em] text-white md:text-[34px]">
                Reports generated from activity.
              </h2>
              <p className="mt-3 max-w-[560px] text-[13px] leading-[1.7] text-[#B9C8DF]">
                Evidence packages stay secondary to the operating record.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.055] px-3.5 py-2 text-[12px] font-semibold text-[#EAFFB4]">
              <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
              Generated from {overview.timeline.length} operational events
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.42fr)_minmax(270px,0.68fr)]">
            <ProofReportCard report={flagshipReport} index={0} />
            <div className="grid gap-4">
              {supportingReports.map((report, index) => (
                <ProofReportCard key={report.title} report={report} index={index + 1} />
              ))}

              <button
                type="button"
                onClick={() => setActiveModal("reports")}
                className="group rounded-[24px] border border-white/10 bg-white/[0.035] px-5 py-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:-translate-y-0.5 hover:border-[#D9FF57]/16 hover:bg-white/[0.055]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#91A6C8]">More evidence</p>
                    <p className="mt-2 text-[17px] font-semibold tracking-[-0.035em] text-white">View all reports</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] text-[#EAFFB4] transition group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-[15px] w-[15px]" strokeWidth={2} />
                  </span>
                </div>
                <p className="mt-3 text-[12px] leading-[1.6] text-[#9FB3D9]">
                  Supplier, rail, pressure, and staffing reports remain available on demand.
                </p>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-[26px] border border-white/[0.07] bg-[#06101F]/26 p-4.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91A6C8]">Create evidence package</p>
              <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-white">Generate operational proof package.</h3>
              <p className="mt-2 max-w-[540px] text-[13px] leading-[1.65] text-[#B9C8DF]">
                Build a shareable package from verified payments, reserves, and commitments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal("builder")}
              className="zila-operational-action-soft inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5"
            >
              Generate Proof Package
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {activeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020815]/70 px-4 py-8 backdrop-blur-xl">
          <div className="relative max-h-[calc(100vh-4rem)] w-full max-w-[860px] overflow-y-auto rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,28,52,0.96),rgba(5,14,28,0.98))] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.10)] md:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.14),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(217,255,87,0.08),transparent_24%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">
                    {activeModal === "builder" ? "Proof package builder" : "Operational reports"}
                  </p>
                  <h3 className="mt-2 text-[30px] font-semibold tracking-[-0.055em] text-white">
                    {activeModal === "builder" ? "Create operational evidence package" : "All generated proof reports"}
                  </h3>
                  <p className="mt-3 max-w-[560px] text-[13px] leading-[1.7] text-[#B9C8DF]">
                    {activeModal === "builder"
                      ? "Generated from verified timeline entries, treasury activity, payout history, and reserve behavior."
                      : "Additional evidence artifacts remain available without competing with the live memory stream."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-[#D7E3F8] transition hover:bg-white/[0.09]"
                  aria-label="Close"
                >
                  <X className="h-[16px] w-[16px]" strokeWidth={2} />
                </button>
              </div>

              {activeModal === "builder" ? (
                <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ["Project", "All active projects"],
                      ["Operating window", "Last 30 days"],
                      ["Verification depth", "Operational record + XRPL reference"],
                      ["Behavior signals", "Pressure, recovery, obligations"],
                    ].map(([label, value]) => (
                      <button key={label} type="button" className="rounded-[20px] border border-white/8 bg-white/[0.04] px-4 py-3.5 text-left transition hover:border-[#D9FF57]/16 hover:bg-white/[0.06]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F91AF]">{label}</p>
                        <p className="mt-1.5 text-[13px] font-semibold text-[#EAF1FF]">{value}</p>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-[#06101F]/42 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Audience</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {audiences.map((audience, index) => (
                        <span
                          key={audience}
                          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                            index === 0
                              ? "border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] text-[#EAFFB4]"
                              : "border-white/8 bg-white/[0.045] text-[#D7E3F8]"
                          }`}
                        >
                          {audience}
                        </span>
                      ))}
                    </div>

                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#91A6C8]">Proof categories</p>
                    <div className="mt-3 grid gap-2">
                      {categories.map((category, index) => (
                        <div key={category} className="flex items-center justify-between gap-4 rounded-[15px] border border-white/8 bg-white/[0.035] px-3 py-2.5">
                          <span className="text-[12px] font-semibold text-[#D7E3F8]">{category}</span>
                          <span className={`h-2 w-2 rounded-full ${index < 4 ? "bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.28)]" : "bg-[#67E8F9]"}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="zila-operational-action-soft inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 lg:col-span-2">
                    Generate Verification Package
                    <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="mt-7 grid gap-3">
                  {hiddenReports.map((report) => {
                    const Icon = report.icon;
                    const tone = toneClasses[report.tone];
                    return (
                      <div key={report.title} className={`rounded-[22px] border p-4 ${tone.panel}`}>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border ${tone.panel} ${tone.text}`}>
                              <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
                            </span>
                            <div>
                              <h4 className="text-[17px] font-semibold tracking-[-0.035em] text-white">{report.title}</h4>
                              <p className="mt-1.5 max-w-[520px] text-[12px] leading-[1.6] text-[#B9C8DF]">{report.summary}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-semibold text-[#EAF1FF]">{report.primaryMetric}</p>
                            <p className={`mt-1 text-[11px] font-semibold ${tone.text}`}>{report.secondaryMetric}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ProofScreenContent({ overview }: { overview: ProofOverview }) {
  const events = useMemo(() => overview.timeline.map(buildMemoryEvent), [overview.timeline]);
  const [selectedId, setSelectedId] = useState(events[0]?.item.id ?? "");
  const selected = events.find((event) => event.item.id === selectedId)?.item ?? events[0]?.item;

  if (!selected) {
    return null;
  }

  return (
    <div className="zila-proof-memory-page relative -mx-4 -mt-2 min-h-[calc(100vh-6rem)] overflow-hidden rounded-none bg-[linear-gradient(180deg,#132B4E_0%,#0B1B33_44%,#050D1A_100%)] px-4 pb-14 pt-4 text-white md:-mx-6 md:rounded-[30px] md:px-5 md:pb-8 lg:-mx-6 lg:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.18),transparent_30%),radial-gradient(circle_at_84%_4%,rgba(217,255,87,0.08),transparent_24%),radial-gradient(circle_at_58%_74%,rgba(88,80,236,0.14),transparent_32%)]" />
      <div className="zila-proof-memory-atmosphere pointer-events-none absolute left-[12%] top-[16%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.08),transparent_68%)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1180px]">
        <header className="max-w-[820px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EAFFB4]">
            <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
            Generated operational history
          </div>
          <h1 className="mt-4 max-w-[720px] text-[38px] font-semibold leading-[0.98] tracking-[-0.07em] text-white md:text-[50px]">
            Every operational move, remembered and verified.
          </h1>
          <p className="mt-4 max-w-[650px] text-[14px] leading-[1.7] text-[#B9C8DF]">
            Supplier payouts, reserves, invoices, runway shifts, and payment confirmations become verified history automatically.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#C9D6EA]">
            {[
              { label: "Projects create pressure", href: "/projects" },
              { label: "Payments coordinate obligations", href: "/payments" },
              { label: "Proof is generated" },
            ].map((item, index) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="rounded-full px-1 text-[#D7E3F8] transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[#EAFFB4]">{item.label}</span>
                )}
                {index < 2 ? <span className="text-[#7EE7F6]/60">→</span> : null}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_276px] lg:items-start">
          <main className="relative">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7EE7F6]">Operational memory</p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-white">Verified business memory</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071526]/48 px-3 py-2 text-[12px] font-semibold text-[#B9C8DF]">
                <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
                Live record
              </span>
            </div>

            <div className="space-y-1">
              {events.map((event, index) => (
                <MemoryTimelineEvent
                  key={`${event.item.id}-${index}`}
                  event={event}
                  selected={event.item.id === selected.id}
                  index={index}
                  onSelect={() => setSelectedId(event.item.id)}
                />
              ))}
            </div>
          </main>

          <VerificationRail overview={overview} selected={selected} />
        </div>

        <OperationalProofReports overview={overview} />
      </div>
    </div>
  );
}

export default ProofScreenContent;
