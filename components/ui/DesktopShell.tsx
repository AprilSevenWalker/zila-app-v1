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
import { openProductGuide } from "@/components/guide/ProductGuideModal";
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
    description: "Apply operating context",
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
    description: "Verified history",
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
    description: "Apply operating context",
  },
  {
    label: "Patterns",
    href: "/compare",
    icon: BarChart3,
    description: "Operating signals",
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
    title: "Record what changed",
    eyebrow: "Home",
    summary: "Start with one update. Zila keeps money, projects, and verified history in sync.",
  },
  "/projects": {
    title: "Projects",
    eyebrow: "Portfolio",
    summary: "Track project health, delivery, and what needs action next.",
  },
  "/ask": {
    title: "Operational update",
    eyebrow: "Context",
    summary: "Capture updates, payments, and invoices with business activity history attached.",
  },
  "/payments": {
    title: "Payments",
    eyebrow: "Cashflow",
    summary: "Understand available cash, allocations, and what needs to move next.",
  },
  "/proof": {
    title: "Proof of Operations",
    eyebrow: "Verified history",
    summary: "Review recorded decisions, verified activity, and operational timeline.",
  },
  "/me": {
    title: "Preferences",
    eyebrow: "Profile",
    summary: "Manage your account context, currency defaults, and personal settings.",
  },
  "/compare": {
    title: "Operating patterns",
    eyebrow: "Signals",
    summary: "Review recurring behaviour and historical operating patterns.",
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
          ? "bg-[radial-gradient(ellipse_at_18%_0%,rgba(255,255,255,0.72),transparent_32%),radial-gradient(ellipse_at_86%_7%,rgba(103,232,249,0.24),transparent_28%),radial-gradient(ellipse_at_54%_88%,rgba(109,94,248,0.10),transparent_36%),linear-gradient(180deg,#DCEEFF_0%,#C6DDF8_48%,#AFCBEF_100%)]"
          : "bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.48),transparent_28%),radial-gradient(ellipse_at_top_right,rgba(103,232,249,0.20),transparent_26%),linear-gradient(180deg,#DCEEFF_0%,#C8DDF6_54%,#B7D0F0_100%)]"
      }`}
    >
      <div className="mx-auto grid min-h-screen w-full max-w-[1480px] grid-cols-[240px_minmax(0,1fr)] gap-7 px-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside
          className={`sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[28px] border px-5 py-5 backdrop-blur-xl ${
            isHome
              ? "border-white/28 bg-[linear-gradient(180deg,rgba(26,55,96,0.68),rgba(18,42,76,0.76)_62%,rgba(12,29,55,0.82))] shadow-[0_24px_58px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(255,255,255,0.18)]"
              : "border-white/24 bg-[linear-gradient(180deg,rgba(28,58,100,0.72),rgba(18,42,76,0.74))] shadow-[0_26px_70px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(247,248,252,0.16)]"
          }`}
        >
          {isHome ? (
            <>
              <div className="pointer-events-none absolute left-[-32%] top-[-12%] h-48 w-60 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.16),rgba(255,255,255,0)_72%)] blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-18%] right-[-38%] h-60 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(103,232,249,0.14),rgba(103,232,249,0)_72%)] blur-3xl" />
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
                <div className="relative h-[52px] w-[52px] overflow-hidden rounded-full border border-white/24 bg-[#16365F] shadow-[0_18px_32px_rgba(31,68,116,0.22)]">
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
                  <p className="truncate text-[14px] font-semibold text-[#F7F8FC]">Amara Mwangi</p>
                  <p className="mt-0.5 truncate text-[12px] font-medium text-[#A7B0C5]">Amara&apos;s Designs</p>
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
                <h1 className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#F7F8FC]">
                  Projects move. Zila keeps the operation aligned.
                </h1>
                <p className="mt-2 text-[13px] leading-[1.65] text-[#A7B0C5]">
                  Track pressure, money movement, and operational changes in real time.
                </p>
              </div>
            </div>
          )}

          <nav className={isHome ? "relative z-10 mt-6 space-y-1.5" : "relative z-10 mt-6 space-y-1.5"}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative z-10 flex cursor-pointer items-center gap-3 rounded-[18px] px-3 py-2.5 transition-all duration-200 ${
                    isHome
                      ? isActive
                        ? "border border-white/20 bg-white/[0.13] text-white shadow-[0_14px_30px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.14)]"
                        : "border border-transparent text-[#D8E7FA] hover:border-white/16 hover:bg-white/[0.08] hover:shadow-[0_12px_24px_rgba(31,68,116,0.14)]"
                      : isActive
                        ? "border border-white/12 bg-[#F3F5F9]/10 shadow-[0_16px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(247,248,252,0.10)]"
                        : "border border-transparent text-[#A7B0C5] hover:border-white/10 hover:bg-white/[0.06] hover:shadow-[0_12px_26px_rgba(1,8,20,0.14)]"
                  }`}
                >
                  <IconTile
                    glow="none"
                    className={
                      isHome
                        ? `h-10 w-10 rounded-[13px] border-white/8 ${
                            isActive
                              ? "bg-white/11 text-white shadow-[0_0_9px_rgba(255,255,255,0.035),inset_0_1px_0_rgba(255,255,255,0.10)]"
                              : "bg-white/[0.055] text-[#AEBBDA] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                          }`
                        : isActive
                          ? "bg-white/12 text-[#F7F8FC]"
                          : "bg-white/[0.06] text-[#A7B0C5]"
                    }
                  >
                    <Icon className={isHome ? "h-[17px] w-[17px]" : "h-[17px] w-[17px]"} strokeWidth={isHome ? 1.9 : 2} />
                  </IconTile>
                  <div className="min-w-0">
                    <p
                      className={`text-[14px] font-semibold ${
                        isHome ? (isActive ? "text-white" : "text-[#D8E0F1]") : isActive ? "text-[#F7F8FC]" : "text-[#D8E0F1]"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className={`truncate text-[12px] ${isHome ? (isActive ? "text-[#D5DAFF]" : "text-[#8C96AC]") : "text-[#A7B0C5]"}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div
            className={`zila-card-hover mt-6 rounded-[24px] border p-4 text-white ${
              isHome
                ? "border-white/18 bg-[linear-gradient(155deg,#17345F,#102A4F_54%,#1C4A7A)] shadow-[0_22px_50px_rgba(31,68,116,0.22),inset_0_1px_0_rgba(234,241,255,0.14)]"
                : "border-white/10 bg-[linear-gradient(180deg,rgba(19,35,71,0.96),rgba(22,43,82,0.88))] shadow-[0_18px_42px_rgba(1,8,20,0.24)]"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7CF3FF]">
              Quick path
            </p>
            <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em]">
              Tell Zila what changed.
            </p>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#CBD5E1]">
              Capture payments, invoices, and cost changes without leaving your flow.
            </p>
            <button
              type="button"
              onClick={openProductGuide}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-[#7CF3FF]/18 bg-white/[0.07] px-4 text-[12px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.10]"
            >
              How Zila works
            </button>
            <Link
              href="/ask"
              className="zila-button-hover mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(29,78,216,0.22)]"
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
                : "rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,43,82,0.82),rgba(19,35,71,0.72))] px-7 py-6 shadow-[0_24px_60px_rgba(1,8,20,0.24),inset_0_1px_0_rgba(247,248,252,0.08)] backdrop-blur-xl"
            }
          >
            {isHome ? (
              <div className="rounded-[24px] border border-white/22 bg-[linear-gradient(180deg,rgba(64,95,128,0.56),rgba(49,83,121,0.44))] px-4 py-3 shadow-[0_16px_34px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-lg">
                <div className="flex items-center justify-between gap-6">
                <div className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-[12px] font-semibold text-white">
                  <Sun className="h-[15px] w-[15px] text-[#D9FF57]" strokeWidth={1.9} />
                  Thursday, 23 April
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-medium text-[#F3F8FF]">Good morning,</p>
                  <p className="mt-1 text-[24px] font-semibold leading-none tracking-[-0.05em] text-[#F7F8FC]">Amara</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-[#D9FF57]/38 bg-[#D9FF57]/20 px-4 py-2 text-[12px] font-semibold text-[#FFFFE5] shadow-[0_16px_32px_rgba(215,255,79,0.12),inset_0_1px_0_rgba(247,248,252,0.16)]">
                    Day 14 streak
                  </div>
                  <button
                    type="button"
                    className="zila-button-hover inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/36 bg-white/[0.28] text-white shadow-[0_14px_28px_rgba(31,68,116,0.18),inset_0_1px_0_rgba(247,248,252,0.20)]"
                    aria-label="Notifications"
                  >
                    <Bell className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </button>
                  <Link
                    href="/proof"
                    className="zila-button-hover inline-flex items-center gap-2 rounded-full border border-[#D7E8FF]/20 bg-[#173D6D] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(31,68,116,0.26),inset_0_1px_0_rgba(255,255,255,0.10)]"
                  >
                    Proof of Operations
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-[720px]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7CF3FF]">
                    {meta.eyebrow}
                  </p>
                  <h2 className="mt-3 text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#F7F8FC]">
                    {meta.title}
                  </h2>
                  <p className="mt-4 text-[15px] leading-[1.8] text-[#A7B0C5]">{meta.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="rounded-full border border-[#D7FF4F]/22 bg-[#D7FF4F]/10 px-4 py-2 text-[12px] font-semibold text-[#F1FFB8] shadow-[0_12px_24px_rgba(215,255,79,0.10)]">
                    Day 14 streak
                  </div>
                  <Link
                    href="/proof"
                    className="inline-flex items-center gap-2 rounded-full border border-[#7CF3FF]/16 bg-[linear-gradient(135deg,#2F80FF,#102347)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
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
