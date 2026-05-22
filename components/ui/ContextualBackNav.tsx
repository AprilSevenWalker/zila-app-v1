"use client";

import { usePathname } from "next/navigation";

import { FlowBackNav } from "@/components/ui/FlowBackNav";

interface ContextualBackNavProps {
  className?: string;
  surface?: "dark" | "light";
}

function getBackItems(pathname: string) {
  if (pathname.startsWith("/payments/")) {
    return [];
  }

  if (pathname.startsWith("/projects/")) {
    return [
      { label: "Projects", href: "/projects", primary: true },
      { label: "Dashboard", href: "/home" },
    ];
  }

  if (pathname === "/move-funds") {
    return [
      { label: "Dashboard", href: "/home", primary: true },
      { label: "Payments", href: "/payments" },
    ];
  }

  if (pathname === "/insight" || pathname === "/wallet") {
    return [{ label: "Dashboard", href: "/home", primary: true }];
  }

  return [];
}

export function ContextualBackNav({ className = "", surface = "dark" }: ContextualBackNavProps) {
  const pathname = usePathname();
  const items = getBackItems(pathname);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <FlowBackNav items={items} surface={surface} />
    </div>
  );
}
