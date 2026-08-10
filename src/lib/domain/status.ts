import type { StatusTarefa, Tarefa } from "@/lib/types";
import { todayISO } from "@/lib/domain/date";

export function getStatus(tarefa: Pick<Tarefa, "concluida" | "quando">, today = todayISO()): StatusTarefa {
  if (tarefa.concluida) return "concluida";
  return tarefa.quando < today ? "pendente" : "em_aberto";
}
