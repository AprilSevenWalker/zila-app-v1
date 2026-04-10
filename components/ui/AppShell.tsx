import type { ReactNode } from "react";

import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBar } from "@/components/home/StatusBar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#F5F3EF]">
      <div className="mx-auto min-h-screen max-w-[390px] bg-[#F5F3EF]">
        <StatusBar />
        <main className="px-4 pb-28 pt-2">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
