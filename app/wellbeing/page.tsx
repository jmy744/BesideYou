"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCheckins, type Checkin, type Mood } from "@/lib/storage";

type Day = { date: Date; checkin: Checkin | null };

const moodColor: Record<Mood, string> = {
  struggling: "bg-rose-400",
  tired: "bg-amber-400",
  okay: "bg-stone-400",
  alright: "bg-[#8a9a7b]",
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WellbeingPage() {
  const [checkins, setCheckins] = useState<Checkin[] | null>(null);

  useEffect(() => setCheckins(getCheckins()), []);

  if (checkins === null) return <main className="bg-stone-50" aria-busy="true" />;

  const today = new Date();
  const byDay = new Map<number, Checkin>();
  checkins.forEach((checkin) => {
    const day = startOfDay(new Date(checkin.timestamp));
    if (!byDay.has(day)) byDay.set(day, checkin);
  });
  const days: Day[] = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (13 - index));
    return { date, checkin: byDay.get(startOfDay(date)) ?? null };
  });
  const commonMood = checkins.length
    ? (Object.entries(checkins.reduce<Record<Mood, number>>((counts, checkin) => {
      counts[checkin.mood] += 1;
      return counts;
    }, { struggling: 0, tired: 0, okay: 0, alright: 0 })).sort((a, b) => b[1] - a[1])[0][0] as Mood)
    : null;

  return (
    <main className="bg-stone-50 px-6 py-12 text-stone-800 sm:py-16">
      <section className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl">How you've been</h1>
        <p className="mt-4 max-w-xl leading-7 text-stone-600">A quiet record of the care you&apos;ve been giving yourself, too.</p>

        <section className="mt-10 rounded-3xl border border-stone-200 bg-amber-50 p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-2xl">The last 14 days</h2>
          <div className="mt-7 flex justify-between gap-1 sm:gap-3" aria-label="Check-ins over the last 14 days">
            {days.map(({ date, checkin }) => (
              <div key={date.toISOString()} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span title={`${formatDate(date)}: ${checkin?.mood ?? "no check-in"}`} className={`h-4 w-4 rounded-full ${checkin ? moodColor[checkin.mood] : "bg-stone-200"}`} />
                <span className="hidden text-[10px] text-stone-500 sm:block">{date.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600">
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />Struggling</span>
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />Tired</span>
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-stone-400" />Okay</span>
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#8a9a7b]" />Alright</span>
          </div>
        </section>

        <p className="mt-8 leading-7 text-stone-700">
          {checkins.length
            ? `In the last 14 days, you've checked in ${checkins.filter(({ timestamp }) => new Date(timestamp).getTime() >= Date.now() - 14 * 24 * 60 * 60 * 1000).length} times. Your most common feeling has been ${commonMood}.`
            : "No check-ins yet. After you use BesideYou for a few moments, this page will show how you've been feeling."}
        </p>

        <section className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-7 shadow-sm sm:p-9">
          <h2 className="font-serif text-3xl">A little support for you</h2>
          <div className="mt-6 grid gap-3">
            <a href="https://www.alz.org/help-support/resources/helpline" target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-200 bg-stone-50 p-5 hover:bg-rose-100"><span className="font-serif text-lg">Talk to someone right now</span><span className="mt-1 block text-sm text-stone-600">Alzheimer&apos;s Association 24/7 Helpline</span></a>
            <a href="https://eldercare.acl.gov/Public/Index.aspx" target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-200 bg-stone-50 p-5 hover:bg-rose-100"><span className="font-serif text-lg">Find respite care near you</span><span className="mt-1 block text-sm text-stone-600">Eldercare Locator</span></a>
            <a href="https://www.alz.org/help-support/caregiving" target="_blank" rel="noreferrer" className="rounded-2xl border border-rose-200 bg-stone-50 p-5 hover:bg-rose-100"><span className="font-serif text-lg">Read: You are not alone</span><span className="mt-1 block text-sm text-stone-600">Caregiver support from the Alzheimer&apos;s Association</span></a>
          </div>
        </section>

        <Link href="/" className="mt-10 inline-block text-sm text-stone-600 transition-colors hover:text-amber-900">← Back to home</Link>
      </section>
    </main>
  );
}
