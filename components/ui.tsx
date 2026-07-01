"use client";

import React from "react";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-semibold text-[#1a1d26]">{children}</label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm " +
        "outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] " +
        (props.className ?? "")
      }
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm leading-relaxed " +
        "outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] " +
        (props.className ?? "")
      }
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm " +
        "outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] " +
        (props.className ?? "")
      }
    />
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "subtle" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-[var(--brand-strong)] text-white hover:opacity-90",
    ghost: "bg-transparent text-[var(--accent-text)] hover:bg-[var(--brand-soft)]",
    subtle: "bg-white border border-[var(--border)] text-[#1a1d26] hover:bg-gray-50",
  }[variant];
  return <button {...props} className={`${base} ${styles} ${className}`} />;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--border)] bg-white ${className}`}>{children}</div>
  );
}

// Latinovation logo, shown top-right on the landing page and every wizard step.
// Drop the artwork at public/latinovation-logo.png — until then this renders
// a tiny wordmark fallback so the layout never shows a broken image.
export function Logo({ className = "" }: { className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <span className={`select-none text-2xl font-extrabold tracking-tight text-[#302569] ${className}`}>
        Latin<span className="text-[var(--brand)]">ovation</span>
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/latinovation-logo.png"
      alt="Latinovation"
      onError={() => setFailed(true)}
      className={`h-9 w-auto object-contain ${className}`}
    />
  );
}

export function BrandPanel({ lines }: { lines: { label: string; value: string }[] }) {
  return (
    <div className="rounded-xl border border-[var(--border)] border-l-4 border-l-[var(--brand)] bg-[var(--brand-soft)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent-text)] mb-2">
        Client alignment
      </p>
      <dl className="space-y-1.5">
        {lines.map((l) => (
          <div key={l.label} className="text-xs">
            <dt className="font-semibold text-[#1a1d26]">{l.label}</dt>
            <dd className="text-gray-600">{l.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
