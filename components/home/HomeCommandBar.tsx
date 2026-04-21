"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Keyboard, Mic, Sparkles } from "lucide-react";

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

const desktopPrompts = [
  "Paid a supplier",
  "Client hasn't paid",
  "Costs increased",
  "Can I afford this?",
];

export function HomeCommandBar() {
  const [desktopInput, setDesktopInput] = useState("");
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [showDesktopResponse, setShowDesktopResponse] = useState(false);

  const handleDesktopPrompt = (prompt: string) => {
    setDesktopInput(prompt);
    setShowDesktopResponse(true);
  };

  const handleDesktopInputChange = (value: string) => {
    setDesktopInput(value);
    setShowDesktopResponse(value.trim().length > 0);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-[30px] border border-[rgba(99,102,241,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(247,246,255,0.72))] p-6 shadow-[0_20px_44px_rgba(99,102,241,0.11),0_14px_30px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur-xl lg:hidden">
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

      <div className="relative hidden overflow-hidden rounded-[34px] border border-[rgba(99,102,241,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(246,248,255,0.82))] p-8 shadow-[0_26px_56px_rgba(99,102,241,0.11),0_18px_40px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(34,211,238,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(99,102,241,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0))]" />
        <div className="absolute left-[-2%] top-[-14%] h-44 w-52 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.18),rgba(34,211,238,0)_72%)] blur-3xl opacity-85" />
        <div className="absolute right-[6%] top-[12%] h-36 w-40 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(129,140,248,0.16),rgba(129,140,248,0)_72%)] blur-3xl opacity-80" />
        <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(125,211,252,0.7),rgba(196,181,253,0.72),rgba(255,255,255,0))]" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/78 text-[#4F46E5] shadow-[0_10px_18px_rgba(99,102,241,0.1)]">
              <Sparkles className="h-[14px] w-[14px]" strokeWidth={2.1} />
            </span>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">Zila</p>
              <span className="rounded-full border border-[rgba(99,102,241,0.12)] bg-white/66 px-2.5 py-1 text-[11px] font-medium text-[#63708A]">
                Live update
              </span>
            </div>
          </div>

          <div className="mt-6 max-w-[760px]">
            <p className="text-[34px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#121417]">
              Tell me what changed - I&apos;ll update everything.
            </p>
          </div>

          <div
            className={`mt-7 rounded-[28px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.72))] p-3 shadow-[0_18px_34px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.84)] transition-all duration-200 ${
              desktopFocused
                ? "border-cyan-300/40 shadow-[0_22px_40px_rgba(34,211,238,0.12),0_18px_34px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.88)]"
                : "border-white/80"
            }`}
          >
            <div className="flex items-center gap-3 rounded-[22px] bg-[linear-gradient(180deg,rgba(247,249,255,0.94),rgba(241,245,255,0.82))] px-5 py-4">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[16px] border border-[rgba(99,102,241,0.12)] bg-[linear-gradient(180deg,#F5F7FF,#EEF2FF)] text-[#4F46E5] shadow-[0_8px_16px_rgba(99,102,241,0.08)]">
                <Keyboard className="h-[16px] w-[16px]" strokeWidth={2.1} />
              </span>
              <input
                value={desktopInput}
                onChange={(event) => handleDesktopInputChange(event.target.value)}
                onFocus={() => setDesktopFocused(true)}
                onBlur={() => setDesktopFocused(false)}
                placeholder="Say it how it happened..."
                className="min-w-0 flex-1 bg-transparent text-[18px] font-medium text-[#273246] outline-none placeholder:text-[#7A879B]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDesktopPrompt("Can I afford this?")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(18,20,23,0.06)] bg-white/80 text-[#4B5D7A] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
                  aria-label="Use voice input"
                >
                  <Mic className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
                <Link
                  href="/ask?action=upload-document"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(18,20,23,0.06)] bg-white/80 text-[#4B5D7A] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
                  aria-label="Upload document"
                >
                  <FileText className="h-[15px] w-[15px]" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {desktopPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleDesktopPrompt(prompt)}
                className="rounded-full border border-[rgba(99,102,241,0.08)] bg-white/58 px-4 py-2.5 text-[13px] font-medium text-[#556274] shadow-[inset_0_1px_0_rgba(255,255,255,0.64)] transition hover:-translate-y-0.5 hover:border-cyan-300/24 hover:bg-white/72 hover:text-[#243244]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[13px] leading-[1.6] text-[#64748B]">
            Zila updates your finances and next moves instantly.
          </p>

          <div
            className={`mt-6 overflow-hidden rounded-[28px] border border-[rgba(99,102,241,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(243,247,255,0.72))] px-6 py-5 shadow-[0_18px_34px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.76)] transition-all duration-300 ${
              showDesktopResponse
                ? "max-h-60 translate-y-0 opacity-100"
                : "max-h-0 -translate-y-2 border-transparent px-6 py-0 opacity-0 shadow-none"
            }`}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-[620px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6366F1]">
                  Response
                </p>
                <p className="mt-3 text-[17px] font-medium leading-[1.7] text-[#243244]">
                  Got it. That increases your costs this week. Project Horizon is now closer to a shortfall by Friday.
                  We can fix it - want me to move funds?
                </p>
              </div>
              <Link
                href="/move-funds"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#121417] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#20242B]"
              >
                Fix this now
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
