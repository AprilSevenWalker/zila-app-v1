import type { ReactNode } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface TopBarProps {
  time?: string;
  dayLabel?: string;
  notificationIcon?: ReactNode;
  notificationLabel?: string;
}

export function TopBar({
  time = "9:41",
  dayLabel = "Day 14",
  notificationIcon = <Bell className="h-3.5 w-3.5" strokeWidth={2} />,
  notificationLabel = "14 day streak",
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#7CF3FF]/12 bg-[#06101F]/90 px-4 py-3 text-sm backdrop-blur-md">
      <span className="text-[12px] font-semibold text-[#EAF1FF]">{time}</span>
      <span className="text-[12px] font-medium text-[#C9D4F5]">{dayLabel}</span>
      <Link
        href="/proof"
        className="flex items-center gap-1.5 rounded-full border border-[#D7FF4F]/22 bg-[#D7FF4F]/10 px-3 py-1.5 text-xs font-semibold text-[#F1FFB8] shadow-lg shadow-[#D7FF4F]/10 transition hover:opacity-90"
      >
        <span>{notificationIcon}</span>
        <span>{notificationLabel}</span>
      </Link>
    </div>
  );
}

export default TopBar;
