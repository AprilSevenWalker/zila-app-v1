"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, Clock3, Landmark, Search, Smartphone, WalletCards } from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import { FlowBackNav } from "@/components/ui/FlowBackNav";
import { IconTile } from "@/components/ui/IconTile";
import { savePaymentDraft } from "@/lib/paymentDraftStore";

const projects = [
  {
    id: "project-horizon",
    name: "Project Horizon",
    runway: "11.5 days after payout",
    reserve: "$19,920 reserve after payout",
    pressure: "Supplier timing watch",
  },
  {
    id: "atlas-project",
    name: "Atlas Project",
    runway: "8.2 days after payout",
    reserve: "$17,640 reserve after payout",
    pressure: "Logistics timing watch",
  },
  {
    id: "northstar-project",
    name: "Northstar Project",
    runway: "6.4 days after payout",
    reserve: "$14,980 reserve after payout",
    pressure: "Contractor pressure rising",
  },
];

const suppliers = [
  {
    id: "horizon-supplier",
    name: "Northline Suppliers",
    projectId: "project-horizon",
    obligation: "$4,300",
    timing: "Due Friday",
    status: "Ready to pay",
    reason: "Materials payout",
  },
  {
    id: "skyline-travel",
    name: "Skyline Travel",
    projectId: "atlas-project",
    obligation: "$3,850",
    timing: "Due tomorrow",
    status: "Awaiting release",
    reason: "Travel payout",
  },
  {
    id: "mara-contractors",
    name: "Mara Contractors",
    projectId: "northstar-project",
    obligation: "$5,200",
    timing: "Due Friday",
    status: "Payment window open",
    reason: "Contractor payment",
  },
];

const currencies = ["USD", "KES", "USDT", "USDC", "RLUSD", "XRP"];
const rails = ["Stablecoin", "Bank transfer", "Mobile money"];
const reasons = ["Supplier payment", "Contractor payment", "Materials payout", "Payroll", "Logistics deposit", "Custom"];

const methods = [
  {
    title: "Stablecoin",
    href: "/payments/stablecoin",
    status: "Available now",
    description: "Fast supplier settlement with reserve impact and proof attached.",
    icon: WalletCards,
    active: true,
    tags: ["Fastest", "Low cost", "Operational proof attached", "Available now"],
    cta: "Send stablecoin",
  },
  {
    title: "Bank Transfer",
    href: "/payments/bank-transfer",
    status: "Coming soon",
    description: "Multi-currency bank payouts with operational tracking.",
    icon: Landmark,
    active: false,
    tags: ["Multi currency bank payouts", "Real time operational tracking"],
    cta: "Coming soon",
  },
  {
    title: "Mobile Money",
    href: "/payments/mobile-money",
    status: "Coming soon",
    description: "Direct mobile wallet payouts for field and supplier operations.",
    icon: Smartphone,
    active: false,
    tags: ["Direct mobile wallet payouts", "Emerging market operations"],
    cta: "Coming soon",
  },
];

