import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const ProofBand: React.FC = () => {
  return (
    <Link
      href="/proof"
      className="flex items-center justify-between rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(25,55,101,0.72),rgba(16,35,71,0.62))] p-4 shadow-[0_14px_30px_rgba(1,8,20,0.24)] transition hover:shadow-[0_20px_40px_rgba(1,8,20,0.30),0_0_22px_rgba(89,225,255,0.08)]"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-11 h-11 rounded-[10px] bg-[#102347] flex items-center justify-center text-[18px] flex-shrink-0 text-white">
          <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#F7F8FC]">Proof of Operations</h4>
          <p className="text-[12px] text-[#C9D4F5]">14 days of verified activity building</p>
        </div>
      </div>
      <div className="bg-[#D7FF4F]/10 border border-[#D7FF4F]/22 rounded-full px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D7FF4F]"></span>
        <span className="text-[11px] font-semibold text-[#F1FFB8]">Verified</span>
      </div>
    </Link>
  );
};

export default ProofBand;
