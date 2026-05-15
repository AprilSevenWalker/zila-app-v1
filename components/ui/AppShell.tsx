import type { ReactNode } from "react";

import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { DesktopShell } from "@/components/ui/DesktopShell";
import { TopBar } from "@/components/home/TopBar";
import { ProductGuideModal } from "@/components/guide/ProductGuideModal";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#06101F] text-[#EAF1FF]">
      <div className="md:hidden">
        <div className="zila-atmosphere mx-auto min-h-screen max-w-[390px] bg-[#06101F]">
          <TopBar />
          <main className="px-4 pb-28 pt-2">{children}</main>
        </div>
        <BottomNavigation />
      </div>
      <DesktopShell>{children}</DesktopShell>
      <ProductGuideModal />
    </div>
  );
}
