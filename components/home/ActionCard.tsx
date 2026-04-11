import { ZilaSaysCard } from "@/components/home/ZilaSaysCard";

interface ActionCardProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
}

export function ActionCard({
  title = "One thing to act on today",
  message,
  ctaLabel,
}: ActionCardProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 pl-1">
        <span className="h-2 w-2 rounded-full bg-[#F59E0B]"></span>
        <p className="text-[13px] font-semibold text-[#121417]">{title}</p>
      </div>

      <ZilaSaysCard message={message} ctaLabel={ctaLabel} />
    </div>
  );
}

export default ActionCard;
