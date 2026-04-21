import { NextResponse } from "next/server";

import { getXamanClient } from "@/lib/xamanServer";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/api/xaman/payload/[id]">) {
  try {
    const { id } = await context.params;
    const xaman = getXamanClient();
    const payload = await xaman.payload?.get(id, true);

    if (!payload) {
      return NextResponse.json({ error: "Payload not found." }, { status: 404 });
    }

    return NextResponse.json({
      meta: payload.meta,
      request: payload.payload.request_json,
      response: payload.response,
      customMeta: payload.custom_meta,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch Xaman payload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
