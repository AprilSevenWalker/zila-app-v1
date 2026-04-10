import React from "react";

export const CapitalCard: React.FC = () => {
  return (
    <div className="bg-[#0F172A] rounded-[28px] p-6 text-[#F5F0E8] shadow-lg relative overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#22D3EE]/10 rounded-[28px]"></div>
      
      <div className="relative z-10">
        {/* Header with momentum widget */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] text-[#94A3B8] mb-2">Total capital</p>
            <h2 className="text-[40px] font-semibold leading-tight text-white">$84,320</h2>
            <div className="flex items-center gap-1 mt-3">
              <span className="text-[12px] text-[#22D3EE]">📈</span>
              <span className="text-[12px] text-[#22D3EE] font-medium">+$2,140 this week</span>
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-[16px] p-3 flex flex-col items-center gap-1 shadow-md backdrop-blur-sm">
            <span className="text-[16px]">📊</span>
            <span className="text-[#6366F1] font-semibold text-[13px]">+8.2%</span>
            <span className="text-[9px] text-[#94A3B8]">vs last week</span>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mb-4">
          <div className="flex gap-1 h-2 mb-3 rounded-full overflow-hidden bg-[#1E293B]">
            <div className="flex-[0.44] bg-[#6366F1] rounded-full shadow-lg shadow-[#6366F1]/50"></div>
            <div className="flex-[0.19] bg-[#22D3EE] rounded-full shadow-lg shadow-[#22D3EE]/50"></div>
            <div className="flex-[0.37] bg-[#334155] rounded-full"></div>
          </div>
          <div className="flex justify-between text-[9px] text-[#94A3B8] gap-2">
            <span>Cash 41k</span>
            <span>Receivables 19k</span>
            <span>Reserved 24k</span>
          </div>
        </div>

        {/* Three detail cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1E293B]/60 backdrop-blur-sm rounded-[14px] p-3 text-center border border-white/5">
            <p className="text-[9px] text-[#94A3B8] mb-2">Cash</p>
            <p className="text-[16px] font-semibold text-white">$41,200</p>
          </div>
          <div className="bg-[#1E293B]/60 backdrop-blur-sm rounded-[14px] p-3 text-center border border-white/5">
            <p className="text-[9px] text-[#94A3B8] mb-2">Receivables</p>
            <p className="text-[16px] font-semibold text-white">$18,900</p>
          </div>
          <div className="bg-[#1E293B]/60 backdrop-blur-sm rounded-[14px] p-3 text-center border border-white/5">
            <p className="text-[9px] text-[#94A3B8] mb-2">Reserved</p>
            <p className="text-[16px] font-semibold text-white">$24,220</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]"></span>
              <span className="text-[8px] text-[#22D3EE]">live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalCard;


