import type { ReactNode } from "react";
import Link from "next/link";

interface ChapterRowProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  href?: string;
}

export const ChapterRow: React.FC<ChapterRowProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  href,
}) => {
  const content = (
    <div className="bg-white border border-[rgba(18,20,23,0.07)] rounded-[16px] p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] transition-shadow">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#121417]">{title}</h4>
          <p className="text-[12px] text-[#72727A]">{subtitle}</p>
        </div>
      </div>
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ml-2 ${badgeColor}`}>
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
