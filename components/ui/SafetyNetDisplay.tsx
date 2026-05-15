interface SafetyNetDisplayProps {
  amount: string;
  dark?: boolean;
  className?: string;
  description?: string;
}

export function SafetyNetDisplay({
  amount,
  dark = false,
  className = "",
  description = "You're covered if revenue dips or costs rise",
}: SafetyNetDisplayProps) {
  return (
    <div
      className={`rounded-[16px] border px-4 py-3 ${
        dark
          ? "border-white/14 bg-[#102A4F]/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-[rgba(18,20,23,0.07)] bg-[#FBFAF7]"
      } ${className}`}
    >
      <p className={`text-[10px] font-medium ${dark ? "text-[#D7FF4F]" : "text-[#5B7218]"}`}>Safety Net: {amount}</p>
      <p className={`mt-2 text-[11px] leading-[1.45] ${dark ? "text-[#C9D4F5]" : "text-[#526173]"}`}>
        {description}
      </p>
    </div>
  );
}
