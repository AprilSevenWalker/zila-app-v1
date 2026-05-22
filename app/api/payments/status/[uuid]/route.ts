import { NextResponse } from "next/server";

import { getTransactionStatus } from "@/lib/xaman";
import { getTransactionByHash } from "@/lib/xrpl";

export const dynamic = "force-dynamic";

function xrplTimestampToIso(timestamp?: number) {
  if (typeof timestamp !== "number") {
    return new Date().toISOString();
  }

  return new Date((timestamp + 946684800) * 1000).toISOString();
}

export async function GET(_request: Request, context: RouteContext<"/api/payments/status/[uuid]">) {
  try {
    const { uuid } = await context.params;
    const status = await getTransactionStatus(uuid);

    if (!status) {
      return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    }

    let xrplTransaction: Awaited<ReturnType<typeof getTransactionByHash>> | null = null;

    if (status.signed && status.txHash) {
      try {
        xrplTransaction = await getTransactionByHash(status.txHash);
      } catch {
        xrplTransaction = null;
      }
    }

    const ledgerIndex =
      typeof xrplTransaction?.ledger_index === "number"
        ? xrplTransaction.ledger_index
        : typeof xrplTransaction?.ledger_index === "string"
          ? Number(xrplTransaction.ledger_index)
          : undefined;

    return NextResponse.json({
      signed: status.signed,
      rejected: status.rejected,
      txHash: status.txHash,
      account: status.account,
      validated: Boolean(xrplTransaction?.validated),
      ledgerIndex: Number.isFinite(ledgerIndex) ? ledgerIndex : undefined,
      timestamp: xrplTimestampToIso(typeof xrplTransaction?.date === "number" ? xrplTransaction.date : undefined),
      payload: {
        meta: status.payload.meta,
        response: status.payload.response,
        customMeta: status.payload.custom_meta,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check payment status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
