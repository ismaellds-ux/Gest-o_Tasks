import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "success" | "warn" | "danger" | "ghost" | "default";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-green-dim text-green border border-green/30 hover:brightness-110",
  warn: "bg-amber-dim text-amber border border-amber/30 hover:brightness-110",
  danger: "bg-coral-dim text-coral border border-coral/30 hover:brightness-110",
  ghost: "bg-transparent text-fg-secondary border border-transparent hover:bg-surface-light",
  default: "bg-surface-light text-fg border border-border hover:bg-surface-elevated",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  icon?: ReactNode;
}

export function Button({ tone = "default", icon, children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
