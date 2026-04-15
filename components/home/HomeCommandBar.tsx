"use client";

import Link from "next/link";
import { FileText, Keyboard, Mic, Sparkles } from "lucide-react";

const prompts = [
  {
    label: "I paid £2000 for materials",
    href: "/ask?action=record-payment",
  },
  {
    label: "Costs increased this week",
    href: "/ask?action=add-update",
  },
  {
    label: "Can I pay this supplier",
    href: "/ask?action=add-update",
  },
];

export function HomeCommandBar() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[rgba(99,102,241,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(247,246,255,0.72))] p-6 shadow-[0_20px_44px_rgba(99,102,241,0.11),0_14px_30px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0))]" />
      <div className="absolute left-[-10%] top-[-18%] h-36 w-44 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.2),rgba(34,211,238,0)_72%)] blur-3xl opacity-80" />
      <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(125,211,252,0.8),rgba(196,181,253,0.75),rgba(255,255,255,0))]" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/65 text-[#4F46E5] shadow-[0_6px_14px_rgba(99,102,241,0.12)]">
            <Sparkles className="h-[13px] w-[13px]" strokeWidth={2.1} />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
            Tell Zila what changed
          </p>
        </div>

        <Link
          href="/ask?action=add-update"
          className="group flex items-center gap-3 rounded-[24px] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.66))] px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.74)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(99,102,241,0.14),inset_0_1px_0_rgba(255,255,255,0.82)]"
        >
          <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[16px] border border-[rgba(99,102,241,0.12)] bg-[linear-gradient(180deg,#F5F7FF,#EEF2FF)] text-[#4F46E5] shadow-[0_8px_16px_rgba(99,102,241,0.08)]">
            <Keyboard className="h-[16px] w-[16px]" strokeWidth={2.1} />
          </span>
          <span className="flex-1 text-[16px] font-medium text-[#516173] transition group-hover:text-[#273246]">
            Type or speak…
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(18,20,23,0.06)] bg-white/72 text-[#4B5D7A] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <Mic className="h-[15px] w-[15px]" strokeWidth={2} />
            </span>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(18,20,23,0.06)] bg-white/72 text-[#4B5D7A] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <FileText className="h-[15px] w-[15px]" strokeWidth={2} />
            </span>
          </div>
        </Link>

        <div className="mt-5 space-y-2.5">
          {prompts.map((prompt) => (
            <Link
              key={prompt.label}
              href={prompt.href}
              className="block text-[14px] leading-[1.55] text-[#68778D] transition hover:text-[#334155]"
            >
              {prompt.label}
            </Link>
          ))}
        </div>

        <div className="mt-5">
          <Link
            href="/ask?action=upload-document"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(129,140,248,0.12))] px-4 py-3 text-[13px] font-semibold text-[#0F2C3A] shadow-[0_14px_28px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.72)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            <FileText className="h-[15px] w-[15px]" strokeWidth={2} />
            Add invoice
          </Link>
          <p className="mt-2 text-[12px] leading-[1.6] text-[#64748B]">
            Zila reads and updates everything automatically
          </p>
        </div>
      </div>
    </div>
  );
}
