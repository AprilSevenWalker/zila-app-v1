import { QuickUpdateMenu } from "@/components/actions/QuickUpdateMenu";
import { GreetingSection } from "@/components/home/GreetingSection";
import { CapitalCard } from "@/components/home/CapitalCard";
import { HomeCommandBar } from "@/components/home/HomeCommandBar";
import { InsightCard } from "@/components/home/InsightCard";
import { AttentionPanel } from "@/components/home/AttentionPanel";
import { BusinessList } from "@/components/home/BusinessList";
import { DesktopHomeScreen } from "@/components/home/DesktopHomeScreen";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="md:hidden">
        <div className="space-y-4">
          <div className="space-y-4">
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

            <div className="space-y-4 pt-1">
              <div className="opacity-[0.94]">
                <InsightCard />
              </div>

              <div className="opacity-[0.96]">
                <BusinessList />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DesktopHomeScreen />
    </AppShell>
  );
}
