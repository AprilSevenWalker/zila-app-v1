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
    <div className="flex items-center justify-between rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(25,55,101,0.72),rgba(16,35,71,0.64)_52%,rgba(11,23,48,0.62))] p-4 shadow-[0_14px_30px_rgba(1,8,20,0.24),inset_0_1px_0_rgba(234,241,255,0.07)] transition-shadow hover:shadow-[0_20px_40px_rgba(1,8,20,0.30),0_0_22px_rgba(89,225,255,0.08)]">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#EAF1FF]">{title}</h4>
          <p className="text-[12px] text-[#C9D4F5]">{subtitle}</p>
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
