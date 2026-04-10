import React from "react";

export const FocusCard: React.FC = () => {
  return (
    <div>
      {/* Label */}
      <div className="flex items-center gap-2 mb-3 pl-1">
        <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
        <p className="text-[13px] font-semibold text-[#121417]">One thing to act on today</p>
      </div>

      {/* Dark gradient card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[20px] p-5 border border-[#6366F1]/20 shadow-lg relative overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/10 via-transparent to-[#22D3EE]/10 rounded-[20px]"></div>
        
        <div className="relative z-10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/30 flex items-center justify-center text-[#22D3EE] font-bold text-sm flex-shrink-0 backdrop-blur-sm border border-[#6366F1]/30">
            Z
          </div>
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] mt-1 flex-shrink-0"></span>
              <p className="text-[12px] font-semibold text-[#22D3EE]">Zila says</p>
            </div>
            <p className="text-[13px] text-white leading-relaxed mb-3">
              Harbour Road needs $4,300 by Thursday. Move from your wallet now to stay on track.
            </p>
            <a href="#" className="text-[12px] text-[#22D3EE] font-semibold hover:opacity-80 transition inline-flex items-center gap-1">
              Sort this now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusCard;
