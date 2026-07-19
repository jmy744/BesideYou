"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getCheckinsInLastNDays, getMomentsInLastNDays, getNotes } from "@/lib/storage";

function plainText(markdown: string) {
  return markdown.replace(/^#{1,6}\s*/gm, "").replace(/[*_`]/g, "");
}

export default function HandoverPage() {
  const [brief, setBrief] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [empty, setEmpty] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  async function generateBrief() {
    const moments = getMomentsInLastNDays(7);
    setBrief("");
    setError("");
    setEmpty(false);
    setActionMessage("");
    if (!moments.length) {
      setEmpty(true);
      return;
    }

    const checkins = getCheckinsInLastNDays(7);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const noteCount = getNotes().filter(({ timestamp }) => new Date(timestamp).getTime() >= weekAgo).length;
    setIsLoading(true);
    try {
      const response = await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moments, checkins, noteCount }),
      });
      if (!response.ok || !response.body) throw new Error("We could not generate a handover brief right now.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completedBrief = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        completedBrief += chunk;
        setBrief((current) => current + chunk);
      }
      completedBrief += decoder.decode();
      setBrief(completedBrief);
    } catch {
      setError("We could not generate a handover brief right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyBrief() {
    await navigator.clipboard.writeText(plainText(brief));
    setActionMessage("Copied to clipboard.");
  }

  async function shareBrief() {
    const text = plainText(brief);
    if (navigator.share) {
      await navigator.share({ title: "BesideYou handover brief", text });
      return;
    }
    await navigator.clipboard.writeText(text);
    setActionMessage("Copied to clipboard.");
  }

  return (
    <main className="bg-stone-50 px-6 py-12 text-stone-800 sm:py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">For the next person</h1>
        <p className="mt-4 max-w-2xl leading-7 text-stone-600">A quiet handover for whoever takes over care next. Send this to your sister, brother, spouse, or whoever is stepping in.</p>
        <button type="button" onClick={generateBrief} disabled={isLoading} className="mt-8 rounded-full bg-amber-800 px-6 py-3 font-semibold text-stone-50 transition-colors hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-stone-400">
          {isLoading ? "Writing the brief…" : "Generate handover brief"}
        </button>

        {empty && <p className="mt-8 rounded-2xl border border-stone-200 bg-amber-50 p-6 leading-7 text-stone-700 shadow-sm">No recent moments to summarize yet. Come back after a few days of using BesideYou.</p>}
        {error && <p role="alert" className="mt-8 rounded-xl bg-red-50 px-5 py-4 text-red-800">{error}</p>}

        {(brief || isLoading) && (
          <>
            <section aria-live="polite" className="mt-10 rounded-sm border border-stone-200 bg-amber-50 p-8 shadow-sm sm:p-12">
              <div className="font-serif text-lg leading-9 text-stone-700 sm:text-xl">
                {brief ? <ReactMarkdown components={{ h3: ({ children }) => <h3 className="mt-8 mb-4 font-serif text-2xl first:mt-0">{children}</h3>, p: ({ children }) => <p className="mt-5 first:mt-0">{children}</p>, ul: ({ children }) => <ul className="mt-5 space-y-3 pl-6 marker:text-amber-800">{children}</ul>, li: ({ children }) => <li className="pl-1">{children}</li> }}>{brief}</ReactMarkdown> : "Gathering the week into a note for the next person…"}
              </div>
            </section>
            {brief && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={copyBrief} className="rounded-full border border-stone-300 bg-stone-50 px-5 py-3 font-semibold text-stone-700 transition-colors hover:bg-amber-50">Copy to clipboard</button>
                <button type="button" onClick={shareBrief} className="rounded-full bg-amber-800 px-5 py-3 font-semibold text-stone-50 transition-colors hover:bg-amber-900">Share via message</button>
              </div>
            )}
            {actionMessage && <p className="mt-3 text-sm text-stone-600">{actionMessage}</p>}
            <p className="mt-6 text-center text-xs leading-5 text-stone-500">Powered by GPT-5.6 Sol · Only share what you&apos;re comfortable with.</p>
          </>
        )}
      </section>
    </main>
  );
}
