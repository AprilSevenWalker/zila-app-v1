import type { ProjectTone } from "@/data/projects";

export type PaymentSection = "due-this-week" | "upcoming";

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
    name: "Harbour Road Supplier",
    project: "Harbour Road",
    dueDate: "Friday",
    amount: "$7,500",
    source: "Main operating wallet",
    status: "Shortfall risk",
    statusTone: "warning",
    cta: "Move funds",
    section: "due-this-week",
    needsAction: true,
  },
  {
    id: "palm-estate-contractor",
    name: "Palm Estate Contractor",
    project: "Palm Estate",
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
    name: "BuildOps Settlement",
    project: "BuildOps Site A",
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

export function getPayments() {
  return payments;
}

export function getPaymentsBySection(section: PaymentSection) {
  return payments.filter((payment) => payment.section === section);
}

export function getActionNeededPayments() {
  return payments.filter((payment) => payment.needsAction);
}
