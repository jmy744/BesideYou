"use client";

import { ChangeEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import { saveNote } from "@/lib/storage";

export default function NotesPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setExplanation("");
    setError("");
    setImageFile(file);
    if (!file) {
      setImageDataUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function explainNote() {
    if (!imageFile || !imageDataUrl) return;

    setExplanation("");
    setError("");
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const response = await fetch("/api/notes", { method: "POST", body: formData });
      if (!response.ok || !response.body) throw new Error("We could not explain this note right now.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completedExplanation = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        completedExplanation += chunk;
        setExplanation((current) => current + chunk);
      }
      completedExplanation += decoder.decode();
      setExplanation(completedExplanation);
      saveNote({ imageDataUrl, explanation: completedExplanation, timestamp: new Date().toISOString() });
    } catch {
      setError("We could not explain this note right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-800 sm:py-20">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-800/70">BesideYou</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Understand a doctor&apos;s note</h1>
        <p className="mt-4 max-w-xl leading-7 text-stone-600">Take a photo of your loved one&apos;s discharge papers, prescription, or clinic note. I&apos;ll explain it in plain language.</p>

        <div className="mt-9 rounded-2xl border border-stone-200 bg-amber-50 p-6 sm:p-8">
          <label htmlFor="medical-note" className="block font-semibold text-stone-700">Choose a photo</label>
          <input id="medical-note" type="file" accept="image/*" onChange={handleImageChange} disabled={isLoading} className="mt-3 block w-full text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-amber-800 file:px-4 file:py-2 file:font-semibold file:text-stone-50 hover:file:bg-amber-900" />
          {imageDataUrl && <img src={imageDataUrl} alt="Preview of the selected medical document" className="mt-6 max-h-96 w-full rounded-xl border border-stone-200 object-contain bg-stone-50" />}
          <button type="button" onClick={explainNote} disabled={!imageFile || !imageDataUrl || isLoading} className="mt-6 rounded-full bg-amber-800 px-6 py-3 font-semibold text-stone-50 transition-colors hover:bg-amber-900 disabled:cursor-not-allowed disabled:bg-stone-400">
            {isLoading ? "Explaining…" : "Explain this"}
          </button>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-5 py-4 text-red-800">{error}</p>}

        {(explanation || isLoading) && (
          <>
            <section aria-live="polite" className="mt-8 rounded-2xl border border-stone-200 bg-amber-50 p-6 sm:p-8">
              <h2 className="font-serif text-2xl">In plain language</h2>
              <div className="mt-5 leading-8 text-stone-700">
                {explanation ? <ReactMarkdown components={{ h3: ({ children }) => <h3 className="mt-7 mb-3 font-serif text-xl first:mt-0">{children}</h3>, p: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>, ul: ({ children }) => <ul className="mt-4 space-y-3 pl-6 marker:text-amber-800">{children}</ul>, li: ({ children }) => <li className="pl-1">{children}</li> }}>{explanation}</ReactMarkdown> : "Reading this with you…"}
              </div>
            </section>
            <p className="mt-4 text-center text-xs leading-5 text-stone-500">Powered by GPT-5.6 Sol vision · Not medical advice — always ask your doctor to confirm.</p>
          </>
        )}
      </section>
    </main>
  );
}
