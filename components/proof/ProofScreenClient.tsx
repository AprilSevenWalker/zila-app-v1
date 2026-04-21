"use client";

import { useEffect, useState } from "react";

import { getProofOverview } from "@/data/proof";
import { getStoredProofTransactions, storedTransactionToTimelineItem, subscribeToProofTransactions } from "@/lib/proofTransactionStore";
import { ProofScreenContent } from "@/components/proof/ProofScreenContent";

function buildOverview() {
  const overview = getProofOverview();
  const storedTimeline = getStoredProofTransactions().map(storedTransactionToTimelineItem);

  return {
    ...overview,
    statusTitle: storedTimeline.length > 0 ? "Wallet and operations recorded" : overview.statusTitle,
    lastUpdate: storedTimeline[0] ? "Just now" : overview.lastUpdate,
    syncStatus: storedTimeline.length > 0 ? "Wallet record synced to proof" : overview.syncStatus,
    operationsStatus: storedTimeline.length > 0 ? "Proof includes on-chain wallet activity" : overview.operationsStatus,
    timeline: [...storedTimeline, ...overview.timeline],
  };
}

export function ProofScreenClient() {
  const [overview, setOverview] = useState(buildOverview);

  useEffect(() => {
    const update = () => {
      setOverview(buildOverview());
    };

    update();
    return subscribeToProofTransactions(update);
  }, []);

  return <ProofScreenContent overview={overview} />;
}
