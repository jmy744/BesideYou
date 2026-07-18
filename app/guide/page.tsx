"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function GuidePage() {
  const [situation, setSituation] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function getGuidance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situation.trim()) return;

    setGuidance("");
    setError("");
    setIsLoading(true);

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setGuidance((current) => current + decoder.decode(value, { stream: true }));
      }

      setGuidance((current) => current + decoder.decode());
    } catch {
      setError("We could not get guidance right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-800 sm:py-20">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-medium tracking-[0.2em] text-amber-800/70 uppercase">Lucid</p>
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
          </>
        )}
      </section>
    </main>
  );
}
