import { AppShell } from "@/components/ui/AppShell";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function Me() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <SectionEyebrow label="Me" dotColor="bg-[#F59E0B]" />
        </div>
        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Profile</p>
          <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">Founder settings, same premium frame</h1>
        </div>
        <SurfaceCard tone="white">
          <p className="text-[12px] font-semibold text-[#6366F1]">Phase 1 shell</p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#121417]">
            This tab now matches the Home and Projects design language, which keeps the MVP feeling complete even before profile details are added.
          </p>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
