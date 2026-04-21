import { Xumm } from "xumm";

function requireEnv(name: "XAMAN_API_KEY" | "XAMAN_API_SECRET" | "XRPL_MAINNET_DESTINATION_ADDRESS") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getXamanClient() {
  return new Xumm(requireEnv("XAMAN_API_KEY"), requireEnv("XAMAN_API_SECRET"));
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