export default function ChoosePaymentMethodPage() {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [supplierProfiles, setSupplierProfiles] = useState(suppliers);
  const [supplierId, setSupplierId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("XRP");
  const [paymentRail, setPaymentRail] = useState("Stablecoin");
  const [paymentReason, setPaymentReason] = useState("Supplier payment");
  const [notes, setNotes] = useState("");
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const activeProject = projects.find((project) => project.id === projectId) ?? projects[0];
  const stablecoinHref = "/payments/make-payment";
  const routeParams = `?project=${encodeURIComponent(activeProject.id)}`;
  const numericAmount = Number(amount.replace(/[^\d.]/g, ""));
  const amountLabel = Number.isFinite(numericAmount) && numericAmount > 0 ? `${numericAmount.toLocaleString("en-US")} ${currency}` : "Not entered";
  const paymentSummary = [
    { label: "Recipient", value: recipientName || "Not selected" },
    { label: "Project", value: activeProject.name },
    { label: "Amount", value: amountLabel },
    { label: "Payment reason", value: paymentReason || "Not selected" },
  ];
  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();
    if (!query) {
      return supplierProfiles;
    }

    return supplierProfiles.filter((supplier) => [supplier.name, supplier.obligation, supplier.timing, supplier.status].some((value) => value.toLowerCase().includes(query)));
  }, [supplierProfiles, supplierSearch]);

  const handleProjectSelect = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    setSupplierSearch("");
  };

  const handleSupplierSelect = (nextSupplierId: string) => {
    setSupplierId(nextSupplierId);
    const supplier = supplierProfiles.find((item) => item.id === nextSupplierId);
    if (supplier) {
      setRecipientName(supplier.name);
    }
  };

  const applySuggestion = (supplier: typeof suppliers[number]) => {
    setSupplierId(supplier.id);
    setRecipientName(supplier.name);
    setProjectId(supplier.projectId);
    setAmount(supplier.obligation.replace(/[^\d.]/g, ""));
    setPaymentReason(supplier.reason);
    setNotes(`${supplier.status} · ${supplier.timing}`);
  };

  const handleAddSupplier = () => {
    const name = newSupplierName.trim();
    if (!name) {
      return;
    }

    const supplier = {
      id: `supplier-${Date.now()}`,
      name,
      projectId,
      obligation: "$0",
      timing: "No due date set",
      status: "New supplier",
      reason: "Supplier payment",
    };

    setSupplierProfiles((current) => [supplier, ...current]);
    setSupplierId(supplier.id);
    setRecipientName(supplier.name);
    setNewSupplierName("");
    setAddingSupplier(false);
  };

  const handleContinue = () => {
    savePaymentDraft({
      projectId: activeProject.id,
      projectName: activeProject.name,
      amountValue: Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0,
      paymentType: paymentReason,
      recipientName,
      currency,
      paymentRail,
      notes,
    });
  };

  return (
    <AppShell>
      <div className="relative text-white">
        <div className="pointer-events-none absolute inset-x-[-2rem] top-[-1rem] h-80 rounded-[36px] bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.16),transparent_24%)]" />

        <div className="relative space-y-6">
          <FlowBackNav
            items={[
              { label: "Payments", href: "/payments", primary: true },
              { label: "Dashboard", href: "/home" },
            ]}
          />

          <section className="zila-unified-panel-soft overflow-hidden rounded-[32px] p-6 md:p-8">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Send Payment</p>
                <h1 className="mt-4 max-w-[760px] text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
                  Choose the supplier, project, and payout rail.
                </h1>
                <p className="mt-4 max-w-[620px] text-[15px] leading-[1.7] text-[#D7E3F8]">
                  Zila keeps the payout linked to reserve impact, runway, and proof readiness.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/12 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Payment Summary</p>
                <div className="mt-4 space-y-3">
                  {paymentSummary.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-[12px] text-[#AFC0DD]">{item.label}</p>
                      <p className="max-w-[180px] text-right text-[13px] font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="mt-8 rounded-[30px] border border-white/12 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] md:p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Create payout</p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-white">Enter the payment details yourself.</h2>
                <p className="mt-2 max-w-[660px] text-[13px] leading-[1.65] text-[#C9D4F5]">
                  Select a saved supplier or type a recipient manually. Amount, project, currency, rail, and reason stay editable until you send.
                </p>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Saved supplier</span>
                  <select value={supplierId} onChange={(event) => handleSupplierSelect(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    <option value="">Select a saved supplier, or type below</option>
                    {supplierProfiles.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Supplier / recipient name</span>
                  <input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Who are you paying?" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#8FA6C7]" />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setAddingSupplier((open) => !open)} className="inline-flex h-10 items-center justify-center rounded-full border border-[#D9FF57]/22 bg-[#D9FF57]/12 px-4 text-[12px] font-semibold text-[#F1FFB8]">
                  Add new supplier
                </button>
                <p className="text-[12px] text-[#AFC0DD]">Adding a supplier only saves the name. You still enter the payment amount manually.</p>
              </div>

              {addingSupplier ? (
                <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-white/10 bg-[#102A4F]/58 p-4 sm:flex-row">
                  <input value={newSupplierName} onChange={(event) => setNewSupplierName(event.target.value)} placeholder="New supplier name" className="h-11 flex-1 rounded-[15px] border border-white/12 bg-[#071D38]/56 px-3 text-[13px] text-white outline-none placeholder:text-[#8FA6C7]" />
                  <button type="button" onClick={handleAddSupplier} className="h-11 rounded-full bg-white px-4 text-[12px] font-semibold text-[#102A4F]">
                    Save supplier
                  </button>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px_150px_180px]">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Project</span>
                  <select value={projectId} onChange={(event) => handleProjectSelect(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Amount</span>
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#8FA6C7]" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Currency</span>
                  <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {currencies.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payment rail</span>
                  <select value={paymentRail} onChange={(event) => setPaymentRail(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {rails.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Payment reason</span>
                  <select value={paymentReason} onChange={(event) => setPaymentReason(event.target.value)} className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none">
                    {reasons.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-[12px] font-medium text-[#C9D4F5]">Notes</span>
                  <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional context for this payout" className="h-12 w-full rounded-[17px] border border-white/12 bg-[#102A4F] px-4 text-[14px] text-white outline-none placeholder:text-[#8FA6C7]" />
                </label>
              </div>
            </section>

            <div className="mt-4 rounded-[22px] border border-[#D9FF57]/12 bg-[#D9FF57]/[0.055] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Operational Impact Preview</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {[
                  ["Reserve", numericAmount > 0 ? "Reserve still protected" : "Enter amount to preview"],
                  ["Runway", numericAmount > 0 ? activeProject.runway : "Updates as you type"],
                  ["Payout timing", paymentRail === "Stablecoin" ? "Expected within 1 minute" : "Coming soon"],
                  ["Proof", "Appears in project proof history"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[16px] border border-white/8 bg-[#071D38]/30 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AFC0DD]">{label}</p>
                    <p className="mt-1 text-[12px] font-semibold leading-[1.4] text-[#E7F5C3]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Optional suggestions</p>
                  <p className="mt-1 text-[13px] text-[#AFC0DD]">Payments due can fill the form, but you can change the amount before sending.</p>
                </div>
                <div className="relative w-full sm:w-[240px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9FB3D9]" strokeWidth={2} />
                  <input
                    value={supplierSearch}
                    onChange={(event) => setSupplierSearch(event.target.value)}
                    placeholder="Search payments due"
                    className="h-10 w-full rounded-full border border-white/10 bg-[#102A4F]/64 pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[#7F91AF] focus:border-[#D9FF57]/24"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {filteredSuppliers.map((supplier) => (
                  <button
                    key={supplier.id}
                    type="button"
                    onClick={() => applySuggestion(supplier)}
                    className="rounded-[18px] border border-white/8 bg-[#102A4F]/38 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.055]"
                  >
                    <p className="text-[14px] font-semibold text-white">{supplier.name}</p>
                    <p className="mt-2 text-[12px] text-[#AFC0DD]">{supplier.status}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#D9FF57]/12 bg-[#D9FF57]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[#E7F5C3]">Suggested {supplier.obligation}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-[#D7E3F8]">{supplier.timing}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {methods.map((method) => {
                const MethodIcon = method.icon;
                const href = method.title === "Stablecoin" ? stablecoinHref : `${method.href}${routeParams}`;
                const card = (
                  <div
                    className={`h-full rounded-[28px] border p-5 transition duration-200 ${
                      method.active
                        ? "border-[#D9FF57]/28 bg-[radial-gradient(circle_at_24%_0%,rgba(217,255,87,0.14),transparent_30%),linear-gradient(180deg,rgba(31,82,132,0.72),rgba(16,42,79,0.86))] shadow-[0_24px_54px_rgba(13,35,68,0.22),0_0_28px_rgba(217,255,87,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5"
                        : "border-white/10 bg-white/[0.035] opacity-78 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <IconTile glow={method.active ? "mint" : "cyan"} className={method.active ? "border-[#D9FF57]/22 bg-[#D9FF57]/12 text-[#EAFFB4]" : "bg-white/[0.06] text-[#BFEFFF]"}>
                        <MethodIcon className="h-[15px] w-[15px]" strokeWidth={2} />
                      </IconTile>
                      <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${method.active ? "border-[#D9FF57]/24 bg-[#D9FF57]/12 text-[#F1FFB8]" : "border-white/10 bg-white/[0.04] text-[#AFC0DD]"}`}>
                        {method.status}
                      </span>
                    </div>
                    <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.04em] text-white">{method.title}</h2>
                    <p className="mt-2 text-[13px] leading-[1.6] text-[#B9C7E6]">{method.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {method.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-semibold text-[#D7E3F8]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6">
                      {method.active ? (
                        <span className="zila-operational-action inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] shadow-[0_18px_36px_rgba(217,255,87,0.18)]">
                          {method.cta}
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </span>
                      ) : (
                        <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-5 text-[13px] font-semibold text-[#AFC0DD]">
                          <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                          {method.cta}
                        </span>
                      )}
                    </div>
                  </div>
                );

                return method.active ? (
                  <Link key={method.title} href={href} onClick={handleContinue} className="block">
                    {card}
                  </Link>
                ) : (
                  <Link key={method.title} href={href} className="block">
                    {card}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              {["Stablecoin route available now", "Reserve protection remains active", "Proof attaches automatically", "Bank and mobile money routes prepared for rollout"].map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 py-2 text-[11px] font-semibold text-[#E7F5C3]">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#D9FF57]" strokeWidth={2} />
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
