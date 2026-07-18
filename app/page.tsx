import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 text-stone-800">
      <section className="max-w-xl text-center">
        <p className="mb-5 text-sm font-medium tracking-[0.2em] text-amber-800/70 uppercase">
          Here with you
        </p>
        <h1 className="font-serif text-6xl tracking-tight text-stone-800">BesideYou</h1>
        <p className="mt-7 text-xl leading-8 text-stone-600">
          Because caring for someone with dementia should never be done alone.
        </p>
        <Link
          href="/guide"
          className="mt-10 inline-flex rounded-full bg-amber-800 px-7 py-4 text-base font-semibold text-stone-50 shadow-sm transition-colors hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
        >
          In the moment&nbsp; I need help now
        </Link>
        <p className="mt-6 text-sm leading-6 text-stone-500">
          For crisis or safety concerns, call 911 or your local emergency number.
        </p>
      </section>
    </main>
  );
}
