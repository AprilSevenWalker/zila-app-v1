import React from "react";

export const StatusBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm bg-white border-b border-[rgba(18,20,23,0.08)]">
      <span className="text-[12px] font-semibold text-[#121417]">9:41</span>
      <span className="text-[12px] text-[#6B7280] font-medium">Day 14</span>
      <div className="flex items-center gap-1.5 bg-[#6366F1] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-[#6366F1]/30">
        <span>⭐</span>
        <span>14 day streak</span>
      </div>
    </div>
  );
};

export default StatusBar;
