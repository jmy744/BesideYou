"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMoments, getRecentMoodPattern, type Moment } from "@/lib/storage";
import { relativeTime } from "@/lib/time";

export default function Home() {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [moodPattern, setMoodPattern] = useState<"struggling" | "stable">("stable");

  useEffect(() => {
    setMoments(getMoments());
    setMoodPattern(getRecentMoodPattern());
  }, []);

  if (moments === null) {
    return <main className="min-h-screen bg-stone-50 px-6 py-12" aria-busy="true" />;
  }

  if (moments.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 text-stone-800">
        <section className="max-w-xl text-center">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-amber-800/70">Here with you</p>
          <h1 className="font-serif text-6xl tracking-tight">BesideYou</h1>
          <p className="mt-7 text-xl leading-8 text-stone-600">Because caring for someone with dementia should never be done alone.</p>
          <Link href="/guide" className="mt-10 inline-flex rounded-full bg-amber-800 px-7 py-4 text-base font-semibold text-stone-50 shadow-sm transition-colors hover:bg-amber-900">
            In the moment&nbsp; I need help now
          </Link>
          <p className="mt-6 text-sm leading-6 text-stone-500">For crisis or safety concerns, call 911 or your local emergency number.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-stone-800 sm:py-12">
      <section className="mx-auto max-w-2xl">
        <p className="font-serif text-xl text-amber-900">BesideYou</p>
        <h1 className="mt-10 font-serif text-5xl tracking-tight sm:text-6xl">Welcome back.</h1>
        <Link href="/guide" className="mt-8 block cursor-pointer rounded-2xl border border-stone-200 bg-amber-50 p-6 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md sm:p-8">
          <span className="font-serif text-2xl sm:text-3xl">In the moment</span>
          <span className="mt-2 block text-lg text-stone-600">— I need help now</span>
        </Link>
        <Link href="/notes" className="mt-4 block cursor-pointer rounded-2xl border border-stone-200 bg-amber-50 p-6 transition-all hover:bg-amber-100 hover:shadow-md">
          <span className="font-serif text-2xl">Understand a doctor&apos;s note</span>
          <span className="mt-2 block text-stone-600">Upload a photo of a medical document</span>
        </Link>

        <section className="mt-10">
          <h2 className="font-serif text-2xl">Recent moments</h2>
          <div className="mt-4 space-y-3">
            {moments.slice(0, 3).map((moment) => (
              <Link key={moment.id} href={`/moments/${moment.id}`} className="block rounded-2xl border border-stone-200 bg-amber-50 p-5 transition-colors hover:bg-amber-100">
                <p className="line-clamp-2 leading-6 text-stone-700">{moment.situation.slice(0, 80)}{moment.situation.length > 80 ? "…" : ""}</p>
                <p className="mt-3 text-sm text-stone-500">{relativeTime(moment.timestamp)}</p>
              </Link>
            ))}
          </div>
        </section>

        {moodPattern === "struggling" && (
          <section className="mt-8 rounded-2xl border border-stone-200 bg-amber-50 p-6">
            <p className="leading-7 text-stone-700">You&apos;ve been carrying a lot lately. When you have a moment, here are ways to find respite care and support.</p>
            <button type="button" className="mt-5 rounded-full bg-amber-800 px-5 py-3 font-semibold text-stone-50 transition-colors hover:bg-amber-900">Find local support</button>
          </section>
        )}
      </section>
    </main>
  );
}
