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

export interface ProjectUpdate {
  label: string;
  tone: ProjectTone;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  category: string;
  stage: string;
  status: string;
  statusTone: ProjectTone;
  budget: string;
  spent: string;
  reserved: string;
  progress: number;
  dueLabel: string;
  cashNeeded: string;
  nextMilestone: string;
  owner: string;
  verifiedDays: number;
  updatedAt: string;
  insight: string;
  stateSignal: string;
  summary: string;
  remaining: string;
  financialImpact: string;
  zilaSays: string;
  zilaSuggestionShort: string;
  nextMoveTitle: string;
  nextMoveSummary: string;
  ifNoAction: string;
  ifActionTaken: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  canUseSafetyNet?: boolean;
  showSafetyNetAction?: boolean;
  safetyNetShortfallText?: string;
  safetyNetAmount?: string;
  safetyNetRemaining?: string;
  safetyNetDestination?: string;
  recentUpdates: ProjectUpdate[];
  suggestedActions: string[];
  lastVerifiedAction?: string;
  tasks: ProjectTask[];
  timeline: ProjectTimelineItem[];
}

export const projects: Project[] = [
  {
    id: "harbour-road",
    name: "Project Horizon",
    client: "Project Horizon",
    location: "Fremantle",
    category: "Project",
    stage: "Cash watch",
    status: "Watch",
    statusTone: "warning",
    budget: "$22,000",
    spent: "$18,000",
    reserved: "$6,200",
    progress: 82,
    dueLabel: "Adjustment due by Friday",
    cashNeeded: "$4,300",
    nextMilestone: "Northline supplier payout before Friday",
    owner: "Kevin",
    verifiedDays: 13,
    updatedAt: "Updated 26 mins ago",
    insight: "Northline Suppliers need payment by Friday. Settlement can clear the obligation while the protected reserve stays intact.",
    stateSignal: "Supplier payout due Friday. Stablecoin settlement keeps the reserve protected.",
    summary:
      "A supplier payout is due this week, but the reserve is protected and the settlement route is ready.",
    remaining: "$4,300",
    financialImpact: "The $4,300 Northline payout can be coordinated before Friday without drawing down protected reserves.",
    zilaSays:
      "Coordinate the Northline payout before Friday and Project Horizon stays inside its operating range.",
    zilaSuggestionShort: "Coordinate $4.3k and keep reserve intact",
    nextMoveTitle: "Next move",
    nextMoveSummary: "Coordinate the $4,300 Northline payout",
    ifNoAction: "Supplier obligation stays open by Friday",
    ifActionTaken: "Payout clears and reserve remains protected",
    primaryActionLabel: "Coordinate payout",
    secondaryActionLabel: "Use Safety Net",
    canUseSafetyNet: true,
    showSafetyNetAction: true,
    safetyNetShortfallText: "You're short $4,300",
    safetyNetAmount: "$2,000",
    safetyNetRemaining: "$4,200",
    safetyNetDestination: "Project Horizon",
    recentUpdates: [
      { label: "Northline invoice attached", tone: "warning" },
      { label: "Stablecoin route prepared", tone: "success" },
      { label: "Delivery plan still on track", tone: "success" },
      { label: "Payment due Friday", tone: "warning" },
    ],
    suggestedActions: ["Coordinate payout", "Protect reserve"],
    lastVerifiedAction: "Reserve protected · Today · Verified",
    tasks: [
      { title: "Coordinate Northline payout", due: "Today", status: "Ready now" },
      { title: "Review reserve impact", due: "Thursday", status: "Protected" },
      { title: "Confirm Friday settlement", due: "Friday", status: "Pending" },
    ],
    timeline: [
      { label: "Now", detail: "Coordinate the supplier payout through the prepared settlement route" },
      { label: "Friday", detail: "Clear the Northline obligation while keeping reserve protection active" },
      { label: "Next", detail: "Reforecast margin once this week's costs settle" },
    ],
  },
  {
    id: "palm-estate",
    name: "Atlas Project",
    client: "Atlas Project",
    location: "Perth Metro",
    category: "Project",
    stage: "Steady delivery",
    status: "Healthy",
    statusTone: "success",
    budget: "$30,000",
    spent: "$19,500",
    reserved: "$10,500",
    progress: 65,
    dueLabel: "On track",
    cashNeeded: "$0",
    nextMilestone: "Weekly delivery review",
    owner: "Kevin",
    verifiedDays: 18,
    updatedAt: "Updated 1 hour ago",
    insight: "On track this week.",
    stateSignal: "Stable this week",
    summary:
      "Atlas Project has enough room in the budget and no immediate cash pressure. Delivery is tracking well for the current week.",
    remaining: "$10,500",
    financialImpact: "There is no immediate funding gap this week. Current commitments remain covered.",
    zilaSays:
      "Keep Atlas Project steady and avoid pulling capital away unless another project becomes urgent.",
    zilaSuggestionShort: "Keep capital in place and review labour spend",
    nextMoveTitle: "Next move",
    nextMoveSummary: "Review labour spend to keep Atlas Project comfortably on track",
    ifNoAction: "Costs may drift next week",
    ifActionTaken: "Runway stays healthy",
    primaryActionLabel: "Review spend",
    secondaryActionLabel: "Review options",
    recentUpdates: [
      { label: "Weekly work on track", tone: "success" },
      { label: "No supplier issues", tone: "success" },
      { label: "Cash position stable", tone: "success" },
    ],
    suggestedActions: ["Review labour spend", "Keep budget steady"],
    lastVerifiedAction: "Client update sent · Today · Verified",
    tasks: [
      { title: "Send weekly client update", due: "Today", status: "Ready now" },
      { title: "Review labour spend", due: "Tomorrow", status: "Scheduled" },
      { title: "Confirm next delivery block", due: "Friday", status: "Upcoming" },
    ],
    timeline: [
      { label: "This week", detail: "Maintain normal delivery cadence and monitor spend" },
      { label: "Next", detail: "Lock the next work package" },
      { label: "Focus", detail: "Protect margin while pace stays healthy" },
    ],
  },
  {
    id: "buildops-site-a",
    name: "Northstar Project",
    client: "Northstar Project",
    location: "North Yard",
    category: "Project",
    stage: "Payment check",
    status: "Due soon",
    statusTone: "warning",
    budget: "$14,000",
    spent: "$13,200",
    reserved: "$2,800",
    progress: 94,
    dueLabel: "Payment due next",
    cashNeeded: "$800",
    nextMilestone: "Clear payment before balance release",
    owner: "Kevin",
    verifiedDays: 9,
    updatedAt: "Updated 44 mins ago",
    insight: "A payment needs to clear before the remaining balance is available, so a quick check now keeps this moving.",
    stateSignal: "Payment due next. A quick check keeps this moving.",
    summary:
      "Northstar Project needs a payment confirmed before the remaining balance becomes available, but the next step is clear and manageable.",
    remaining: "$800",
    financialImpact: "This stays tight until the due payment clears and the remaining balance becomes available.",
    zilaSays:
      "Confirm the due payment first and Northstar Project should be ready to use the remaining balance with more confidence.",
    zilaSuggestionShort: "Confirm payment now and the balance can clear cleanly",
    nextMoveTitle: "Next move",
    nextMoveSummary: "Confirm the payment now so the remaining balance can clear",
    ifNoAction: "Close-out may slip",
    ifActionTaken: "Balance clears cleanly",
    primaryActionLabel: "Move funds",
    secondaryActionLabel: "Use Safety Net",
    canUseSafetyNet: true,
    showSafetyNetAction: false,
    safetyNetShortfallText: "You're short $800",
    safetyNetAmount: "$800",
    safetyNetRemaining: "$2,000",
    safetyNetDestination: "Northstar Project",
    recentUpdates: [
      { label: "Payment due before release", tone: "warning" },
      { label: "Balance release still pending", tone: "warning" },
      { label: "Next step is clearly defined", tone: "info" },
    ],
    suggestedActions: ["Schedule payment", "Reconfirm release date"],
    lastVerifiedAction: "Cash board updated · Today · Verified",
    tasks: [
      { title: "Schedule due payment", due: "Today", status: "Ready now" },
      { title: "Confirm balance release timing", due: "Tomorrow", status: "Waiting reply" },
      { title: "Update cash board", due: "Tomorrow", status: "Ready now" },
    ],
    timeline: [
      { label: "Now", detail: "Pay the outstanding amount before the balance clears" },
      { label: "Next", detail: "Release remaining funds into operating cash" },
      { label: "Focus", detail: "Keep the close-out sequence moving with a quick confirmation" },
    ],
  },
  {
    id: "north-block",
    name: "Helix Project",
    client: "Helix Project",
    location: "Subiaco",
    category: "Project",
    stage: "Comfortable runway",
    status: "Healthy",
    statusTone: "success",
    budget: "$11,500",
    spent: "$7,100",
    reserved: "$4,400",
    progress: 61,
    dueLabel: "Enough runway",
    cashNeeded: "$0",
    nextMilestone: "Current commitments covered",
    owner: "Kevin",
    verifiedDays: 15,
    updatedAt: "Updated yesterday",
    insight: "Enough runway for current commitments.",
    stateSignal: "Comfortable runway",
    summary:
      "Helix Project has sufficient runway to handle the current round of commitments without immediate intervention.",
    remaining: "$4,400",
    financialImpact: "Current commitments are covered. No urgent funding move is needed right now.",
    zilaSays:
      "Helix Project is in a stable place, so only routine monitoring is needed for now.",
    zilaSuggestionShort: "Maintain routine oversight this week",
    nextMoveTitle: "Next move",
    nextMoveSummary: "Refresh the forecast to keep Helix Project comfortably ahead",
    ifNoAction: "Visibility softens next week",
    ifActionTaken: "Runway stays clear",
    primaryActionLabel: "Refresh forecast",
    secondaryActionLabel: "Review options",
    recentUpdates: [
      { label: "Runway remains healthy", tone: "success" },
      { label: "Current commitments covered", tone: "success" },
      { label: "Routine review only", tone: "info" },
    ],
    suggestedActions: ["Refresh forecast", "Monitor supplier balances"],
    lastVerifiedAction: "Forecast refreshed · Yesterday · Verified",
    tasks: [
      { title: "Review current commitments", due: "This week", status: "On track" },
      { title: "Check supplier balances", due: "Friday", status: "Upcoming" },
      { title: "Refresh forecast", due: "Next week", status: "Planned" },
    ],
    timeline: [
      { label: "This week", detail: "Maintain routine oversight" },
      { label: "Next", detail: "Refresh the forecast after current commitments post" },
      { label: "Focus", detail: "Preserve runway and avoid unnecessary transfers" },
    ],
  },
];

export function getProjects() {
  return projects;
}

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

export function getDefaultProject() {
  return getProjectById("harbour-road") ?? projects[0];
}
