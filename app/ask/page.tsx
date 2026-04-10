import { AppShell } from "@/components/ui/AppShell";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function Ask() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <SectionEyebrow label="Ask Zila" dotColor="bg-[#22D3EE]" />
        </div>
        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Conversation</p>
          <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">Your operator in the loop</h1>
        </div>
        <SurfaceCard tone="dark">
          <p className="text-[12px] font-semibold text-[#22D3EE]">Phase 1 shell</p>
          <p className="mt-3 text-[14px] leading-relaxed text-white">
            Ask Zila is ready for the shared app shell and navigation. The conversational flow can plug into this surface next without needing a visual reset.
          </p>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
