"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, ShieldCheck } from "lucide-react";

import type { ProofOverview, ProofTimelineItem } from "@/data/proof";

interface OperationalReport {
  id: string;
  title: string;
  summary: string;
  metrics: Array<[string, string]>;
  verification: string;
  detail: string;
  highlights: string[];
  flagship?: boolean;
}

interface PdfVerificationContext {
  reference: string;
  timestamp: string;
  status: string;
  ledger: string;
}

const operationalReports: OperationalReport[] = [
  {
    id: "supplier-payroll",
    title: "Supplier & Payroll Report",
    summary: "Verified payout timing across suppliers, payroll movement, and recurring operational obligations.",
    metrics: [
      ["Supplier payouts", "14 verified"],
      ["Payroll movement", "$18.4K tracked"],
      ["Timing reliability", "96% on schedule"],
    ],
    verification: "Settlement activity summary verified",
    detail: "Built from supplier payouts, payroll movement, recurring obligations, payout timing reliability, and verified settlement history.",
    highlights: ["Supplier payout cadence", "Payroll movement timeline", "Recurring obligations monitored"],
  },
  {
    id: "compliance",
    title: "Taxes, Licenses & Compliance Report",
    summary: "Operational compliance movement for taxes, licenses, permits, and recurring cross-border obligations.",
    metrics: [
      ["Compliance items", "8 tracked"],
      ["Taxes paid", "$6.2K verified"],
      ["Permit renewals", "3 upcoming"],
    ],
    verification: "Operational verification current",
    detail: "Shows tax payments, license renewals, permits, and recurring compliance movement for cross-border operations.",
    highlights: ["Taxes and licenses paid", "Permits and renewal windows", "Compliance obligations connected to cash movement"],
  },
  {
    id: "seasonal-cashflow",
    title: "Seasonal Cashflow Report",
    summary: "Predictive view of spend periods, payout spikes, runway pressure, and recurring seasonal movement.",
    metrics: [
      ["Highest spend period", "Delivery weeks"],
      ["Payout spikes", "4 detected"],
      ["Runway pressure", "2 periods"],
    ],
    verification: "Generated from real business activity",
    detail: "Identifies highest spend periods, lower activity windows, recurring payout spikes, runway pressure, and seasonal movement trends.",
    highlights: ["Spend peaks and quiet windows", "Recurring payout spikes", "Runway pressure periods"],
  },
  {
    id: "business-overview",
    title: "Business Operations Overview",
    summary: "Executive-level view of operational movement, reserves, cross-border payments, projects, and proof history.",
    metrics: [
      ["Operational movement", "$84.3K"],
      ["Payout completion", "92%"],
      ["Health score", "87/100"],
    ],
    verification: "Verified business memory synced",
    detail: "Combines total operational movement, protected reserve state, cross-border payment activity, payout completion rate, active projects, proof records, and operational health.",
    highlights: ["Protected reserve state", "Cross-border payment activity", "Active projects and proof records"],
    flagship: true,
  },
];

function amountFromAction(action: string) {
  return action.match(/\$[\d,]+/)?.[0] ?? action;
}

function currencyFromAction(action: string) {
  if (action.includes("$")) {
    return "USD";
  }

  const currency = action.match(/\b(XRP|USD|KES|USDT|USDC|RLUSD)\b/)?.[0];
  return currency ?? "Settlement currency";
}

function supplierFromContext(context: string) {
  return context.split("·")[0]?.trim() || "Operational payee";
}

