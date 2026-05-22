import type { ProjectTone } from "@/data/projects";

export type PaymentSection = "due-this-week" | "upcoming";

export interface CashflowRail {
  id: string;
  label: string;
  amount: string;
}

export interface CashflowAllocation {
  allocated: string;
  freeToUse: string;
  projectBreakdown: CashflowProjectAllocation[];
}

export interface CashflowProjectAllocation {
  id: string;
  project: string;
  amount: string;
}

export interface CashflowOverview {
  totalAvailable: string;
  totalSubtext: string;
  rails: CashflowRail[];
  allocation: CashflowAllocation;
  commitmentsThisWeek: string;
  recentActivity: CashflowActivity[];
  needsAttention?: CashflowAttentionItem;
}

export interface CashflowActivity {
  id: string;
  type: string;
  amount: string;
  project: string;
  status: string;
  href: string;
}

export interface CashflowAttentionItem {
  project: string;
  detail: string;
}

export interface Payment {
  id: string;
  name: string;
  project: string;
  dueDate: string;
  amount: string;
  source: string;
  status: string;
  statusTone: ProjectTone;
  cta: string;
  section: PaymentSection;
  needsAction: boolean;
}

export const payments: Payment[] = [
  {
    id: "harbour-road-supplier",
    name: "Northline Suppliers",
    project: "Project Horizon",
    dueDate: "Friday",
    amount: "$4,300",
    source: "Stablecoin settlement rail",
    status: "Ready with reserve guard",
    statusTone: "warning",
    cta: "Coordinate payout",
    section: "due-this-week",
    needsAction: true,
  },
  {
    id: "palm-estate-contractor",
    name: "Atlas Project Contractor",
    project: "Atlas Project",
    dueDate: "Monday",
    amount: "$3,200",
    source: "Client drawdown rail",
    status: "Ready",
    statusTone: "success",
    cta: "Review",
    section: "upcoming",
    needsAction: false,
  },
  {
    id: "buildops-settlement",
    name: "Northstar Project Settlement",
    project: "Northstar Project",
    dueDate: "Today",
    amount: "$2,000",
    source: "Settlement hold rail",
    status: "Pending",
    statusTone: "warning",
    cta: "Confirm payment",
    section: "due-this-week",
    needsAction: true,
  },
];

export const cashflowOverview: CashflowOverview = {
  totalAvailable: "$42,300",
  totalSubtext: "Across all accounts and rails",
  rails: [
    { id: "bank", label: "Bank", amount: "$18,000" },
    { id: "mobile-money", label: "Mobile money", amount: "$6,300" },
    { id: "stablecoin", label: "Stablecoin", amount: "$18,000" },
  ],
  allocation: {
    allocated: "$30,000",
    freeToUse: "$12,300",
    projectBreakdown: [
      { id: "project-horizon", project: "Project Horizon", amount: "$18,000" },
      { id: "atlas-project", project: "Atlas Project", amount: "$12,000" },
    ],
  },
  commitmentsThisWeek: "$9,500",
  recentActivity: [
    {
      id: "invoice-project-horizon",
      type: "Invoice",
      amount: "$4,300",
      project: "Project Horizon",
      status: "Northline due Friday",
      href: "/projects/harbour-road",
    },
    {
      id: "reserve-project-horizon",
      type: "Reserve",
      amount: "$24,220",
      project: "Project Horizon",
      status: "Protected before payout",
      href: "/projects/harbour-road",
    },
  ],
  needsAttention: {
    project: "Project Horizon",
    detail: "Northline payout due Friday; reserve remains protected",
  },
};

export function getPayments() {
  return payments;
}

export function getCashflowOverview() {
  return cashflowOverview;
}

export function getPaymentsBySection(section: PaymentSection) {
  return payments.filter((payment) => payment.section === section);
}

export function getActionNeededPayments() {
  return payments.filter((payment) => payment.needsAction);
}
