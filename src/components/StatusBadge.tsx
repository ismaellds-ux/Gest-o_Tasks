import type { StatusTarefa, Tipo } from "@/lib/types";

const STATUS_CONFIG: Record<StatusTarefa, { label: string; fg: string; bg: string }> = {
  pendente: { label: "Pendente", fg: "text-amber", bg: "bg-amber-dim" },
  em_aberto: { label: "Em Aberto", fg: "text-yellow", bg: "bg-yellow-dim" },
  concluida: { label: "Concluída", fg: "text-green", bg: "bg-green-dim" },
};

export function StatusBadge({ status }: { status: StatusTarefa }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${c.fg} ${c.bg}`}>
      {c.label}
    </span>
  );
}

const TIPO_CONFIG: Record<Tipo, { label: string; fg: string; bg: string }> = {
  interna: { label: "Interna", fg: "text-violet", bg: "bg-violet-dim" },
  externa: { label: "Externa", fg: "text-fg-secondary", bg: "bg-surface-light" },
};

export function TipoBadge({ tipo }: { tipo: Tipo }) {
  const c = TIPO_CONFIG[tipo];
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${c.fg} ${c.bg}`}>
      {c.label}
    </span>
  );
}

export function corBordaTipo(tipo: Tipo): string {
  return tipo === "interna" ? "var(--violet)" : "var(--fg-muted)";
}
