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
          <p className="text-[12px] font-semibold text-[#6366F1]">Preferences</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[11px] text-[#6B7280]">Primary currency</p>
              <p className="mt-1 text-[16px] font-semibold text-[#121417]">USD</p>
            </div>
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[11px] text-[#6B7280]">Secondary currency</p>
              <p className="mt-1 text-[16px] font-semibold text-[#121417]">KES</p>
            </div>
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[11px] text-[#6B7280]">Language</p>
              <p className="mt-1 text-[16px] font-semibold text-[#121417]">English</p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
