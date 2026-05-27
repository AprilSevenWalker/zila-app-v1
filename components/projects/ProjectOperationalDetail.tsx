"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Archive,
  ArrowRightLeft,
  BadgeCheck,
  ChevronDown,
  Copy,
  FileText,
  MessageCircle,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { MockInvoiceUpload } from "@/components/documents/MockInvoiceUpload";
import { AppShell } from "@/components/ui/AppShell";
import { getProjects, type Project } from "@/data/projects";
import { getOperationalProjectById } from "@/lib/projectStore";

type ProjectType =
  | "Residency"
  | "Construction"
  | "Media production"
  | "Event"
  | "Logistics"
  | "Real estate development"
  | "Agency project"
  | "Other";

interface VaultDetail {
  label: string;
  value: string;
}

interface ProjectVault {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  committed: number;
  pressure: "Healthy" | "Watch" | "Pressure";
  upcomingPayout: string;
  details: VaultDetail[];
  suppliers: string[];
  participants: string[];
  notes: string[];
  archived?: boolean;
}

type ActionModal =
  | null
  | { kind: "create-vault" }
  | { kind: "edit-vault"; vaultId: string }
  | { kind: "add-supplier" | "add-participant" | "add-note" | "add-subcategory" | "add-payout" | "attach-proof" | "move-money" | "proof-history"; vaultId: string }
  | { kind: "delete-vault"; vaultId: string }
  | { kind: "project-edit" }
  | { kind: "delete-project" };

