import { ZilaSaysCard } from "@/components/home/ZilaSaysCard";

interface ActionCardProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
  variant?: "light" | "dark";
}

export function ActionCard({
  title = "One thing to act on today",
  message,
  ctaLabel,
  variant = "dark",
}: ActionCardProps) {
  const isLight = variant === "light";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 pl-1">
        <span className="h-2 w-2 rounded-full bg-[#2F80FF] shadow-[0_0_12px_rgba(47,128,255,0.35)]"></span>
        <p className={`text-[13px] font-semibold ${isLight ? "text-[#182033]" : "text-[#F7F8FC]"}`}>{title}</p>
      </div>

      <ZilaSaysCard message={message} ctaLabel={ctaLabel} />
    </div>
  );
}

export default ActionCard;
