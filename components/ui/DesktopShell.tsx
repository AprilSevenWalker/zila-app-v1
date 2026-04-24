"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CreditCard,
  FolderKanban,
  Home,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";

interface DesktopShellProps {
  children: ReactNode;
}

interface DesktopNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const desktopNavItems: DesktopNavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
    description: "Business overview",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    description: "Track delivery and spend",
  },
  {
    label: "Ask Zila",
    href: "/ask",
    icon: MessageSquareText,
    description: "Record updates quickly",
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    description: "Move cash with confidence",
  },
  {
    label: "Proof",
    href: "/proof",
    icon: ShieldCheck,
    description: "Operational record",
  },
  {
    label: "Me",
    href: "/me",
    icon: UserRound,
    description: "Preferences and profile",
  },
];

const homeNavItems: DesktopNavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
    description: "Business overview",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    description: "Track delivery & spend",
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    description: "Move cash with confidence",
  },
  {
    label: "Proof",
    href: "/proof",
    icon: ShieldCheck,
    description: "Operational record",
  },
  {
    label: "Ask Zila",
    href: "/ask",
    icon: MessageSquareText,
    description: "Record updates quickly",
  },
  {
    label: "Analytics",
    href: "/compare",
    icon: BarChart3,
    description: "Explore your data",
  },
  {
    label: "Settings",
    href: "/me",
    icon: Settings,
    description: "Preferences & profile",
  },
];

const pageMeta: Record<string, { title: string; eyebrow: string; summary: string }> = {
  "/home": {
    title: "Tell Zila what changed",
    eyebrow: "Home",
    summary: "Start with one update. Zila helps keep money, projects, and next actions in sync.",
  },
  "/projects": {
    title: "Projects",
    eyebrow: "Portfolio",
    summary: "Track project health, delivery, and what needs action next.",
  },
  "/ask": {
    title: "Ask Zila",
    eyebrow: "Command",
    summary: "Capture updates, payments, and invoices in one guided workflow.",
  },
  "/payments": {
    title: "Payments",
    eyebrow: "Cashflow",
    summary: "Understand available cash, allocations, and what needs to move next.",
  },
  "/proof": {
    title: "Proof of Operations",
    eyebrow: "Proof",
    summary: "Review what has been recorded, time stamped, and saved.",
  },
  "/me": {
    title: "Preferences",
    eyebrow: "Profile",
    summary: "Manage your account context, currency defaults, and personal settings.",
  },
  "/compare": {
    title: "Business comparison",
    eyebrow: "Insight",
    summary: "See how this business compares and where to focus next.",
  },
};

function getPageMeta(pathname: string) {
  const exact = pageMeta[pathname];
  if (exact) {
    return exact;
  }

  if (pathname.startsWith("/projects/")) {
    return {
      title: "Project detail",
      eyebrow: "Project",
      summary: "Review finances, updates, and next moves for the selected project.",
    };
  }

  if (pathname.startsWith("/payments/")) {
    return {
      title: "Payments action",
      eyebrow: "Cashflow",
      summary: "Complete the next payment step without leaving the finance workspace.",
    };
  }

  return {
    title: "Zila",
    eyebrow: "Workspace",
    summary: "Run the business with one connected operating layer.",
  };
}

