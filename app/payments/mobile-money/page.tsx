import Link from "next/link";
import { BadgeCheck, Bell, Smartphone } from "lucide-react";

import { AppShell } from "@/components/ui/AppShell";
import { FlowBackNav } from "@/components/ui/FlowBackNav";
import { IconTile } from "@/components/ui/IconTile";

const benefits = [
  "Instant wallet payouts",
  "Operational proof attached",
  "Lower cost routing",
  "Emerging market support",
];

export default function MobileMoneyComingSoonPage() {
  return (
    <AppShell>
      <div className="relative text-white">
        <div className="pointer-events-none absolute inset-x-[-2rem] top-[-1rem] h-80 rounded-[36px] bg-[radial-gradient(circle_at_20%_18%,rgba(217,255,87,0.10),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.16),transparent_24%)]" />
        <div className="relative space-y-6">
          <FlowBackNav
            items={[
              { label: "Payment Methods", href: "/payments/choose-method", primary: true },
              { label: "Payments", href: "/payments" },
              { label: "Dashboard", href: "/home" },
            ]}
          />

          <section className="zila-unified-panel-soft overflow-hidden rounded-[32px] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div>
                <IconTile size="md" glow="mint" className="border-[#D9FF57]/18 bg-[#D9FF57]/10 text-[#EAFFB4]">
                  <Smartphone className="h-[18px] w-[18px]" strokeWidth={2} />
                </IconTile>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7EE7F6]">Mobile Money</p>
                <h1 className="mt-4 max-w-[760px] text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
                  Mobile money payouts are coming soon.
                </h1>
                <p className="mt-4 max-w-[620px] text-[15px] leading-[1.7] text-[#D7E3F8]">
                  We&apos;re integrating with leading mobile money providers to support fast and accessible payouts.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(16,42,79,0.72),rgba(9,25,50,0.84))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">What to expect</p>
                <div className="mt-5 space-y-3">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.04] px-3 py-3">
                      <BadgeCheck className="h-4 w-4 text-[#D9FF57]" strokeWidth={2} />
                      <p className="text-[13px] text-[#E7EEFF]">{benefit}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.07] px-5 text-[13px] font-semibold text-[#EAF1FF] transition hover:bg-white/[0.10]"
                >
                  <Bell className="h-4 w-4 text-[#BFEFFF]" strokeWidth={2} />
                  Notify me when ready
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
