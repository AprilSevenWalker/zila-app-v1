import Link from "next/link";

interface ChapterRowProps {
  icon: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  href?: string;
}

export const ChapterRow: React.FC<ChapterRowProps> = ({
  icon,
  iconBgColor,
  title,
  subtitle,
  badge,
  badgeColor,
  href,
}) => {
  const content = (
    <div className="bg-white border border-[rgba(18,20,23,0.08)] rounded-[16px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-11 h-11 rounded-[10px] ${iconBgColor} flex items-center justify-center text-[18px] flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#121417]">{title}</h4>
          <p className="text-[12px] text-[#6B7280]">{subtitle}</p>
        </div>
      </div>
      <div className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap ml-2 ${badgeColor}`}>
        {badge}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default ChapterRow;
