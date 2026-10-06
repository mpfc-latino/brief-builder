"use client";

import React from "react";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-bold text-[var(--foreground)]">{children}</label>
      {hint && <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-2.5 text-sm " +
        "outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[rgba(232,119,34,0.15)] " +
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
        "w-full rounded-[20px] border border-[var(--border)] bg-white/90 px-4 py-3 text-sm leading-relaxed shadow-[inset_0_1px_2px_rgba(48,37,105,0.05)] " +
        "outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[rgba(232,119,34,0.15)] " +
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
        "w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-2.5 text-sm " +
        "outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[rgba(232,119,34,0.15)] " +
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
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]";
  const styles = {
    primary: "btn-orange hover:brightness-105",
    ghost: "bg-transparent text-[var(--accent-text)] hover:bg-[var(--brand-soft)]",
    subtle: "bg-[var(--glass-strong)] border border-[var(--border)] text-[var(--indigo)] hover:bg-white",
  }[variant];
  return <button {...props} className={`${base} ${styles} ${className}`} />;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-3xl ${className}`}>{children}</div>
  );
}

// Latinovation wordmark, shown on the landing page and every wizard step.
// Drop artwork at public/latinovation-logo.png and set LOGO_SRC to use it instead.
const LOGO_SRC: string | null = null;
export function Logo({ className = "" }: { className?: string }) {
  if (LOGO_SRC) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={LOGO_SRC} alt="Latinovation" className={`h-9 w-auto object-contain ${className}`} />;
  }
  return (
    <span className={`select-none text-[22px] font-extrabold tracking-tight text-[var(--indigo)] ${className}`}>
      Latin<span className="text-[var(--brand)]">ovation</span>
    </span>
  );
}

export function BrandPanel({ lines, swatches }: { lines: { label: string; value: string }[]; swatches?: string[] }) {
  return (
    <div className="rounded-[18px] border border-white/80 bg-gradient-to-br from-white/75 to-[rgba(251,227,207,0.7)] p-4 shadow-[var(--shadow-soft)]">
      {swatches && swatches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {swatches.map((hex) => (
            <span key={hex} className="w-[22px] h-[22px] rounded-lg shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" style={{ background: hex }} title={hex} />
          ))}
        </div>
      )}
      <p className="font-serif text-sm font-bold text-[var(--indigo)] mb-2">Client alignment</p>
      <dl className="space-y-1.5">
        {lines.map((l) => (
          <div key={l.label} className="text-xs">
            <dt className="font-semibold text-[var(--foreground)]">{l.label}</dt>
            <dd className={l.label === "Voice" ? "font-serif italic text-[13px] leading-snug text-[var(--accent-text)]" : "text-[var(--muted)]"}>{l.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