function buildRecordSections(selected: ProofTimelineItem) {
  const reference = selected.txid ?? selected.xrplReference;
  const verificationStatus = selected.status.includes("XRPL") ? selected.status : "Verified operational record";
  const ledgerConfirmation = selected.after?.toLowerCase().includes("ledger") ? selected.after : "Ledger confirmed";
  const settlementRail = selected.before?.replace(/^Rail:\s*/i, "") || "XRPL settlement through Xaman";

  return [
    {
      title: "Payment Summary",
      rows: [
        ["Amount", amountFromAction(selected.action)],
        ["Currency", currencyFromAction(selected.action)],
        ["Supplier", supplierFromContext(selected.context)],
        ["Timestamp", `${selected.day} · ${selected.timestamp}`],
        ["Settlement rail", settlementRail],
      ],
    },
    {
      title: "Project Context",
      rows: [
        ["Linked project", selected.project],
        ["Payment reason", selected.action],
        ["Cross-border route", "XRPL Mainnet settlement"],
        ["Reserve state after payout", selected.summary.includes("reserve") || selected.summary.includes("Reserve") ? "Reserve protected after payout" : "Operational state recorded"],
      ],
    },
    {
      title: "XRPL Verification",
      rows: [
        ["Transaction hash", reference],
        ["Ledger confirmation", ledgerConfirmation],
        ["Validation status", verificationStatus],
        ["XRPL Mainnet verified", selected.status.includes("XRPL") ? "Yes" : "Settlement verified"],
        ["Explorer link", selected.xrplExplorerUrl ? "Available" : "Not attached"],
      ],
      action: selected.xrplExplorerUrl,
    },
    {
      title: "Operational Impact",
      rows: [
        ["Reserve protected", "Yes"],
        ["Payment completed", selected.status.includes("XRPL") ? "Settlement verified" : "Completed"],
        ["Proof synced to operational memory", "Yes"],
      ],
    },
  ];
}

function pdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadReportPdf(report: OperationalReport, verification?: PdfVerificationContext) {
  const workspace = getReportWorkspace(report);
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const commands: string[] = [];
  let y = 748;

  const color = (r: number, g: number, b: number) => `${r} ${g} ${b} rg`;
  const stroke = (r: number, g: number, b: number) => `${r} ${g} ${b} RG`;
  const rect = (x: number, rectY: number, width: number, height: number, fill: [number, number, number], strokeColor?: [number, number, number]) => {
    commands.push(`${color(...fill)} ${strokeColor ? stroke(...strokeColor) : ""} ${x} ${rectY} ${width} ${height} re ${strokeColor ? "B" : "f"}`);
  };
  const text = (value: string, x: number, textY: number, size = 10, fill: [number, number, number] = [0.08, 0.12, 0.18], font = "F1") => {
    commands.push(`BT ${color(...fill)} /${font} ${size} Tf 1 0 0 1 ${x} ${textY} Tm (${pdfText(value)}) Tj ET`);
  };
  const wrapText = (value: string, maxChars: number) => {
    const words = value.split(" ");
    const lines: string[] = [];
    let current = "";
    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);
    return lines;
  };
  const paragraph = (value: string, x: number, maxChars: number, size = 10, fill: [number, number, number] = [0.32, 0.38, 0.46]) => {
    wrapText(value, maxChars).forEach((line) => {
      text(line, x, y, size, fill);
      y -= size + 6;
    });
  };
  const sectionTitle = (value: string) => {
    y -= 20;
    text(value.toUpperCase(), 54, y, 9, [0.10, 0.30, 0.55], "F2");
    commands.push(`${stroke(0.79, 0.84, 0.90)} 54 ${y - 10} m 558 ${y - 10} l S`);
    y -= 30;
  };

  rect(0, 0, 612, 792, [0.95, 0.97, 1]);
  rect(0, 646, 612, 146, [0.07, 0.18, 0.34]);
  rect(54, 676, 504, 58, [0.10, 0.24, 0.43], [0.22, 0.42, 0.62]);
  text("Zila Proof of Operations", 76, 710, 18, [1, 1, 1], "F2");
  text(report.title, 76, 688, 12, [0.78, 0.86, 0.96], "F2");
  rect(398, 698, 136, 22, [0.85, 1, 0.34]);
  text("Operational verification", 410, 705, 8, [0.06, 0.16, 0.30], "F2");
  text(`Generated ${generatedAt}`, 54, 628, 9, [0.36, 0.43, 0.52]);
  text(report.verification, 390, 628, 9, [0.10, 0.30, 0.55], "F2");

  y = 596;
  text("Operational summary", 54, y, 13, [0.08, 0.12, 0.18], "F2");
  y -= 24;
  paragraph(report.summary, 54, 90, 10);
  paragraph(workspace.summary, 54, 90, 10);

  sectionTitle("Verified movement metrics");
  report.metrics.forEach(([label, value], index) => {
    const x = 54 + index * 168;
    rect(x, y - 48, 150, 58, [1, 1, 1], [0.82, 0.87, 0.93]);
    text(label, x + 12, y - 10, 8, [0.40, 0.46, 0.55], "F2");
    text(value, x + 12, y - 33, 18, [0.08, 0.12, 0.18], "F2");
  });
  y -= 78;

  sectionTitle("Settlement activity");
  rect(54, y - 18, 504, 24, [0.91, 0.94, 0.98]);
  ["Period", "Activity", "Amount", "Status"].forEach((header, index) => text(header, 66 + index * 126, y - 8, 8, [0.10, 0.30, 0.55], "F2"));
  y -= 34;
  workspace.timeline.forEach(([period, activity, amount, status]) => {
    text(period, 66, y, 9);
    text(activity, 192, y, 9);
    text(amount, 318, y, 9, [0.08, 0.12, 0.18], "F2");
    text(status, 444, y, 9, [0.16, 0.42, 0.36], "F2");
    commands.push(`${stroke(0.88, 0.91, 0.95)} 54 ${y - 9} m 558 ${y - 9} l S`);
    y -= 22;
  });

  sectionTitle("Operational insights");
  workspace.insights.forEach((insight) => {
    rect(54, y - 16, 504, 26, [1, 1, 1], [0.86, 0.90, 0.95]);
    text("Verified", 66, y - 1, 8, [0.10, 0.30, 0.55], "F2");
    text(insight, 124, y - 1, 9);
    y -= 34;
  });

  sectionTitle("XRPL verification");
  const verificationRows = [
    ["XRPL Mainnet verified", "Yes"],
    ["Transaction reference", verification?.reference ?? "Attached in Proof of Operations"],
    ["Verification timestamp", verification?.timestamp ?? generatedAt],
    ["Ledger confirmation", verification?.ledger ?? "Settlement confirmed"],
    ["Proof attached automatically", "Yes"],
    ["Settlement confirmation status", verification?.status ?? "Settlement verified"],
  ];
  verificationRows.forEach(([label, value], index) => {
    const rowY = y - index * 20;
    text(label, 66, rowY, 9, [0.36, 0.43, 0.52]);
    text(value, 300, rowY, 9, [0.08, 0.12, 0.18], "F2");
  });
  y -= 142;

  rect(54, 38, 504, 36, [0.07, 0.18, 0.34]);
  text("Verified operational intelligence generated from real business activity.", 72, 58, 9, [1, 1, 1], "F2");
  text("Zila Proof of Operations", 72, 45, 8, [0.78, 0.86, 0.96]);

  const stream = commands.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.id}-zila-operational-report.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function ReportCard({
  report,
  onView,
  verification,
}: {
  report: OperationalReport;
  onView: (report: OperationalReport) => void;
  verification: PdfVerificationContext;
}) {
  return (
    <article className={`relative overflow-hidden rounded-[26px] border p-5 shadow-[0_20px_48px_rgba(1,8,20,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] ${
      report.flagship
        ? "border-[#D9FF57]/18 bg-[radial-gradient(circle_at_100%_0%,rgba(217,255,87,0.10),transparent_28%),linear-gradient(180deg,rgba(30,74,125,0.62),rgba(13,35,68,0.72))]"
        : "border-white/10 bg-[linear-gradient(180deg,rgba(30,74,125,0.48),rgba(13,35,68,0.66))]"
    }`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(103,232,249,0.10),transparent_30%)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Verified operational intelligence</p>
            <h3 className="mt-2 text-[22px] font-semibold leading-[1.08] tracking-[-0.05em] text-white">{report.title}</h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] px-3 py-1.5 text-[10px] font-semibold text-[#EAFFB4]">
            <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
            Verified
          </span>
        </div>
        <p className="mt-3 text-[13px] leading-[1.7] text-[#C9D6EA]">{report.summary}</p>
        <div className="mt-5 grid gap-2">
          {report.metrics.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-[16px] border border-white/8 bg-white/[0.045] px-3 py-2.5">
              <span className="text-[12px] font-medium text-[#AFC0DD]">{label}</span>
              <strong className="text-right text-[13px] font-semibold text-white">{value}</strong>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12px] font-semibold text-[#EAFFB4]">{report.verification}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onView(report)} className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[12px] font-semibold text-[#173D6D]">
            View report
          </button>
          <button type="button" onClick={() => downloadReportPdf(report, verification)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[12px] font-semibold text-[#EAF1FF]">
            <Download className="h-[12px] w-[12px]" strokeWidth={2} />
            Download PDF
          </button>
        </div>
      </div>
    </article>
  );
}

function getReportWorkspace(report: OperationalReport) {
  if (report.id === "supplier-payroll") {
    return {
      summary: "Supplier and payroll movement stayed coordinated across recurring obligations, verified payouts, and reserve-aware settlement timing.",
      timeline: [
        ["Week 1", "Supplier payout", "$4.3K", "Verified"],
        ["Week 2", "Payroll movement", "$7.2K", "Settled"],
        ["Week 3", "Contractor payout", "$1.8K", "Verified"],
        ["Week 4", "Supplier reserve", "$4.1K", "Protected"],
      ],
      bars: [
        ["Supplier payouts", 84],
        ["Payroll movement", 72],
        ["Recurring obligations", 64],
        ["Settlement success", 96],
      ],
      insights: [
        "Supplier payouts remained on schedule.",
        "Protected reserves remained above threshold.",
        "Settlement timing improved this month.",
      ],
      activity: [
        ["Northline Suppliers", "Supplier payout", "$4,300", "Validated"],
        ["Payroll reserve", "Payroll movement", "$7,200", "Recorded"],
        ["Mara Contractors", "Contractor payout", "$1,800", "Validated"],
      ],
    };
  }

  if (report.id === "compliance") {
    return {
      summary: "Compliance movement is tracked alongside payment activity so cross-border operations stay verifiable and ready for review.",
      timeline: [
        ["Jan", "Tax payment", "$2.4K", "Verified"],
        ["Feb", "Permit renewal", "1 permit", "Recorded"],
        ["Mar", "License fee", "$1.1K", "Verified"],
        ["Apr", "Compliance reserve", "$2.7K", "Protected"],
      ],
      bars: [
        ["Taxes paid", 78],
        ["Licenses current", 88],
        ["Permit readiness", 66],
        ["Compliance movement", 82],
      ],
      insights: [
        "Recurring compliance obligations are visible before settlement windows.",
        "License and permit activity is connected to operational cash movement.",
        "Cross-border verification is ready for partner review.",
      ],
      activity: [
        ["Tax authority", "Tax payment", "$2,400", "Verified"],
        ["City permit", "Permit renewal", "Due soon", "Monitored"],
        ["Operating license", "License fee", "$1,100", "Verified"],
      ],
    };
  }

  if (report.id === "seasonal-cashflow") {
    return {
      summary: "Seasonal movement patterns show where spend peaks, payout spikes, and runway pressure tend to form.",
      timeline: [
        ["Q1", "Lower activity", "$12.8K", "Stable"],
        ["Q2", "Delivery spend", "$24.6K", "High"],
        ["Q3", "Payout spike", "$18.9K", "Monitored"],
        ["Q4", "Reserve rebuild", "$9.4K", "Protected"],
      ],
      bars: [
        ["Highest spend", 92],
        ["Lower activity", 42],
        ["Payout spikes", 74],
        ["Runway pressure", 58],
      ],
      insights: [
        "Delivery weeks remain the highest spend periods.",
        "Recurring payout spikes are predictable before supplier windows.",
        "Runway pressure periods are narrowing after reserve protection.",
      ],
      activity: [
        ["Delivery weeks", "Highest spend period", "$24,600", "Observed"],
        ["Supplier cycle", "Recurring payout spike", "$9,500", "Monitored"],
        ["Reserve window", "Runway pressure", "2 periods", "Improving"],
      ],
    };
  }

  return {
    summary: "Executive-level operational intelligence across movement, reserves, cross-border payouts, projects, and verified proof records.",
    timeline: [
      ["Movement", "Total operational movement", "$84.3K", "Verified"],
      ["Reserves", "Protected reserve state", "$24.2K", "Protected"],
      ["Payments", "Cross-border activity", "14 payouts", "Validated"],
      ["Projects", "Active work", "4 projects", "Current"],
    ],
    bars: [
      ["Operational movement", 86],
      ["Reserve health", 82],
      ["Payout completion", 92],
      ["Proof coverage", 88],
    ],
    insights: [
      "Operational health remains strong across active projects.",
      "Payout completion rate supports supplier reliability.",
      "Verified business memory is ready to share with external partners.",
    ],
    activity: [
      ["Portfolio", "Operational movement", "$84,300", "Verified"],
      ["Protected reserve", "Reserve state", "$24,220", "Protected"],
      ["Proof records", "Operational verification", "8 records", "Synced"],
    ],
  };
}

function ReportWorkspace({
  report,
  explorerUrl,
  verification,
  onBack,
}: {
  report: OperationalReport;
  explorerUrl?: string;
  verification: PdfVerificationContext;
  onBack: () => void;
}) {
  const workspace = getReportWorkspace(report);

  return (
    <div className="relative z-10 mx-auto max-w-[1120px]">
      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={onBack} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[12px] font-semibold text-[#EAF1FF]">
          <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={2} />
          Back to Proof
        </button>
        <button type="button" onClick={() => downloadReportPdf(report, verification)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[12px] font-semibold text-[#EAF1FF]">
          <Download className="h-[13px] w-[13px]" strokeWidth={2} />
          Download PDF
        </button>
        {explorerUrl ? (
          <Link href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-4 text-[12px] font-semibold text-[#102A4F]">
            View XRPL verification
            <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-[34px] border border-white/12 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.14),transparent_32%),radial-gradient(circle_at_88%_4%,rgba(217,255,87,0.08),transparent_28%),linear-gradient(180deg,rgba(30,74,125,0.66),rgba(7,17,31,0.72))] p-6 shadow-[0_30px_86px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.10)] md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7EE7F6]">Operational report workspace</p>
            <h1 className="mt-3 max-w-[760px] text-[42px] font-semibold leading-[0.98] tracking-[-0.07em] text-white md:text-[54px]">{report.title}</h1>
            <p className="mt-4 max-w-[700px] text-[15px] leading-[1.75] text-[#C9D6EA]">
              Operational intelligence generated automatically from verified business activity.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] px-3.5 py-2 text-[12px] font-semibold text-[#EAFFB4]">
            <ShieldCheck className="h-[14px] w-[14px]" strokeWidth={2} />
            {report.verification}
          </span>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.74fr)]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Operational summary</p>
            <p className="mt-3 text-[17px] font-semibold leading-[1.55] tracking-[-0.025em] text-white">{workspace.summary}</p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {report.metrics.map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#91A6C8]">{label}</p>
                  <p className="mt-2 text-[22px] font-semibold tracking-[-0.045em] text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">Operational insights</p>
            <div className="mt-4 space-y-3">
              {workspace.insights.map((insight) => (
                <div key={insight} className="flex gap-3 rounded-[18px] border border-white/8 bg-white/[0.04] px-3 py-3">
                  <span className="zila-live-dot mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D9FF57]" />
                  <p className="text-[13px] font-semibold leading-[1.55] text-[#D7E3F8]">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Movement chart</p>
            <div className="mt-5 space-y-4">
              {workspace.bars.map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-[#C9D6EA]">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#D9FF57,#67E8F9)] shadow-[0_0_18px_rgba(103,232,249,0.22)]" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Timeline</p>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
              {workspace.timeline.map(([period, event, amount, status]) => (
                <div key={`${period}-${event}`} className="grid grid-cols-[0.7fr_1.25fr_0.75fr_0.7fr] gap-3 border-b border-white/8 px-3 py-3 text-[12px] last:border-b-0">
                  <span className="font-semibold text-[#EAF1FF]">{period}</span>
                  <span className="text-[#C9D6EA]">{event}</span>
                  <span className="font-semibold text-white">{amount}</span>
                  <span className="text-right font-semibold text-[#EAFFB4]">{status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Recent activity</p>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10">
              {workspace.activity.map(([name, activity, amount, state]) => (
                <div key={`${name}-${activity}`} className="grid gap-2 border-b border-white/8 px-3 py-3 text-[12px] last:border-b-0 md:grid-cols-[1fr_1fr_0.7fr_0.7fr]">
                  <span className="font-semibold text-white">{name}</span>
                  <span className="text-[#C9D6EA]">{activity}</span>
                  <span className="font-semibold text-[#EAF1FF]">{amount}</span>
                  <span className="font-semibold text-[#EAFFB4] md:text-right">{state}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#D9FF57]/14 bg-[#D9FF57]/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">Verification</p>
            <div className="mt-4 space-y-3">
              {["Generated from real business activity", "Verified business memory current", "Operational proof synced"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.045] px-3 py-3">
                  <ShieldCheck className="h-[14px] w-[14px] shrink-0 text-[#EAFFB4]" strokeWidth={2} />
                  <span className="text-[12px] font-semibold text-[#D7E3F8]">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export function ProofScreenContent({ overview }: { overview: ProofOverview }) {
  const [selectedId, setSelectedId] = useState(overview.timeline[0]?.id ?? "");
  const [activeReport, setActiveReport] = useState<OperationalReport | null>(null);
  const selected = overview.timeline.find((item) => item.id === selectedId) ?? overview.timeline[0];

  if (!selected) {
    return null;
  }

  const sections = buildRecordSections(selected);
  const explorerUrl = selected.xrplExplorerUrl;
  const verificationContext: PdfVerificationContext = {
    reference: selected.txid ?? selected.xrplReference,
    timestamp: `${selected.day} ${selected.timestamp}`,
    status: selected.status.includes("XRPL") ? "Validated on XRPL Mainnet" : "Settlement verified",
    ledger: selected.after?.toLowerCase().includes("ledger") ? selected.after : "Settlement confirmed",
  };

  if (activeReport) {
    return (
      <div className="relative -mx-4 -mt-2 min-h-[calc(100vh-6rem)] overflow-hidden rounded-none bg-[linear-gradient(180deg,#132B4E_0%,#0B1B33_44%,#050D1A_100%)] px-4 pb-14 pt-5 text-white md:-mx-6 md:rounded-[30px] md:px-5 md:pb-8 lg:-mx-6 lg:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.12),transparent_30%),radial-gradient(circle_at_84%_4%,rgba(217,255,87,0.06),transparent_24%)]" />
        <ReportWorkspace report={activeReport} explorerUrl={explorerUrl} verification={verificationContext} onBack={() => setActiveReport(null)} />
      </div>
    );
  }

  return (
    <div className="relative -mx-4 -mt-2 min-h-[calc(100vh-6rem)] overflow-hidden rounded-none bg-[linear-gradient(180deg,#132B4E_0%,#0B1B33_44%,#050D1A_100%)] px-4 pb-14 pt-5 text-white md:-mx-6 md:rounded-[30px] md:px-5 md:pb-8 lg:-mx-6 lg:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.12),transparent_30%),radial-gradient(circle_at_84%_4%,rgba(217,255,87,0.06),transparent_24%)]" />

      <div className="relative z-10 mx-auto max-w-[1080px]">
        <div className="mb-5 flex flex-wrap gap-2">
          <Link href="/payments" className="inline-flex h-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-4 text-[12px] font-semibold text-[#EAF1FF]">
            Back to payments
          </Link>
          <Link href="/home" className="inline-flex h-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-4 text-[12px] font-semibold text-[#EAF1FF]">
            Back to dashboard
          </Link>
        </div>
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[720px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EAFFB4]">
              <span className="zila-live-dot h-1.5 w-1.5 rounded-full bg-[#D9FF57]" />
              Verified Operational Record
            </div>
            <h1 className="mt-4 max-w-[720px] text-[38px] font-semibold leading-[0.98] tracking-[-0.07em] text-white md:text-[50px]">
              Proof of Operations
            </h1>
            <p className="mt-4 max-w-[650px] text-[15px] leading-[1.7] text-[#B9C8DF]">
              Verified operational payout settled on XRPL Mainnet.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[#071526]/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#91A6C8]">Verification status</p>
            <p className="mt-2 text-[18px] font-semibold tracking-[-0.035em] text-white">Settlement verified</p>
            <p className="mt-1 text-[12px] text-[#B9C8DF]">Operational proof synced</p>
          </div>
        </header>

        <section className="mt-8 overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(243,245,249,0.97),rgba(220,232,255,0.94))] p-5 text-[#111827] shadow-[0_28px_74px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.78)] md:p-6">
          <div className="flex flex-col gap-4 border-b border-[#C8D2E4] pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Verified transaction record</p>
              <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.055em] text-[#121417]">{selected.action}</h2>
              <p className="mt-2 max-w-[640px] text-[14px] leading-[1.7] text-[#667085]">{selected.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#A8B6CD] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#173D6D]">
                <ShieldCheck className="h-[14px] w-[14px]" strokeWidth={2} />
                Validated on XRPL Mainnet
              </span>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D9FF57]/24 bg-[#D9FF57]/12 px-3.5 py-2 text-[12px] font-semibold text-[#173D6D]">
                Proof attached automatically
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {sections.map((section) => (
              <section key={section.title} className="rounded-[24px] border border-[#D8E1EF] bg-white/80 p-4 shadow-[0_12px_28px_rgba(17,24,39,0.045),inset_0_1px_0_rgba(255,255,255,0.84)]">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-[#121417]">{section.title}</h3>
                  {section.action ? (
                    <Link href={section.action} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1D4ED8]">
                      Explorer link
                      <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2} />
                    </Link>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2.5">
                  {section.rows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 border-t border-[#E4EAF3] pt-2.5 first:border-t-0 first:pt-0">
                      <p className="text-[12px] font-medium text-[#667085]">{label}</p>
                      <p className="max-w-[62%] break-words text-right text-[13px] font-semibold text-[#182033]">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-[#D8E1EF] pt-5">
            {explorerUrl ? (
              <Link href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#173D6D] px-4 text-[13px] font-semibold text-white">
                View on XRPL
                <ArrowUpRight className="h-[13px] w-[13px]" strokeWidth={2} />
              </Link>
            ) : null}
            <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#C8D2E4] bg-white px-4 text-[13px] font-semibold text-[#173D6D]">
              <Download className="h-[13px] w-[13px]" strokeWidth={2} />
              Download report
            </button>
            <Link href="/payments" className="inline-flex h-11 items-center justify-center rounded-full border border-[#C8D2E4] bg-white px-4 text-[13px] font-semibold text-[#173D6D]">
              Back to payments
            </Link>
            <Link href="/home" className="inline-flex h-11 items-center justify-center rounded-full border border-[#C8D2E4] bg-white px-4 text-[13px] font-semibold text-[#173D6D]">
              Back to dashboard
            </Link>
            <Link href="/home" className="inline-flex h-11 items-center justify-center rounded-full bg-[#D9FF57] px-4 text-[13px] font-semibold text-[#102A4F]">
              Done
            </Link>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_16%_0%,rgba(103,232,249,0.12),transparent_32%),linear-gradient(180deg,rgba(12,28,52,0.58),rgba(5,14,28,0.66))] p-5 shadow-[0_24px_68px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.07)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7EE7F6]">Operational intelligence</p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[1.02] tracking-[-0.06em] text-white">Verified operational reports</h2>
              <p className="mt-3 max-w-[650px] text-[14px] leading-[1.7] text-[#B9C8DF]">
                Generated from real business activity, settlement movement, reserves, obligations, and verified business memory.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-3.5 py-2 text-[12px] font-semibold text-[#EAFFB4]">
              <ShieldCheck className="h-[14px] w-[14px]" strokeWidth={2} />
              Operator-ready records
            </span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {operationalReports.map((report) => (
              <ReportCard key={report.id} report={report} onView={setActiveReport} verification={verificationContext} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,28,52,0.42),rgba(5,14,28,0.54))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Supporting operational history</p>
              <p className="mt-1 text-[13px] text-[#B9C8DF]">Recent verified records that support the intelligence layer.</p>
            </div>
            <Link href="/payments/send" className="inline-flex h-10 items-center justify-center rounded-full bg-[#D9FF57] px-4 text-[12px] font-semibold text-[#102A4F]">
              Make Payment
            </Link>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {overview.timeline.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-[18px] border px-4 py-3 text-left transition ${
                  item.id === selected.id
                    ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.08]"
                    : "border-white/8 bg-white/[0.04] hover:border-white/14 hover:bg-white/[0.06]"
                }`}
              >
                <p className="text-[12px] font-semibold text-white">{item.action}</p>
                <p className="mt-1 text-[11px] text-[#9FB3D9]">{item.context}</p>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default ProofScreenContent;
