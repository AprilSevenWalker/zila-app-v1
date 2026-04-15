import Link from "next/link";

import { AppShell } from "@/components/ui/AppShell";

export default function MakePaymentPage() {
  return (
    <AppShell>
      <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden bg-[linear-gradient(160deg,#0D142B_0%,#171E46_42%,#1F2559_72%,#15374F_100%)] px-6 pb-28 pt-8 text-white">
        <div className="absolute inset-x-0 top-14 h-96 bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.18),transparent_22%),linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0))]" />
        <div className="relative flex flex-1 flex-col">
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#B7C2E0]">Make payment</p>
          <h1 className="mt-4 max-w-[320px] text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
            Send a payment from your available cash
          </h1>
          <p className="mt-5 max-w-[292px] text-[16px] leading-[1.68] text-[#D4DCEF]/84">
            Mock flow for now. Zila will help route the payment and confirm the timing before any real integration is
            added.
          </p>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.68),rgba(15,23,42,0.34))] p-6 shadow-[0_20px_48px_rgba(5,10,24,0.24),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AFC0FF]">Next</p>
            <p className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-white">Pay £4,300 by Friday</p>
            <p className="mt-3 text-[15px] leading-[1.72] text-[#D7E3F8]">
              This would cover the current shortfall and keep Project Horizon stable through the week.
            </p>
          </section>

          <div className="mt-auto flex gap-3 pt-10">
            <Link
              href="/payments"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 text-[13px] font-semibold text-[#EAF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.08]"
            >
              Back
            </Link>
            <Link
              href="/move-funds"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.96))] px-5 text-[13px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.14),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:bg-[#F7F7FB]"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
