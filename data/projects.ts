export type ProjectTone = "neutral" | "warning" | "success" | "info";

export interface ProjectTask {
  title: string;
  due: string;
  status: string;
}

export interface ProjectTimelineItem {
  label: string;
  detail: string;
}

export interface Project {
  slug: string;
  name: string;
  client: string;
  location: string;
  category: string;
  stage: string;
  status: string;
  statusTone: ProjectTone;
  health: string;
  healthTone: ProjectTone;
  dueLabel: string;
  budget: string;
  spent: string;
  reserved: string;
  progress: number;
  cashNeeded: string;
  nextMilestone: string;
  owner: string;
  verifiedDays: number;
  updatedAt: string;
  summary: string;
  zilaSays: string;
  tasks: ProjectTask[];
  timeline: ProjectTimelineItem[];
}

export const projects: Project[] = [
  {
    slug: "harbour-road",
    name: "Harbour Road",
    client: "Northline Developments",
    location: "Fremantle",
    category: "Fit-out",
    stage: "Funding window",
    status: "Needs funding",
    statusTone: "warning",
    health: "Watch",
    healthTone: "warning",
    dueLabel: "$4.3k due Thu",
    budget: "$28,400",
    spent: "$19,860",
    reserved: "$4,300",
    progress: 72,
    cashNeeded: "$4,300",
    nextMilestone: "Electrical drawdown Thursday",
    owner: "Amara",
    verifiedDays: 13,
    updatedAt: "Updated 26 mins ago",
    summary:
      "A premium hospitality fit-out with a strong margin, but this week's supplier payment needs to be covered to keep the install sequence on time.",
    zilaSays:
      "Move $4,300 into Harbour Road before Thursday to protect your install slot and avoid a margin leak from rush rescheduling.",
    tasks: [
      { title: "Move capital to project wallet", due: "Today", status: "Ready now" },
      { title: "Confirm electrician drawdown", due: "Thursday", status: "Waiting reply" },
      { title: "Send progress note to client", due: "Friday", status: "Drafted" },
    ],
    timeline: [
      { label: "This week", detail: "Electrical and custom joinery release" },
      { label: "Next", detail: "Lighting install and defect sweep" },
      { label: "Risk", detail: "Supplier slot expires in 2 days" },
    ],
  },
  {
    slug: "atlas-yard",
    name: "Atlas Yard",
    client: "Atlas Civil",
    location: "Perth Metro",
    category: "Site systems",
    stage: "Delivery",
    status: "On track",
    statusTone: "success",
    health: "Healthy",
    healthTone: "success",
    dueLabel: "Crew booked",
    budget: "$41,000",
    spent: "$24,100",
    reserved: "$9,600",
    progress: 58,
    cashNeeded: "$0",
    nextMilestone: "Concrete sensors install Monday",
    owner: "Mika",
    verifiedDays: 19,
    updatedAt: "Updated 2 hours ago",
    summary:
      "Ops and payments are aligned, giving this project enough room to complete the next install cycle without intervention.",
    zilaSays:
      "No urgent action needed here. Keep the Monday install crew confirmed and use this project as your stable margin anchor this week.",
    tasks: [
      { title: "Reconfirm Monday crew", due: "Tomorrow", status: "Scheduled" },
      { title: "Approve sensor shipment", due: "Monday", status: "Ready now" },
      { title: "Review stage invoice", due: "Tuesday", status: "Upcoming" },
    ],
    timeline: [
      { label: "This week", detail: "Crew allocation and install staging" },
      { label: "Next", detail: "Commissioning and final QA" },
      { label: "Opportunity", detail: "Invoice earlier once QA is locked" },
    ],
  },
  {
    slug: "solace-studio",
    name: "Solace Studio",
    client: "Solace Health",
    location: "Subiaco",
    category: "Clinic refresh",
    stage: "Wrap-up",
    status: "Client review",
    statusTone: "info",
    health: "Stable",
    healthTone: "info",
    dueLabel: "Sign-off pending",
    budget: "$18,600",
    spent: "$15,440",
    reserved: "$1,940",
    progress: 89,
    cashNeeded: "$0",
    nextMilestone: "Final walk-through Tuesday",
    owner: "Priya",
    verifiedDays: 11,
    updatedAt: "Updated yesterday",
    summary:
      "The delivery work is essentially complete. Final sign-off and invoice timing now matter more than operational effort.",
    zilaSays:
      "Prep the sign-off pack now so you can invoice within hours of the walk-through rather than losing another week to admin lag.",
    tasks: [
      { title: "Compile defect photos", due: "Today", status: "In progress" },
      { title: "Prepare final invoice", due: "Tuesday", status: "Ready now" },
      { title: "Book walk-through", due: "Tuesday", status: "Confirmed" },
    ],
    timeline: [
      { label: "This week", detail: "Defect sweep and walk-through pack" },
      { label: "Next", detail: "Invoice and close-out archive" },
      { label: "Focus", detail: "Speed up admin after sign-off" },
    ],
  },
];

export function getProjects() {
  return projects;
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectSummary() {
  const activeProjects = projects.length;
  const watchProjects = projects.filter((project) => project.health === "Watch").length;

  return {
    activeProjects,
    watchProjects,
    totalBudget: "$88k",
    receivables: "$19k",
  };
}
