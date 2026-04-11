import React from "react";
import { ShieldCheck } from "lucide-react";

export const ProofBand: React.FC = () => {
  return (
    <div className="bg-white border border-[rgba(18,20,23,0.08)] rounded-[16px] p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-11 h-11 rounded-[10px] bg-[#0F172A] flex items-center justify-center text-[18px] flex-shrink-0 text-white">
          <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#121417]">Proof of Operations</h4>
          <p className="text-[12px] text-[#6B7280]">14 days of verified activity building</p>
        </div>
      </div>
      <div className="bg-[#0F172A] rounded-full px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
        <span className="text-[11px] font-semibold text-white">Verified</span>
      </div>
    </div>
  );
};

export default ProofBand;
