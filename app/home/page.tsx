import { GreetingSection } from "@/components/home/GreetingSection";
import { CapitalCard } from "@/components/home/CapitalCard";
import { InsightCard } from "@/components/home/InsightCard";
import { ActionCard } from "@/components/home/ActionCard";
import { BusinessList } from "@/components/home/BusinessList";
import { AppShell } from "@/components/ui/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <GreetingSection />

        <div className="mt-4">
          <CapitalCard />
        </div>

        <InsightCard />

        <ActionCard />

        <BusinessList />
      </div>
    </AppShell>
  );
}
