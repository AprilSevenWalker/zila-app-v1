"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";

interface QuickUpdateMenuProps {
  variant?: "icon" | "label";
  align?: "left" | "right";
}

const actions = [
  { label: "Add update", href: "/ask?action=add-update" },
  { label: "Upload document", href: "/ask?action=upload-document" },
  { label: "Record payment", href: "/ask?action=record-payment" },
];

export function QuickUpdateMenu({
  variant = "label",
  align = "left",
}: QuickUpdateMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={
          variant === "icon"
            ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(18,20,23,0.12)] bg-white text-[#121417] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#F8F6F1]"
            : "inline-flex h-10 items-center gap-2 rounded-full border border-[#121417]/12 bg-white px-4 text-[13px] font-semibold text-[#121417] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:bg-[#F8F6F1]"
        }
        aria-label="Open quick project update actions"
        aria-expanded={isOpen}
      >
        <Plus className="h-[15px] w-[15px]" strokeWidth={2.1} />
        {variant === "label" ? "Add update" : null}
      </button>

      {isOpen ? (
        <div
          className={`absolute top-12 z-20 min-w-[190px] rounded-[18px] border border-[rgba(18,20,23,0.08)] bg-white p-2 shadow-[0_18px_32px_rgba(15,23,42,0.12)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center rounded-[14px] px-3 py-2.5 text-[14px] font-medium text-[#121417] transition hover:bg-[#F8F6F1]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
