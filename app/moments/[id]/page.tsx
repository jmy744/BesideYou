"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getMomentById } from "@/lib/storage";

export default function MomentPage() {
  const params = useParams<{ id: string }>();
  const moment = getMomentById(params.id);

  if (!moment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 text-stone-800">
        <section className="text-center">
          <h1 className="font-serif text-4xl">Moment not found</h1>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-amber-800 px-5 py-3 font-semibold text-stone-50 hover:bg-amber-900">Back home</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-stone-800 sm:py-20">
      <section className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-amber-900 hover:text-amber-950">← Back to home</Link>
        <h1 className="mt-8 font-serif text-4xl sm:text-5xl">This moment</h1>
        <section className="mt-8 rounded-2xl border border-stone-200 bg-amber-50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl">What was happening</h2>
          <div className="mt-4 whitespace-pre-wrap leading-7 text-stone-700">
            <ReactMarkdown>{moment.situation}</ReactMarkdown>
          </div>
        </section>
        <section className="mt-5 rounded-2xl border border-stone-200 bg-amber-50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Guidance</h2>
          <div className="mt-5 leading-8 text-stone-700">
            <ReactMarkdown
              components={{
                h3: ({ children }) => <h3 className="mt-7 mb-3 font-serif text-xl first:mt-0">{children}</h3>,
                p: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
                ul: ({ children }) => <ul className="mt-4 space-y-3 pl-6 marker:text-amber-800">{children}</ul>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
              }}
            >
              {moment.response}
            </ReactMarkdown>
          </div>
        </section>
      </section>
    </main>
  );
}
