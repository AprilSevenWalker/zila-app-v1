import { AlertCircle, Clock3, WalletCards } from "lucide-react";

import { PaymentCard } from "@/components/payments/PaymentCard";
import { AppShell } from "@/components/ui/AppShell";
import { IconTile } from "@/components/ui/IconTile";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { getActionNeededPayments, getPaymentsBySection } from "@/data/payments";

export default function PaymentsPage() {
  const dueThisWeek = getPaymentsBySection("due-this-week");
  const upcoming = getPaymentsBySection("upcoming");
  const actionNeeded = getActionNeededPayments();

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <SectionEyebrow label="Operator payments" dotColor="bg-[#6366F1]" />
        </div>

        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Keep upcoming money movement under control</p>
          <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">Payments</h1>
        </div>

        <SurfaceCard tone="white">
          <div className="flex items-start gap-3">
            <IconTile size="md" glow="indigo" className="flex-shrink-0">
              <WalletCards className="h-[18px] w-[18px]" strokeWidth={2} />
            </IconTile>
            <div>
              <p className="text-[12px] font-semibold text-[#6366F1]">Zila view</p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#121417]">
                Focus on Harbour Road and BuildOps first. One has a shortfall risk, the other needs confirmation today.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <section className="space-y-3 pt-1">
          <div className="flex items-center gap-2 pl-1">
            <IconTile glow="indigo">
              <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
            </IconTile>
            <h2 className="text-[13px] font-semibold text-[#121417]">Due this week</h2>
          </div>
          {dueThisWeek.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </section>

        <section className="space-y-3 pt-1">
          <div className="flex items-center gap-2 pl-1">
            <IconTile>
              <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
            </IconTile>
            <h2 className="text-[13px] font-semibold text-[#121417]">Upcoming</h2>
          </div>
          {upcoming.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </section>

        <section className="space-y-3 pt-1">
          <div className="flex items-center gap-2 pl-1">
            <IconTile glow="cyan">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
            </IconTile>
            <h2 className="text-[13px] font-semibold text-[#121417]">Action needed</h2>
          </div>
          {actionNeeded.map((payment) => (
            <PaymentCard key={`${payment.id}-action`} payment={payment} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
