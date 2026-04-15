import { QuickUpdateMenu } from "@/components/actions/QuickUpdateMenu";
import { GreetingSection } from "@/components/home/GreetingSection";
import { CapitalCard } from "@/components/home/CapitalCard";
import { HomeCommandBar } from "@/components/home/HomeCommandBar";
import { InsightCard } from "@/components/home/InsightCard";
import { ActionCard } from "@/components/home/ActionCard";
import { BusinessList } from "@/components/home/BusinessList";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <GreetingSection />
          <div className="pt-2">
            <QuickUpdateMenu variant="icon" align="right" />
          </div>
        </div>

        <div className="mt-4">
          <CapitalCard />
        </div>

        <div className="my-6">
          <HomeCommandBar />
        </div>

        <div className="opacity-[0.94]">
          <InsightCard />
        </div>

        <div className="opacity-[0.95]">
          <ActionCard />
        </div>

        <div className="opacity-[0.96]">
          <BusinessList />
        </div>
      </div>
    </AppShell>
  );
}
