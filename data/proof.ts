export interface ProofTimelineItem {
  id: string;
  day: "Today" | "Yesterday";
  action: string;
  context: string;
  status: string;
  timestamp: string;
  summary: string;
  project: string;
  before?: string;
  after?: string;
  xrplReference: string;
  txid?: string;
  xrplExplorerUrl?: string;
}

export interface ProofOverview {
  statusTitle: string;
  lastUpdate: string;
  missingRecords: string;
  syncStatus: string;
  systemStatus: string;
  operationsStatus: string;
  lastSynced: string;
  needsAttention: string;
  timeline: ProofTimelineItem[];
}

export function getProofOverview(): ProofOverview {
  return {
    statusTitle: "Verified history current",
    lastUpdate: "2 minutes ago",
    missingRecords: "No missing records",
    syncStatus: "All projects synced",
    systemStatus: "Record status",
    operationsStatus: "All operations recorded",
    lastSynced: "Synced 2 minutes ago",
    needsAttention: "Project Horizon has one supplier payout due Friday. The reserve remains protected while settlement is prepared.",
    timeline: [
      {
        id: "proof-1",
        day: "Today",
        action: "$4,300 payout verified",
        context: "Northline Suppliers · Project Horizon",
        status: "Verified on XRPL",
        timestamp: "11:42",
        summary: "Supplier payout settled, reserve impact recorded, and the project timeline updated automatically.",
        project: "Project Horizon",
        before: "Supplier obligation: Pending",
        after: "Payout, reserve, and proof synced",
        xrplReference: "XRPL-4A91-7F2C-81A9",
      },
      {
        id: "proof-2",
        day: "Today",
        action: "$24,220 reserve protected",
        context: "Supplier reserve held before payout",
        status: "Recorded",
        timestamp: "09:18",
        summary: "Zila protected the operating reserve before routing the Northline supplier payout.",
        project: "Project Horizon",
        before: "Reserve status: Open",
        after: "Reserve status: Protected",
        xrplReference: "XRPL-5D0A-93BF-8A32",
      },
      {
        id: "proof-3",
        day: "Yesterday",
        action: "$4,300 invoice attached",
        context: "Northline invoice assigned to Project Horizon",
        status: "Recorded",
        timestamp: "16:07",
        summary: "The invoice was linked to the project, supplier obligation, and upcoming payout schedule.",
        project: "Project Horizon",
        before: "Upcoming due this week: $5,200",
        after: "Upcoming due this week: $9,500",
        xrplReference: "XRPL-11CC-42DE-6F80",
      },
      {
        id: "proof-4",
        day: "Yesterday",
        action: "Stablecoin route prepared",
        context: "Settlement path selected for Northline payout",
        status: "Recorded",
        timestamp: "13:26",
        summary: "Zila prepared the fastest settlement route while keeping bank and mobile money rails visible.",
        project: "Project Horizon",
        before: "Settlement route: Not selected",
        after: "Settlement route: Stablecoin ready",
        xrplReference: "XRPL-A3C4-7B19-2E55",
      },
    ],
  };
}
