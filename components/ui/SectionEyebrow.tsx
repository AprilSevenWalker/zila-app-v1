interface SectionEyebrowProps {
  label: string;
  dotColor?: string;
  className?: string;
}

export function SectionEyebrow({
  label,
  dotColor = "bg-[#6366F1]",
  className = "",
}: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`h-2 w-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.18)] ${dotColor}`}></span>
      <p className="text-[12px] font-semibold text-[#6B7280]">{label}</p>
    </div>
  );
}
