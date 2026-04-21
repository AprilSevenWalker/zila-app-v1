import { QuickUpdateMenu } from "@/components/actions/QuickUpdateMenu";
import { GreetingSection } from "@/components/home/GreetingSection";
import { CapitalCard } from "@/components/home/CapitalCard";
import { HomeCommandBar } from "@/components/home/HomeCommandBar";
import { InsightCard } from "@/components/home/InsightCard";
import { AttentionPanel } from "@/components/home/AttentionPanel";
import { BusinessList } from "@/components/home/BusinessList";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-4 md:space-y-0">
        <div className="md:grid md:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] md:gap-6 lg:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-start justify-between gap-3">
              <GreetingSection />
              <div className="pt-2">
                <QuickUpdateMenu variant="icon" align="right" />
              </div>
            </div>

            <div className="opacity-[0.95]">
              <HomeCommandBar />
            </div>

            <div className="mt-4 md:mt-0">
              <CapitalCard />
            </div>

            <div className="opacity-[0.97]">
              <AttentionPanel />
            </div>
          </div>

          <div className="space-y-4 pt-1 md:space-y-6">
            <div className="opacity-[0.94]">
              <InsightCard />
            </div>

            <div className="opacity-[0.96]">
              <BusinessList />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
