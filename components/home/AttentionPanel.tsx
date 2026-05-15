import { ActionCard } from "@/components/home/ActionCard";
import { MoneySourceSetupCard } from "@/components/money/MoneySourceSetupCard";

export function AttentionPanel() {
  return (
    <section className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#F3F5F9,#E4ECF8_84%)] p-5 text-[#121417] shadow-[0_26px_64px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.92)] md:p-6">
      <div className="mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#476022]">Safe to spend</p>
        <p className="mt-2 text-[14px] leading-[1.7] text-[#526173]">
          Keep today&apos;s choices inside the operating range.
        </p>
      </div>

      <div className="space-y-4">
        <MoneySourceSetupCard
          variant="light"
          headline="Connect your money to get started"
          description="Set up a payment source to move funds and record verified activity."
          ctaLabel="Connect your money"
          helperText="You'll need this to make payments and fix funding gaps."
          emphasis="required"
        />
        <ActionCard title="Next action recommendation" variant="light" />
      </div>
    </section>
  );
}

export default AttentionPanel;
