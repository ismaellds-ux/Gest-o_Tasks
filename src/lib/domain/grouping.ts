import type { Tarefa } from "@/lib/types";
import { addDaysISO, diaDaSemana, diffDaysISO, todayISO } from "@/lib/domain/date";

export type GrupoData =
  | "atrasadas"
  | "hoje"
  | "amanha"
  | "semana_que_vem"
  | "mes_que_vem"
  | "mais_adiante";

const LABELS: Record<GrupoData, string> = {
  atrasadas: "Atrasadas",
  hoje: "Hoje",
  amanha: "Amanhã",
  semana_que_vem: "Semana que vem",
  mes_que_vem: "Mês que vem",
  mais_adiante: "Mais adiante",
};

const SEMPRE_VISIVEL: GrupoData[] = ["hoje", "amanha", "semana_que_vem", "mes_que_vem"];

// Semana civil: domingo a sábado. "Semana que vem" cobre do dia depois de
// amanhã até o fim da próxima semana civil (o tamanho da faixa varia conforme
// o dia da semana de hoje).
function fimDaProximaSemanaCivil(today: string): string {
  const fimDestaSemana = addDaysISO(today, 6 - diaDaSemana(today));
  return addDaysISO(fimDestaSemana, 7);
}

export function bucketDe(quando: string, today = todayISO()): GrupoData {
  const diff = diffDaysISO(today, quando);
  if (diff < 0) return "atrasadas";
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanha";
  if (quando <= fimDaProximaSemanaCivil(today)) return "semana_que_vem";
  if (diff <= 30) return "mes_que_vem";
  return "mais_adiante";
}

export interface GrupoTarefas {
  key: GrupoData;
  label: string;
  itens: Tarefa[];
}

const ORDEM: GrupoData[] = [
  "atrasadas",
  "hoje",
  "amanha",
  "semana_que_vem",
  "mes_que_vem",
  "mais_adiante",
];

export function agruparPorData(tarefas: Tarefa[], today = todayISO()): GrupoTarefas[] {
  const porGrupo = new Map<GrupoData, Tarefa[]>();

  for (const tarefa of tarefas) {
    const grupo = bucketDe(tarefa.quando, today);
    if (!porGrupo.has(grupo)) porGrupo.set(grupo, []);
    porGrupo.get(grupo)!.push(tarefa);
  }

  for (const itens of porGrupo.values()) {
    itens.sort((a, b) => a.quando.localeCompare(b.quando));
  }

  return ORDEM.filter(
    (grupo) => SEMPRE_VISIVEL.includes(grupo) || (porGrupo.get(grupo)?.length ?? 0) > 0,
  ).map((grupo) => ({
    key: grupo,
    label: LABELS[grupo],
    itens: porGrupo.get(grupo) ?? [],
  }));
}
