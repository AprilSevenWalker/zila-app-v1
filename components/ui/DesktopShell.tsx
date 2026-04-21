"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CreditCard,
  FolderKanban,
  Home,
  MessageSquareText,
  ShieldCheck,
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

  return (
    <div className="hidden min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,#F7F4EE_0%,#F3F0E8_54%,#EEEAE0_100%)] md:block">
      <div className="mx-auto grid min-h-screen w-full max-w-[1480px] grid-cols-[250px_minmax(0,1fr)] gap-8 px-6 py-6 lg:grid-cols-[272px_minmax(0,1fr)] lg:px-8">
        <aside className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[32px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.86))] px-5 py-6 shadow-[0_26px_60px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl">
          <div className="px-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#6366F1]">
              Zila
            </p>
            <h1 className="mt-3 text-[30px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#121417]">
              Operate with clarity.
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#667085]">
              Desktop mode gives you a wider command view without changing the mobile app itself.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[22px] px-3 py-3.5 transition-all duration-200 ${
                    isActive
                      ? "border border-[#D7D8FB] bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,211,238,0.08))] shadow-[0_14px_30px_rgba(99,102,241,0.08)]"
                      : "border border-transparent hover:border-[rgba(18,20,23,0.08)] hover:bg-white/70"
                  }`}
                >
                  <IconTile
                    glow={isActive ? "indigo" : "none"}
                    className={isActive ? "bg-white text-[#121417]" : "bg-[#F7F4EE] text-[#475467]"}
                  >
                    <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
                  </IconTile>
                  <div className="min-w-0">
                    <p className={`text-[14px] font-semibold ${isActive ? "text-[#121417]" : "text-[#253041]"}`}>
                      {item.label}
                    </p>
                    <p className="truncate text-[12px] text-[#667085]">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[24px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(31,41,55,0.92))] p-4 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
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
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#121417] transition hover:opacity-90"
            >
              Open Ask Zila
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="rounded-[32px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))] px-7 py-6 shadow-[0_24px_54px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur-xl">
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
          </header>

          <main className="pb-10 pt-7">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default DesktopShell;
