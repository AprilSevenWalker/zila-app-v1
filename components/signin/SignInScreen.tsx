"use client";

import type { CSSProperties, MouseEvent } from "react";
import { startTransition, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, LockKeyhole, Mail, MoreHorizontal, ShieldCheck } from "lucide-react";
import { getAndClearAuthToast, startZilaSession } from "@/lib/demoSession";

type AuthMode = "sign-in" | "sign-up";

const operationalCards = [
  {
    title: "Reserve protected",
    detail: "Friday supplier reserve remains active",
    meta: "Healthy",
    tone: "lime",
  },
  {
    title: "Upcoming payout",
    detail: "Supplier payout ready in Kenya",
    meta: "$50,000",
    tone: "violet",
  },
];

function GoogleMark() {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[14px] font-bold">
      <span className="bg-[conic-gradient(from_45deg,#4285F4_0_25%,#34A853_0_50%,#FBBC05_0_75%,#EA4335_0_100%)] bg-clip-text text-transparent">
        G
      </span>
    </span>
  );
}

function FloatingOperationalCard({
  title,
  detail,
  meta,
  tone,
  className,
  items,
  compact = false,
}: {
  title: string;
  detail: string;
  meta: string;
  tone: "lime" | "violet" | "blue";
  className: string;
  items?: string[];
  compact?: boolean;
}) {
  const isDark = className.includes("text-white");
  const toneClass = {
    lime: "bg-[#D9FF57] shadow-[0_0_18px_rgba(217,255,87,0.26)]",
    violet: "bg-[#7C3AED] shadow-[0_0_18px_rgba(124,58,237,0.24)]",
    blue: "bg-[#67E8F9] shadow-[0_0_18px_rgba(103,232,249,0.24)]",
  }[tone];

  return (
    <div className={`zila-auth-floating-card absolute z-20 rounded-[22px] border border-white/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.74),rgba(235,241,252,0.50))] ${compact ? "p-3" : "p-3.5"} text-[#101827] shadow-[0_22px_50px_rgba(6,10,28,0.20),0_0_22px_rgba(124,58,237,0.07),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${toneClass}`} />
          <p className={`${compact ? "text-[11.5px]" : "text-[12px]"} font-semibold tracking-[-0.02em] ${isDark ? "text-white/92 drop-shadow-[0_1px_8px_rgba(2,6,23,0.34)]" : ""}`}>{title}</p>
        </div>
        <MoreHorizontal className={`h-3.5 w-3.5 ${isDark ? "text-white/62" : "text-[#1F2A44]/55"}`} strokeWidth={2} />
      </div>
      {items ? (
        <div className={`${compact ? "mt-2.5 space-y-1" : "mt-3 space-y-1.5"}`}>
          {items.map((item) => (
            <p key={item} className={`flex items-center gap-2 text-[11px] font-semibold leading-[1.35] ${isDark ? "text-white/88 drop-shadow-[0_1px_7px_rgba(2,6,23,0.30)]" : "text-[#334155]"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#D9FF57]" : "bg-[#214F83]/55"}`} />
              {item}
            </p>
          ))}
        </div>
      ) : (
        <p className={`mt-3 text-[11px] font-medium leading-[1.45] ${isDark ? "text-[#DCE7FA]" : "text-[#334155]"}`}>{detail}</p>
      )}
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <p className={`${compact ? "text-[15px]" : "text-[16px]"} font-semibold tracking-[-0.05em] ${isDark ? "text-white/92 drop-shadow-[0_1px_8px_rgba(2,6,23,0.34)]" : "text-[#111827]"}`}>{meta}</p>
        {tone === "lime" ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#D9FF57] text-[#101827] shadow-[0_0_18px_rgba(217,255,87,0.24)]">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MiniActivityCard() {
  const rows = [
    ["Supplier payout", "Completed", "2h ago", "bg-[#D9FF57]"],
    ["Reserve transfer", "Processing", "5h ago", "bg-[#7C3AED]"],
    ["Project Atlas", "Runway extended", "1d ago", "bg-[#EC4899]"],
  ];

  return (
    <div className="zila-auth-floating-card zila-auth-card-drift-d absolute bottom-[2%] left-[5%] z-20 hidden w-[250px] rounded-[24px] border border-white/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.74),rgba(235,241,252,0.50))] p-3.5 text-[#101827] shadow-[0_22px_50px_rgba(6,10,28,0.20),0_0_22px_rgba(124,58,237,0.07),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl xl:block">
      <div className="mb-2.5 flex items-center justify-between gap-4">
        <p className="text-[12px] font-semibold">Recent activity</p>
        <p className="text-[11px] font-medium text-[#64748B]">7 updates today</p>
      </div>
      <div className="space-y-0">
        {rows.map(([title, detail, time, dot], index) => (
          <div key={title} className="relative flex gap-2.5 pb-3 last:pb-0">
            <span className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ${dot} shadow-[0_0_12px_rgba(15,23,42,0.10)]`} />
            {index < rows.length - 1 ? <span className="absolute left-[6.5px] top-6 h-[calc(100%-1.2rem)] w-px bg-[#CBD5E1]" /> : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold text-[#101827]">{title}</p>
                <span className="text-[10px] font-medium text-[#64748B]">{time}</span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-[#475569]">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignInScreen() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePanelMotion, setImagePanelMotion] = useState({ x: 0, y: 0 });
  const [authToast, setAuthToast] = useState("");

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("zila-auth-email");
    const toast = getAndClearAuthToast();

    if (savedEmail) {
      setEmail(savedEmail);
    }

    if (toast) {
      setAuthToast(toast);
      window.setTimeout(() => setAuthToast(""), 3200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const canContinue = email.trim().length > 0 && password.trim().length > 0;
  const imagePanelStyle = {
    "--zila-auth-parallax-x": `${imagePanelMotion.x}px`,
    "--zila-auth-parallax-y": `${imagePanelMotion.y}px`,
    "--zila-auth-image-x": `${imagePanelMotion.x * -0.12}px`,
    "--zila-auth-image-y": `${imagePanelMotion.y * -0.12}px`,
    "--zila-auth-card-a-x": `${imagePanelMotion.x * 0.46}px`,
    "--zila-auth-card-a-y": `${imagePanelMotion.y * 0.46}px`,
    "--zila-auth-card-b-x": `${imagePanelMotion.x * 0.34}px`,
    "--zila-auth-card-b-y": `${imagePanelMotion.y * 0.34}px`,
    "--zila-auth-card-c-x": `${imagePanelMotion.x * 0.40}px`,
    "--zila-auth-card-c-y": `${imagePanelMotion.y * 0.40}px`,
    "--zila-auth-card-d-x": `${imagePanelMotion.x * 0.28}px`,
    "--zila-auth-card-d-y": `${imagePanelMotion.y * 0.28}px`,
    "--zila-auth-glow-x": `${imagePanelMotion.x * 0.10}px`,
    "--zila-auth-glow-y": `${imagePanelMotion.y * 0.10}px`,
    "--zila-auth-glow-slow-x": `${imagePanelMotion.x * 0.08}px`,
    "--zila-auth-glow-slow-y": `${imagePanelMotion.y * 0.08}px`,
  } as CSSProperties;

  const handleImagePanelMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;

    setImagePanelMotion({ x, y });
  };

  const resetImagePanelMotion = () => {
    setImagePanelMotion({ x: 0, y: 0 });
  };

  const handleContinue = () => {
    if (!canContinue || isLoading) {
      return;
    }

    startZilaSession({ email: email.trim(), mode, remember });

    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        router.push(mode === "sign-up" ? "/onboarding" : "/home");
      });
    }, 900);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_14%_4%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(103,232,249,0.16),transparent_28%),radial-gradient(circle_at_72%_86%,rgba(214,123,52,0.16),transparent_30%),linear-gradient(135deg,#DCEEFF_0%,#9DBFE7_36%,#17345F_100%)] p-2 text-[#0F172A] sm:p-4 lg:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1rem)] max-w-[1440px] overflow-hidden rounded-[34px] border border-white/24 bg-[linear-gradient(135deg,#214F83_0%,#173D6D_40%,#10233F_100%)] shadow-[0_32px_94px_rgba(16,35,63,0.32),0_0_62px_rgba(103,232,249,0.10),inset_0_1px_0_rgba(255,255,255,0.18)] lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[minmax(400px,0.94fr)_minmax(520px,1.06fr)]">
        <section className="relative flex min-h-[680px] flex-col overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(103,232,249,0.16),transparent_30%),radial-gradient(circle_at_100%_52%,rgba(214,123,52,0.10),transparent_28%),radial-gradient(circle_at_0%_96%,rgba(217,255,87,0.07),transparent_26%),linear-gradient(160deg,#245B8B_0%,#173D6D_48%,#102A4F_100%)] px-6 py-6 text-white sm:px-8 lg:px-10 xl:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0)_18%,rgba(255,255,255,0.09)_48%,rgba(255,255,255,0)_78%)]" />
          <div className="pointer-events-none absolute -right-24 top-16 h-96 w-52 rounded-l-full bg-white/[0.055] blur-sm" />
          <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.15),transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute right-[-4rem] top-[38%] h-80 w-44 rounded-l-full bg-[radial-gradient(circle,rgba(216,129,59,0.16),transparent_68%)] blur-2xl" />
          <div className="pointer-events-none absolute bottom-[-6rem] left-[28%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(4,8,48,0.34),transparent_68%)] blur-2xl" />

          <div className="relative">
            <Image
              src="/zila-logo-white.png"
              alt="Zila"
              width={142}
              height={56}
              className="h-auto w-[106px] drop-shadow-[0_16px_32px_rgba(2,6,23,0.22)]"
              priority
            />
          </div>

          <div className="relative mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-6">
            <div>
              <h1 className="text-[38px] font-semibold leading-none tracking-[-0.07em] text-white md:text-[46px]">
                {mode === "sign-in" ? "Welcome back" : "Create account"}
              </h1>
              <p className="mt-3 max-w-[320px] text-[15px] font-medium leading-[1.58] text-[#DCE7FF]/82">
                Sign in to coordinate projects, payouts, reserves, and proof records in real time.
              </p>
            </div>

            <form
              className="mt-7 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleContinue();
              }}
            >
              <button
                type="button"
                onClick={() => {
                  startZilaSession({ email: "kevin@zila.demo", mode: "sign-in", remember: true });
                  router.push("/home");
                }}
                className="inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-[16px] border border-white/80 bg-white px-5 text-[14px] font-semibold text-[#101827] shadow-[0_20px_38px_rgba(2,6,23,0.18),0_0_24px_rgba(103,232,249,0.07),inset_0_1px_0_rgba(255,255,255,0.92)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(2,6,23,0.22),0_0_30px_rgba(103,232,249,0.09),inset_0_1px_0_rgba(255,255,255,0.96)]"
              >
                <GoogleMark />
                Continue with Google
              </button>

              {authToast ? (
                <div className="rounded-[14px] border border-[#D9FF57]/20 bg-[#D9FF57]/[0.10] px-4 py-3 text-[12px] font-semibold text-[#EAFFB4]">
                  {authToast}
                </div>
              ) : null}

              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-white/20" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">Or</span>
                <span className="h-px flex-1 bg-white/20" />
              </div>

              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-[12px] font-semibold text-white">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email-address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className="h-[52px] w-full rounded-[16px] border border-white/20 bg-white/[0.065] px-4 pr-11 text-[14px] font-medium text-white shadow-[0_14px_28px_rgba(2,6,23,0.10),inset_0_1px_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-sm transition placeholder:text-white/58 focus:border-[#D9FF57]/38 focus:bg-white/[0.10] focus:shadow-[0_0_0_4px_rgba(217,255,87,0.08),0_14px_28px_rgba(2,6,23,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] disabled:cursor-wait disabled:opacity-80"
                  />
                  <Mail className="pointer-events-none absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/78" strokeWidth={1.9} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-[12px] font-semibold text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="h-[52px] w-full rounded-[16px] border border-white/20 bg-white/[0.065] px-4 pr-11 text-[14px] font-medium text-white shadow-[0_14px_28px_rgba(2,6,23,0.10),inset_0_1px_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-sm transition placeholder:text-white/58 focus:border-[#D9FF57]/38 focus:bg-white/[0.10] focus:shadow-[0_0_0_4px_rgba(217,255,87,0.08),0_14px_28px_rgba(2,6,23,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] disabled:cursor-wait disabled:opacity-80"
                  />
                  <Eye className="pointer-events-none absolute right-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/78" strokeWidth={1.9} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex cursor-pointer items-center gap-3 text-[13px] font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] border border-white/70 bg-white/8 text-[#10233F] transition peer-checked:border-[#C8F21E] peer-checked:bg-[#D9FF57]">
                    {remember ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </span>
                  Remember me
                </label>
                <button type="button" className="text-[13px] font-semibold text-[#D9FF57] transition hover:text-white">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={!canContinue || isLoading}
                className="group inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-[16px] border border-[#E7FF7A]/80 bg-[linear-gradient(180deg,#E8FF3F,#CBF000)] px-5 text-[14px] font-semibold text-[#101827] shadow-[0_18px_36px_rgba(166,203,0,0.20),0_0_22px_rgba(217,255,87,0.18),inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(166,203,0,0.24),0_0_30px_rgba(217,255,87,0.22),inset_0_1px_0_rgba(255,255,255,0.64)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Securing workspace" : mode === "sign-in" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2.2} />
              </button>
            </form>

            <div className="mt-5 text-center text-[12px] font-medium text-white/76">
              {mode === "sign-in" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
                className="font-semibold text-[#D9FF57] transition hover:text-white"
              >
                {mode === "sign-in" ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>

          <div className="relative mt-auto flex items-start gap-3 text-white/76">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D9FF57]" strokeWidth={1.7} />
            <p className="max-w-[330px] text-[12px] font-medium leading-[1.5]">
              Your data is protected with enterprise-grade encryption and secure infrastructure.
            </p>
          </div>
        </section>

        <section
          className="zila-auth-image-panel relative hidden min-h-[680px] overflow-hidden bg-[#0B1121] lg:block"
          style={imagePanelStyle}
          onMouseMove={handleImagePanelMove}
          onMouseLeave={resetImagePanelMotion}
        >
          <Image
            src="/zila-auth-portrait-source.png"
            alt="Business operator coordinating financial operations on her phone"
            fill
            sizes="(max-width: 1280px) 48vw, (max-width: 1440px) 50vw, 720px"
            className="zila-auth-portrait-layer object-cover object-[50%_50%]"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,17,42,0.40)_0%,rgba(23,52,95,0.11)_27%,rgba(9,12,24,0)_62%,rgba(9,12,24,0.22)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_50%,rgba(83,62,170,0.20),transparent_24%),radial-gradient(circle_at_94%_0%,rgba(217,255,87,0.12),transparent_16%),radial-gradient(circle_at_78%_96%,rgba(214,123,52,0.22),transparent_24%),radial-gradient(circle_at_68%_82%,rgba(103,232,249,0.05),transparent_28%)] mix-blend-soft-light" />
          <div className="zila-auth-ambient-glow absolute left-[18%] top-[34%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(83,62,170,0.20),rgba(103,232,249,0.08)_44%,rgba(214,123,52,0.08)_58%,transparent_70%)] opacity-52 mix-blend-screen" />
          <div className="zila-auth-ambient-glow-slow absolute -right-24 -top-24 h-80 w-44 rounded-bl-[120px] bg-[linear-gradient(180deg,rgba(217,255,87,0.18),rgba(214,123,52,0.08),transparent)] opacity-58 mix-blend-screen" />
          <div className="zila-auth-ambient-glow absolute bottom-[4%] right-[28%] h-44 w-28 rounded-t-full bg-[linear-gradient(180deg,rgba(83,62,170,0.24),rgba(103,232,249,0.07),transparent)] opacity-56 mix-blend-screen" />

          <div className="absolute left-[7%] top-[13%] z-20 max-w-[315px] text-white">
            <p className="text-[25px] font-semibold leading-[1.3] tracking-[-0.05em] drop-shadow-[0_7px_16px_rgba(0,0,0,0.18)]">
              Money moves across borders, teams, suppliers, and approvals every day.
            </p>
            <p className="mt-4 text-[21px] font-semibold leading-[1.3] tracking-[-0.04em] text-[#D9FF57] drop-shadow-[0_7px_16px_rgba(0,0,0,0.14)]">
              Zila keeps operations coordinated in real time.
            </p>
          </div>

          <div className="zila-auth-ambient-glow-slow absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(217,255,87,0.16),rgba(217,255,87,0)_70%)] blur-xl" />
          <div className="zila-auth-ambient-glow absolute bottom-[-8%] right-[18%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(83,62,170,0.22),rgba(83,62,170,0)_68%)] blur-xl" />
          <div className="zila-auth-ambient-glow-slow absolute bottom-[-10%] right-[-8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(214,123,52,0.28),rgba(214,123,52,0)_70%)] blur-xl" />

          <FloatingOperationalCard
            title={operationalCards[0].title}
            detail={operationalCards[0].detail}
            meta={operationalCards[0].meta}
            tone="lime"
            className="zila-auth-card-drift-a right-[5%] top-[13%] w-[252px]"
          />
          <FloatingOperationalCard
            title={operationalCards[1].title}
            detail={operationalCards[1].detail}
            meta={operationalCards[1].meta}
            tone="violet"
            className="zila-auth-card-drift-b right-[3.5%] top-[42%] w-[244px]"
          />
          <FloatingOperationalCard
            title="Cross-border route active"
            detail="Global supplier movement is ready"
            meta="Operational"
            tone="lime"
            items={["USD to KES verified", "Supplier payout ready", "Reserve protection active"]}
            compact
            className="zila-auth-card-drift-b left-[5.5%] bottom-[42%] hidden w-[220px] border-white/32 bg-[linear-gradient(145deg,rgba(8,14,30,0.92),rgba(23,52,95,0.82))] text-white shadow-[0_26px_58px_rgba(2,6,23,0.36),0_0_24px_rgba(217,255,87,0.12),inset_0_1px_0_rgba(255,255,255,0.20)] backdrop-blur-md xl:block"
          />
          <MiniActivityCard />
        </section>
      </div>
    </main>
  );
}
