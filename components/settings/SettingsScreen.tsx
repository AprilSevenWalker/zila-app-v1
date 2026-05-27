"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  Globe2,
  Languages,
  LockKeyhole,
  LogOut,
  Mail,
  RadioTower,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import {
  disconnectMoneySource,
  getMoneySourceState,
  subscribeToMoneySource,
  type MoneySourceState,
} from "@/lib/moneySourceStore";

const demoWalletAddress = "rZilaDemo8u7J4d9KxXRPLMainnet5qP9m2";

const railStatuses = [
  ["XRPL Mainnet", "Connected", "Active settlement rail"],
  ["Proof layer", "Enabled", "Records attach automatically"],
  ["Stablecoin rail", "Prepared", "Ready for configured settlement"],
  ["Mobile money", "Coming soon", "Prepared for rollout"],
  ["Bank integrations", "Coming soon", "Integration queue active"],
];

const complianceItems = [
  ["Tax reserve category", "VAT / tax reserve enabled"],
  ["Licence / permit costs", "Business licence renewal tracked"],
  ["Renewal dates", "Next review: 30 June"],
];

const proofSettings = [
  "Proof of Operations enabled",
  "Reports generated from verified activity",
  "XRPL verification active",
  "Export reports enabled",
];

function statusClass(status: string) {
  if (status === "Connected" || status === "Enabled" || status === "Active") {
    return "border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] text-[#EAFFB4]";
  }

  if (status === "Prepared") {
    return "border-[#67E8F9]/16 bg-[#67E8F9]/[0.08] text-[#DDFBFF]";
  }

  return "border-white/10 bg-white/[0.055] text-[#C9D4F5]";
}

function SectionCard({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_100%_0%,rgba(103,232,249,0.08),transparent_28%),linear-gradient(180deg,rgba(16,42,79,0.72),rgba(7,21,38,0.58))] p-4 shadow-[0_24px_58px_rgba(1,8,20,0.20),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[#67E8F9]/14 bg-[#67E8F9]/[0.07] text-[#DDFBFF]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">{eyebrow}</p>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-0.045em] text-white">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  icon: Icon,
  type = "text",
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  type?: string;
}) {
  return (
    <label className="block rounded-[18px] border border-white/10 bg-white/[0.055] px-4 py-3 transition focus-within:border-[#D9FF57]/24 focus-within:bg-white/[0.075]">
      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">
        {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2} /> : null}
        {label}
      </span>
      <input
        type={type}
        defaultValue={value}
        className="mt-2 h-8 w-full bg-transparent text-[15px] font-semibold text-white outline-none placeholder:text-[#8FA4C3]"
      />
    </label>
  );
}

