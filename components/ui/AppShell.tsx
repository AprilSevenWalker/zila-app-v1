"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, FolderKanban, Home, Menu, MessageSquareText, Settings, ShieldCheck, X } from "lucide-react";

import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { ContextualBackNav } from "@/components/ui/ContextualBackNav";
import { DesktopShell } from "@/components/ui/DesktopShell";
import { ProductGuideModal } from "@/components/guide/ProductGuideModal";

interface AppShellProps {
  children: ReactNode;
}

const mobileNavItems = [
  { name: "Home", icon: Home, href: "/home" },
  { name: "Projects", icon: FolderKanban, href: "/projects" },
  { name: "Payments", icon: CreditCard, href: "/payments" },
  { name: "Proof", icon: ShieldCheck, href: "/proof" },
  { name: "Ask Zila", icon: MessageSquareText, href: "/ask" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#06101F] text-[#EAF1FF]">
      <div className="lg:hidden">
        <div className="zila-atmosphere mx-auto min-h-[100dvh] w-full max-w-[760px] bg-[#06101F]">
          <div className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/18 bg-[linear-gradient(135deg,rgba(33,79,131,0.96),rgba(23,61,109,0.94)_48%,rgba(16,42,79,0.96))] px-4 py-3 shadow-[0_14px_34px_rgba(1,8,20,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            <Link href="/home" className="justify-self-center" aria-label="Zila home">
              <Image
                src="/zila-logo-white.png"
                alt="Zila"
                width={96}
                height={32}
                priority
                unoptimized
                className="h-auto w-[84px] object-contain drop-shadow-[0_10px_22px_rgba(1,8,20,0.24)]"
              />
            </Link>
            <Link
              href="/payments/send"
              className="rounded-full border border-[#D9FF57]/30 bg-[#D9FF57] px-3.5 py-2 text-[11px] font-semibold text-[#06101F] shadow-[0_12px_24px_rgba(217,255,87,0.18),inset_0_1px_0_rgba(255,255,255,0.28)]"
            >
              Send Payment
            </Link>
          </div>
          <main className="zila-safe-bottom-lg min-w-0 px-4 pt-2 sm:px-5">
            <ContextualBackNav className="mb-3" />
            {children}
          </main>
        </div>
        <BottomNavigation />
        {drawerOpen ? (
          <div className="fixed inset-0 z-[70] bg-[#020817]/64 backdrop-blur-md" onClick={() => setDrawerOpen(false)}>
            <aside
              className="zila-safe-bottom absolute bottom-0 left-0 top-0 flex w-[min(86vw,340px)] flex-col overflow-y-auto border-r border-white/14 bg-[linear-gradient(180deg,rgba(23,61,109,0.96),rgba(16,42,79,0.98)_54%,rgba(7,21,38,0.98))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <Link href="/home" onClick={() => setDrawerOpen(false)} className="text-[18px] font-semibold tracking-[-0.04em] text-white">
                  Zila
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <p className="mt-3 text-[12px] leading-[1.6] text-[#C9D4F5]">Projects, payments, reserves, and proof stay coordinated.</p>
              <nav className="mt-5 space-y-2">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex min-h-12 items-center gap-3 rounded-[16px] border px-3 py-3 text-[14px] font-semibold transition ${
                        isActive
                          ? "border-[#D9FF57]/20 bg-[#D9FF57]/[0.09] text-[#F1FFB8]"
                          : "border-white/10 bg-white/[0.045] text-[#D7E3F8] hover:bg-white/[0.075]"
                      }`}
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border border-white/10 bg-white/[0.06]">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        ) : null}
      </div>
      <DesktopShell>{children}</DesktopShell>
      <ProductGuideModal />
    </div>
  );
}
