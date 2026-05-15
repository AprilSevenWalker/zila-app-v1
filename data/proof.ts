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
    needsAttention: "Project Horizon is nearing a shortfall by Friday, matching a supplier-heavy pattern from last month.",
    timeline: [
      {
        id: "proof-1",
        day: "Today",
        action: "£2,000 recorded",
        context: "Materials added to Project Horizon",
        status: "Recorded",
        timestamp: "11:42",
        summary: "Material costs were added to Project Horizon and compared with historical operating patterns.",
        project: "Project Horizon",
        before: "Remaining runway: 10 days",
        after: "Remaining runway: 6 days",
        xrplReference: "XRPL-7F2C-81A9-4D21",
      },
      {
        id: "proof-2",
        day: "Today",
        action: "£4,300 invoice detected",
        context: "Supplier invoice assigned to Project Horizon",
        status: "Recorded",
        timestamp: "09:18",
        summary: "A supplier invoice was attached to Project Horizon and added to the operational timeline.",
        project: "Project Horizon",
        before: "Upcoming due this week: £5,200",
        after: "Upcoming due this week: £9,500",
        xrplReference: "XRPL-5D0A-93BF-8A32",
      },
      {
        id: "proof-3",
        day: "Yesterday",
        action: "£2,000 payment recorded",
        context: "Supplier payment saved against Project Horizon",
        status: "Recorded",
        timestamp: "16:07",
        summary: "A supplier payment was recorded and reflected in verified project spend and cash positioning.",
        project: "Project Horizon",
        before: "Spent: £14,600",
        after: "Spent: £16,600",
        xrplReference: "XRPL-11CC-42DE-6F80",
      },
      {
        id: "proof-4",
        day: "Yesterday",
        action: "Funding move prepared",
        context: "Move funds recommendation created for Harbour Road",
        status: "Recorded",
        timestamp: "13:26",
        summary: "A funding move recommendation was recorded after the week matched previous delivery pressure.",
        project: "Harbour Road",
        before: "Available buffer: £8,700",
        after: "Required move: £4,300",
        xrplReference: "XRPL-A3C4-7B19-2E55",
      },
    ],
  };
}
