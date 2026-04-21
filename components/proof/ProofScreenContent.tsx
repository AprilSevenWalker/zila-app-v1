"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  FileOutput,
  ShieldCheck,
} from "lucide-react";
import type { ProofOverview, ProofTimelineItem } from "@/data/proof";
import { IconTile } from "@/components/ui/IconTile";

type FeatureIconTone = "proof" | "cashflow" | "health" | "export";

function FeatureIconContainer({
  tone,
  size = "md",
  children,
}: {
  tone: FeatureIconTone;
  size?: "sm" | "md";
  children: ReactNode;
}) {
  const sizeClass = size === "sm" ? "h-10 w-10 rounded-[14px]" : "h-12 w-12 rounded-[16px]";

  const toneClasses = {
    proof: {
      shell:
        "border-[#A78BFA]/24 bg-[linear-gradient(180deg,rgba(167,139,250,0.26),rgba(91,60,196,0.14))] text-[#F2EAFE] shadow-[0_18px_32px_rgba(91,60,196,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
      glow: "bg-[radial-gradient(circle,rgba(167,139,250,0.42)_0%,rgba(139,92,246,0.18)_42%,rgba(139,92,246,0)_74%)]",
    },
    cashflow: {
      shell:
        "border-cyan-300/22 bg-[linear-gradient(180deg,rgba(103,232,249,0.2),rgba(37,99,235,0.12))] text-[#E4F9FF] shadow-[0_18px_32px_rgba(37,99,235,0.18),inset_0_1px_0_rgba(255,255,255,0.2)]",
      glow: "bg-[radial-gradient(circle,rgba(103,232,249,0.36)_0%,rgba(59,130,246,0.16)_46%,rgba(59,130,246,0)_76%)]",
    },
    health: {
      shell:
        "border-amber-300/24 bg-[linear-gradient(180deg,rgba(251,191,36,0.2),rgba(245,158,11,0.1))] text-[#FFF0D6] shadow-[0_18px_32px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]",
      glow: "bg-[radial-gradient(circle,rgba(251,191,36,0.34)_0%,rgba(245,158,11,0.14)_44%,rgba(245,158,11,0)_76%)]",
    },
    export: {
      shell:
        "border-white/16 bg-[linear-gradient(180deg,rgba(226,232,240,0.14),rgba(139,92,246,0.08))] text-[#EEF2FF] shadow-[0_18px_32px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]",
      glow: "bg-[radial-gradient(circle,rgba(196,181,253,0.28)_0%,rgba(148,163,184,0.12)_46%,rgba(148,163,184,0)_76%)]",
    },
  } as const;

  return (
    <span className={`relative inline-flex items-center justify-center ${sizeClass}`}>
      <span className={`absolute inset-[-10px] -z-10 rounded-[20px] blur-[12px] ${toneClasses[tone].glow}`} />
      <span
        className={`relative inline-flex h-full w-full items-center justify-center overflow-hidden border ${toneClasses[tone].shell} ${sizeClass}`}
      >
        <span className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/8" />
        <span className="pointer-events-none absolute inset-x-[18%] top-[8%] h-[36%] rounded-full bg-white/10 blur-[6px]" />
        {children}
      </span>
    </span>
  );
}

function ProofFeatureMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="5" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.55" />
      <rect x="4.5" y="10" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.55" />
      <rect x="4.5" y="15" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.55" />
      <path d="M14.5 14.5 17 17l4-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CashflowFeatureMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 15.5c2.3 0 2.8-6 5.2-6s2.9 5 5.1 5 2.7-3.5 5.7-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M17.8 8.2h2.9v2.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m20.7 8.2-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 19.25h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function HealthFeatureMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 15.5h3.2l1.8-4.5 2.3 7 2.1-5h2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 13.5h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 7.75a8.1 8.1 0 0 1 12 0" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.52" />
      <path d="M8.4 10.1a4.9 4.9 0 0 1 7.2 0" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.68" />
    </svg>
  );
}

function ExportFeatureMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 4.75h5.8L18 8.9V18a2 2 0 0 1-2 2H8A2 2 0 0 1 6 18V6.75a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M13.5 4.9V9h4.1" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14h5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="m13 12 2 2-2 2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function extractAmount(action: string) {
  const match = action.match(/[£$]\s?\d[\d,]*/);
  return match?.[0]?.replace(/\s+/g, "") ?? "£2,000";
}

