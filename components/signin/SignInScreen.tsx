"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";

type AuthMode = "sign-in" | "sign-up";
type UseCase = "Running projects" | "Managing cash flow" | "Growing a business";

const useCases: UseCase[] = ["Running projects", "Managing cash flow", "Growing a business"];

export function SignInScreen() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useCase, setUseCase] = useState<UseCase>("Running projects");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("zila-auth-email");
    const savedUserType = window.localStorage.getItem("zila-auth-user-type");
    const savedUseCase = window.localStorage.getItem("zila-auth-use-case") as UseCase | null;

    if (savedEmail) {
      setEmail(savedEmail);
    }

    if (savedUserType === "new") {
      setMode("sign-up");
    }

    if (savedUseCase && useCases.includes(savedUseCase)) {
      setUseCase(savedUseCase);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const canContinue = email.trim().length > 0 && password.trim().length > 0;

  const handleContinue = () => {
    if (!email.trim() || !password.trim() || isLoading) {
      return;
    }

    const userType = mode === "sign-up" ? "new" : "returning";

    window.localStorage.setItem("zila-auth-email", email.trim());
    window.localStorage.setItem("zila-auth-user-type", userType);
    window.localStorage.setItem("zila-auth-mode", mode);

    if (mode === "sign-up") {
      window.localStorage.setItem("zila-auth-use-case", useCase);
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        router.push(mode === "sign-up" ? "/onboarding" : "/home");
      });
    }, 1500);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(162deg,#0B1121_0%,#141A36_34%,#241F48_66%,#1A3348_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_80%_24%,rgba(34,211,238,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0)_16%,rgba(129,140,248,0.08)_44%,rgba(34,211,238,0.06)_72%,rgba(255,255,255,0)_88%)]" />
      <div className="absolute left-[-3rem] top-[14%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.3),rgba(99,102,241,0.14)_46%,rgba(99,102,241,0)_78%)] blur-3xl" />
      <div className="absolute right-[-2rem] top-[18%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.18),rgba(34,211,238,0.08)_42%,rgba(34,211,238,0)_80%)] blur-3xl" />
      <div className="absolute left-[12%] top-[22%] h-44 w-28 rotate-[16deg] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_36%,rgba(255,255,255,0)_80%)] blur-2xl opacity-70" />

      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col px-6 pb-8 pt-10">
        <div className="mb-14 w-fit">
          <Image
            src="/zila-logo-white.png"
            alt="Zila"
            width={126}
            height={50}
            className="h-auto w-[122px] object-contain opacity-95"
            priority
          />
        </div>

        <div className="mx-auto flex w-full max-w-[336px] flex-1 flex-col justify-center">
          <div className="mb-8 inline-flex h-8 w-8 items-center justify-center">
            <span className="insight-signal-pulse relative inline-flex h-2.5 w-2.5 rounded-full bg-[#87E9F6] shadow-[0_0_18px_rgba(135,233,246,0.3)]">
              <span className="insight-signal-ripple absolute inset-0 rounded-full border border-[#A5B4FC]/45"></span>
            </span>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/6 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              disabled={isLoading}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                mode === "sign-in"
                  ? "bg-white text-[#121417] shadow-[0_6px_18px_rgba(255,255,255,0.14)]"
                  : "text-[#C9D5EA] hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              disabled={isLoading}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                mode === "sign-up"
                  ? "bg-white text-[#121417] shadow-[0_6px_18px_rgba(255,255,255,0.14)]"
                  : "text-[#C9D5EA] hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          <h1 className="mt-8 text-[34px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#FBFCFF]">
            {mode === "sign-in" ? "Welcome back" : "Create your Zila account"}
          </h1>

          <p className="mt-5 max-w-[292px] text-[15px] leading-[1.68] text-[#D4DCEF]/82">
            We&apos;ll pick up your latest projects and operating signals.
          </p>

          <form
            className="mt-10 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleContinue();
            }}
          >
            <div className="space-y-2">
              <label htmlFor="email-address" className="block text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                Email address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D7E3F8]/70">
                  <Mail className="h-[16px] w-[16px]" strokeWidth={1.9} />
                </span>
                <input
                  id="email-address"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  disabled={isLoading}
                  className="h-14 w-full rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.045))] pl-12 pr-4 text-[15px] text-[#F7FAFF] shadow-[0_0_28px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-sm transition placeholder:text-[#B9C7DF]/52 focus:border-cyan-300/28 focus:shadow-[0_0_28px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.14)] disabled:cursor-wait disabled:opacity-80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#D7E3F8]/70">
                  <LockKeyhole className="h-[16px] w-[16px]" strokeWidth={1.9} />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                  className="h-14 w-full rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.045))] pl-12 pr-4 text-[15px] text-[#F7FAFF] shadow-[0_0_28px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-sm transition placeholder:text-[#B9C7DF]/52 focus:border-cyan-300/28 focus:shadow-[0_0_28px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.14)] disabled:cursor-wait disabled:opacity-80"
                />
              </div>
            </div>

            {mode === "sign-up" ? (
              <div className="space-y-3 pt-2">
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#B8C1DE]">
                  What are you using Zila for?
                </p>
                <div className="space-y-2">
                  {useCases.map((option) => {
                    const isSelected = useCase === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setUseCase(option)}
                        disabled={isLoading}
                        className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left text-[14px] font-medium transition ${
                          isSelected
                            ? "border-cyan-300/26 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(129,140,248,0.08))] text-[#F7FBFF] shadow-[0_0_22px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]"
                            : "border-white/10 bg-white/6 text-[#D6E1F3] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        }`}
                      >
                        <span>{option}</span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isSelected ? "bg-[#7EE7F6] shadow-[0_0_12px_rgba(126,231,246,0.32)]" : "bg-white/18"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canContinue || isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/60 bg-white px-4 py-4 text-[14px] font-semibold text-[#121417] shadow-[0_18px_36px_rgba(255,255,255,0.12),0_0_18px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.76)] transition hover:bg-[#F7F7FB] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="insight-signal-pulse relative inline-flex h-2.5 w-2.5 rounded-full bg-[#5EEAD4] shadow-[0_0_14px_rgba(94,234,212,0.35)]">
                    <span className="insight-signal-ripple absolute inset-0 rounded-full border border-[#5EEAD4]/40"></span>
                  </span>
                  {mode === "sign-up" ? "Setting up your account" : "Signing you in"}
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        </div>

        <div className="mt-auto pt-8" />
      </div>
    </div>
  );
}
