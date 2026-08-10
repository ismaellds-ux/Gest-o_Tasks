"use client";

import { Carimbo } from "@/components/Carimbo";
import type { Stats } from "@/lib/domain/stats";

interface StatsPanelProps {
  stats: Stats;
  totalConclusoesHistorico: number;
  onAbrirConclusoes: () => void;
}

export function StatsPanel({ stats, totalConclusoesHistorico, onAbrirConclusoes }: StatsPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-6">
        <Carimbo pct={stats.pctConcluido} color="var(--green)" label="Concluído" />

        <div className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
          <StatNumber label="Total" value={stats.total} />
          <StatNumber label="Em Aberto" value={stats.emAberto} color="var(--yellow)" />
          <StatNumber label="Pendentes" value={stats.pendentes} color="var(--amber)" />
          <button type="button" onClick={onAbrirConclusoes} className="text-left transition-opacity hover:opacity-80">
            <StatNumber label="Conclusões (histórico)" value={totalConclusoesHistorico} color="var(--green)" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border-soft pt-5 sm:grid-cols-2">
        <TipoBar label="Interna" pct={stats.porTipo.interna.pct} total={stats.porTipo.interna.total} color="var(--violet)" />
        <TipoBar label="Externa" pct={stats.porTipo.externa.pct} total={stats.porTipo.externa.total} color="var(--fg-secondary)" />
      </div>
    </div>
  );
}

function StatNumber({ label, value, color = "var(--fg)" }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <span className="label-caps block">{label}</span>
      <span className="font-display text-2xl font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function TipoBar({ label, pct, total, color }: { label: string; pct: number; total: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-caps">
          {label} ({total})
        </span>
        <span className="text-sm font-semibold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