function SelectField({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <label className="block rounded-[18px] border border-white/10 bg-white/[0.055] px-4 py-3 transition focus-within:border-[#D9FF57]/24 focus-within:bg-white/[0.075]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">{label}</span>
      <select defaultValue={value} className="mt-2 h-9 w-full rounded-[12px] border border-white/10 bg-[#102A4F] px-3 text-[14px] font-semibold text-white outline-none">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function SwitchRow({ label, detail, enabled = true }: { label: string; detail?: string; enabled?: boolean }) {
  const [checked, setChecked] = useState(enabled);

  return (
    <button
      type="button"
      onClick={() => setChecked((current) => !current)}
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/[0.055] px-4 py-3 text-left transition hover:border-[#D9FF57]/18 hover:bg-white/[0.075]"
      aria-pressed={checked}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-[1.4] text-[#D7E3F8]">{label}</span>
        {detail ? <span className="mt-1 block text-[11px] leading-[1.45] text-[#AFC0DD]">{detail}</span> : null}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full border transition ${checked ? "border-[#D9FF57]/28 bg-[#D9FF57]/18" : "border-white/12 bg-white/[0.08]"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full transition ${checked ? "left-6 bg-[#D9FF57] shadow-[0_0_14px_rgba(217,255,87,0.28)]" : "left-1 bg-[#AFC0DD]"}`} />
      </span>
    </button>
  );
}

function CopyButton({ value, onCopied }: { value: string; onCopied: () => void }) {
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    onCopied();
  };

  return (
    <button type="button" onClick={copyValue} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] px-4 text-[12px] font-semibold text-[#EAFFB4] transition hover:bg-[#D9FF57]/[0.12] sm:w-auto">
      <Copy className="h-3.5 w-3.5" strokeWidth={2} />
      Copy address
    </button>
  );
}

export function SettingsScreen() {
  const [moneySource, setMoneySource] = useState<MoneySourceState>(() => getMoneySourceState());
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [walletDisconnected, setWalletDisconnected] = useState(false);
  const walletAddress = moneySource.walletAddress || demoWalletAddress;
  const walletLabel = moneySource.walletAddressShort || `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;
  const walletActive = !walletDisconnected;
  const explorerUrl = `https://xrpscan.com/account/${walletAddress}`;

  const walletRows = useMemo(
    () => [
      ["Connected wallet", walletLabel],
      ["XRPL Mainnet status", walletActive ? "Active" : "Disconnected"],
      ["Wallet signing status", walletActive ? "Ready for approval" : "Reconnect required"],
      ["Proof enabled", walletActive ? "Yes" : "No"],
    ],
    [walletActive, walletLabel],
  );

  useEffect(() => {
    const sync = () => {
      setMoneySource(getMoneySourceState());
      setWalletDisconnected(false);
    };

    sync();
    return subscribeToMoneySource(sync);
  }, []);

  const saveSettings = () => {
    window.localStorage.setItem("zila-settings-saved-at", new Date().toISOString());
    window.localStorage.setItem("zila-settings-workspace", "Zila Operations");
    window.localStorage.setItem("zila-business-name", "Zila Operations");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  const disconnectWallet = () => {
    disconnectMoneySource();
    setWalletDisconnected(true);
  };

  const reconnectWallet = () => {
    setWalletDisconnected(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <AppShell>
      <div className="relative -mx-4 -mt-2 overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(103,232,249,0.20),transparent_30%),radial-gradient(ellipse_at_86%_4%,rgba(217,255,87,0.10),transparent_28%),linear-gradient(180deg,#183B6A_0%,#10233F_50%,#071526_100%)] px-4 pb-8 pt-4 text-white md:-mx-5 md:rounded-[30px] md:px-5 lg:-mx-6 lg:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_36%,rgba(103,232,249,0.05)_72%,transparent)]" />
        <div className="relative z-10 mx-auto max-w-[1120px] space-y-5">
          <section className="rounded-[30px] border border-white/14 bg-[linear-gradient(145deg,rgba(33,79,131,0.76),rgba(16,42,79,0.68)_56%,rgba(7,21,38,0.72))] p-5 shadow-[0_28px_72px_rgba(1,8,20,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-[720px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#D9FF57]">Business settings</p>
                <h1 className="mt-3 text-[36px] font-semibold leading-none tracking-[-0.07em] text-white sm:text-[42px]">Settings</h1>
                <p className="mt-3 text-[15px] leading-[1.75] text-[#D7E3F8]">
                  Configure the people, currencies, rails, approvals, proof records, and compliance reminders that keep Zila coordinated.
                </p>
              </div>
              <div className="rounded-[20px] border border-[#D9FF57]/16 bg-[#D9FF57]/[0.075] px-4 py-3">
                <p className="flex items-center gap-2 text-[12px] font-semibold text-[#EAFFB4]">
                  <span className="zila-live-dot h-2 w-2 rounded-full bg-[#D9FF57]" />
                  Kevin workspace active
                </p>
                <p className="mt-1 text-[12px] text-[#C9D4F5]">Business settings saved locally for demo.</p>
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-5">
              <SectionCard eyebrow="Profile & account" title="User and workspace profile" icon={UserRound}>
                <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#67E8F9]/18 bg-[linear-gradient(145deg,#1D4ED8,#102A4F)] text-[34px] font-semibold text-white shadow-[0_18px_38px_rgba(29,78,216,0.18)]">
                      K
                    </div>
                    <p className="mt-4 text-center text-[12px] font-semibold text-[#D7E3F8]">Profile photo</p>
                    <button type="button" className="mt-3 h-10 w-full rounded-full border border-white/10 bg-white/[0.055] text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:text-white">
                      Change avatar
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" value="Kevin" icon={UserRound} />
                    <Field label="Email address" value="kevin@zila.demo" icon={Mail} type="email" />
                    <Field label="Role" value="Operations Lead" icon={ShieldCheck} />
                    <Field label="Business/workspace name" value="Zila Operations" icon={Building2} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard eyebrow="Workspace preferences" title="Currencies, language, and locale" icon={Globe2}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField label="Default country" value="Kenya" options={["Kenya", "United States", "United Kingdom", "South Africa", "Australia"]} />
                  <SelectField label="Primary operating currency" value="USD" options={["USD", "KES", "EUR", "GBP", "AUD"]} />
                  <SelectField label="Secondary currency" value="KES" options={["KES", "USD", "EUR", "GBP", "UGX"]} />
                  <SelectField label="Language" value="English" options={["English", "Swahili", "French"]} />
                  <SelectField label="Time zone" value="East Africa Time" options={["East Africa Time", "UTC", "Pacific Time", "Eastern Time", "Central Africa Time"]} />
                </div>
              </SectionCard>

              <SectionCard eyebrow="Payment setup" title="Approval and payout preferences" icon={SlidersHorizontal}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3">
                    <SelectField label="Default payment rail" value="XRP/XRPL" options={["XRP/XRPL", "Stablecoin rail", "Bank transfer", "Mobile money"]} />
                    <SelectField label="Default settlement currency" value="USD" options={["USD", "KES", "XRP", "USDC"]} />
                    <SelectField label="Payment approval preference" value="Wallet signature required" options={["Wallet signature required", "Two-person review", "Operations lead approval"]} />
                    <SelectField label="Payout review mode" value="Operational review" options={["Operational review", "Fast approval", "Reserve-first review"]} />
                  </div>
                  <div className="space-y-3">
                    <SwitchRow label="Auto attach proof after payment" />
                    <SwitchRow label="Reserve protection" detail="Protect commitments before money is marked safe to spend." />
                    <SwitchRow label="Operational alerts" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard eyebrow="Compliance, taxes & licences" title="Recurring business obligations" icon={LockKeyhole}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3">
                    {complianceItems.map(([label, value]) => (
                      <div key={label} className="rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">{label}</p>
                        <p className="mt-2 text-[14px] font-semibold leading-[1.45] text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <SwitchRow label="Compliance payment reminders" />
                    <SwitchRow label="Compliance reminders enabled" />
                    <button type="button" className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] px-5 text-[13px] font-semibold text-[#EAFFB4] transition hover:bg-[#D9FF57]/[0.12]">
                      <FileCheck2 className="h-4 w-4" strokeWidth={2} />
                      Export compliance report
                    </button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard eyebrow="Notifications & language" title="Operational communication" icon={BellRing}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SwitchRow label="Payment reminders" />
                  <SwitchRow label="Reserve alerts" />
                  <SwitchRow label="Supplier payout reminders" />
                  <SwitchRow label="Compliance reminders" />
                  <SwitchRow label="Weekly report email" />
                  <SelectField label="Language preference" value="English" options={["English", "Swahili", "French"]} />
                </div>
              </SectionCard>

              <SectionCard eyebrow="Proof & reporting" title="Verified operational records" icon={FileCheck2}>
                <p className="mb-4 rounded-[18px] border border-[#67E8F9]/12 bg-[#67E8F9]/[0.06] px-4 py-3 text-[13px] leading-[1.6] text-[#D7E3F8]">
                  Zila turns completed payments, reserve changes, and operational activity into verified records and reports.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {proofSettings.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[18px] border border-[#D9FF57]/12 bg-[#D9FF57]/[0.055] p-4">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#D9FF57]" strokeWidth={2} />
                      <p className="text-[13px] font-semibold leading-[1.45] text-[#D7E3F8]">{item}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-5">
              <SectionCard eyebrow="Wallet & connected rails" title="Xaman / XRPL connection" icon={WalletCards}>
                <div className="rounded-[22px] border border-[#67E8F9]/14 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.13),transparent_30%),rgba(7,21,38,0.36)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[#D9FF57]/16 bg-[#D9FF57]/[0.08] text-[#EAFFB4]">
                      <RadioTower className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7EE7F6]">{walletActive ? "Connected Xaman/XRPL wallet" : "Wallet disconnected"}</p>
                      <p className="mt-2 break-all text-[13px] font-semibold leading-[1.5] text-white">{walletAddress}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {walletRows.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 rounded-[15px] border border-white/8 bg-white/[0.045] px-3 py-2">
                        <p className="text-[11px] text-[#AFC0DD]">{label}</p>
                        <p className="break-words text-right text-[12px] font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2">
                    {railStatuses.map(([rail, status, detail]) => (
                      <div key={rail} className="rounded-[16px] border border-white/8 bg-white/[0.045] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[12px] font-semibold text-white">{rail}</p>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(status)}`}>{status}</span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-[1.5] text-[#AFC0DD]">{detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={reconnectWallet} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#67E8F9]/22 hover:text-white sm:w-auto">
                      <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                      Reconnect wallet
                    </button>
                    <CopyButton
                      value={walletAddress}
                      onCopied={() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1800);
                      }}
                    />
                    <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#67E8F9]/22 hover:text-white sm:w-auto">
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                      View on XRPL
                    </a>
                    <button type="button" onClick={disconnectWallet} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:text-white sm:w-auto">
                      <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                      Disconnect
                    </button>
                  </div>
                  {copied ? <p className="mt-3 text-[12px] font-semibold text-[#D9FF57]">Wallet address copied.</p> : null}
                </div>
              </SectionCard>

              <SectionCard eyebrow="Account" title="Settings actions" icon={Languages}>
                <div className="space-y-3">
                  <button type="button" onClick={saveSettings} className="zila-operational-action-soft inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75]">
                    <Save className="h-4 w-4" strokeWidth={2} />
                    Save settings
                  </button>
                  <Link href="/home" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 text-[13px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:text-white">
                    <Globe2 className="h-4 w-4" strokeWidth={2} />
                    Back to dashboard
                  </Link>
                  {saved ? (
                    <div className="flex items-center gap-2 rounded-[16px] border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 py-3 text-[12px] font-semibold text-[#EAFFB4]">
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      Settings saved.
                    </div>
                  ) : null}
                </div>
              </SectionCard>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default SettingsScreen;
