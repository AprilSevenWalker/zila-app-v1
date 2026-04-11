import type { ReactNode } from "react";
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
    <div className="flex items-center justify-between border-b border-[rgba(18,20,23,0.08)] bg-white px-4 py-3 text-sm">
      <span className="text-[12px] font-semibold text-[#121417]">{time}</span>
      <span className="text-[12px] font-medium text-[#6B7280]">{dayLabel}</span>
      <div className="flex items-center gap-1.5 rounded-full bg-[#6366F1] px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#6366F1]/30">
        <span>{notificationIcon}</span>
        <span>{notificationLabel}</span>
      </div>
    </div>
  );
}

export default TopBar;
