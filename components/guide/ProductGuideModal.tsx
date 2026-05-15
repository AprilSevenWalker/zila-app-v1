"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, FolderKanban, Landmark, LockKeyhole, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";

const GUIDE_STORAGE_KEY = "zila-product-guide-seen";
const GUIDE_OPEN_EVENT = "zila-open-product-guide";

const guideSteps = [
  {
    title: "Welcome to Zila",
    text: "Zila helps project-based businesses understand what is safe to spend, protect important money, and move funds with confidence.",
    icon: Sparkles,
  },
  {
    title: "Projects",
    text: "Track money across real operational work so payments and decisions stay connected to delivery.",
    icon: FolderKanban,
  },
  {
    title: "Protected Money",
    text: "Set aside money for suppliers, payroll, tax, and upcoming commitments before it becomes available to spend.",
    icon: LockKeyhole,
  },
  {
    title: "Safe to Spend",
    text: "See what is actually available before making decisions, after protected money and commitments are accounted for.",
    icon: WalletCards,
  },
  {
    title: "Proof of Operations",
    text: "Every important movement creates a verified operational record your business can rely on later.",
    icon: FileCheck2,
  },
  {
    title: "Operational insight",
    text: "Zila turns project updates, reserves, and payment movement into calm guidance about what happens next.",
    icon: ShieldCheck,
  },
];

export function openProductGuide() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(GUIDE_OPEN_EVENT));
}

export function ProductGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const openGuide = () => {
      setStepIndex(0);
      setIsOpen(true);
    };

    const hasSeenGuide = window.localStorage.getItem(GUIDE_STORAGE_KEY) === "true";
    const path = window.location.pathname;
    const isAuthSurface = path === "/" || path === "/login" || path === "/onboarding";

    if (!hasSeenGuide && !isAuthSurface) {
      window.setTimeout(openGuide, 550);
    }

    window.addEventListener(GUIDE_OPEN_EVENT, openGuide);
    return () => window.removeEventListener(GUIDE_OPEN_EVENT, openGuide);
  }, []);

  if (!isOpen) {
    return null;
  }

  const step = guideSteps[stepIndex];
  const Icon = step.icon;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === guideSteps.length - 1;

  const closeGuide = () => {
    window.localStorage.setItem(GUIDE_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#102A4F]/54 p-4 backdrop-blur-xl md:items-center">
      <section className="relative w-full max-w-[480px] overflow-hidden rounded-[30px] border border-white/24 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,#214F83,#173D6D_50%,#102A4F)] p-5 text-[#EAF1FF] shadow-[0_34px_90px_rgba(31,68,116,0.34),inset_0_1px_0_rgba(234,241,255,0.18)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(234,241,255,0.12),transparent_36%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#BCEEFF]">How Zila works</p>
              <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-white">{step.title}</h2>
              <p className="mt-2 text-[12px] font-semibold text-[#DCEBFF]">Step {stepIndex + 1} of {guideSteps.length}</p>
            </div>
            <button
              type="button"
              onClick={closeGuide}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-[#C9D4F5]"
              aria-label="Close guide"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/14 bg-white/[0.10] p-5 shadow-[inset_0_1px_0_rgba(234,241,255,0.12)]">
            <span className="inline-flex h-13 w-13 items-center justify-center rounded-[18px] border border-white/16 bg-[#102A4F]/48 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="mt-5 text-[15px] leading-[1.75] text-[#DCE8FF]">{step.text}</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {guideSteps.map((item, index) => (
                <span
                  key={item.title}
                  className={`h-1.5 rounded-full transition-all ${index === stepIndex ? "w-7 bg-[#D9FF57] shadow-[0_0_12px_rgba(217,255,87,0.36)]" : index < stepIndex ? "w-3 bg-[#D9FF57]/72" : "w-1.5 bg-white/22"}`}
                />
              ))}
            </div>
            <button type="button" onClick={closeGuide} className="text-[12px] font-semibold text-[#C9D4F5] transition hover:text-white">
              Skip
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
              disabled={isFirst}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-4 text-[13px] font-semibold text-[#EAF1FF] transition disabled:opacity-35"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back
            </button>
            <button
              type="button"
              onClick={() => (isLast ? closeGuide() : setStepIndex((current) => current + 1))}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1D4ED8] px-5 text-[13px] font-semibold text-white shadow-[0_18px_34px_rgba(29,78,216,0.24)]"
            >
              {isLast ? (
                <>
                  Finish
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductGuideModal;
