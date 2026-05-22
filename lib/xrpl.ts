import { Client } from "xrpl";

import { readServerEnv } from "@/lib/serverEnv";

function getRpcUrl() {
  return readServerEnv("XRPL_RPC_URL") || "wss://xrplcluster.com";
}

export const xrplClient = new Client(getRpcUrl());

export async function connectXRPL() {
  if (!xrplClient.isConnected()) {
    await xrplClient.connect();
  }

  return xrplClient;
}

export async function getTransactionByHash(hash: string) {
  const client = await connectXRPL();
  const response = await client.request({
    command: "tx",
    transaction: hash,
  });

  return response.result;
}
