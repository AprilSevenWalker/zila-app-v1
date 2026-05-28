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
  { name: "Payments", icon: CreditCard, href: "/payments" },
  { name: "Proof", icon: ShieldCheck, href: "/proof" },
  { name: "Ask", icon: MessageSquareText, href: "/ask" },
  { name: "Me", icon: UserRound, href: "/me" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="grid grid-cols-6 items-end rounded-[24px] border border-[#7CF3FF]/14 bg-[#102347]/94 px-2.5 py-2 shadow-[0_20px_50px_rgba(1,8,20,0.40),0_0_24px_rgba(89,225,255,0.08)] backdrop-blur-md sm:px-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-0.5 py-2.5 text-center transition-opacity hover:opacity-75"
              >
                <IconTile
                  className={`shrink-0 ${isActive ? "text-[#F7F8FC] bg-[#2F80FF]" : "text-[#C9D4F5] bg-white/[0.06]"}`}
                  glow={isActive ? "indigo" : "none"}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </IconTile>
                <span className={`block max-w-full whitespace-nowrap text-[9.5px] font-medium leading-none tracking-[-0.01em] sm:text-[11px] sm:tracking-normal ${isActive ? "text-[#F7F8FC]" : "text-[#C9D4F5]"}`}>
                  {item.name}
                </span>
                {isActive ? (
                  <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#D7FF4F] shadow-[0_0_12px_rgba(215,255,79,0.34)]"></span>
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
