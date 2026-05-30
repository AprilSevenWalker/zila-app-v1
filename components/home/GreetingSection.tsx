"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { defaultUserProfile, getZilaAvatarDataUrl, getZilaUserProfile, subscribeToZilaSession } from "@/lib/demoSession";

interface GreetingSectionProps {
  dateLabel?: string;
  greeting?: string;
  name?: string;
  contextLabel?: string;
}

export function GreetingSection({
  dateLabel,
  greeting = "Good morning,",
  name,
  contextLabel = "Operational workspace",
}: GreetingSectionProps) {
  const [displayName, setDisplayName] = useState(name || defaultUserProfile.name);
  const [workspace, setWorkspace] = useState(defaultUserProfile.workspace);
  const [avatarDataUrl, setAvatarDataUrl] = useState("");

  useEffect(() => {
    if (name) {
      return undefined;
    }

    const sync = () => {
      const profile = getZilaUserProfile();
      setDisplayName(profile.name);
      setWorkspace(profile.workspace);
      setAvatarDataUrl(getZilaAvatarDataUrl());
    };

    sync();
    return subscribeToZilaSession(sync);
  }, [name]);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/28 bg-[linear-gradient(145deg,rgba(234,244,255,0.92),rgba(188,212,246,0.76)_48%,rgba(33,79,131,0.88))] p-4 text-[#10233F] shadow-[0_24px_58px_rgba(31,68,116,0.24),inset_0_1px_0_rgba(255,255,255,0.46)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.70),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(103,232,249,0.18),transparent_30%)]" />
      <div className="relative flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/58 bg-[#10233F] text-[24px] font-extrabold text-[#D9FF57] shadow-[0_18px_34px_rgba(16,35,63,0.22),inset_0_1px_0_rgba(255,255,255,0.14)]">
          {avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            "Z"
          )}
        </div>
        <div className="min-w-0 flex-1">
          {dateLabel ? <p className="text-[12px] font-medium text-[#526173]">{dateLabel}</p> : null}
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.035em] text-[#10233F] sm:text-[24px]">
            <span className="font-medium text-[#526173]">{greeting.replace(/,\s*$/, "")}, </span>
            <span className="font-extrabold text-[#06101F]">{name || displayName}</span>
          </h1>
          <p className="mt-1 truncate text-[13px] font-semibold text-[#173D6D]">{workspace}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold leading-[1.35] text-[#526173]">
            <span>{contextLabel}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9FF57] shadow-[0_0_10px_rgba(217,255,87,0.42)]" aria-hidden="true" />
            <span className="text-[#173D6D]">Live coordination active</span>
          </div>
        </div>
        <Link
          href="/payments/send"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-[#D9FF57] px-4 py-2.5 text-[12px] font-semibold text-[#06101F] shadow-[0_14px_28px_rgba(217,255,87,0.18)] min-[430px]:inline-flex"
        >
          Send Payment
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}

export default GreetingSection;
