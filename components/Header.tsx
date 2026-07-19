"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/guide", label: "Guide" },
  { href: "/notes", label: "Notes" },
  { href: "/wellbeing", label: "Wellbeing" },
  { href: "/handover", label: "Handover" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl text-amber-900 transition-colors hover:text-amber-950">BesideYou</Link>
        <nav className="hidden items-center gap-4 text-sm sm:flex" aria-label="Main navigation">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} className={`transition-colors hover:text-amber-900 ${active ? "font-semibold text-amber-900 underline underline-offset-4" : "text-stone-600"}`}>{label}</Link>;
          })}
        </nav>
      </div>
    </header>
  );
}
