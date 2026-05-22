import { NextResponse } from "next/server";

import { createPaymentPayload } from "@/lib/xaman";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const body = (await request.json()) as {
      supplierName?: string;
      amount?: string | number;
      destinationAddress?: string;
      memo?: string;
      projectId?: string;
      projectName?: string;
      senderAddress?: string;
      currency?: string;
      issuer?: string;
      returnPath?: string;
    };

    if (!body.supplierName || !body.amount || !body.destinationAddress || !body.projectId) {
      return NextResponse.json({ error: "Missing supplier, amount, destination, or project details." }, { status: 400 });
    }

    const returnPath = body.returnPath?.startsWith("/") ? body.returnPath : "/payments/make-payment";
    const payload = await createPaymentPayload({
      supplierName: body.supplierName,
      amount: body.amount,
      destinationAddress: body.destinationAddress,
      memo: body.memo,
      projectId: body.projectId,
      projectName: body.projectName,
      senderAddress: body.senderAddress,
      currency: body.currency,
      issuer: body.issuer,
      returnUrl: {
        app: `${origin}${returnPath}?payload={id}&txid={txid}`,
        web: `${origin}${returnPath}?payload={id}&txid={txid}`,
      },
    });

    return NextResponse.json({
      uuid: payload.uuid,
      qrUrl: payload.refs.qr_png,
      deepLink: payload.next.always,
      websocketStatusUrl: payload.refs.websocket_status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create payment request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
