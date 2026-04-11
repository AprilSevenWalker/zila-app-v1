import { ArrowUpRight, CalendarDays, Landmark, Wallet } from "lucide-react";

import type { Payment } from "@/data/payments";
import { IconTile } from "@/components/ui/IconTile";
import { Pill } from "@/components/ui/Pill";

interface PaymentCardProps {
  payment: Payment;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <div className="rounded-[20px] border border-[rgba(18,20,23,0.07)] bg-white p-5 shadow-[0_3px_10px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-medium text-[#6B7280]">{payment.project}</p>
          <h2 className="text-[20px] font-semibold text-[#121417]">{payment.name}</h2>
        </div>
        <Pill tone={payment.statusTone}>{payment.status}</Pill>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-[16px] bg-[#F8F6F1] p-3">
          <div className="mb-2 flex items-center gap-2 text-[#6B7280]">
            <IconTile glow="indigo">
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
            </IconTile>
            <p className="text-[10px]">Due date</p>
          </div>
          <p className="text-[16px] font-semibold text-[#121417]">{payment.dueDate}</p>
        </div>
        <div className="rounded-[16px] bg-[#F8F6F1] p-3">
          <div className="mb-2 flex items-center gap-2 text-[#6B7280]">
            <IconTile>
              <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
            </IconTile>
            <p className="text-[10px]">Amount</p>
          </div>
          <p className="text-[16px] font-semibold text-[#121417]">{payment.amount}</p>
        </div>
      </div>

      <div className="rounded-[16px] border border-[rgba(18,20,23,0.05)] bg-[#FCFBF8] p-4">
        <div className="mb-3 flex items-center gap-2 text-[#6B7280]">
          <IconTile glow="cyan">
            <Landmark className="h-3.5 w-3.5" strokeWidth={2} />
          </IconTile>
          <p className="text-[11px] font-semibold text-[#121417]">Payment rail</p>
        </div>
        <p className="text-[13px] leading-relaxed text-[#121417]">{payment.source}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[rgba(18,20,23,0.08)] pt-4">
        <div>
          <p className="text-[11px] text-[#6B7280]">Next step</p>
          <p className="text-[13px] font-semibold text-[#121417]">{payment.cta}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-[rgba(15,23,42,0.08)] bg-[#F6F3ED] px-4 py-2 text-[12px] font-semibold text-[#0F172A] transition hover:bg-[#F1ECE4]"
        >
          <span>{payment.cta}</span>
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
