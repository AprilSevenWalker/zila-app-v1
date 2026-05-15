"use client";

import { useEffect, useState } from "react";

import { getProofOverview } from "@/data/proof";
import { getStoredProofTransactions, storedTransactionToTimelineItem, subscribeToProofTransactions } from "@/lib/proofTransactionStore";
import {
  getProtectedMoneyState,
  protectedMoneyActivityToTimelineItem,
  subscribeToProtectedMoney,
} from "@/lib/protectedMoneyStore";
import { ProofScreenContent } from "@/components/proof/ProofScreenContent";

function buildOverview() {
  const overview = getProofOverview();
  const storedTimeline = getStoredProofTransactions().map(storedTransactionToTimelineItem);
  const reserveTimeline = getProtectedMoneyState().activity.map(protectedMoneyActivityToTimelineItem);
  const liveTimeline = [...reserveTimeline, ...storedTimeline].sort((left, right) => {
    if (left.day !== right.day) {
      return left.day === "Today" ? -1 : 1;
    }

    return right.timestamp.localeCompare(left.timestamp);
  });

  return {
    ...overview,
    statusTitle: liveTimeline.length > 0 ? "Operations recorded" : overview.statusTitle,
    lastUpdate: liveTimeline[0] ? "Just now" : overview.lastUpdate,
    syncStatus: liveTimeline.length > 0 ? "Verified activity synced" : overview.syncStatus,
    operationsStatus: reserveTimeline.length > 0 ? "Protected money included in operational history" : overview.operationsStatus,
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
    const unsubscribeProtectedMoney = subscribeToProtectedMoney(update);

    return () => {
      unsubscribeProof();
      unsubscribeProtectedMoney();
    };
  }, []);

  return <ProofScreenContent overview={overview} />;
}
