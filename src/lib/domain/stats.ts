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
  canceladas: number;
  pctConcluido: number;
  porTipo: Record<Tipo, StatsBucket>;
}

// Recorrentes não têm um "concluído" permanente (o ciclo sempre reabre), então
// não entram no numerador nem no denominador do % concluído — só tarefas
// únicas contam pra esse percentual. Canceladas também ficam de fora.
function contaNoPercentual(tarefa: Tarefa): boolean {
  return !tarefa.cancelada && tarefa.periodicidade === "unica";
}

export function computeStats(tarefas: Tarefa[], today = todayISO()): Stats {
  let concluidas = 0;
  let pendentes = 0;
  let emAberto = 0;
  let canceladas = 0;
  let validas = 0;

  const porTipo: Record<Tipo, StatsBucket & { validas: number }> = {
    interna: { total: 0, concluidas: 0, pct: 0, validas: 0 },
    externa: { total: 0, concluidas: 0, pct: 0, validas: 0 },
  };

  for (const tarefa of tarefas) {
    const status = getStatus(tarefa, today);
    if (status === "pendente") pendentes += 1;
    if (status === "em_aberto") emAberto += 1;
    if (status === "cancelada") canceladas += 1;

    const contaTarefa = contaNoPercentual(tarefa);
    const concluida = contaTarefa && tarefa.concluida;
    if (contaTarefa) validas += 1;
    if (concluida) concluidas += 1;

    const bucket = porTipo[tarefa.tipo];
    bucket.total += 1;
    if (contaTarefa) bucket.validas += 1;
    if (concluida) bucket.concluidas += 1;
  }

  for (const tipo of Object.keys(porTipo) as Tipo[]) {
    const bucket = porTipo[tipo];
    bucket.pct = bucket.validas > 0 ? Math.round((bucket.concluidas / bucket.validas) * 100) : 0;
  }

  return {
    total: tarefas.length,
    concluidas,
    pendentes,
    emAberto,
    canceladas,
    pctConcluido: validas > 0 ? Math.round((concluidas / validas) * 100) : 0,
    porTipo,
  };
}
