import { AppShell } from "@/components/ui/AppShell";

export default function Loading() {
  return (
    <AppShell>
      <div className="mt-2 animate-pulse space-y-4">
        <div className="h-5 w-24 rounded-full bg-[#E5E7EB]" />
        <div className="h-28 rounded-[28px] bg-[#CBD5E1]" />
        <div className="h-36 rounded-[20px] bg-[#E5E7EB]" />
        <div className="h-36 rounded-[20px] bg-[#E5E7EB]" />
      </div>
    </AppShell>
  );
}
