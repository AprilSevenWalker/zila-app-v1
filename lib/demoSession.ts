export interface ZilaUserProfile {
  name: string;
  fullName: string;
  email: string;
  role: string;
  workspace: string;
  isDemo: boolean;
}

const SESSION_EVENT = "zila-session-updated";
const SESSION_KEY = "zila-auth-session";
const DEMO_MODE_KEY = "zila-demo-mode";
const USER_NAME_KEY = "zila-user-name";
const USER_EMAIL_KEY = "zila-user-email";
const USER_AVATAR_KEY = "zila-user-avatar";
const USER_ROLE_KEY = "zila-user-role";

const AUTH_KEYS = [
  SESSION_KEY,
  DEMO_MODE_KEY,
  USER_NAME_KEY,
  USER_EMAIL_KEY,
  "zila-auth-email",
  "zila-auth-user-type",
  "zila-auth-mode",
  "zila-auth-remember",
  USER_AVATAR_KEY,
  USER_ROLE_KEY,
];

const PROFILE_KEYS = [
  "zila-business-name",
  "zila-business-type",
  "zila-settings-workspace",
  "zila-settings-saved-at",
];

const DEMO_RESET_PREFIXES = ["zila-"];

export const defaultDemoUser: ZilaUserProfile = {
  name: "Kevin",
  fullName: "Kevin Mwangi",
  email: "kevin@zila.demo",
  role: "Operations Lead",
  workspace: "Zila Operations",
  isDemo: true,
};

export const defaultUserProfile: ZilaUserProfile = {
  name: "Operator",
  fullName: "Operator",
  email: "",
  role: "Owner",
  workspace: "Operational workspace",
  isDemo: false,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function titleFromEmail(email: string) {
  const localPart = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!localPart) {
    return "New operator";
  }

  return localPart
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function dispatchSessionUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

function removeMatchingStorageKeys(storage: Storage, predicate: (key: string) => boolean) {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => Boolean(key));

  keys.forEach((key) => {
    if (predicate(key)) {
      storage.removeItem(key);
    }
  });
}

export function getZilaUserProfile(): ZilaUserProfile {
  if (!isBrowser()) {
    return defaultUserProfile;
  }

  const isDemo = window.localStorage.getItem(DEMO_MODE_KEY) === "true";
  const email = window.localStorage.getItem(USER_EMAIL_KEY) || window.localStorage.getItem("zila-auth-email") || (isDemo ? defaultDemoUser.email : "");
  const fallbackName = isDemo ? defaultDemoUser.name : titleFromEmail(email);
  const name = window.localStorage.getItem(USER_NAME_KEY) || fallbackName;
  const workspace = window.localStorage.getItem("zila-business-name") || (isDemo ? defaultDemoUser.workspace : defaultUserProfile.workspace);

  return {
    name,
    fullName: isDemo ? defaultDemoUser.fullName : name,
    email,
    role: window.localStorage.getItem(USER_ROLE_KEY) || (isDemo ? defaultDemoUser.role : defaultUserProfile.role),
    workspace,
    isDemo,
  };
}

export function getZilaAvatarDataUrl() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(USER_AVATAR_KEY) || "";
}

export function subscribeToZilaSession(onChange: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith("zila-")) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_EVENT, onChange);
  };
}

export function startZilaSession(input: { email: string; mode: "sign-in" | "sign-up"; remember: boolean; name?: string }) {
  if (!isBrowser()) {
    return;
  }

  const email = input.email.trim();
  const name = input.name?.trim() || titleFromEmail(email);

  if (input.mode === "sign-up") {
    removeMatchingStorageKeys(window.localStorage, (key) => key.startsWith("zila-"));
    removeMatchingStorageKeys(window.sessionStorage, (key) => key.startsWith("zila-"));
  }

  window.localStorage.setItem(SESSION_KEY, "active");
  window.localStorage.setItem(DEMO_MODE_KEY, "false");
  window.localStorage.setItem(USER_EMAIL_KEY, email);
  window.localStorage.setItem(USER_NAME_KEY, name);
  window.localStorage.setItem(USER_ROLE_KEY, "Owner");
  window.localStorage.setItem("zila-auth-email", email);
  window.localStorage.setItem("zila-auth-user-type", input.mode === "sign-up" ? "new" : "returning");
  window.localStorage.setItem("zila-auth-mode", input.mode);
  window.localStorage.setItem("zila-auth-remember", String(input.remember));

  if (input.mode === "sign-up") {
    window.localStorage.removeItem("zila-business-name");
    window.localStorage.removeItem("zila-settings-workspace");
  }

  dispatchSessionUpdate();
}

export function startZilaDemoSession() {
  if (!isBrowser()) {
    return;
  }

  removeMatchingStorageKeys(window.localStorage, (key) => DEMO_RESET_PREFIXES.some((prefix) => key.startsWith(prefix)));
  removeMatchingStorageKeys(window.sessionStorage, (key) => DEMO_RESET_PREFIXES.some((prefix) => key.startsWith(prefix)));
  window.localStorage.setItem(SESSION_KEY, "active");
  window.localStorage.setItem(DEMO_MODE_KEY, "true");
  window.localStorage.setItem(USER_EMAIL_KEY, defaultDemoUser.email);
  window.localStorage.setItem(USER_NAME_KEY, defaultDemoUser.name);
  window.localStorage.setItem(USER_ROLE_KEY, defaultDemoUser.role);
  window.localStorage.setItem("zila-auth-email", defaultDemoUser.email);
  window.localStorage.setItem("zila-auth-user-type", "demo");
  window.localStorage.setItem("zila-auth-mode", "demo");
  window.localStorage.setItem("zila-auth-remember", "true");
  window.localStorage.setItem("zila-business-name", defaultDemoUser.workspace);
  window.localStorage.setItem("zila-settings-workspace", defaultDemoUser.workspace);
  dispatchSessionUpdate();
}

export function signOutZilaSession() {
  if (!isBrowser()) {
    return;
  }

  AUTH_KEYS.concat(PROFILE_KEYS, ["zila-money-source"]).forEach((key) => window.localStorage.removeItem(key));
  removeMatchingStorageKeys(window.sessionStorage, (key) => key.startsWith("zila-"));
  window.sessionStorage.setItem("zila-auth-toast", "Signed out successfully.");
  dispatchSessionUpdate();
}

export function resetZilaDemoData() {
  if (!isBrowser()) {
    return;
  }

  removeMatchingStorageKeys(window.localStorage, (key) => DEMO_RESET_PREFIXES.some((prefix) => key.startsWith(prefix)));
  removeMatchingStorageKeys(window.sessionStorage, (key) => DEMO_RESET_PREFIXES.some((prefix) => key.startsWith(prefix)));

  startZilaDemoSession();
}

export function getAndClearAuthToast() {
  if (!isBrowser()) {
    return "";
  }

  const toast = window.sessionStorage.getItem("zila-auth-toast") || "";
  window.sessionStorage.removeItem("zila-auth-toast");
  return toast;
}
