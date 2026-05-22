"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Keyboard, Mic } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-[30px] border border-white/22 bg-[linear-gradient(135deg,#214F83,#173D6D_48%,#102A4F)] p-6 shadow-[0_28px_68px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(234,241,255,0.14)] backdrop-blur-xl md:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(103,232,249,0.16),transparent_30%),linear-gradient(180deg,rgba(234,241,255,0.08),rgba(234,241,255,0))]" />
        <div className="absolute left-[-10%] top-[-18%] h-36 w-44 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.20),rgba(255,255,255,0)_72%)] blur-3xl opacity-80" />
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(243,245,249,0.66),rgba(103,232,249,0.38),rgba(255,255,255,0))]" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.10] shadow-[0_6px_14px_rgba(47,128,255,0.12)]">
              <span className="relative h-[13px] w-[13px]">
                <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="13px" className="object-contain" />
              </span>
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#67E8F9]">
              Tell Zila what changed
            </p>
          </div>

          <Link
            href="/ask?action=add-update"
            className="group flex items-center gap-3 rounded-[24px] border border-white/14 bg-[#102A4F]/54 px-5 py-5 shadow-[0_18px_38px_rgba(31,68,116,0.20),inset_0_1px_0_rgba(234,241,255,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(234,241,255,0.12)]"
          >
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[16px] border border-white/14 bg-white/[0.10] text-[#F7F8FC] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
              <Keyboard className="h-[16px] w-[16px]" strokeWidth={2.1} />
            </span>
            <span className="flex-1 text-[16px] font-medium text-[#D8E0F1] transition group-hover:text-[#F7F8FC]">
              Type or speak…
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-[#A7B0C5] shadow-[inset_0_1px_0_rgba(247,248,252,0.06)]">
                <Mic className="h-[15px] w-[15px]" strokeWidth={2} />
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-[#A7B0C5] shadow-[inset_0_1px_0_rgba(247,248,252,0.06)]">
                <FileText className="h-[15px] w-[15px]" strokeWidth={2} />
              </span>
            </div>
          </Link>

          <div className="mt-5 space-y-2.5">
            {prompts.map((prompt) => (
              <Link
                key={prompt.label}
                href={prompt.href}
                className="block text-[14px] leading-[1.55] text-[#C9D4F5] transition hover:text-[#F7F8FC]"
              >
                {prompt.label}
              </Link>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href="/ask?action=upload-document"
              className="inline-flex items-center gap-2 rounded-full border border-[#67E8F9]/18 bg-[#1D4ED8] px-4 py-3 text-[13px] font-semibold text-[#F7F8FC] shadow-[0_14px_28px_rgba(29,78,216,0.18)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <FileText className="h-[15px] w-[15px]" strokeWidth={2} />
              Add invoice
            </Link>
            <p className="mt-2 text-[12px] leading-[1.6] text-[#C9D4F5]">
              Zila records the change and updates the operating view
            </p>
          </div>
        </div>

      </div>

      <div className="relative hidden overflow-hidden rounded-[38px] border border-[rgba(99,102,241,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(238,243,255,0.84)_42%,rgba(246,240,255,0.78))] p-9 shadow-[0_34px_80px_rgba(79,70,229,0.15),0_20px_46px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.22),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(129,140,248,0.28),transparent_27%),radial-gradient(circle_at_82%_72%,rgba(99,102,241,0.13),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.32),rgba(255,255,255,0))]" />
        <div className="absolute left-[-4%] top-[-20%] h-56 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.24),rgba(34,211,238,0)_70%)] blur-3xl opacity-90" />
        <div className="absolute right-[-4%] top-[-10%] h-64 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.24),rgba(99,102,241,0)_70%)] blur-3xl opacity-90" />
        <div className="absolute bottom-[-32%] left-[26%] h-60 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(196,181,253,0.18),rgba(196,181,253,0)_70%)] blur-3xl opacity-85" />
        <div className="absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(125,211,252,0.9),rgba(196,181,253,0.88),rgba(255,255,255,0))]" />
        <div className="absolute right-10 top-10 h-28 w-28 rounded-full border border-white/45 opacity-40" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/65 bg-[linear-gradient(135deg,#EEF2FF,#E0F7FF_48%,#F3E8FF)] shadow-[0_16px_32px_rgba(99,102,241,0.16),0_0_24px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.82)]">
              <span className="relative h-[20px] w-[20px]">
                <Image src="/logo-z.png" alt="Zila" fill unoptimized sizes="20px" className="object-contain" />
              </span>
            </span>
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#4F46E5]">Zila</p>
              <span className="rounded-full border border-[rgba(99,102,241,0.14)] bg-white/72 px-3 py-1.5 text-[11px] font-semibold text-[#63708A] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                Live update
              </span>
            </div>
          </div>

          <div className="mt-7 max-w-[820px]">
            <p className="text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#111827]">
              Tell Zila what changed. Your operating view updates.
            </p>
          </div>

          <div
            className={`mt-8 rounded-[30px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.74))] p-3.5 shadow-[0_22px_46px_rgba(79,70,229,0.10),0_12px_26px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.88)] transition-all duration-200 ${
              desktopFocused
                ? "border-cyan-300/50 shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_28px_58px_rgba(34,211,238,0.16),0_18px_38px_rgba(79,70,229,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]"
                : "border-white/85"
            }`}
          >
            <div className="flex items-center gap-4 rounded-[24px] bg-[linear-gradient(180deg,rgba(248,250,255,0.98),rgba(238,244,255,0.88))] px-5 py-[18px]">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[17px] border border-white/70 bg-[linear-gradient(135deg,#E0E7FF,#DBF7FF)] text-[#4F46E5] shadow-[0_12px_24px_rgba(99,102,241,0.13),0_0_18px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <Keyboard className="h-[18px] w-[18px]" strokeWidth={2.15} />
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
                  className="inline-flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.82))] text-[#42526E] shadow-[0_10px_22px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.84)] transition hover:-translate-y-0.5 hover:text-[#4F46E5] hover:shadow-[0_14px_28px_rgba(99,102,241,0.12)]"
                  aria-label="Use voice input"
                >
                  <Mic className="h-[15px] w-[15px]" strokeWidth={2} />
                </button>
                <Link
                  href="/ask?action=upload-document"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,246,255,0.82))] text-[#42526E] shadow-[0_10px_22px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.84)] transition hover:-translate-y-0.5 hover:text-[#4F46E5] hover:shadow-[0_14px_28px_rgba(99,102,241,0.12)]"
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
                className="rounded-full border border-white/70 bg-white/62 px-4 py-2.5 text-[13px] font-semibold text-[#556274] shadow-[0_8px_18px_rgba(99,102,241,0.05),inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:border-cyan-300/34 hover:bg-white/82 hover:text-[#243244] hover:shadow-[0_12px_24px_rgba(99,102,241,0.10)]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[13px] leading-[1.6] text-[#64748B]">
            Zila updates your finances, operating history, and next moves instantly.
          </p>

          <div
            className={`mt-6 overflow-hidden rounded-[28px] border border-[rgba(99,102,241,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(238,246,255,0.78))] px-6 py-5 shadow-[0_20px_42px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.82)] transition-all duration-300 ${
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
                  Got it. Project Horizon has one supplier obligation due Friday. Zila can coordinate the payout while keeping the reserve protected.
                </p>
              </div>
              <Link
                href="/payments/choose-method"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#111827,#312E81)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(49,46,129,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(49,46,129,0.26)]"
              >
                Coordinate payout
                <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
