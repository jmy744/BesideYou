"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCheckins, getMoments, getRecentMoodPattern, type MoodPattern, type Moment } from "@/lib/storage";
import { relativeTime } from "@/lib/time";

export default function Home() {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [moodPattern, setMoodPattern] = useState<MoodPattern | null>(null);
  const [hasCheckins, setHasCheckins] = useState(false);

  useEffect(() => {
    setMoments(getMoments());
    setMoodPattern(getRecentMoodPattern());
    setHasCheckins(getCheckins().length > 0);
  }, []);

  if (moments === null) {
    return <main className="bg-stone-50 px-6 py-12" aria-busy="true" />;
  }

  if (moments.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-stone-50 px-6 py-12 text-stone-800">
        <section className="max-w-xl text-center">
          <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">Here with you.</h1>
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
    <main className="bg-stone-50 px-6 py-12 text-stone-800 sm:py-16">
      <section className="mx-auto max-w-2xl">
        <div className="flex items-start justify-end gap-4">
          {hasCheckins && <Link href="/wellbeing" className="text-sm text-stone-500 transition-colors hover:text-amber-900">View your wellbeing →</Link>}
        </div>
        <h1 className="mt-10 font-serif text-5xl tracking-tight sm:text-6xl">Welcome back.</h1>
        <Link href="/guide" className="mt-8 block cursor-pointer rounded-2xl border border-stone-200 bg-amber-50 p-6 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md sm:p-8">
          <span className="font-serif text-2xl sm:text-3xl">In the moment</span>
          <span className="mt-2 block text-lg text-stone-600">— I need help now</span>
        </Link>
        <Link href="/notes" className="mt-4 block cursor-pointer rounded-2xl border border-stone-200 bg-amber-50 p-6 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md">
          <span className="font-serif text-2xl">Understand a doctor&apos;s note</span>
          <span className="mt-2 block text-stone-600">Upload a photo of a medical document</span>
        </Link>
        <Link href="/handover" className="mt-4 block cursor-pointer rounded-2xl border border-stone-200 bg-amber-50 p-6 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md">
          <span className="font-serif text-2xl">For the next person</span>
          <span className="mt-2 block text-stone-600">Generate a handover brief for a family member taking over</span>
        </Link>

        <section className="mt-10">
          <h2 className="font-serif text-2xl">Recent moments</h2>
          <div className="mt-4 space-y-3">
            {moments.slice(0, 3).map((moment) => (
              <Link key={moment.id} href={`/moments/${moment.id}`} className="block rounded-2xl border border-stone-200 bg-amber-50 p-5 shadow-sm transition-colors hover:bg-amber-100">
                <p className="line-clamp-2 leading-6 text-stone-700">{moment.situation.slice(0, 80)}{moment.situation.length > 80 ? "…" : ""}</p>
                <p className="mt-3 text-sm text-stone-500">{relativeTime(moment.timestamp)}</p>
              </Link>
            ))}
          </div>
        </section>

        {(moodPattern?.pattern === "struggling" || moodPattern?.pattern === "carrying") && (
          <section className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-7 shadow-sm sm:p-9">
            <h2 className="font-serif text-3xl">How are you?</h2>
            <p className="mt-4 max-w-xl leading-7 text-stone-700">
              {moodPattern.pattern === "struggling"
                ? "You've been carrying a lot lately. That takes a real toll. When you have a moment, here are some things that might help."
                : "The last few days have been heavy. You are doing important work, and you deserve care too."}
            </p>
            <div className="mt-7 grid gap-3">
              <a href="https://www.alz.org/help-support/resources/helpline" target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-200 bg-stone-50 p-5 shadow-sm transition-colors hover:bg-rose-100">
                <span className="font-serif text-lg">Talk to someone right now</span>
                <span className="mt-1 block text-sm text-stone-600">Alzheimer&apos;s Association 24/7 Helpline</span>
              </a>
              <a href="https://eldercare.acl.gov/Public/Index.aspx" target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-200 bg-stone-50 p-5 shadow-sm transition-colors hover:bg-rose-100">
                <span className="font-serif text-lg">Find respite care near you</span>
                <span className="mt-1 block text-sm text-stone-600">Eldercare Locator</span>
              </a>
              <a href="https://www.alz.org/help-support/caregiving" target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-200 bg-stone-50 p-5 shadow-sm transition-colors hover:bg-rose-100">
                <span className="font-serif text-lg">Read: You are not alone</span>
                <span className="mt-1 block text-sm text-stone-600">Caregiver support from the Alzheimer&apos;s Association</span>
              </a>
            </div>
            <p className="mt-7 text-xs leading-5 text-stone-500">This nudge appears when your recent check-ins suggest you may need extra support.</p>
          </section>
        )}
        <p className="mt-10 text-center text-xs leading-5 text-stone-500">This is a companion, not medical advice. Always consult your loved one&apos;s doctor.</p>
      </section>
    </main>
  );
}
