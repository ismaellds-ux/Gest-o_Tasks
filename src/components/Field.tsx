import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export const inputClass =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-violet/40";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="label-caps">{label}</span>
      {children}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs text-coral">
      <AlertCircle size={13} />
      {message}
    </span>
  );
}
