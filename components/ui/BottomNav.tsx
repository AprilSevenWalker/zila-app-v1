"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Home", icon: "🏠", href: "/" },
  { name: "Projects", icon: "📋", href: "/projects" },
  { name: "Ask Zila", icon: "💬", href: "/ask" },
  { name: "Proof", icon: "🛡️", href: "/proof" },
  { name: "Me", icon: "👤", href: "/me" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-[390px] px-4 pb-4">
        <div className="flex items-end justify-around rounded-[24px] border border-[rgba(18,20,23,0.08)] bg-white/95 px-2 pt-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-1 flex-col items-center px-2 py-3 transition-opacity hover:opacity-75"
              >
                <span className="mb-1 text-[20px]">{item.icon}</span>
                <span className={`text-[11px] font-medium ${isActive ? "text-[#121417]" : "text-[#6B7280]"}`}>
                  {item.name}
                </span>
                {isActive ? (
                  <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#6366F1] shadow-lg shadow-[#6366F1]/50"></span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
