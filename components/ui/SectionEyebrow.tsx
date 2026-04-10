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
      <span className={`h-2 w-2 rounded-full ${dotColor}`}></span>
      <p className="text-[12px] font-semibold text-[#6B7280]">{label}</p>
    </div>
  );
}
