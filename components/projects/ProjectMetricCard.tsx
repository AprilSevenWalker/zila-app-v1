interface ProjectMetricCardProps {
  label: string;
  value: string;
  detail: string;
}

export function ProjectMetricCard({ label, value, detail }: ProjectMetricCardProps) {
  return (
    <div className="rounded-[16px] bg-[#1E293B]/70 p-4 backdrop-blur-sm">
      <p className="text-[10px] text-[#94A3B8]">{label}</p>
      <p className="mt-2 text-[20px] font-semibold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-[#CBD5E1]">{detail}</p>
    </div>
  );
}
