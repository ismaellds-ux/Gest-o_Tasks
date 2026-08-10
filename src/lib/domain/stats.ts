import type { Tarefa, Tipo } from "@/lib/types";
import { getStatus } from "@/lib/domain/status";
import { todayISO } from "@/lib/domain/date";

export interface StatsBucket {
  total: number;
  concluidas: number;
  pct: number;
}

export interface Stats {
  total: number;
  concluidas: number;
  pendentes: number;
  emAberto: number;
  pctConcluido: number;
  porTipo: Record<Tipo, StatsBucket>;
}

function contaConcluida(tarefa: Tarefa, tarefasComConclusao: Set<string>): boolean {
  if (tarefa.concluida) return true;
  return tarefa.periodicidade !== "unica" && tarefasComConclusao.has(tarefa.id);
}

export function computeStats(
  tarefas: Tarefa[],
  tarefasComConclusao: Set<string>,
  today = todayISO(),
): Stats {
  let concluidas = 0;
  let pendentes = 0;
  let emAberto = 0;

  const porTipo: Record<Tipo, StatsBucket> = {
    interna: { total: 0, concluidas: 0, pct: 0 },
    externa: { total: 0, concluidas: 0, pct: 0 },
  };

  for (const tarefa of tarefas) {
    const status = getStatus(tarefa, today);
    if (status === "pendente") pendentes += 1;
    if (status === "em_aberto") emAberto += 1;

    const concluida = contaConcluida(tarefa, tarefasComConclusao);
    if (concluida) concluidas += 1;

    const bucket = porTipo[tarefa.tipo];
    bucket.total += 1;
    if (concluida) bucket.concluidas += 1;
  }

  for (const tipo of Object.keys(porTipo) as Tipo[]) {
    const bucket = porTipo[tipo];
    bucket.pct = bucket.total > 0 ? Math.round((bucket.concluidas / bucket.total) * 100) : 0;
  }

  return {
    total: tarefas.length,
    concluidas,
    pendentes,
    emAberto,
    pctConcluido: tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0,
    porTipo,
  };
}
