import type { ReactNode } from "react";

import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { DesktopShell } from "@/components/ui/DesktopShell";
import { TopBar } from "@/components/home/TopBar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#F5F3EF]">
      <div className="md:hidden">
        <div className="mx-auto min-h-screen max-w-[390px] bg-[#F5F3EF]">
          <TopBar />
          <main className="px-4 pb-28 pt-2">{children}</main>
        </div>
        <BottomNavigation />
      </div>
      <DesktopShell>{children}</DesktopShell>
    </div>
  );
}
