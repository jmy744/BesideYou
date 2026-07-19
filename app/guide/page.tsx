"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import { saveCheckin, saveMoment, type Mood } from "@/lib/storage";

export default function GuidePage() {
  const [situation, setSituation] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [momentId, setMomentId] = useState<string | null>(null);
  const [checkinMood, setCheckinMood] = useState<Mood | null>(null);

  async function getGuidance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situation.trim()) return;

    setGuidance("");
    setError("");
    setIsLoading(true);
    setMomentId(null);
    setCheckinMood(null);

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });

      if (!response.ok || !response.body) {
        throw new Error("We could not get guidance right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completedGuidance = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        completedGuidance += chunk;
        setGuidance((current) => current + chunk);
      }

      completedGuidance += decoder.decode();
      setGuidance(completedGuidance);
      const moment = saveMoment({
        situation: situation.trim(),
        response: completedGuidance,
        timestamp: new Date().toISOString(),
      });
      setMomentId(moment.id);
    } catch {
      setError("We could not get guidance right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCheckin(mood: Mood) {
    if (!momentId) return;
    saveCheckin({ mood, momentId, timestamp: new Date().toISOString() });
    setCheckinMood(mood);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-800 sm:py-20">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-medium tracking-[0.2em] text-amber-800/70 uppercase">BesideYou</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          What&apos;s happening right now?
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-stone-600">
          Tell me what you&apos;re seeing. We&apos;ll focus on the next small step.
        </p>

        <form onSubmit={getGuidance} className="mt-9">
          <label htmlFor="situation" className="sr-only">Describe the situation</label>
          <textarea
            id="situation"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            placeholder="Example: My mother is refusing to take her medication and is becoming agitated. It's late at night and I don't know what to do."
            className="min-h-40 w-full rounded-2xl border border-stone-300 bg-white p-5 leading-7 shadow-sm outline-none placeholder:text-stone-400 focus:border-amber-800 focus:ring-3 focus:ring-amber-800/15"
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading || !situation.trim()}
            className="mt-4 rounded-full bg-amber-800 px-6 py-3 font-semibold text-stone-50 transition-colors hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isLoading ? "Getting guidance…" : "Get guidance"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-5 py-4 text-red-800">
            {error}
          </p>
        )}

        {(guidance || isLoading) && (
          <>
            <section aria-live="polite" className="mt-9 rounded-2xl border border-amber-900/10 bg-amber-50/50 p-6 shadow-sm sm:p-8">
              <h2 className="font-serif text-2xl text-stone-800">Guidance for this moment</h2>
              <div className="mt-5 text-[1.05rem] leading-8 text-stone-700">
                {guidance ? (
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => (
                        <h3 className="mt-7 mb-3 font-serif text-sm font-semibold tracking-[0.16em] text-amber-900/70 uppercase first:mt-0">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
                      ul: ({ children }) => <ul className="mt-4 space-y-3 pl-6 marker:text-amber-800">{children}</ul>,
                      li: ({ children }) => <li className="pl-1 leading-8">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-amber-950">{children}</strong>,
                    }}
                  >
                    {guidance}
                  </ReactMarkdown>
                ) : (
                  "Thinking through this with you…"
                )}
              </div>
            </section>
            <p className="mt-4 text-center text-xs leading-5 text-stone-500">
              Powered by GPT-5.6 Sol&nbsp;&nbsp; Grounded in evidence-based dementia care principles
            </p>
            {momentId && (
              <section className="mt-8 rounded-2xl border border-stone-200 bg-amber-50 p-6 text-center">
                <h2 className="font-serif text-2xl">How are you doing right now?</h2>
                {checkinMood ? (
                  <p className="mt-4 leading-7 text-stone-700">
                    {checkinMood === "struggling" || checkinMood === "tired"
                      ? "Thank you for telling me. I'm keeping this in mind."
                      : "Glad to hear it."}
                  </p>
                ) : (
                  <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
                    {[
                      ["struggling", "😔", "Struggling"],
                      ["tired", "😮‍💨", "Tired"],
                      ["okay", "🙂", "Okay"],
                      ["alright", "😊", "Alright"],
                    ].map(([value, emoji, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleCheckin(value as Mood)}
                        className="rounded-xl border border-stone-200 bg-stone-50 px-2 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-amber-800 hover:bg-amber-100"
                      >
                        <span className="block text-xl" aria-hidden="true">{emoji}</span>
                        <span className="mt-1 block">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
