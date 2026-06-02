"use client";

import { startTransition, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Plus, Trash2, Upload } from "lucide-react";

import { getZilaUserProfile, startZilaSession } from "@/lib/demoSession";
import { saveOnboardingProjects } from "@/lib/projectStore";

const ONBOARDING_COMPLETE_KEY = "zila-onboarding-complete";
const GUIDE_STORAGE_KEY = "zila-product-guide-seen";
const TOTAL_STEPS = 5;

const businessTypes = [
  "Construction",
  "Agency",
  "Interior Design",
  "Property Development",
  "Hospitality",
  "Consulting",
  "Other",
];

const paymentRails = ["Bank Transfers", "Mobile Money", "Stablecoins", "XRP", "Other"];
const projectStages = ["Planning", "Active", "Procurement", "Delivery", "Completed"];
const budgetExamples = ["10000", "25000", "50000", "100000"];

interface OnboardingProjectDraft {
  name: string;
  description: string;
  budget: string;
  stage: string;
  budgetUnknown: boolean;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "Z").toUpperCase();
}

export function OnboardingFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const profile = getZilaUserProfile();
    return profile.isDemo || profile.name === "Operator" ? "" : profile.name;
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const profile = getZilaUserProfile();
    return profile.isDemo ? "" : profile.email;
  });
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("zila-business-name") || "" : ""));
  const [businessType, setBusinessType] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("zila-business-type") || "Construction" : "Construction"));
  const [projects, setProjects] = useState<OnboardingProjectDraft[]>([
    { name: "", description: "", budget: "", stage: "Planning", budgetUnknown: false },
  ]);
  const [selectedRails, setSelectedRails] = useState<string[]>([]);
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [avatarMode, setAvatarMode] = useState<"profile" | "logo" | "skip">("skip");

  const currentStep = stepIndex + 1;
  const progress = useMemo(() => (currentStep / TOTAL_STEPS) * 100, [currentStep]);
  const cleanProjects = useMemo(() => projects.filter((project) => project.name.trim().length > 0), [projects]);
  const canContinue = useMemo(() => {
    if (stepIndex === 0) {
      return name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0;
    }
    if (stepIndex === 1) {
      return businessName.trim().length > 0 && businessType.trim().length > 0;
    }
    if (stepIndex === 2) {
      return cleanProjects.length > 0;
    }
    if (stepIndex === 3) {
      return selectedRails.length > 0;
    }

    return true;
  }, [businessName, businessType, cleanProjects.length, email, name, password, selectedRails.length, stepIndex]);

  const updateProject = <Key extends keyof OnboardingProjectDraft>(index: number, field: Key, value: OnboardingProjectDraft[Key]) => {
    setProjects((current) => current.map((project, projectIndex) => (projectIndex === index ? { ...project, [field]: value } : project)));
  };

  const addProject = () => {
    setProjects((current) => [...current, { name: "", description: "", budget: "", stage: "Planning", budgetUnknown: false }]);
  };

  const removeProject = (index: number) => {
    setProjects((current) => (current.length === 1 ? current : current.filter((_, projectIndex) => projectIndex !== index)));
  };

  const toggleRail = (rail: string) => {
    setSelectedRails((current) => (current.includes(rail) ? current.filter((item) => item !== rail) : [...current, rail]));
  };

  const handleFile = (file?: File) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarDataUrl(reader.result);
        setAvatarMode("profile");
      }
    };
    reader.readAsDataURL(file);
  };

  const finishSetup = () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanBusinessName = businessName.trim();

    startZilaSession({ email: cleanEmail, mode: "sign-up", remember: true, name: cleanName });
    window.localStorage.setItem("zila-demo-mode", "false");
    window.localStorage.setItem("zila-business-name", cleanBusinessName);
    window.localStorage.setItem("zila-settings-workspace", cleanBusinessName);
    window.localStorage.setItem("zila-business-type", businessType);
    window.localStorage.setItem("zila-onboarding-payment-rails", JSON.stringify(selectedRails));
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    window.localStorage.setItem(GUIDE_STORAGE_KEY, "true");

    if (avatarDataUrl && avatarMode !== "skip") {
      window.localStorage.setItem("zila-user-avatar", avatarDataUrl);
      window.localStorage.setItem("zila-user-avatar-type", avatarMode);
    } else {
      window.localStorage.removeItem("zila-user-avatar");
      window.localStorage.setItem("zila-user-avatar-type", "default");
    }

    saveOnboardingProjects(cleanProjects);

    startTransition(() => {
      router.push("/home");
    });
  };

  const goNext = () => {
    if (!canContinue) {
      return;
    }

    if (stepIndex === TOTAL_STEPS - 1) {
      finishSetup();
      return;
    }

    setStepIndex((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => setStepIndex((current) => Math.max(current - 1, 0));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.82),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(103,232,249,0.24),transparent_28%),linear-gradient(180deg,#DCEEFF_0%,#BCD4F6_56%,#102A4F_100%)] px-4 py-5 text-[#0F172A] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-[1120px] flex-col overflow-hidden rounded-[32px] border border-white/34 bg-[linear-gradient(145deg,rgba(255,255,255,0.62),rgba(220,236,255,0.34)_42%,rgba(23,61,109,0.82))] shadow-[0_34px_90px_rgba(16,35,63,0.28),inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/26 px-5 py-4 sm:px-7">
          <Image src="/logo-full.png" alt="Zila" width={118} height={44} priority className="h-auto w-[104px] object-contain" />
          <div className="min-w-[132px] text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#173D6D]">Step {currentStep} of {TOTAL_STEPS}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/52">
              <div className="h-full rounded-full bg-[#D9FF57]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
            {stepIndex === 0 ? (
              <div className="max-w-[620px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Create account</p>
                <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#10233F] sm:text-[54px]">Start with your real workspace.</h1>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" autoComplete="name" className="h-13 rounded-[18px] border border-white/70 bg-white/72 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085]" />
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" className="h-13 rounded-[18px] border border-white/70 bg-white/72 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085]" />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" autoComplete="new-password" className="h-13 rounded-[18px] border border-white/70 bg-white/72 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085] sm:col-span-2" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button type="button" className="h-12 rounded-[17px] border border-white/70 bg-white/52 text-[13px] font-semibold text-[#334155]">Continue with Google</button>
                  <button type="button" className="h-12 rounded-[17px] border border-white/70 bg-white/52 text-[13px] font-semibold text-[#334155]">Continue with Wallet</button>
                </div>
              </div>
            ) : null}

            {stepIndex === 1 ? (
              <div className="max-w-[620px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Business setup</p>
                <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#10233F] sm:text-[54px]">Tell us about your business.</h1>
                <div className="mt-8 space-y-4">
                  <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Business name" className="h-13 w-full rounded-[18px] border border-white/70 bg-white/72 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085]" />
                  <select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="h-13 w-full rounded-[18px] border border-white/70 bg-white/72 px-4 text-[14px] font-semibold text-[#10233F] outline-none">
                    {businessTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            ) : null}

            {stepIndex === 2 ? (
              <div className="max-w-[720px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Create projects</p>
                <h1 className="mt-3 text-[38px] font-semibold leading-[1.04] tracking-[-0.06em] text-[#10233F] sm:text-[50px]">What projects are you currently running?</h1>
                <div className="mt-7 space-y-3">
                  {projects.map((project, index) => (
                    <div key={index} className="rounded-[22px] border border-white/60 bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#526173]">Project {index + 1}</p>
                        {projects.length > 1 ? (
                          <button type="button" onClick={() => removeProject(index)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#10233F]/8 text-[#526173]" aria-label="Remove project">
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input value={project.name} onChange={(event) => updateProject(index, "name", event.target.value)} placeholder="Project name" className="h-12 rounded-[16px] border border-white/70 bg-white/78 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085]" />
                        <input value={project.description} onChange={(event) => updateProject(index, "description", event.target.value)} placeholder="Optional description" className="h-12 rounded-[16px] border border-white/70 bg-white/78 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085]" />
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#526173]">
                            What is the current budget for this project?
                          </label>
                          <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <input
                              value={project.budget}
                              onChange={(event) => updateProject(index, "budget", event.target.value)}
                              disabled={project.budgetUnknown}
                              placeholder="$25,000"
                              inputMode="numeric"
                              className="h-12 rounded-[16px] border border-white/70 bg-white/78 px-4 text-[14px] font-semibold outline-none placeholder:text-[#667085] disabled:opacity-55"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateProject(index, "budgetUnknown", !project.budgetUnknown);
                                if (!project.budgetUnknown) {
                                  updateProject(index, "budget", "");
                                }
                              }}
                              className={`h-12 rounded-[16px] border px-4 text-[12px] font-semibold ${project.budgetUnknown ? "border-[#D9FF57]/70 bg-[#D9FF57] text-[#10233F]" : "border-white/70 bg-white/62 text-[#173D6D]"}`}
                            >
                              I don&apos;t know yet
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {budgetExamples.map((budget) => (
                              <button
                                key={budget}
                                type="button"
                                onClick={() => {
                                  updateProject(index, "budgetUnknown", false);
                                  updateProject(index, "budget", budget);
                                }}
                                className="rounded-full border border-[#173D6D]/12 bg-white/58 px-3 py-1.5 text-[11px] font-semibold text-[#173D6D]"
                              >
                                ${Number(budget).toLocaleString("en-US")}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#526173]">
                            What stage is this project currently in?
                          </label>
                          <div className="mt-2 grid gap-2 sm:grid-cols-5">
                            {projectStages.map((stage) => (
                              <button
                                key={stage}
                                type="button"
                                onClick={() => updateProject(index, "stage", stage)}
                                className={`h-11 rounded-[15px] border px-3 text-[12px] font-semibold ${project.stage === stage ? "border-[#D9FF57]/70 bg-[#D9FF57] text-[#10233F]" : "border-white/70 bg-white/62 text-[#173D6D]"}`}
                              >
                                {stage}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addProject} className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-[17px] border border-[#173D6D]/12 bg-white/62 px-5 text-[13px] font-semibold text-[#173D6D]">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Add Another Project
                </button>
              </div>
            ) : null}

            {stepIndex === 3 ? (
              <div className="max-w-[640px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Payment rails</p>
                <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#10233F] sm:text-[54px]">How do you currently move money?</h1>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {paymentRails.map((rail) => {
                    const selected = selectedRails.includes(rail);
                    return (
                      <button key={rail} type="button" onClick={() => toggleRail(rail)} className={`flex h-14 items-center justify-between rounded-[18px] border px-4 text-[14px] font-semibold transition ${selected ? "border-[#D9FF57]/70 bg-[#D9FF57] text-[#10233F]" : "border-white/70 bg-white/62 text-[#173D6D]"}`}>
                        {rail}
                        {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {stepIndex === 4 ? (
              <div className="max-w-[640px]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">Profile setup</p>
                <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#10233F] sm:text-[54px]">Add a profile photo or company logo.</h1>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border border-white/72 bg-[#10233F] text-[32px] font-bold text-[#D9FF57] shadow-[0_22px_44px_rgba(16,35,63,0.22)]">
                    {avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initialsFor(name || businessName)
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-[17px] bg-[#D9FF57] px-5 text-[13px] font-semibold text-[#10233F]">
                      <Upload className="h-4 w-4" strokeWidth={2} />
                      Upload Profile Photo
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
                        setAvatarMode("profile");
                        handleFile(event.target.files?.[0]);
                      }} />
                    </label>
                    <label className="ml-0 inline-flex h-12 cursor-pointer items-center gap-2 rounded-[17px] border border-white/70 bg-white/62 px-5 text-[13px] font-semibold text-[#173D6D] sm:ml-2">
                      <ImagePlus className="h-4 w-4" strokeWidth={2} />
                      Upload Company Logo
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
                        setAvatarMode("logo");
                        handleFile(event.target.files?.[0]);
                      }} />
                    </label>
                    <button type="button" onClick={() => {
                      setAvatarMode("skip");
                      setAvatarDataUrl("");
                    }} className="block text-[13px] font-semibold text-[#173D6D]">
                      Skip and use default Z avatar
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="hidden border-l border-white/20 bg-[linear-gradient(180deg,rgba(23,61,109,0.88),rgba(16,42,79,0.96))] p-7 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#67E8F9]">Workspace preview</p>
              <h2 className="mt-4 text-[30px] font-semibold leading-[1.05] tracking-[-0.055em]">{businessName || "Your business"}</h2>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#C9D4F5]">
                {cleanProjects.length > 0 ? `${cleanProjects.length} project${cleanProjects.length === 1 ? "" : "s"} ready for coordination.` : "Projects will appear here as you add them."}
              </p>
            </div>
            <div className="space-y-3">
              {cleanProjects.slice(0, 3).map((project) => (
                <div key={project.name} className="rounded-[20px] border border-white/12 bg-white/[0.08] p-4">
                  <p className="text-[15px] font-semibold">{project.name}</p>
                  <p className="mt-1 text-[12px] text-[#C9D4F5]">{project.description || "Ready for payment coordination"}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/20 px-5 py-4 sm:px-7">
          <button type="button" onClick={goBack} disabled={stepIndex === 0} className="inline-flex h-11 items-center gap-2 rounded-[16px] border border-white/54 bg-white/36 px-4 text-[13px] font-semibold text-[#173D6D] disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Back
          </button>
          <button type="button" onClick={goNext} disabled={!canContinue} className="inline-flex h-12 items-center gap-2 rounded-[17px] bg-[#D9FF57] px-5 text-[14px] font-semibold text-[#10233F] shadow-[0_18px_36px_rgba(217,255,87,0.16)] disabled:opacity-50">
            {stepIndex === TOTAL_STEPS - 1 ? "Finish Setup" : "Continue"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </main>
  );
}

export default OnboardingFlow;