interface ProjectDetailState {
  name: string;
  type: ProjectType;
  budget: string;
  currency: string;
  status: string;
  owner: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const projectTypes: ProjectType[] = [
  "Residency",
  "Construction",
  "Media production",
  "Event",
  "Logistics",
  "Real estate development",
  "Agency project",
  "Other",
];

const residencyVaults: ProjectVault[] = [
  {
    id: "flights",
    name: "Flights",
    allocated: 6800,
    spent: 2400,
    committed: 1900,
    pressure: "Watch",
    upcomingPayout: "Sarah flight hold · tomorrow",
    details: [
      { label: "Participant", value: "Sarah" },
      { label: "Route", value: "Nairobi → Perth" },
      { label: "Estimated flight cost", value: "$1,850" },
      { label: "Booked cost", value: "$1,720" },
      { label: "Payment status", value: "Record attaches after payout" },
    ],
    suppliers: ["Skyline Travel"],
    participants: ["Sarah", "Kevin"],
    notes: ["Add participant flight for Sarah when dates are confirmed."],
  },
  {
    id: "accommodation",
    name: "Accommodation",
    allocated: 9200,
    spent: 4200,
    committed: 2400,
    pressure: "Healthy",
    upcomingPayout: "Villa deposit · Friday",
    details: [
      { label: "Stay", value: "Two villas" },
      { label: "Estimated cost", value: "$9,200" },
      { label: "Booked cost", value: "$6,600 committed" },
      { label: "Record status", value: "Deposit verified" },
    ],
    suppliers: ["North Beach Villas"],
    participants: ["Residency cohort"],
    notes: ["Housing can split into two villas if arrivals change."],
  },
  {
    id: "food",
    name: "Food",
    allocated: 3600,
    spent: 820,
    committed: 640,
    pressure: "Healthy",
    upcomingPayout: "Catering advance · next week",
    details: [
      { label: "Category", value: "Meals and groceries" },
      { label: "Daily range", value: "$210-$260" },
      { label: "Reserve impact", value: "Minimal" },
    ],
    suppliers: ["Local catering partner"],
    participants: ["Residency cohort"],
    notes: ["Small updates from receipts should record without reserve movement."],
  },
  {
    id: "transport",
    name: "Transport",
    allocated: 2200,
    spent: 560,
    committed: 420,
    pressure: "Healthy",
    upcomingPayout: "Airport pickup · Monday",
    details: [
      { label: "Route", value: "Airport and venue transfers" },
      { label: "Payment status", value: "Ready to schedule" },
    ],
    suppliers: ["City transfer partner"],
    participants: ["Arrival group"],
    notes: [],
  },
  {
    id: "experiences",
    name: "Experiences",
    allocated: 3000,
    spent: 400,
    committed: 900,
    pressure: "Healthy",
    upcomingPayout: "Workshop venue · Thursday",
    details: [
      { label: "Experience", value: "Welcome dinner and field visits" },
      { label: "Record status", value: "Ready" },
    ],
    suppliers: ["Workshop venue"],
    participants: ["Residency cohort"],
    notes: [],
  },
  {
    id: "staff",
    name: "Staff",
    allocated: 4100,
    spent: 1200,
    committed: 1300,
    pressure: "Watch",
    upcomingPayout: "Coordinator payout · Friday",
    details: [
      { label: "Role", value: "Program coordinator" },
      { label: "Payment status", value: "Queued" },
    ],
    suppliers: ["Operations team"],
    participants: ["Coordinator"],
    notes: [],
  },
  {
    id: "vendor-payouts",
    name: "Vendor payouts",
    allocated: 5200,
    spent: 1600,
    committed: 2100,
    pressure: "Watch",
    upcomingPayout: "Two vendor payouts · tomorrow",
    details: [
      { label: "Vendors", value: "Venue, AV, catering" },
      { label: "Record status", value: "Auto attach on payout" },
    ],
    suppliers: ["Venue", "AV partner"],
    participants: [],
    notes: [],
  },
  {
    id: "operations-reserve",
    name: "Operations reserve",
    allocated: 4800,
    spent: 0,
    committed: 900,
    pressure: "Healthy",
    upcomingPayout: "Reserve untouched",
    details: [
      { label: "Protected", value: "$3,900" },
      { label: "Release status", value: "Protected before payout" },
    ],
    suppliers: [],
    participants: [],
    notes: ["Reserve protection remains active this week."],
  },
  {
    id: "emergency-reserve",
    name: "Emergency reserve",
    allocated: 2500,
    spent: 0,
    committed: 0,
    pressure: "Healthy",
    upcomingPayout: "No payout scheduled",
    details: [
      { label: "Protected", value: "$2,500" },
      { label: "Operational status", value: "Healthy" },
    ],
    suppliers: [],
    participants: [],
    notes: [],
  },
];

const constructionVaults: ProjectVault[] = [
  {
    id: "materials",
    name: "Materials",
    allocated: 12400,
    spent: 7200,
    committed: 3100,
    pressure: "Watch",
    upcomingPayout: "Timber supplier · tomorrow",
    details: [
      { label: "Material type", value: "Timber and fixtures" },
      { label: "Supplier", value: "Northline Materials" },
      { label: "Quantity", value: "3 delivery lots" },
      { label: "Estimated cost", value: "$12,400" },
      { label: "Actual cost", value: "$10,300 committed" },
      { label: "Delivery status", value: "Partially delivered" },
    ],
    suppliers: ["Northline Materials"],
    participants: ["Site manager"],
    notes: ["Material cost is the active pressure point."],
  },
  {
    id: "labour",
    name: "Labour",
    allocated: 9800,
    spent: 5200,
    committed: 2600,
    pressure: "Healthy",
    upcomingPayout: "Crew payout · Friday",
    details: [
      { label: "Crew", value: "5 contractors" },
      { label: "Payment status", value: "Prepared" },
    ],
    suppliers: ["Site crew"],
    participants: ["Foreman", "Crew"],
    notes: [],
  },
  {
    id: "equipment",
    name: "Equipment",
    allocated: 3600,
    spent: 1400,
    committed: 800,
    pressure: "Healthy",
    upcomingPayout: "Lift hire · next week",
    details: [
      { label: "Equipment", value: "Lift and temporary power" },
      { label: "Record status", value: "Invoice requested" },
    ],
    suppliers: ["Hire partner"],
    participants: [],
    notes: [],
  },
  {
    id: "permits",
    name: "Permits",
    allocated: 1800,
    spent: 1200,
    committed: 300,
    pressure: "Healthy",
    upcomingPayout: "Inspection fee · pending",
    details: [
      { label: "Permit type", value: "Inspection and access" },
      { label: "Status", value: "Submitted" },
    ],
    suppliers: ["Council office"],
    participants: ["Project owner"],
    notes: [],
  },
  {
    id: "site-operations",
    name: "Site operations",
    allocated: 4200,
    spent: 1700,
    committed: 1200,
    pressure: "Healthy",
    upcomingPayout: "Site utilities · Friday",
    details: [
      { label: "Category", value: "Utilities, security, site support" },
      { label: "Reserve impact", value: "Low" },
    ],
    suppliers: ["Site services"],
    participants: ["Site manager"],
    notes: [],
  },
  {
    id: "supplier-payments",
    name: "Supplier payments",
    allocated: 7600,
    spent: 3300,
    committed: 3100,
    pressure: "Pressure",
    upcomingPayout: "Supplier balance · Friday",
    details: [
      { label: "Supplier", value: "Concrete partner" },
      { label: "Payment status", value: "Reserve review needed" },
    ],
    suppliers: ["Concrete partner"],
    participants: [],
    notes: ["Delay noncritical payout until client payment settles."],
  },
  {
    id: "contingency-reserve",
    name: "Contingency reserve",
    allocated: 5000,
    spent: 0,
    committed: 1200,
    pressure: "Healthy",
    upcomingPayout: "Protected before release",
    details: [
      { label: "Protected", value: "$3,800" },
      { label: "Release status", value: "Requires approval" },
    ],
    suppliers: [],
    participants: [],
    notes: ["Reserve remains above threshold after planned payout."],
  },
];

function currency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function parseCurrencyAmount(value: string) {
  const numeric = Number(value.replace(/[^0-9.-]+/g, ""));

  return Number.isFinite(numeric) ? numeric : 0;
}

function getDefaultType(project: Project): ProjectType {
  if (project.id === "harbour-road") {
    return "Residency";
  }

  if (project.id === "buildops-site-a") {
    return "Construction";
  }

  return "Agency project";
}

function makeGenericVaults(project: Project): ProjectVault[] {
  const budget = parseCurrencyAmount(project.budget) || 16000;

  return [
    {
      id: "delivery",
      name: "Delivery",
      allocated: Math.round(budget * 0.42),
      spent: parseCurrencyAmount(project.spent) * 0.45,
      committed: 1800,
      pressure: project.statusTone === "warning" ? "Watch" : "Healthy",
      upcomingPayout: "Delivery payout · this week",
      details: [
        { label: "Workstream", value: "Core delivery" },
        { label: "Payment status", value: "Tracking" },
      ],
      suppliers: ["Delivery partner"],
      participants: [project.owner],
      notes: ["Core delivery remains connected to operational history."],
    },
    {
      id: "suppliers",
      name: "Suppliers",
      allocated: Math.round(budget * 0.26),
      spent: parseCurrencyAmount(project.spent) * 0.25,
      committed: 1200,
      pressure: "Healthy",
      upcomingPayout: "Supplier check · tomorrow",
      details: [
        { label: "Supplier", value: "Primary vendor" },
        { label: "Record status", value: "Ready" },
      ],
      suppliers: ["Primary vendor"],
      participants: [],
      notes: [],
    },
    {
      id: "operations-reserve",
      name: "Operations reserve",
      allocated: Math.round(budget * 0.18),
      spent: 0,
      committed: 600,
      pressure: "Healthy",
      upcomingPayout: "Protected",
      details: [
        { label: "Protected", value: project.reserved },
        { label: "Reserve status", value: "Active" },
      ],
      suppliers: [],
      participants: [],
      notes: ["Reserve protection remains active."],
    },
  ];
}

function getVaultDefaults(type: ProjectType, project: Project) {
  if (type === "Residency") {
    return residencyVaults;
  }

  if (type === "Construction") {
    return constructionVaults;
  }

  return makeGenericVaults(project);
}

function getInitialProjectDetails(project: Project): ProjectDetailState {
  const type = getDefaultType(project);

  return {
    name: project.name,
    type,
    budget: project.budget,
    currency: "USD",
    status: project.status,
    owner: project.owner,
    startDate: "2026-05-20",
    endDate: "2026-06-28",
    notes: project.summary,
  };
}

function pressureClass(pressure: ProjectVault["pressure"]) {
  if (pressure === "Pressure") {
    return "border-[#FBBF24]/22 bg-[#FBBF24]/[0.08] text-[#FFE8B0]";
  }

  if (pressure === "Watch") {
    return "border-[#67E8F9]/20 bg-[#67E8F9]/[0.08] text-[#DDFBFF]";
  }

  return "border-[#D9FF57]/18 bg-[#D9FF57]/[0.075] text-[#EAFFB4]";
}

function vaultSurfaceClass(vault: ProjectVault, isExpanded: boolean) {
  const reserve = vault.name.toLowerCase().includes("reserve");

  if (isExpanded) {
    return "zila-vault-active border-[#D9FF57]/20 bg-[linear-gradient(180deg,rgba(217,255,87,0.075),rgba(255,255,255,0.06))] shadow-[0_24px_62px_rgba(0,0,0,0.20),0_0_30px_rgba(217,255,87,0.07),inset_0_1px_0_rgba(255,255,255,0.10)]";
  }

  if (vault.pressure === "Pressure") {
    return "border-[#FBBF24]/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.075),rgba(255,255,255,0.045))] shadow-[0_16px_42px_rgba(251,191,36,0.04),inset_0_1px_0_rgba(255,255,255,0.07)]";
  }

  if (vault.pressure === "Watch") {
    return "border-[#67E8F9]/16 bg-white/[0.06] shadow-[0_12px_34px_rgba(103,232,249,0.035),inset_0_1px_0_rgba(255,255,255,0.08)]";
  }

  if (reserve) {
    return "border-[#D9FF57]/10 bg-[#071526]/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]";
  }

  return "border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.065)]";
}

function getVaultReserveImpact(vault: ProjectVault) {
  const remaining = Math.max(vault.allocated - vault.spent - vault.committed, 0);
  const ratio = vault.allocated > 0 ? remaining / vault.allocated : 0;

  if (vault.name.toLowerCase().includes("reserve")) {
    return remaining > 0 ? "Reserve threshold protected" : "Reserve requires replenishment";
  }

  if (vault.pressure === "Pressure") {
    return "Reserve review recommended before release";
  }

  if (ratio < 0.18) {
    return "Operating cushion tightening";
  }

  return "Reserve impact low";
}

function getVaultSignal(vault: ProjectVault) {
  if (vault.pressure === "Pressure") {
    return "Operational pressure increasing";
  }

  if (vault.upcomingPayout.toLowerCase().includes("tomorrow") || vault.upcomingPayout.toLowerCase().includes("friday")) {
    return "Supplier payout approaching";
  }

  if (vault.name.toLowerCase().includes("reserve")) {
    return "Reserve stable";
  }

  return "Treasury healthy";
}

function getPayoutSchedule(vault: ProjectVault) {
  const supplier = vault.suppliers[0] ?? "Vendor";

  return [
    { label: vault.upcomingPayout, detail: supplier, state: vault.pressure === "Pressure" ? "Review" : "Ready" },
    { label: "Record sync", detail: "Operational proof attaches automatically after settlement", state: "Prepared" },
  ];
}

function getProofRecords(vault: ProjectVault) {
  return [
    `${vault.name} allocation verified`,
    `${getVaultReserveImpact(vault)}`,
    "Settlement context linked to project memory",
  ];
}

function getRecentActivity(vault: ProjectVault) {
  return [
    `${vault.name} balance recalculated`,
    vault.suppliers[0] ? `${vault.suppliers[0]} linked` : "No supplier pressure detected",
    vault.pressure === "Healthy" ? "Reserve state remains healthy" : "Pressure state reviewed",
  ];
}

function cloneVaults(vaults: ProjectVault[]) {
  return vaults.map((vault) => ({
    ...vault,
    details: vault.details.map((detail) => ({ ...detail })),
    suppliers: [...vault.suppliers],
    participants: [...vault.participants],
    notes: [...vault.notes],
  }));
}

export function ProjectOperationalDetail({ project, requestedProjectId }: { project: Project; requestedProjectId?: string }) {
  const activeProject = requestedProjectId ? getOperationalProjectById(getProjects(), requestedProjectId) ?? project : project;
  const initialProjectDetails = getInitialProjectDetails(activeProject);
  const [projectDetails, setProjectDetails] = useState<ProjectDetailState>(initialProjectDetails);
  const [projectType, setProjectType] = useState<ProjectType>(initialProjectDetails.type);
  const [vaults, setVaults] = useState<ProjectVault[]>(() => cloneVaults(getVaultDefaults(initialProjectDetails.type, activeProject)));
  const [expandedVaultId, setExpandedVaultId] = useState(vaults[0]?.id ?? "");
  const [actionModal, setActionModal] = useState<ActionModal>(null);
  const [newVaultName, setNewVaultName] = useState("");
  const [newVaultAmount, setNewVaultAmount] = useState("2500");
  const [newVaultCategory, setNewVaultCategory] = useState("Operations");
  const [newVaultReserve, setNewVaultReserve] = useState(false);
  const [newVaultAssignee, setNewVaultAssignee] = useState("");
  const [newVaultNotes, setNewVaultNotes] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [modalAmount, setModalAmount] = useState("500");
  const [timelineEntries, setTimelineEntries] = useState([
    `${initialProjectDetails.name} operating range active`,
    `${initialProjectDetails.type} vault structure ready`,
    "Reserve threshold protected",
    "Operational history ready",
  ]);
  const [projectArchived, setProjectArchived] = useState(false);
  const [recalculationKey, setRecalculationKey] = useState(0);

  const activeVaults = vaults.filter((vault) => !vault.archived);
  const totals = useMemo(
    () =>
      activeVaults.reduce(
        (sum, vault) => ({
          allocated: sum.allocated + vault.allocated,
          spent: sum.spent + vault.spent,
          committed: sum.committed + vault.committed,
        }),
        { allocated: 0, spent: 0, committed: 0 },
      ),
    [activeVaults],
  );
  const remaining = Math.max(totals.allocated - totals.spent - totals.committed, 0);
  const pressureCount = activeVaults.filter((vault) => vault.pressure !== "Healthy").length;
  const reserveTotal = activeVaults
    .filter((vault) => vault.name.toLowerCase().includes("reserve"))
    .reduce((sum, vault) => sum + Math.max(vault.allocated - vault.spent - vault.committed, 0), 0);
  const projectPressureState = pressureCount ? "Watch" : "Healthy";

  const addTimelineEntry = (entry: string) => {
    setRecalculationKey((current) => current + 1);
    setTimelineEntries((current) => [entry, ...current].slice(0, 6));
  };

  const resetDefaults = (type: ProjectType) => {
    const nextVaults = cloneVaults(getVaultDefaults(type, project));
    setProjectType(type);
    setProjectDetails((current) => ({ ...current, type }));
    setVaults(nextVaults);
    setExpandedVaultId(nextVaults[0]?.id ?? "");
    addTimelineEntry(`${type} vault structure activated`);
  };

  const updateVault = (id: string, updates: Partial<ProjectVault>) => {
    setVaults((current) => current.map((vault) => (vault.id === id ? { ...vault, ...updates } : vault)));
    if (updates.allocated !== undefined || updates.spent !== undefined || updates.committed !== undefined || updates.pressure !== undefined) {
      addTimelineEntry("Vault calculation updated");
    }
  };

  const addVault = () => {
    const name = newVaultName.trim();
    const amount = Number(newVaultAmount);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const vault: ProjectVault = {
      id,
      name,
      allocated: amount,
      spent: 0,
      committed: 0,
      pressure: "Healthy",
      upcomingPayout: newVaultReserve ? "Protected before release" : "No payout scheduled",
      details: [
        { label: "Category", value: newVaultCategory },
        { label: "Reserve protected", value: newVaultReserve ? "Yes" : "No" },
        { label: "Operational state", value: "Ready for updates" },
      ],
      suppliers: newVaultAssignee.trim() ? [newVaultAssignee.trim()] : [],
      participants: [],
      notes: newVaultNotes.trim() ? [newVaultNotes.trim()] : ["Created from project detail."],
    };

    setVaults((current) => [...current, vault]);
    setExpandedVaultId(id);
    setNewVaultName("");
    setNewVaultAmount("2500");
    setNewVaultCategory("Operations");
    setNewVaultReserve(false);
    setNewVaultAssignee("");
    setNewVaultNotes("");
    setActionModal(null);
    addTimelineEntry(`${name} vault added`);
  };

  const archiveVault = (id: string) => {
    setVaults((current) => current.map((vault) => (vault.id === id ? { ...vault, archived: true } : vault)));
    if (expandedVaultId === id) {
      setExpandedVaultId(activeVaults.find((vault) => vault.id !== id)?.id ?? "");
    }
    addTimelineEntry("Vault archived");
  };

  const deleteVault = (id: string) => {
    setVaults((current) => current.filter((vault) => vault.id !== id));
    if (expandedVaultId === id) {
      setExpandedVaultId(activeVaults.find((vault) => vault.id !== id)?.id ?? "");
    }
    setActionModal(null);
    addTimelineEntry("Vault deleted");
  };

  const addDetail = (id: string, label: string, value: string) => {
    setVaults((current) =>
      current.map((vault) =>
        vault.id === id
          ? {
              ...vault,
              details: [...vault.details, { label, value }],
            }
          : vault,
      ),
    );
    addTimelineEntry(`${label} added`);
  };

  const addListItem = (id: string, list: "suppliers" | "participants" | "notes", value: string) => {
    setVaults((current) =>
      current.map((vault) =>
        vault.id === id
          ? {
              ...vault,
              [list]: [...vault[list], value],
            }
          : vault,
      ),
    );
    addTimelineEntry(`${list === "suppliers" ? "Supplier" : list === "participants" ? "Participant" : "Note"} added`);
  };

  const openItemModal = (modal: Exclude<ActionModal, null>) => {
    setModalValue("");
    setModalAmount("500");
    setActionModal(modal);
  };

  const selectedVault =
    actionModal && "vaultId" in actionModal ? vaults.find((vault) => vault.id === actionModal.vaultId) : undefined;
  const operationalSuggestions = useMemo(() => {
    const firstVault = activeVaults[0]?.name ?? "Operations";
    const reserveVault = activeVaults.find((vault) => vault.name.toLowerCase().includes("reserve"))?.name ?? "Operations Reserve";
    const payoutVault = activeVaults.find((vault) => vault.suppliers.length > 0 || vault.name.toLowerCase().includes("payout")) ?? activeVaults[0];
    const supplier = payoutVault?.suppliers[0] ?? "primary supplier";

    return [
      `Delivery reserve may tighten after the next ${payoutVault?.name ?? firstVault} payout.`,
      `${supplier} timing could reduce runway if settlement slips.`,
      `${reserveVault} protection remains healthy after current commitments.`,
      `${firstVault} has room for one additional operational update.`,
      `Operational history will sync automatically after settlement.`,
    ];
  }, [activeVaults]);

  const applyModalAction = () => {
    if (!actionModal || !("vaultId" in actionModal) || !selectedVault) {
      return;
    }

    const value = modalValue.trim();
    const amount = Number(modalAmount);

    if (actionModal.kind === "add-supplier" && value) {
      addListItem(selectedVault.id, "suppliers", value);
    }

    if (actionModal.kind === "add-participant" && value) {
      addListItem(selectedVault.id, "participants", value);
    }

    if (actionModal.kind === "add-note" && value) {
      addListItem(selectedVault.id, "notes", amount > 0 ? `${value} · ${currency(amount)}` : value);
      if (Number.isFinite(amount) && amount > 0) {
        updateVault(selectedVault.id, { spent: selectedVault.spent + amount });
      }
    }

    if (actionModal.kind === "add-subcategory" && value) {
      addDetail(selectedVault.id, value, amount > 0 ? `Committed ${currency(amount)}` : "Operational line added");
      if (Number.isFinite(amount) && amount > 0) {
        updateVault(selectedVault.id, { committed: selectedVault.committed + amount });
      }
    }

    if (actionModal.kind === "add-payout" && value) {
      addDetail(selectedVault.id, "Payout schedule", amount > 0 ? `${value} · ${currency(amount)}` : value);
      updateVault(selectedVault.id, {
        committed: selectedVault.committed + (Number.isFinite(amount) && amount > 0 ? amount : 0),
        upcomingPayout: value,
        pressure: selectedVault.pressure === "Healthy" && amount > selectedVault.allocated * 0.25 ? "Watch" : selectedVault.pressure,
      });
      addTimelineEntry(`Payout added to ${selectedVault.name}`);
    }

    if (actionModal.kind === "attach-proof" && value) {
      addDetail(selectedVault.id, "Operational record", value);
      addTimelineEntry(`Operational record attached to ${selectedVault.name}`);
    }

    if (actionModal.kind === "move-money" && Number.isFinite(amount) && amount > 0) {
      updateVault(selectedVault.id, {
        allocated: selectedVault.allocated + amount,
        pressure: selectedVault.pressure === "Pressure" ? "Watch" : selectedVault.pressure,
      });
      addTimelineEntry(`${currency(amount)} moved into ${selectedVault.name}`);
    }

    setActionModal(null);
  };

  const saveProjectDetails = () => {
    setProjectType(projectDetails.type);
    setActionModal(null);
    addTimelineEntry("Project details updated");
  };

  return (
    <AppShell>
      <div className="relative -mx-4 -mt-2 overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(103,232,249,0.22),transparent_30%),radial-gradient(ellipse_at_86%_4%,rgba(217,255,87,0.10),transparent_28%),linear-gradient(180deg,#183B6A_0%,#10233F_48%,#071526_100%)] px-4 pb-8 pt-4 text-white md:-mx-5 md:rounded-[30px] md:px-5 lg:-mx-6 lg:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_36%,rgba(103,232,249,0.05)_72%,transparent)]" />
        <div className="relative z-10 mx-auto max-w-[1080px]">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/20 hover:bg-[#D9FF57]/[0.06] hover:text-white"
          >
            <span>←</span>
            <span>Back to Projects</span>
          </Link>

          <section className="mt-3 rounded-[26px] border border-white/12 bg-white/[0.065] p-4 shadow-[0_24px_58px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl md:p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[680px]">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="min-w-0 break-words text-[32px] font-semibold leading-none tracking-[-0.06em] md:text-[38px]">{projectDetails.name}</h1>
                  {projectArchived ? (
                    <span className="rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">Archived</span>
                  ) : null}
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">{projectType} Operations</p>
                <p className="mt-3 max-w-[600px] text-[13px] leading-[1.6] text-[#D7E3F8]">{projectDetails.notes}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setActionModal({ kind: "project-edit" })} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] px-4 text-[12px] font-semibold text-[#F1FFB8] transition hover:bg-[#D9FF57]/[0.12]">
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    Edit project
                  </button>
                  <button type="button" onClick={() => addTimelineEntry(`${projectDetails.name} duplicated as draft`)} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:text-white">
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                    Duplicate
                  </button>
                  <button type="button" onClick={() => { setProjectArchived(true); addTimelineEntry("Project archived"); }} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:text-white">
                    <Archive className="h-3.5 w-3.5" strokeWidth={2} />
                    Archive
                  </button>
                  <button type="button" onClick={() => setActionModal({ kind: "delete-project" })} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#FCA5A5]/16 bg-[#FCA5A5]/[0.055] px-4 text-[12px] font-semibold text-[#FFD6D6] transition hover:bg-[#FCA5A5]/[0.08]">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Delete
                  </button>
                </div>
              </div>
              <div key={`health-${recalculationKey}`} className="zila-recalc-pulse w-full min-w-0 rounded-[22px] border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] p-3 shadow-[0_18px_44px_rgba(217,255,87,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] sm:w-auto sm:min-w-[230px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#EAFFB4]">Operational health</p>
                <p className="mt-2 break-words text-[19px] font-semibold tracking-[-0.045em]">{projectPressureState === "Watch" ? `${pressureCount} vaults need attention` : "Reserve threshold healthy"}</p>
                <p className="mt-2 text-[12px] leading-[1.55] text-[#D7E3F8]">Reserve protected: {currency(reserveTotal)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Allocated", currency(totals.allocated)],
                ["Spent", currency(totals.spent)],
                ["Committed", currency(totals.committed)],
                ["Remaining", currency(remaining)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-white/10 bg-[#071526]/36 p-3 transition duration-300 hover:border-[#D9FF57]/14">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9FB3D9]">{label}</p>
                  <p key={`${label}-${value}`} className="zila-number-shift mt-1.5 text-[20px] font-semibold tracking-[-0.05em] text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[#071526]/34 p-2.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]">Project type</span>
                <select
                  value={projectType}
                  onChange={(event) => resetDefaults(event.target.value as ProjectType)}
                  className="h-11 max-w-full rounded-[15px] border border-white/12 bg-[#102A4F] px-3 text-[13px] font-semibold text-white outline-none transition focus:border-[#D9FF57]/34"
                >
                  {projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex min-w-0 flex-wrap gap-2">
                <Link href={`/ask?project=${activeProject.id}`} className="inline-flex h-11 items-center justify-center rounded-full border border-[#D9FF57]/18 bg-[#D9FF57]/[0.08] px-4 text-[13px] font-semibold text-[#F1FFB8] transition hover:bg-[#D9FF57]/[0.12]">
                  Add update with Zila
                </Link>
                <MockInvoiceUpload assignedProject={projectDetails.name} buttonLabel="Upload invoice" tone="dark" inlineInFlexRow buttonClassName="!h-11 !rounded-full !border-white/12 !bg-white/[0.06] !text-[#D7E3F8]" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Operational vaults</p>
                  <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.05em]">Editable project structure</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModal({ kind: "create-vault" })}
                  className="zila-operational-action-soft inline-flex h-11 items-center gap-2 rounded-full bg-[#D9FF57] px-4 text-[13px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14),inset_0_1px_0_rgba(255,255,255,0.32)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  Add Vault
                </button>
              </div>

              <div className="space-y-3">
                {activeVaults.map((vault) => {
                  const vaultRemaining = Math.max(vault.allocated - vault.spent - vault.committed, 0);
                  const isExpanded = expandedVaultId === vault.id;

                  return (
                    <article
                      key={vault.id}
                      className={`group overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D9FF57]/18 hover:shadow-[0_18px_44px_rgba(0,0,0,0.18),0_0_22px_rgba(217,255,87,0.045),inset_0_1px_0_rgba(255,255,255,0.08)] ${vaultSurfaceClass(vault, isExpanded)}`}
                    >
                      <div
                        onClick={() => setExpandedVaultId(isExpanded ? "" : vault.id)}
                        className="w-full px-4 py-4 text-left md:px-5"
                        aria-expanded={isExpanded}
                      >
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[16px] border transition ${isExpanded ? "border-[#D9FF57]/24 bg-[#D9FF57]/[0.12] text-[#EAFFB4] shadow-[0_0_18px_rgba(217,255,87,0.10)]" : "border-white/10 bg-white/[0.055] text-[#DDFBFF] group-hover:border-[#D9FF57]/16 group-hover:text-[#EAFFB4]"}`}>
                              <WalletCards className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <div className="min-w-0">
                              <input
                                value={vault.name}
                                onChange={(event) => updateVault(vault.id, { name: event.target.value })}
                                onClick={(event) => event.stopPropagation()}
                                className="h-9 w-full min-w-0 rounded-[12px] border border-transparent bg-transparent px-0 text-[20px] font-semibold tracking-[-0.04em] text-white outline-none transition focus:border-[#D9FF57]/24 focus:bg-white/[0.055] focus:px-3"
                              />
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${isExpanded ? "zila-live-dot bg-[#D9FF57]" : vault.pressure === "Pressure" ? "bg-[#FBBF24]" : "bg-[#67E8F9]/70"}`} />
                                <p className="text-[12px] leading-[1.45] text-[#AFC0DD]">{vault.upcomingPayout}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
                            <div className="min-w-[138px] rounded-[18px] border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] px-4 py-3 text-right">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#EAFFB4]/80">Remaining</p>
                              <p key={`${vault.id}-remaining-${vaultRemaining}`} className="zila-number-shift mt-1 text-[22px] font-semibold tracking-[-0.05em] text-[#F1FFB8]">{currency(vaultRemaining)}</p>
                            </div>
                            <div className={`rounded-[18px] border px-4 py-3 ${pressureClass(vault.pressure)}`}>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-75">Pressure</p>
                              <p className="mt-1 text-[14px] font-semibold">{vault.pressure}</p>
                            </div>
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${isExpanded ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.10] text-[#EAFFB4]" : "border-white/10 bg-white/[0.045] text-[#AFC0DD] group-hover:border-[#D9FF57]/14 group-hover:text-white"}`}>
                              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} strokeWidth={2} />
                            </span>
                          </div>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="zila-readable-text zila-vault-expand border-t border-white/10 px-4 pb-5 pt-4 md:px-5">
                          <div className="mb-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
                            <div className="rounded-[22px] border border-[#D9FF57]/16 bg-[#D9FF57]/[0.07] p-4">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#EAFFB4]">Remaining</p>
                              <p key={`${vault.id}-expanded-remaining-${vaultRemaining}`} className="zila-number-shift mt-2 text-[30px] font-semibold tracking-[-0.06em] text-[#F1FFB8]">{currency(vaultRemaining)}</p>
                              <p className="mt-2 text-[12px] leading-[1.55] text-[#D7E3F8]">{vault.upcomingPayout}</p>
                            </div>
                            <div className="rounded-[22px] border border-white/8 bg-[#071526]/32 p-4">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8FA4C3]">Allocated</p>
                              <p key={`${vault.id}-allocated-${vault.allocated}`} className="zila-number-shift mt-2 text-[22px] font-semibold tracking-[-0.04em] text-white">{currency(vault.allocated)}</p>
                            </div>
                            <div className="rounded-[22px] border border-white/8 bg-[#071526]/32 p-4">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8FA4C3]">Spent</p>
                              <p key={`${vault.id}-spent-${vault.spent}`} className="zila-number-shift mt-2 text-[22px] font-semibold tracking-[-0.04em] text-white">{currency(vault.spent)}</p>
                            </div>
                            <div className={`rounded-[22px] border p-4 ${pressureClass(vault.pressure)}`}>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75">Pressure</p>
                              <p className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">{vault.pressure}</p>
                              <p className="mt-2 text-[12px] leading-[1.55] opacity-80">Committed: {currency(vault.committed)}</p>
                            </div>
                          </div>

                          <div className="mb-5 rounded-[22px] border border-[#D9FF57]/14 bg-[radial-gradient(circle_at_0%_0%,rgba(217,255,87,0.08),transparent_30%),rgba(7,21,38,0.32)] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Operational Status</p>
                                <p className="mt-2 break-words text-[16px] font-semibold leading-[1.4] text-white">{getVaultSignal(vault)}</p>
                              </div>
                              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[11px] font-semibold text-[#EAFFB4]">
                                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                                Settlement verified
                              </span>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                              {[
                                ["Action", vault.upcomingPayout],
                                ["Impact", vault.pressure === "Pressure" ? "Review before release" : "Ready for coordination"],
                                ["Reserve", getVaultReserveImpact(vault)],
                                ["Memory", "Operational record synced"],
                              ].map(([label, value], index) => (
                                <div key={label} className="min-w-0 rounded-[16px] border border-white/8 bg-white/[0.045] p-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "zila-live-dot bg-[#D9FF57]" : "bg-[#67E8F9]/70"}`} />
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#AFC0DD]">{label}</p>
                                  </div>
                                  <p className="mt-2 break-words text-[12px] font-semibold leading-[1.45] text-[#EAF4FF]">{value}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="space-y-4">
                              <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">Operational details</p>
                                  <button type="button" onClick={() => openItemModal({ kind: "add-subcategory", vaultId: vault.id })} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:text-white">
                                    Add detail
                                  </button>
                                </div>
                                <div className="grid gap-3 lg:grid-cols-2">
                              {vault.details.map((detail) => (
                                <div key={`${detail.label}-${detail.value}`} className="rounded-[18px] border border-white/8 bg-[#071526]/32 p-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8FA4C3]">{detail.label}</p>
                                  <p className="mt-2 break-words text-[14px] font-semibold leading-[1.45] text-[#EAF4FF]">{detail.value}</p>
                                </div>
                              ))}
                                </div>
                              </div>

                              <div className="grid gap-3 lg:grid-cols-2">
                                <section className="rounded-[20px] border border-white/8 bg-[#071526]/30 p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Payout schedule</p>
                                    <button type="button" onClick={() => openItemModal({ kind: "add-payout", vaultId: vault.id })} className="rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[11px] font-semibold text-[#EAFFB4]">Add payout</button>
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    {getPayoutSchedule(vault).map((item) => (
                                      <div key={`${item.label}-${item.state}`} className="rounded-[15px] border border-white/8 bg-white/[0.045] p-3">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                          <p className="text-[13px] font-semibold leading-[1.45] text-white">{item.label}</p>
                                          <span className="rounded-full border border-[#D9FF57]/12 bg-[#D9FF57]/[0.055] px-2 py-0.5 text-[9px] font-semibold text-[#EAFFB4]">{item.state}</span>
                                        </div>
                                        <p className="mt-1 text-[12px] leading-[1.45] text-[#AFC0DD]">{item.detail}</p>
                                      </div>
                                    ))}
                                  </div>
                                </section>

                                <section className="rounded-[20px] border border-white/8 bg-[#071526]/30 p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Operational record</p>
                                    <button type="button" onClick={() => setActionModal({ kind: "proof-history", vaultId: vault.id })} className="rounded-full border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] px-3 py-1.5 text-[11px] font-semibold text-[#EAFFB4]">View record</button>
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    {getProofRecords(vault).map((record) => (
                                      <div key={record} className="flex gap-2 rounded-[15px] border border-[#D9FF57]/10 bg-[#D9FF57]/[0.045] p-3">
                                        <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D9FF57]" strokeWidth={2} />
                                        <p className="break-words text-[12px] font-semibold leading-[1.45] text-[#D7E3F8]">{record}</p>
                                      </div>
                                    ))}
                                  </div>
                                </section>
                              </div>

                              <section className="rounded-[20px] border border-white/8 bg-[#071526]/30 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Recent activity</p>
                                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                                  {getRecentActivity(vault).map((activity) => (
                                    <div key={activity} className="rounded-[15px] border border-white/8 bg-white/[0.04] p-3">
                                      <p className="text-[12px] font-semibold leading-[1.45] text-[#D7E3F8]">{activity}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            </div>

                            <div className="space-y-3">
                              <div className="rounded-[18px] border border-[#D9FF57]/12 bg-[#D9FF57]/[0.055] p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EAFFB4]">Inline intelligence</p>
                                <p className="mt-2 text-[13px] leading-[1.55] text-[#D7E3F8]">
                                  {vault.pressure === "Pressure"
                                    ? "Delay transfer until incoming payment settles."
                                    : vault.pressure === "Watch"
                                      ? "Reserve protection remains active after planned payout."
                                      : "No operational pressure detected."}
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <label className="grid gap-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8FA4C3]">Allocated</span>
                                <input
                                  type="number"
                                  value={vault.allocated}
                                  onChange={(event) => updateVault(vault.id, { allocated: Number(event.target.value) || 0 })}
                                  className="h-11 rounded-[14px] border border-white/10 bg-[#071526]/42 px-3 text-[13px] text-white outline-none focus:border-[#D9FF57]/30"
                                />
                                </label>
                                <label className="grid gap-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8FA4C3]">Spent</span>
                                  <input
                                    type="number"
                                    value={vault.spent}
                                    onChange={(event) => updateVault(vault.id, { spent: Number(event.target.value) || 0 })}
                                    className="h-11 rounded-[14px] border border-white/10 bg-[#071526]/42 px-3 text-[13px] text-white outline-none focus:border-[#D9FF57]/30"
                                  />
                                </label>
                                <label className="grid gap-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8FA4C3]">Committed</span>
                                  <input
                                    type="number"
                                    value={vault.committed}
                                    onChange={(event) => updateVault(vault.id, { committed: Number(event.target.value) || 0 })}
                                    className="h-11 rounded-[14px] border border-white/10 bg-[#071526]/42 px-3 text-[13px] text-white outline-none focus:border-[#D9FF57]/30"
                                  />
                                </label>
                                <label className="grid gap-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8FA4C3]">Pressure state</span>
                                <select
                                  value={vault.pressure}
                                  onChange={(event) => updateVault(vault.id, { pressure: event.target.value as ProjectVault["pressure"] })}
                                  className="h-11 rounded-[14px] border border-white/10 bg-[#102A4F] px-3 text-[13px] text-white outline-none focus:border-[#D9FF57]/30"
                                >
                                  <option>Healthy</option>
                                  <option>Watch</option>
                                  <option>Pressure</option>
                                </select>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 xl:grid-cols-3">
                            <OperationalList title="Suppliers" icon={<ReceiptText className="h-4 w-4" />} items={vault.suppliers} onAdd={() => openItemModal({ kind: "add-supplier", vaultId: vault.id })} />
                            <OperationalList title="Participants" icon={<Users className="h-4 w-4" />} items={vault.participants} onAdd={() => openItemModal({ kind: "add-participant", vaultId: vault.id })} />
                            <OperationalList title="Notes" icon={<FileText className="h-4 w-4" />} items={vault.notes} onAdd={() => openItemModal({ kind: "add-note", vaultId: vault.id })} />
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-[#071526]/28 p-3">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => setActionModal({ kind: "edit-vault", vaultId: vault.id })} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/18 hover:text-white">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit vault
                              </button>
                              <button type="button" onClick={() => openItemModal({ kind: "add-subcategory", vaultId: vault.id })} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/18 hover:text-white">
                                <Plus className="h-3.5 w-3.5" />
                                Add item
                              </button>
                              <button type="button" onClick={() => openItemModal({ kind: "move-money", vaultId: vault.id })} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/18 hover:text-white">
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                Move money
                              </button>
                              <button type="button" onClick={() => setActionModal({ kind: "proof-history", vaultId: vault.id })} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-[#D7E3F8] transition hover:border-[#D9FF57]/18 hover:text-white">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Operational history
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => archiveVault(vault.id)} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-[#AFC0DD] transition hover:text-white">
                                <Archive className="h-3.5 w-3.5" />
                                Archive
                              </button>
                              <button type="button" onClick={() => setActionModal({ kind: "delete-vault", vaultId: vault.id })} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-[#FCA5A5]/14 bg-[#FCA5A5]/[0.055] px-3 text-[12px] font-semibold text-[#FFD6D6] transition hover:bg-[#FCA5A5]/[0.08]">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-4">
              <section className="rounded-[28px] border border-[#D9FF57]/16 bg-[linear-gradient(180deg,rgba(217,255,87,0.08),rgba(7,21,38,0.44))] p-5 shadow-[0_22px_54px_rgba(217,255,87,0.05),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D9FF57]">Ask Zila intelligence</p>
                <p className="mt-3 text-[22px] font-semibold tracking-[-0.045em]">Context-aware operating signals.</p>
                <div className="mt-4 space-y-2">
                  {operationalSuggestions.map((example) => (
                    <Link key={example} href={`/ask?project=${activeProject.id}`} className="block break-words rounded-[16px] border border-white/8 bg-[#071526]/34 px-3 py-2 text-[12px] font-semibold leading-[1.45] text-[#D7E3F8] transition hover:border-[#D9FF57]/16 hover:bg-[#D9FF57]/[0.055] hover:text-white">
                      {example}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#67E8F9]/18 bg-[#67E8F9]/[0.08] text-[#DDFBFF]">
                    <MessageCircle className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7EE7F6]">WhatsApp updates coming soon</p>
                    <p className="mt-2 text-[18px] font-semibold tracking-[-0.035em] text-white">Forward updates. Zila structures them.</p>
                  </div>
                </div>
                <p className="mt-4 text-[13px] leading-[1.7] text-[#D7E3F8]">
                  Forward operational updates from WhatsApp and Zila will structure them into project costs, payouts, reserves, and operational history.
                </p>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {["Action captured", "Operational impact calculated", "Reserve recalculates", "Record attached automatically", "Memory synced"].map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.28)]" : "bg-[#67E8F9]/60"}`} />
                      <p className="text-[12px] font-semibold text-[#D7E3F8]">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[#071526]/38 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Operational timeline</p>
                <div className="mt-4 space-y-4">
                  {timelineEntries.map((item, index) => (
                    <div key={item} className="relative flex gap-3">
                      {index < timelineEntries.length - 1 ? <span className="absolute left-[4px] top-4 h-[calc(100%+0.5rem)] w-px bg-white/10" /> : null}
                      <span className="relative mt-1 h-2.5 w-2.5 rounded-full bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.22)]" />
                      <p className="break-words text-[13px] font-semibold text-[#D7E3F8]">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </section>

          {actionModal?.kind === "create-vault" ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#020817]/68 px-4 py-5 backdrop-blur-md md:items-center">
              <div className="zila-flow-step w-full max-w-[560px] overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,#183B6A,#10233F_52%,#071526)] p-5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">Add Vault</p>
                    <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.055em]">Create operational vault</h3>
                    <p className="mt-2 text-[13px] leading-[1.65] text-[#D7E3F8]">Structure a budget line, reserve, supplier payout, or participant cost inside this project.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-[#D7E3F8] transition hover:border-[#D9FF57]/18 hover:text-white"
                    aria-label="Close add vault modal"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Vault name</span>
                    <input
                      value={newVaultName}
                      onChange={(event) => setNewVaultName(event.target.value)}
                      placeholder="Accommodation overflow"
                      className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none placeholder:text-[#8FA4C3] transition focus:border-[#D9FF57]/30 focus:bg-white/[0.075]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Allocation amount</span>
                    <input
                      value={newVaultAmount}
                      onChange={(event) => setNewVaultAmount(event.target.value)}
                      type="number"
                      className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none transition focus:border-[#D9FF57]/30 focus:bg-white/[0.075]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Category</span>
                    <select
                      value={newVaultCategory}
                      onChange={(event) => setNewVaultCategory(event.target.value)}
                      className="h-12 rounded-[16px] border border-white/10 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition focus:border-[#D9FF57]/30"
                    >
                      {["Operations", "Reserve", "Supplier payout", "Participant cost", "Travel", "Materials", "Custom"].map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Optional supplier or participant</span>
                    <input
                      value={newVaultAssignee}
                      onChange={(event) => setNewVaultAssignee(event.target.value)}
                      placeholder="Supplier, vendor, or participant"
                      className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none placeholder:text-[#8FA4C3] transition focus:border-[#D9FF57]/30 focus:bg-white/[0.075]"
                    />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Notes</span>
                    <textarea
                      value={newVaultNotes}
                      onChange={(event) => setNewVaultNotes(event.target.value)}
                      placeholder="Add operating context..."
                      rows={3}
                      className="resize-none rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3 text-[14px] leading-[1.55] text-white outline-none placeholder:text-[#8FA4C3] transition focus:border-[#D9FF57]/30 focus:bg-white/[0.075]"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setNewVaultReserve((value) => !value)}
                  className={`mt-4 flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition ${
                    newVaultReserve
                      ? "border-[#D9FF57]/22 bg-[#D9FF57]/[0.08] text-[#F1FFB8]"
                      : "border-white/10 bg-white/[0.045] text-[#D7E3F8] hover:border-[#D9FF57]/14"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                    <span>
                      <span className="block text-[13px] font-semibold">Reserve protected vault</span>
                      <span className="mt-0.5 block text-[12px] text-[#AFC0DD]">Marks this allocation as protected before release.</span>
                    </span>
                  </span>
                  <span className={`h-5 w-9 rounded-full border transition ${newVaultReserve ? "border-[#D9FF57]/30 bg-[#D9FF57]/30" : "border-white/16 bg-white/[0.06]"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition ${newVaultReserve ? "translate-x-4 bg-[#D9FF57]" : "translate-x-0.5"}`} />
                  </span>
                </button>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <p className="max-w-[280px] text-[12px] leading-[1.55] text-[#AFC0DD]">Zila will include this vault in allocation, reserve, payout, and operational record calculations immediately.</p>
                  <button
                    type="button"
                    onClick={addVault}
                    className="zila-operational-action-soft inline-flex h-12 items-center gap-2 rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] shadow-[0_14px_28px_rgba(217,255,87,0.14)] transition hover:-translate-y-0.5 hover:bg-[#E5FF75] active:scale-[0.99]"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Create Vault
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {actionModal?.kind === "project-edit" ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#020817]/68 px-4 py-5 backdrop-blur-md md:items-center">
              <div className="zila-flow-step w-full max-w-[640px] rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,#183B6A,#10233F_52%,#071526)] p-5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
                <ModalTitle eyebrow="Edit project" title="Project details" onClose={() => setActionModal(null)} />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Project name", "name"],
                    ["Total budget", "budget"],
                    ["Currency", "currency"],
                    ["Status", "status"],
                    ["Project owner", "owner"],
                    ["Start date", "startDate"],
                    ["End date", "endDate"],
                  ].map(([label, key]) => (
                    <label key={key} className="grid gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">{label}</span>
                      <input
                        value={String(projectDetails[key as keyof ProjectDetailState])}
                        onChange={(event) => setProjectDetails((current) => ({ ...current, [key]: event.target.value }))}
                        type={key === "startDate" || key === "endDate" ? "date" : "text"}
                        className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none transition focus:border-[#D9FF57]/30 focus:bg-white/[0.075]"
                      />
                    </label>
                  ))}
                  <label className="grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Project type</span>
                    <select
                      value={projectDetails.type}
                      onChange={(event) => setProjectDetails((current) => ({ ...current, type: event.target.value as ProjectType }))}
                      className="h-12 rounded-[16px] border border-white/10 bg-[#102A4F] px-4 text-[14px] text-white outline-none transition focus:border-[#D9FF57]/30"
                    >
                      {projectTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Notes</span>
                    <textarea
                      value={projectDetails.notes}
                      onChange={(event) => setProjectDetails((current) => ({ ...current, notes: event.target.value }))}
                      rows={3}
                      className="resize-none rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3 text-[14px] leading-[1.55] text-white outline-none transition focus:border-[#D9FF57]/30 focus:bg-white/[0.075]"
                    />
                  </label>
                </div>
                <div className="mt-5 flex justify-end border-t border-white/10 pt-5">
                  <button type="button" onClick={saveProjectDetails} className="zila-operational-action-soft inline-flex h-12 items-center rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] transition hover:-translate-y-0.5 hover:bg-[#E5FF75]">
                    Save project details
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {actionModal && "vaultId" in actionModal && selectedVault && actionModal.kind === "edit-vault" ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#020817]/68 px-4 py-5 backdrop-blur-md md:items-center">
              <div className="zila-flow-step w-full max-w-[560px] rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,#183B6A,#10233F_52%,#071526)] p-5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
                <ModalTitle eyebrow="Edit vault" title={selectedVault.name} onClose={() => setActionModal(null)} />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Vault name</span>
                    <input value={selectedVault.name} onChange={(event) => updateVault(selectedVault.id, { name: event.target.value })} className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none focus:border-[#D9FF57]/30" />
                  </label>
                  {(["allocated", "spent", "committed"] as const).map((field) => (
                    <label key={field} className="grid gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">{field}</span>
                      <input type="number" value={selectedVault[field]} onChange={(event) => updateVault(selectedVault.id, { [field]: Number(event.target.value) || 0 })} className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none focus:border-[#D9FF57]/30" />
                    </label>
                  ))}
                  <label className="grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Pressure</span>
                    <select value={selectedVault.pressure} onChange={(event) => updateVault(selectedVault.id, { pressure: event.target.value as ProjectVault["pressure"] })} className="h-12 rounded-[16px] border border-white/10 bg-[#102A4F] px-4 text-[14px] text-white outline-none focus:border-[#D9FF57]/30">
                      <option>Healthy</option>
                      <option>Watch</option>
                      <option>Pressure</option>
                    </select>
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">Upcoming payout</span>
                    <input value={selectedVault.upcomingPayout} onChange={(event) => updateVault(selectedVault.id, { upcomingPayout: event.target.value })} className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none focus:border-[#D9FF57]/30" />
                  </label>
                </div>
                <div className="mt-5 flex justify-end border-t border-white/10 pt-5">
                  <button type="button" onClick={() => { setActionModal(null); addTimelineEntry(`${selectedVault.name} updated`); }} className="zila-operational-action-soft inline-flex h-12 items-center rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] transition hover:-translate-y-0.5 hover:bg-[#E5FF75]">
                    Save vault
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {actionModal && "vaultId" in actionModal && selectedVault && ["add-supplier", "add-participant", "add-note", "add-subcategory", "add-payout", "attach-proof", "move-money"].includes(actionModal.kind) ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#020817]/68 px-4 py-5 backdrop-blur-md md:items-center">
              <div className="zila-flow-step w-full max-w-[520px] rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,#183B6A,#10233F_52%,#071526)] p-5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
                <ModalTitle
                  eyebrow={selectedVault.name}
                  title={
                    actionModal.kind === "move-money"
                      ? "Move money"
                      : actionModal.kind === "add-payout"
                        ? "Add payout"
                        : actionModal.kind === "attach-proof"
                          ? "Link operational record"
                      : actionModal.kind === "add-subcategory"
                        ? "Add subcategory"
                        : actionModal.kind === "add-note"
                          ? "Add note"
                          : actionModal.kind === "add-participant"
                            ? "Add participant"
                            : "Add supplier"
                  }
                  onClose={() => setActionModal(null)}
                />
                {actionModal.kind !== "move-money" ? (
                  <label className="mt-5 grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">
                      {actionModal.kind === "add-payout" ? "Payout label" : actionModal.kind === "attach-proof" ? "Record reference" : "Details"}
                    </span>
                    <input value={modalValue} onChange={(event) => setModalValue(event.target.value)} className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none focus:border-[#D9FF57]/30" />
                  </label>
                ) : null}
                {actionModal.kind === "add-note" || actionModal.kind === "add-subcategory" || actionModal.kind === "add-payout" || actionModal.kind === "move-money" ? (
                  <label className="mt-3 grid gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AFC0DD]">{actionModal.kind === "move-money" ? "Amount to move" : "Optional cost / commitment"}</span>
                    <input type="number" value={modalAmount} onChange={(event) => setModalAmount(event.target.value)} className="h-12 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 text-[14px] text-white outline-none focus:border-[#D9FF57]/30" />
                  </label>
                ) : null}
                <div className="mt-5 flex justify-end border-t border-white/10 pt-5">
                  <button type="button" onClick={applyModalAction} className="zila-operational-action-soft inline-flex h-12 items-center rounded-full bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#102A4F] transition hover:-translate-y-0.5 hover:bg-[#E5FF75]">
                    Apply update
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {actionModal && "vaultId" in actionModal && selectedVault && actionModal.kind === "proof-history" ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#020817]/68 px-4 py-5 backdrop-blur-md md:items-center">
              <div className="zila-flow-step w-full max-w-[520px] rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,#183B6A,#10233F_52%,#071526)] p-5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
                <ModalTitle eyebrow={selectedVault.name} title="Operational history" onClose={() => setActionModal(null)} />
                <div className="mt-5 space-y-3">
                  {["Vault allocation verified", "Reserve status synced", "Upcoming payout linked", "Proof attached automatically", "Operational memory synced"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[16px] border border-[#D9FF57]/12 bg-[#D9FF57]/[0.055] px-4 py-3">
                      <BadgeCheck className="h-4 w-4 shrink-0 text-[#D9FF57]" strokeWidth={2} />
                      <p className="break-words text-[13px] font-semibold text-[#D7E3F8]">{item}</p>
                    </div>
                  ))}
                </div>
                <Link href="/proof" className="mt-5 inline-flex h-12 items-center rounded-full border border-[#D9FF57]/20 bg-[#D9FF57]/[0.08] px-5 text-[13px] font-semibold text-[#F1FFB8]">
                  View operational record
                </Link>
              </div>
            </div>
          ) : null}

          {actionModal && "vaultId" in actionModal && selectedVault && actionModal.kind === "delete-vault" ? (
            <ConfirmModal
              eyebrow="Delete vault"
              title={`Delete ${selectedVault.name}?`}
              body="This removes the vault from project calculations. Archive is safer if you may need the history later."
              confirmLabel="Delete vault"
              onCancel={() => setActionModal(null)}
              onConfirm={() => deleteVault(selectedVault.id)}
            />
          ) : null}

          {actionModal?.kind === "delete-project" ? (
            <ConfirmModal
              eyebrow="Delete project"
              title={`Delete ${projectDetails.name}?`}
              body="This is a destructive action. Archive keeps the project out of active operations without losing its operational history."
              confirmLabel="Delete project"
              onCancel={() => setActionModal(null)}
              onConfirm={() => {
                setProjectArchived(true);
                setActionModal(null);
                addTimelineEntry("Project deletion requested");
              }}
            />
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

function OperationalList({
  title,
  icon,
  items,
  onAdd,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  onAdd: () => void;
}) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[#071526]/32 p-3">
      <div className="flex items-center justify-between gap-2 text-[#DDFBFF]">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]">{title}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-[#D9FF57]/14 bg-[#D9FF57]/[0.07] text-[#EAFFB4] transition hover:bg-[#D9FF57]/[0.12]"
          aria-label={`Add ${title}`}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      <div className="mt-3 space-y-1.5">
        {items.length ? (
          items.map((item) => (
            <p key={item} className="break-words rounded-[12px] bg-white/[0.045] px-3 py-2 text-[12px] font-semibold leading-[1.45] text-[#D7E3F8]">
              {item}
            </p>
          ))
        ) : (
          <p className="rounded-[12px] bg-white/[0.035] px-3 py-2 text-[12px] text-[#8FA4C3]">No {title.toLowerCase()} yet</p>
        )}
      </div>
    </div>
  );
}

function ModalTitle({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D9FF57]">{eyebrow}</p>
        <h3 className="mt-2 break-words text-[28px] font-semibold tracking-[-0.055em] text-white">{title}</h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-[#D7E3F8] transition hover:border-[#D9FF57]/18 hover:text-white"
        aria-label="Close modal"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function ConfirmModal({
  eyebrow,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  eyebrow: string;
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#020817]/68 px-4 py-5 backdrop-blur-md md:items-center">
      <div className="zila-flow-step w-full max-w-[460px] rounded-[30px] border border-[#FCA5A5]/16 bg-[linear-gradient(180deg,#183B6A,#10233F_52%,#071526)] p-5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] md:p-6">
        <ModalTitle eyebrow={eyebrow} title={title} onClose={onCancel} />
        <p className="mt-4 text-[13px] leading-[1.7] text-[#D7E3F8]">{body}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-5">
          <button type="button" onClick={onCancel} className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.055] px-4 text-[13px] font-semibold text-[#D7E3F8] transition hover:text-white">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="inline-flex h-11 items-center rounded-full border border-[#FCA5A5]/18 bg-[#FCA5A5]/[0.08] px-4 text-[13px] font-semibold text-[#FFD6D6] transition hover:bg-[#FCA5A5]/[0.12]">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
