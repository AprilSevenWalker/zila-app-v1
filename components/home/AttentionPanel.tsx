import { ActionCard } from "@/components/home/ActionCard";
import { MoneySourceSetupCard } from "@/components/money/MoneySourceSetupCard";

export function AttentionPanel() {
  return (
    <section className="rounded-[28px] border border-[rgba(18,20,23,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.9))] p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.78)] md:p-6">
      <div className="mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">What needs your attention</p>
        <p className="mt-2 text-[14px] leading-[1.7] text-[#667085]">
          Set up the essentials and let Zila guide the next move.
        </p>
      </div>

      <div className="space-y-4">
        <MoneySourceSetupCard
          headline="Connect your money to get started"
          description="Set up a payment source to move funds and record verified activity."
          ctaLabel="Connect your money"
          helperText="You'll need this to make payments and fix funding gaps."
          emphasis="required"
        />
        <ActionCard title="Next action recommendation" />
      </div>
    </section>
  );
}

export default AttentionPanel;
