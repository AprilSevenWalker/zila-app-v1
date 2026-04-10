import { AppShell } from "@/components/ui/AppShell";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function Proof() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <SectionEyebrow label="Proof" />
        </div>
        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Operations record</p>
          <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">Verified momentum, ready to expand</h1>
        </div>
        <SurfaceCard tone="white">
          <p className="text-[12px] font-semibold text-[#6366F1]">Phase 1 shell</p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#121417]">
            Proof now inherits the same mobile frame, spacing, and bottom navigation so later MVP work can build directly on this foundation.
          </p>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