function MobileTimelineDetail({
  item,
}: {
  item: ProofTimelineItem;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.xrplReference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5 shadow-[0_16px_30px_rgba(5,10,24,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9FB3D9]">Record detail</p>
          <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white">{item.action}</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/12 px-3 py-1 text-[11px] font-medium text-[#E1FBEE]">
          <ShieldCheck className="h-[12px] w-[12px]" strokeWidth={2} />
          {item.status}
        </span>
      </div>

      <p className="mt-4 text-[15px] leading-[1.7] text-[#D9E2F1]">{item.summary}</p>

      <div className="mt-5 grid gap-3">
        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Project</p>
          <p className="mt-2 text-[15px] font-semibold text-white">{item.project}</p>
        </div>
        {item.before || item.after ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Before</p>
              <p className="mt-2 text-[14px] text-[#E3EBF8]">{item.before ?? "No earlier state recorded"}</p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">After</p>
              <p className="mt-2 text-[14px] text-[#E3EBF8]">{item.after ?? "No updated state recorded"}</p>
            </div>
          </div>
        ) : null}
        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">On-chain record</p>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#DCE7F8] transition hover:bg-white/10"
            >
              <Copy className="h-[11px] w-[11px]" strokeWidth={2} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 font-mono text-[13px] tracking-[0.08em] text-[#DCE7F8]">{item.xrplReference}</p>
        </div>
      </div>
    </div>
  );
}

function DesktopHighlightPanel({
  item,
  needsAttention,
}: {
  item: ProofTimelineItem;
  needsAttention: string;
}) {
  const [copied, setCopied] = useState(false);
  const amount = extractAmount(item.action);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.xrplReference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="sticky top-6 rounded-[28px] border border-[#818CF8]/32 bg-[linear-gradient(180deg,rgba(31,42,86,0.9),rgba(17,24,45,0.96))] p-1 shadow-[0_28px_64px_rgba(17,24,45,0.38),0_0_40px_rgba(129,140,248,0.2)]">
      <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <section className="rounded-[22px] border border-[#818CF8]/26 bg-[linear-gradient(180deg,rgba(129,140,248,0.18),rgba(99,102,241,0.08))] p-5 shadow-[0_18px_30px_rgba(99,102,241,0.16),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-[260px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D7DCFF]">What this means</p>
              <p className="mt-3 text-[15px] leading-[1.72] text-[#F2F5FF]">
                Your operations are fully recorded and verified. No gaps detected. Your business is operating with full visibility.
              </p>
            </div>
            <div className="rounded-[22px] border border-[#818CF8]/28 bg-[radial-gradient(circle_at_50%_50%,rgba(129,140,248,0.18),rgba(129,140,248,0.06)_56%,rgba(129,140,248,0)_80%)] p-4 shadow-[0_0_26px_rgba(129,140,248,0.22)]">
              <ShieldCheck className="h-8 w-8 text-[#DDE2FF]" strokeWidth={1.9} />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,30,0.72),rgba(10,16,32,0.86))] p-5 shadow-[0_22px_34px_rgba(5,10,24,0.22),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/14 bg-emerald-300/10 text-[#DFFBF0]">
                <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={2} />
              </span>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D7E0F6]">Verified on-chain</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-300/14 bg-emerald-300/10 px-3 py-1 text-[11px] font-medium text-[#DFFBF0]">
              Confirmed
            </span>
          </div>

          <div className="mt-5">
            <p className="text-[36px] font-semibold tracking-[-0.05em] text-white">{amount} recorded</p>
            <p className="mt-1 text-[15px] text-[#D2DCEF]">Confirmed on XRPL</p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Timestamp</p>
              <p className="mt-2 text-[13px] text-[#E3EBF8]">Today, {item.timestamp}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Network</p>
              <p className="mt-2 text-[13px] text-[#E3EBF8]">XRPL Mainnet</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Status</p>
              <p className="mt-2 text-[13px] text-[#DFFBF0]">Confirmed</p>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">On-chain reference</p>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-[14px] border border-white/8 bg-[#0D1426]/80 px-3 py-3">
              <p className="font-mono text-[14px] tracking-[0.08em] text-[#E3EBF8]">{item.xrplReference}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#DCE7F8] transition hover:bg-white/10"
                aria-label="Copy on-chain reference"
              >
                <Copy className="h-[14px] w-[14px]" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="#"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-semibold text-[#E7EEFF] transition hover:bg-white/8"
            >
              View on explorer
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-semibold text-[#E7EEFF] transition hover:bg-white/8"
            >
              {copied ? "Copied" : "Copy reference"}
              <Copy className="h-[13px] w-[13px]" strokeWidth={2} />
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[20px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.1),rgba(249,115,22,0.04))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="max-w-[250px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFD39A]">Next signal</p>
              <p className="mt-2 text-[14px] leading-[1.65] text-[#FCE7C7]">{needsAttention}</p>
            </div>
            <Link
              href="/projects/harbour-road"
              className="inline-flex shrink-0 items-center rounded-full border border-amber-300/22 bg-amber-300/10 px-3 py-2 text-[12px] font-semibold text-[#FFE7C6] transition hover:bg-amber-300/14"
            >
              View details
            </Link>
          </div>
        </section>

        <section className="mt-4 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D7E0F6]">Use this proof</p>
          <p className="mt-2 text-[14px] leading-[1.65] text-[#D2DCEF]">
            Download, share, or export your verified records for partners, finance teams, and reporting.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-3 py-3 text-[12px] font-semibold text-[#E7EEFF] transition hover:bg-white/8"
            >
              <ArrowDownToLine className="h-[13px] w-[13px]" strokeWidth={2} />
              Download PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-3 py-3 text-[12px] font-semibold text-[#E7EEFF] transition hover:bg-white/8"
            >
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
              Share link
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-3 py-3 text-[12px] font-semibold text-[#E7EEFF] transition hover:bg-white/8"
            >
              <FileOutput className="h-[13px] w-[13px]" strokeWidth={2} />
              Export data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ProofScreenContent({ overview }: { overview: ProofOverview }) {
  const groupedTimeline = useMemo(() => {
    return overview.timeline.reduce<Record<string, ProofTimelineItem[]>>((accumulator, item) => {
      if (!accumulator[item.day]) {
        accumulator[item.day] = [];
      }

      accumulator[item.day].push(item);
      return accumulator;
    }, {});
  }, [overview.timeline]);

  const [selectedId, setSelectedId] = useState(overview.timeline[0]?.id ?? "");
  const selectedItem = overview.timeline.find((item) => item.id === selectedId) ?? overview.timeline[0];

  return (
    <div className="-mx-4 -mt-2 min-h-[calc(100vh-7.5rem)] bg-[linear-gradient(160deg,#0A1225_0%,#111B38_34%,#18254B_68%,#10253A_100%)] px-4 pb-28 pt-6 text-white md:-mx-6 md:rounded-[34px] md:px-6 md:pb-12 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-[420px] lg:max-w-none">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#AFC0FF]">Proof of Operations</p>
          <div className="lg:flex lg:items-start lg:justify-between lg:gap-6">
            <div>
              <h1 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-[40px]">
                Proof of Operations
              </h1>
              <p className="mt-4 text-[15px] leading-[1.72] text-[#C8D5EA]">
                Every decision and transaction, recorded.
              </p>
            </div>

            <div className="mt-5 hidden lg:flex lg:items-center lg:gap-3">
              <div className="rounded-[16px] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(27,48,55,0.92),rgba(20,30,44,0.88))] px-4 py-3 shadow-[0_18px_30px_rgba(6,10,24,0.2)]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.4)]" />
                  <p className="text-[13px] font-semibold text-white">{overview.statusTitle}</p>
                </div>
                <p className="mt-1 text-[12px] text-[#A8C6B8]">Synced {overview.lastUpdate}</p>
              </div>
              <Link
                href="/proof"
                className="inline-flex items-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.03] px-4 py-3 text-[13px] font-semibold text-[#E7EEFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:bg-white/[0.05]"
              >
                Proof of Operations
                <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 lg:hidden">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] p-5 shadow-[0_18px_38px_rgba(6,10,24,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6">
            <div className="flex items-start gap-3">
              <IconTile size="md" glow="cyan" className="bg-white/10 text-[#E7F8FF]">
                <ShieldCheck className="h-[16px] w-[16px]" strokeWidth={2} />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="text-[22px] font-semibold tracking-[-0.03em] text-white">{overview.statusTitle}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Last update</p>
                    <p className="mt-2 text-[14px] font-medium text-[#E3EBF8]">{overview.lastUpdate}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Record status</p>
                    <p className="mt-2 text-[14px] font-medium text-[#E3EBF8]">{overview.missingRecords}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8EA4C8]">Sync</p>
                    <p className="mt-2 text-[14px] font-medium text-[#E3EBF8]">{overview.syncStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 hidden lg:grid lg:grid-cols-4 lg:gap-4">
          <button
            type="button"
            className="group rounded-[22px] border border-[#8B5CF6]/32 bg-[linear-gradient(180deg,rgba(48,28,92,0.84),rgba(24,17,50,0.9))] p-5 text-left shadow-[0_24px_40px_rgba(15,10,35,0.3),0_0_34px_rgba(139,92,246,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-1 hover:shadow-[0_28px_44px_rgba(15,10,35,0.34),0_0_40px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <FeatureIconContainer tone="proof">
              <ProofFeatureMark className="h-[19px] w-[19px]" />
            </FeatureIconContainer>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[20px] font-semibold tracking-[-0.03em] text-white">Proof of Operations</p>
              <span className="rounded-full bg-[#8B5CF6]/24 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E9DDFF]">
                Primary
              </span>
            </div>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#D7CEF7]">
              Generate a verified record of your transactions, project activity, and financial state.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-[#E5DBFF]">
              <li>Transactions verified</li>
              <li>Project activity logged</li>
              <li>XRPL reference included</li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-[14px] border border-[#8B5CF6]/24 bg-[#8B5CF6]/18 px-4 py-3 text-[13px] font-semibold text-white transition group-hover:bg-[#8B5CF6]/24">
              <FeatureIconContainer tone="proof" size="sm">
                <ProofFeatureMark className="h-[15px] w-[15px]" />
              </FeatureIconContainer>
              Generate proof
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
            </div>
          </button>

          <button
            type="button"
            className="group rounded-[22px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(10,31,52,0.78),rgba(10,22,38,0.86))] p-5 text-left shadow-[0_18px_30px_rgba(5,10,24,0.18),0_0_22px_rgba(34,211,238,0.08)] transition hover:-translate-y-1"
          >
            <FeatureIconContainer tone="cashflow">
              <CashflowFeatureMark className="h-[19px] w-[19px]" />
            </FeatureIconContainer>
            <p className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-white">Cashflow Summary</p>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#C4EAF3]">
              Snapshot of money in and out with key insights.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-[#D7F3F9]">
              <li>Income vs expenses</li>
              <li>Cash position</li>
              <li>Monthly trends</li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-[14px] border border-cyan-300/18 bg-cyan-300/10 px-4 py-3 text-[13px] font-semibold text-[#E7FBFF] transition group-hover:bg-cyan-300/14">
              <FeatureIconContainer tone="cashflow" size="sm">
                <CashflowFeatureMark className="h-[15px] w-[15px]" />
              </FeatureIconContainer>
              Generate report
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
            </div>
          </button>

          <button
            type="button"
            className="group rounded-[22px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(52,31,11,0.76),rgba(36,24,14,0.84))] p-5 text-left shadow-[0_18px_30px_rgba(5,10,24,0.18),0_0_22px_rgba(251,191,36,0.08)] transition hover:-translate-y-1"
          >
            <FeatureIconContainer tone="health">
              <HealthFeatureMark className="h-[19px] w-[19px]" />
            </FeatureIconContainer>
            <p className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-white">Project Health</p>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#F1D9B2]">
              Track risk, runway, and financial stability.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-[#F8E7CD]">
              <li>Runway analysis</li>
              <li>Budget vs actual</li>
              <li>Risk indicators</li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-[14px] border border-amber-300/18 bg-amber-300/10 px-4 py-3 text-[13px] font-semibold text-[#FFE6C5] transition group-hover:bg-amber-300/14">
              <FeatureIconContainer tone="health" size="sm">
                <HealthFeatureMark className="h-[15px] w-[15px]" />
              </FeatureIconContainer>
              Generate report
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
            </div>
          </button>

          <button
            type="button"
            className="group rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(34,40,64,0.82),rgba(18,24,42,0.88))] p-5 text-left shadow-[0_18px_30px_rgba(5,10,24,0.18)] transition hover:-translate-y-1"
          >
            <FeatureIconContainer tone="export">
              <ExportFeatureMark className="h-[19px] w-[19px]" />
            </FeatureIconContainer>
            <p className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-white">Custom Export</p>
            <p className="mt-3 text-[14px] leading-[1.65] text-[#D2DCEF]">
              Build your own report with custom date ranges, categories, and metrics.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-[#E4EAF9]">
              <li>Flexible date range</li>
              <li>Custom filters</li>
              <li>Multiple metrics</li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-[14px] border border-white/12 bg-white/5 px-4 py-3 text-[13px] font-semibold text-[#EEF3FF] transition group-hover:bg-white/8">
              <FeatureIconContainer tone="export" size="sm">
                <ExportFeatureMark className="h-[15px] w-[15px]" />
              </FeatureIconContainer>
              Create export
              <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
            </div>
          </button>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1.26fr)_390px] lg:items-start lg:gap-8">
          <div>
            <div className="hidden items-center justify-between lg:flex">
              <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-white">Recorded activity</h2>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[12px] font-semibold text-[#DCE7F8] transition hover:bg-white/[0.05]"
              >
                All activity
              </button>
            </div>

            {(["Today", "Yesterday"] as const).map((group) => {
              const items = groupedTimeline[group];
              if (!items?.length) {
                return null;
              }

              return (
                <section key={group} className="mb-10 last:mb-0 md:mb-12">
                  <div className="mb-4 mt-0 flex items-center gap-2 lg:mb-5 lg:mt-6">
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(134,176,255,0.22),rgba(134,176,255,0))]" />
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9FB3D9]">
                      {group === "Today" ? "Recorded today" : "Previously recorded"}
                    </h2>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(134,176,255,0),rgba(134,176,255,0.22))]" />
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const isSelected = item.id === selectedItem?.id;
                      const isMostRecent = group === "Today" && index === 0;
                      const accent =
                        index % 3 === 0
                          ? "emerald"
                          : index % 3 === 1
                            ? "cyan"
                            : "amber";

                      const iconClasses =
                        accent === "emerald"
                          ? "border-emerald-300/18 bg-emerald-300/12 text-[#D9F9EA]"
                          : accent === "cyan"
                            ? "border-cyan-300/18 bg-cyan-300/12 text-[#DFFAFF]"
                            : "border-amber-300/18 bg-amber-300/12 text-[#FFE4BA]";

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full rounded-[24px] border px-5 py-4 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-cyan-300/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] shadow-[0_18px_30px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]"
                              : isMostRecent
                                ? "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.03))] shadow-[0_18px_28px_rgba(6,10,24,0.14),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-white/16"
                                : "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_10px_20px_rgba(6,10,24,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/12 hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] border ${iconClasses}`}>
                                  {accent === "emerald" ? (
                                    <ArrowDownToLine className="h-[16px] w-[16px]" strokeWidth={2} />
                                  ) : accent === "cyan" ? (
                                    <ExportFeatureMark className="h-[16px] w-[16px]" />
                                  ) : (
                                    <ArrowUpRight className="h-[16px] w-[16px]" strokeWidth={2} />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <p className={`font-semibold tracking-[-0.03em] text-white ${isMostRecent ? "text-[19px]" : "text-[18px]"}`}>
                                    {item.action}
                                  </p>
                                  <p className="mt-1 text-[14px] leading-[1.65] text-[#CDD8EA]">{item.context}</p>
                                </div>
                              </div>
                              <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px]">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/18 bg-emerald-300/12 px-2.5 py-1 font-medium text-[#E1FBEE]">
                                  <CheckCheck className="h-[11px] w-[11px]" strokeWidth={2} />
                                  {item.status}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-[#9FB3D9]">
                                  <Clock3 className="h-[12px] w-[12px]" strokeWidth={2} />
                                  {group === "Today" ? item.timestamp : `${group} ${item.timestamp}`}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#9FB3D9]" strokeWidth={2} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <div className="hidden lg:flex lg:justify-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.03] px-5 py-3 text-[13px] font-semibold text-[#E7EEFF] transition hover:bg-white/[0.05]"
              >
                View all activity
                <ArrowDownToLine className="h-[13px] w-[13px]" strokeWidth={2} />
              </button>
            </div>

            {selectedItem ? (
              <div className="lg:hidden">
                <MobileTimelineDetail item={selectedItem} />
              </div>
            ) : null}
          </div>

          <div className="mt-8 hidden lg:block">
            {selectedItem ? (
              <DesktopHighlightPanel item={selectedItem} needsAttention={overview.needsAttention} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProofScreenContent;
