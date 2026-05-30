const PRODUCTION_APP_URL = "https://app.zila.one";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getConfiguredAppUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || PRODUCTION_APP_URL);
}

export function getAppOriginForRequest(requestUrl: string) {
  if (process.env.NODE_ENV === "production") {
    return getConfiguredAppUrl();
  }

  return new URL(requestUrl).origin;
}
