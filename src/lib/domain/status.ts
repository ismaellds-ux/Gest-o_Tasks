import type { StatusTarefa, Tarefa } from "@/lib/types";
import { todayISO } from "@/lib/domain/date";

export function getStatus(
  tarefa: Pick<Tarefa, "concluida" | "quando" | "cancelada">,
  today = todayISO(),
): StatusTarefa {
  if (tarefa.cancelada) return "cancelada";
  if (tarefa.concluida) return "concluida";
  return tarefa.quando < today ? "pendente" : "em_aberto";
}
