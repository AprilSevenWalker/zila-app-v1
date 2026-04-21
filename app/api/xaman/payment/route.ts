import { NextResponse } from "next/server";

import { getMainnetDestinationAddress, getXamanClient, toDrops } from "@/lib/xamanServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const body = (await request.json()) as {
      amount?: string;
      walletAddress?: string;
      linkedLabel?: string;
      project?: string;
    };

    if (!body.amount || !body.walletAddress || !body.linkedLabel || !body.project) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    const xaman = getXamanClient();
    const payload = await xaman.payload?.create({
      txjson: {
        TransactionType: "Payment",
        Account: body.walletAddress,
        Destination: getMainnetDestinationAddress(),
        Amount: toDrops(body.amount),
      },
      options: {
        force_network: "MAINNET",
        return_url: {
          app: `${origin}/wallet?payload={id}&txid={txid}`,
          web: `${origin}/wallet?payload={id}&txid={txid}`,
        },
      },
      custom_meta: {
        identifier: `zila-payment-${body.project}`,
        instruction: `Sign to make a payment for ${body.linkedLabel}.`,
        blob: {
          linkedLabel: body.linkedLabel,
          project: body.project,
        },
      },
    });

    if (!payload) {
      return NextResponse.json({ error: "Unable to create Xaman payment request." }, { status: 500 });
    }

    return NextResponse.json({
      id: payload.uuid,
      url: payload.next.always,
      qrPng: payload.refs.qr_png,
      websocketStatus: payload.refs.websocket_status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Xaman payment request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
