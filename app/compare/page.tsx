import Link from "next/link";

import { AppShell } from "@/components/ui/AppShell";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function ComparePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="mt-2">
          <SectionEyebrow label="Comparison" />
        </div>

        <div>
          <p className="mb-1 text-[14px] text-[#6B7280]">Business benchmark</p>
          <h1 className="text-[32px] font-semibold leading-tight text-[#121417]">
            You are operating ahead of similar project-led businesses
          </h1>
        </div>

        <SurfaceCard tone="white">
          <p className="text-[14px] leading-relaxed text-[#121417]">
            Your business is reviewing cash and project pressure earlier than most peers, which gives you more time to
            fix gaps before they disrupt delivery.
          </p>
        </SurfaceCard>

        <SurfaceCard tone="white">
          <div className="space-y-3">
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6366F1]">Benchmark point</p>
              <p className="mt-2 text-[14px] font-semibold text-[#121417]">You review business cash weekly</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                Similar businesses often wait until payments are due, while you are spotting pressure about 6 days
                earlier.
              </p>
            </div>
            <div className="rounded-[16px] bg-[#F8F6F1] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6366F1]">Benchmark point</p>
              <p className="mt-2 text-[14px] font-semibold text-[#121417]">Your verified activity is stronger</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                You have 14 days of verified operating activity, which puts you ahead on consistency and decision
                readiness.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <div className="flex gap-3">
          <Link
            href="/home"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#121417]/10 bg-[#121417] px-5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(18,20,23,0.08)] transition hover:opacity-90"
          >
            Continue
          </Link>
          <Link
            href="/home"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(18,20,23,0.12)] bg-white px-5 text-[13px] font-semibold text-[#121417] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#F8F6F1]"
          >
            Back
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
