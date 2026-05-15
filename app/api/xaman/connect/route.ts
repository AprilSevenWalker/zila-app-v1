import { NextResponse } from "next/server";

import { getXamanClient } from "@/lib/xamanServer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const xaman = getXamanClient();
    const origin = new URL(request.url).origin;
    const body = (await request.json().catch(() => ({}))) as {
      returnPath?: string;
    };
    const returnPath = body.returnPath?.startsWith("/") ? body.returnPath : "/wallet";
    const payload = await xaman.payload?.create({
      txjson: {
        TransactionType: "SignIn",
      },
      options: {
        force_network: "MAINNET",
        return_url: {
          app: `${origin}${returnPath}?payload={id}`,
          web: `${origin}${returnPath}?payload={id}`,
        },
      },
      custom_meta: {
        identifier: "zila-connect-money",
        instruction: "Connect your money source to continue in Zila.",
      },
    });

    if (!payload) {
      return NextResponse.json({ error: "Unable to create Xaman connection request." }, { status: 500 });
    }

    return NextResponse.json({
      id: payload.uuid,
      url: payload.next.always,
      qrPng: payload.refs.qr_png,
      websocketStatus: payload.refs.websocket_status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Xaman connection request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