export function DesktopShell({ children }: DesktopShellProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const isHome = pathname === "/home";
  const visibleNavItems = isHome ? homeNavItems : desktopNavItems;

  return (
    <div
      className={`zila-page-grain hidden min-h-screen w-full md:block ${
        isHome
          ? "bg-[radial-gradient(circle_at_18%_8%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_58%_86%,rgba(129,140,248,0.14),transparent_36%),linear-gradient(180deg,#FAF7F1_0%,#F0EEE9_48%,#E5E0D5_100%)]"
          : "bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,#F7F4EE_0%,#F3F0E8_54%,#EEEAE0_100%)]"
      }`}
    >
      <div className="mx-auto grid min-h-screen w-full max-w-[1480px] grid-cols-[240px_minmax(0,1fr)] gap-7 px-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside
          className={`sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[28px] border px-5 py-6 backdrop-blur-xl ${
            isHome
              ? "border-white/9 bg-[radial-gradient(circle_at_16%_0%,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_88%_88%,rgba(34,211,238,0.06),transparent_32%),linear-gradient(180deg,#10162A,#0B1020_58%,#0A0E19)] shadow-[0_20px_60px_rgba(0,0,0,0.11),0_30px_68px_rgba(15,23,42,0.21),0_0_26px_rgba(99,102,241,0.055),inset_0_1px_0_rgba(255,255,255,0.07)]"
              : "border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.86))] shadow-[0_26px_60px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]"
          }`}
        >
          {isHome ? (
            <>
              <div className="pointer-events-none absolute left-[-32%] top-[-12%] h-48 w-60 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.09),rgba(34,211,238,0)_72%)] blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-18%] right-[-38%] h-60 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.10),rgba(99,102,241,0)_72%)] blur-3xl" />
            </>
          ) : null}
          {isHome ? (
            <div className="relative">
              <div className="sidebar-header">
                <div className="sidebar-logo-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-full.png" alt="Zila" className="sidebar-logo" />
                </div>
              </div>

              <div className="profile-section flex items-center gap-3 px-2">
                <div className="relative h-[52px] w-[52px] overflow-hidden rounded-full border border-white/14 bg-[#111827] shadow-[0_18px_32px_rgba(0,0,0,0.30),0_0_22px_rgba(99,102,241,0.16)]">
                  <Image
                    src="/zila-profile-amara.png"
                    alt="Amara Mwangi"
                    fill
                    unoptimized
                    sizes="52px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-white">Amara Mwangi</p>
                  <p className="mt-0.5 truncate text-[12px] font-medium text-[#8993AC]">Amara&apos;s Designs</p>
                </div>
                <ChevronDown className="h-[15px] w-[15px] text-[#8993AC]" strokeWidth={2} />
              </div>
            </div>
          ) : (
            <div>
              <div className="sidebar-header">
                <div className="sidebar-logo-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-full.png" alt="Zila" className="sidebar-logo" />
                </div>
              </div>
              <div className="px-2">
                <h1 className="mt-3 text-[30px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#121417]">
                  Operate with clarity.
                </h1>
                <p className="mt-3 text-[14px] leading-[1.7] text-[#667085]">
                  Desktop mode gives you a wider command view without changing the mobile app itself.
                </p>
              </div>
            </div>
          )}

          <nav className={isHome ? "relative mt-8 space-y-2" : "mt-8 space-y-2"}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[18px] px-3 py-3 transition-all duration-200 ${
                    isHome
                      ? isActive
                        ? "border border-[#8589FF]/24 bg-[linear-gradient(135deg,rgba(91,86,210,0.62),rgba(45,59,132,0.54))] text-white shadow-[0_14px_26px_rgba(79,70,229,0.15),0_0_10px_rgba(99,102,241,0.045),inset_0_1px_0_rgba(255,255,255,0.10)]"
                        : "border border-transparent text-[#B8C3DB] hover:border-white/9 hover:bg-white/[0.055] hover:shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                      : isActive
                        ? "border border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.10))] shadow-[0_16px_34px_rgba(99,102,241,0.11),inset_0_1px_0_rgba(255,255,255,0.72)]"
                        : "border border-transparent hover:border-[rgba(99,102,241,0.12)] hover:bg-white/78 hover:shadow-[0_12px_26px_rgba(99,102,241,0.07)]"
                  }`}
                >
                  <IconTile
                    glow={isActive ? "indigo" : "none"}
                    className={
                      isHome
                        ? `h-10 w-10 rounded-[13px] border-white/8 ${
                            isActive
                              ? "bg-white/11 text-white shadow-[0_0_9px_rgba(255,255,255,0.035),inset_0_1px_0_rgba(255,255,255,0.10)]"
                              : "bg-white/[0.055] text-[#AEBBDA] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                          }`
                        : isActive
                          ? "bg-white text-[#121417]"
                          : "bg-[#F7F4EE] text-[#475467]"
                    }
                  >
                    <Icon className={isHome ? "h-[17px] w-[17px]" : "h-[17px] w-[17px]"} strokeWidth={isHome ? 1.9 : 2} />
                  </IconTile>
                  <div className="min-w-0">
                    <p
                      className={`text-[14px] font-semibold ${
                        isHome ? (isActive ? "text-white" : "text-[#D8E0F1]") : isActive ? "text-[#121417]" : "text-[#253041]"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className={`truncate text-[12px] ${isHome ? (isActive ? "text-[#C8D2FF]" : "text-[#7D879E]") : "text-[#667085]"}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div
            className={`zila-card-hover mt-auto rounded-[26px] border p-4 text-white ${
              isHome
                ? "border-white/10 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_82%_100%,rgba(99,102,241,0.16),transparent_34%),linear-gradient(155deg,#070C18,#0E172A_54%,#1A1447)] shadow-[0_24px_50px_rgba(15,23,42,0.24),0_0_24px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(31,41,55,0.92))] shadow-[0_18px_36px_rgba(15,23,42,0.18)]"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8BE9F7]">
              Quick path
            </p>
            <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em]">
              Tell Zila what changed.
            </p>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#CBD5E1]">
              Capture payments, invoices, and cost changes without leaving your flow.
            </p>
            <Link
              href="/ask"
              className="zila-button-hover mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7C3AED,#5B5DE8)] px-4 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(91,93,232,0.32),0_0_20px_rgba(124,58,237,0.16)]"
            >
              Ask Zila
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header
            className={
              isHome
                ? "px-1 py-2"
                : "rounded-[32px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))] px-7 py-6 shadow-[0_24px_54px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur-xl"
            }
          >
            {isHome ? (
              <div className="flex items-center justify-between gap-6">
                <div className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-[12px] font-semibold text-[#667085]">
                  <Sun className="h-[15px] w-[15px] text-[#F59E0B]" strokeWidth={1.9} />
                  Thursday, 23 April
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-medium text-[#667085]">Good morning,</p>
                  <p className="mt-1 text-[24px] font-semibold leading-none tracking-[-0.05em] text-[#121417]">Amara 👋</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-[rgba(99,102,241,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,255,0.78))] px-4 py-2 text-[12px] font-semibold text-[#4F46E5] shadow-[0_16px_32px_rgba(99,102,241,0.14),inset_0_1px_0_rgba(255,255,255,0.86)]">
                    Day 14 streak
                  </div>
                  <button
                    type="button"
                    className="zila-button-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/72 bg-white/78 text-[#1F2937] shadow-[0_14px_28px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.82)]"
                    aria-label="Notifications"
                  >
                    <Bell className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </button>
                  <Link
                    href="/proof"
                    className="zila-button-hover inline-flex items-center gap-2 rounded-full border border-white/12 bg-[linear-gradient(135deg,#0F172A,#312E81)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_20px_38px_rgba(49,46,129,0.30),0_0_24px_rgba(99,102,241,0.16)]"
                  >
                    Proof of Operations
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-[720px]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                    {meta.eyebrow}
                  </p>
                  <h2 className="mt-3 text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#121417]">
                    {meta.title}
                  </h2>
                  <p className="mt-4 text-[15px] leading-[1.8] text-[#667085]">{meta.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="rounded-full border border-[rgba(99,102,241,0.16)] bg-white/86 px-4 py-2 text-[12px] font-semibold text-[#4F46E5] shadow-[0_12px_24px_rgba(99,102,241,0.08)]">
                    Day 14 streak
                  </div>
                  <Link
                    href="/proof"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(18,20,23,0.08)] bg-[#121417] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                  >
                    Proof of Operations
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            )}
          </header>

          <main className={isHome ? "pb-10 pt-5" : "pb-10 pt-7"}>{children}</main>
        </div>
      </div>
    </div>
  );
}

export default DesktopShell;
