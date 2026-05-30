import { GreetingSection } from "@/components/home/GreetingSection";
import { CapitalCard } from "@/components/home/CapitalCard";
import { HomeCommandBar } from "@/components/home/HomeCommandBar";
import { InsightCard } from "@/components/home/InsightCard";
import { AttentionPanel } from "@/components/home/AttentionPanel";
import { ActiveFocusCard } from "@/components/home/ActiveFocusCard";
import { BusinessList } from "@/components/home/BusinessList";
import { DesktopHomeScreen } from "@/components/home/DesktopHomeScreen";
import { MobilePrimaryActions } from "@/components/home/MobilePrimaryActions";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="lg:hidden">
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="px-1 pt-2">
              <GreetingSection />
            </div>

            <div className="pt-2">
              <CapitalCard />
            </div>

            <div className="opacity-[0.97]">
              <ProjectCarousel />
            </div>

            <div className="opacity-[0.98]">
              <MobilePrimaryActions />
            </div>

            <div className="opacity-[0.97]">
              <ActiveFocusCard />
            </div>

            <div className="opacity-[0.97]">
              <AttentionPanel />
            </div>

            <div className="space-y-4 pt-1">
              <div className="opacity-[0.96]">
                <BusinessList />
              </div>

              <div className="opacity-[0.94]">
                <InsightCard />
              </div>

              <div className="pt-1 opacity-[0.95]">
                <HomeCommandBar />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DesktopHomeScreen />
    </AppShell>
  );
}
