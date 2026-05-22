import { Xumm } from "xumm";

import { readServerEnv } from "@/lib/serverEnv";

function requireEnv(name: "XAMAN_API_KEY" | "XAMAN_API_SECRET" | "XRPL_MAINNET_DESTINATION_ADDRESS", fallback?: string) {
  const value = readServerEnv(name, fallback);
  if (!value) {
    if (name === "XAMAN_API_KEY" || name === "XAMAN_API_SECRET") {
      throw new Error("Missing Xaman API credentials");
    }

    throw new Error(`Missing required environment variable: ${name}${fallback ? ` or ${fallback}` : ""}`);
  }

  return value;
}

export function getXamanClient() {
  // Prefer the current Xumm env names, with legacy Xaman names supported for older local setups.
  return new Xumm(requireEnv("XAMAN_API_KEY", "XUMM_API_KEY"), requireEnv("XAMAN_API_SECRET", "XUMM_API_SECRET"));
}

export function getMainnetDestinationAddress() {
  return requireEnv("XRPL_MAINNET_DESTINATION_ADDRESS");
}

export function toDrops(amount: string | number) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  return String(Math.round(numericAmount * 1_000_000));
}
