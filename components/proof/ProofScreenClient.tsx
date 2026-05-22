"use client";

import { useEffect, useState } from "react";

import { getProofOverview } from "@/data/proof";
import { getOperationalProofRecords, operationalProofToTimelineItem, subscribeToOperationalProofRecords } from "@/lib/proof";
import { getStoredProofTransactions, storedTransactionToTimelineItem, subscribeToProofTransactions } from "@/lib/proofTransactionStore";
import {
  getProtectedMoneyState,
  protectedMoneyActivityToTimelineItem,
  subscribeToProtectedMoney,
} from "@/lib/protectedMoneyStore";
import { ProofScreenContent } from "@/components/proof/ProofScreenContent";

function buildOverview() {
  const overview = getProofOverview();
  const operationalProofTimeline = getOperationalProofRecords().map(operationalProofToTimelineItem);
  const storedTimeline = getStoredProofTransactions().map(storedTransactionToTimelineItem);
  const reserveTimeline = getProtectedMoneyState().activity.map(protectedMoneyActivityToTimelineItem);
  const liveTimeline = [...operationalProofTimeline, ...reserveTimeline, ...storedTimeline].sort((left, right) => {
    if (left.day !== right.day) {
      return left.day === "Today" ? -1 : 1;
    }

    return right.timestamp.localeCompare(left.timestamp);
  });

  return {
    ...overview,
    statusTitle: liveTimeline.length > 0 ? "Verified operational activity" : overview.statusTitle,
    lastUpdate: liveTimeline[0] ? "Just now" : overview.lastUpdate,
    syncStatus: liveTimeline.length > 0 ? "Confirmed payout history synced" : overview.syncStatus,
    operationsStatus: operationalProofTimeline.length > 0 ? "Proof created from real project movement" : reserveTimeline.length > 0 ? "Protected money included in operational history" : overview.operationsStatus,
    timeline: [...liveTimeline, ...overview.timeline],
  };
}

export function ProofScreenClient() {
  const [overview, setOverview] = useState(buildOverview);

  useEffect(() => {
    const update = () => {
      setOverview(buildOverview());
    };

    update();
    const unsubscribeProof = subscribeToProofTransactions(update);
    const unsubscribeOperationalProof = subscribeToOperationalProofRecords(update);
    const unsubscribeProtectedMoney = subscribeToProtectedMoney(update);

    return () => {
      unsubscribeProof();
      unsubscribeOperationalProof();
      unsubscribeProtectedMoney();
    };
  }, []);

  return <ProofScreenContent overview={overview} />;
}
