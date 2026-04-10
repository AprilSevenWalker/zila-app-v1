import { AppShell } from "@/components/ui/AppShell";

export default function Loading() {
  return (
    <AppShell>
      <div className="mt-2 animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-[#E5E7EB]" />
        <div className="h-24 rounded-[28px] bg-[#CBD5E1]" />
        <div className="h-40 rounded-[20px] bg-[#E5E7EB]" />
        <div className="h-40 rounded-[20px] bg-[#E5E7EB]" />
      </div>
    </AppShell>
  );
}
