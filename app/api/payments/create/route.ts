import { NextResponse } from "next/server";
import { isValidClassicAddress } from "xrpl";

import { getAppOriginForRequest } from "@/lib/appUrl";
import { createPaymentPayload } from "@/lib/xaman";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to create payment request.";
}

function summarizeAddress(address?: string) {
  const trimmed = address?.trim();
  if (!trimmed) {
    return null;
  }

  return `${trimmed.slice(0, 6)}...${trimmed.slice(-6)}`;
}

export async function POST(request: Request) {
  let requestContext:
    | {
        supplierName?: string;
        amount?: string | number;
        currency?: string;
        projectId?: string;
        projectName?: string;
        destinationAddress?: string | null;
        senderAddress?: string | null;
        hasIssuer: boolean;
        returnPath?: string;
      }
    | null = null;

  try {
    const origin = getAppOriginForRequest(request.url);
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

    requestContext = {
      supplierName: body.supplierName,
      amount: body.amount,
      currency: body.currency?.trim().toUpperCase() || "XRP",
      projectId: body.projectId,
      projectName: body.projectName,
      destinationAddress: summarizeAddress(body.destinationAddress),
      senderAddress: summarizeAddress(body.senderAddress),
      hasIssuer: Boolean(body.issuer),
      returnPath: body.returnPath,
    };

    if (!body.supplierName || !body.amount || !body.destinationAddress || !body.projectId) {
      return NextResponse.json({ error: "Missing supplier, amount, destination, or project details." }, { status: 400 });
    }

    if (!isValidClassicAddress(body.destinationAddress.trim())) {
      return NextResponse.json({ error: "Enter a valid recipient XRP Ledger address before creating the payment." }, { status: 400 });
    }

    if (body.senderAddress?.trim().toLowerCase() === body.destinationAddress.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "You can’t send this payout to the same wallet connected as the sender. Add a supplier or payee destination." },
        { status: 400 },
      );
    }

    const currency = body.currency?.trim().toUpperCase() || "XRP";
    const numericAmount = typeof body.amount === "number" ? body.amount : Number(body.amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Enter a positive XRP amount before creating the payment." }, { status: 400 });
    }

    if (currency !== "XRP") {
      return NextResponse.json({ error: "Use XRP for the first Xaman payout test. Stablecoin support comes later." }, { status: 400 });
    }

    const returnPath = body.returnPath?.startsWith("/") ? body.returnPath : "/payments/send";
    const payload = await createPaymentPayload({
      supplierName: body.supplierName,
      amount: body.amount,
      destinationAddress: body.destinationAddress.trim(),
      projectId: body.projectId,
      projectName: body.projectName,
      currency,
      returnUrl: {
        app: `${origin}${returnPath}?payload={id}&txid={txid}`,
        web: `${origin}${returnPath}?payload={id}&txid={txid}`,
      },
    });

    return NextResponse.json({
      uuid: payload.uuid,
      qr: payload.refs.qr_png,
      qrUrl: payload.refs.qr_png,
      deeplink: payload.next.always,
      deepLink: payload.next.always,
      websocketStatusUrl: payload.refs.websocket_status,
      txHash: payload.response?.txid ?? null,
    });
  } catch (error) {
    const rawMessage = getErrorMessage(error);
    const message = rawMessage.includes("Missing required environment variable")
      || rawMessage.includes("Missing Xaman API credentials")
      ? "Xaman payment credentials are not configured. Add XUMM_API_KEY/XAMAN_API_KEY and XUMM_API_SECRET/XAMAN_API_SECRET to the server environment."
      : rawMessage;

    console.error("POST /api/payments/create failed", {
      error: rawMessage,
      request: requestContext,
    });

    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV !== "production" ? { detail: rawMessage } : {}),
      },
      { status: 500 },
    );
  }
}
