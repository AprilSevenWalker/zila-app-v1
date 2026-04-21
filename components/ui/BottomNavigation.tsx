"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CreditCard, FolderKanban, Home, MessageSquareText, ShieldCheck, UserRound } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", icon: Home, href: "/home" },
  { name: "Projects", icon: FolderKanban, href: "/projects" },
  { name: "Ask", icon: MessageSquareText, href: "/ask" },
  { name: "Payments", icon: CreditCard, href: "/payments" },
  { name: "Proof", icon: ShieldCheck, href: "/proof" },
  { name: "Me", icon: UserRound, href: "/me" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden">
      <div className="mx-auto max-w-[390px] px-4 pb-4">
        <div className="flex items-end justify-around rounded-[24px] border border-[rgba(18,20,23,0.08)] bg-white/95 px-2 pt-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-1 flex-col items-center px-2 py-3 transition-opacity hover:opacity-75"
              >
                <IconTile
                  className={`mb-1 ${isActive ? "text-[#0F172A] bg-[#F3F0EA]" : "text-[#475569] bg-[#FAF8F4]"}`}
                  glow={isActive ? "indigo" : "none"}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </IconTile>
                <span className={`text-[11px] font-medium ${isActive ? "text-[#121417]" : "text-[#71717A]"}`}>
                  {item.name}
                </span>
                {isActive ? (
                  <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.24)]"></span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNavigation;
