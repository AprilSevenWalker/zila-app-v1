import Link from "next/link";
import { CreditCard, FolderKanban, ShieldCheck } from "lucide-react";

const actions = [
  {
    label: "Send Payment",
    href: "/payments/send",
    icon: CreditCard,
    className:
      "border-[#D9FF57]/30 bg-[#D9FF57] text-[#06101F] shadow-[0_18px_34px_rgba(217,255,87,0.18),inset_0_1px_0_rgba(255,255,255,0.28)]",
    iconClass: "bg-[#06101F]/10 text-[#06101F]",
  },
  {
    label: "Review Projects",
    href: "/projects",
    icon: FolderKanban,
    className:
      "border-white/14 bg-[#102A4F]/74 text-[#EAF1FF] shadow-[0_14px_28px_rgba(1,8,20,0.20),inset_0_1px_0_rgba(255,255,255,0.08)]",
    iconClass: "bg-white/[0.08] text-[#C9D4F5]",
  },
  {
    label: "Protect Money",
    href: "/move-funds",
    icon: ShieldCheck,
    className:
      "border-[#D9FF57]/22 bg-[#D9FF57]/10 text-[#F1FFB8] shadow-[0_14px_28px_rgba(1,8,20,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]",
    iconClass: "bg-[#D9FF57]/12 text-[#F1FFB8]",
  },
];

export function MobilePrimaryActions() {
  return (
    <div className="grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.href}
            href={action.href}
            className={`flex min-h-[64px] items-center gap-3 rounded-[22px] border px-4 py-3.5 transition hover:-translate-y-0.5 ${action.className}`}
          >
            <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-white/10 ${action.iconClass}`}>
              <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
            </span>
            <span className="min-w-0 text-[13px] font-semibold leading-tight">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default MobilePrimaryActions;
