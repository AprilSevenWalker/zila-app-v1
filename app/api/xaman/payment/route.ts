import { NextResponse } from "next/server";

import { getMainnetDestinationAddress, getXamanClient, toDrops } from "@/lib/xamanServer";

export const dynamic = "force-dynamic";

function normalizeCurrency(currency: string | undefined) {
  return currency?.trim().toUpperCase() || "XRP";
}

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const body = (await request.json()) as {
      amount?: string;
      walletAddress?: string;
      linkedLabel?: string;
      project?: string;
      currency?: string;
      issuer?: string;
      destinationAddress?: string;
      returnPath?: string;
    };

    if (!body.amount || !body.walletAddress || !body.linkedLabel || !body.project) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    const currency = normalizeCurrency(body.currency);
    const destinationAddress = body.destinationAddress || getMainnetDestinationAddress();
    const returnPath = body.returnPath?.startsWith("/") ? body.returnPath : "/wallet";

    if (currency !== "XRP" && !body.issuer) {
      return NextResponse.json({ error: "Token payments require an issuer address." }, { status: 400 });
    }

    const amount =
      currency === "XRP"
        ? toDrops(body.amount)
        : {
            currency,
            issuer: body.issuer,
            value: body.amount,
          };

    const xaman = getXamanClient();
    const payload = await xaman.payload?.create({
      txjson: {
        TransactionType: "Payment",
        Account: body.walletAddress,
        Destination: destinationAddress,
        Amount: amount,
      },
      options: {
        force_network: "MAINNET",
        return_url: {
          app: `${origin}${returnPath}?payload={id}&txid={txid}`,
          web: `${origin}${returnPath}?payload={id}&txid={txid}`,
        },
      },
      custom_meta: {
        identifier: `zila-payment-${body.project}`,
        instruction: `Sign to make a ${currency} payment for ${body.linkedLabel}.`,
        blob: {
          linkedLabel: body.linkedLabel,
          project: body.project,
          destinationAddress,
          currency,
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
      destinationAddress,
      currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Xaman payment request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
