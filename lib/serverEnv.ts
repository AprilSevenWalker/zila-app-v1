import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let appEnvCache: Record<string, string> | null = null;

function parseEnvFile(contents: string) {
  return contents.split(/\r?\n/).reduce<Record<string, string>>((values, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return values;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return values;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    values[key] = rawValue.replace(/^['"]|['"]$/g, "");

    return values;
  }, {});
}

function getAppEnv() {
  if (appEnvCache) {
    return appEnvCache;
  }

  const envPath = path.join(process.cwd(), "app", ".env.local");
  appEnvCache = existsSync(envPath) ? parseEnvFile(readFileSync(envPath, "utf8")) : {};

  return appEnvCache;
}

export function readServerEnv(name: string, fallback?: string) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined) || getAppEnv()[name] || (fallback ? getAppEnv()[fallback] : undefined);
}
