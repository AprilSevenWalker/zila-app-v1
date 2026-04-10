import React from "react";

export const FounderInsight: React.FC = () => {
  return (
    <div className="bg-white border border-[rgba(18,20,23,0.08)] rounded-[20px] p-5 shadow-sm">
      {/* Header with avatar and title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-bold text-sm shadow-md">
          Z
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[#6366F1]">Today&apos;s founder insight</p>
          <p className="text-[11px] text-[#6B7280]">Personalised to your business</p>
        </div>
      </div>

      {/* Quote */}
      <div className="pl-4 border-l-2 border-[#6366F1] mb-4">
          <p className="text-[13px] italic text-[#121417] leading-relaxed">
            &ldquo;Infrastructure founders who review cash weekly are 3x less likely to miss a project milestone.&rdquo;
          </p>
      </div>

      {/* Meta info */}
      <p className="text-[11px] text-[#6B7280] mb-4">Based on your 14 days of activity · Updated daily</p>

      {/* Footer with link and pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgba(18,20,23,0.08)]">
        <a href="#" className="text-[12px] text-[#6366F1] font-semibold hover:opacity-80 transition">
          How does my business compare? →
        </a>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6366F1]"></span>
          <span className="w-2 h-2 rounded-full bg-[#E5E7EB]"></span>
          <span className="w-2 h-2 rounded-full bg-[#E5E7EB]"></span>
        </div>
      </div>
    </div>
  );
};

export default FounderInsight;
