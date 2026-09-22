import type { RespostaChecklist, Turno } from "@/lib/types";

export const TURNOS: { value: Turno; label: string }[] = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export function labelTurno(turno: Turno): string {
  return TURNOS.find((t) => t.value === turno)?.label ?? turno;
}

export interface PontuacaoChecklist {
  ok: number;
  problema: number;
  naoAplica: number;
  pontuacao: number | null;
}

export function computeChecklistScore(respostas: { resposta: RespostaChecklist }[]): PontuacaoChecklist {
  const ok = respostas.filter((r) => r.resposta === "ok").length;
  const problema = respostas.filter((r) => r.resposta === "problema").length;
  const naoAplica = respostas.filter((r) => r.resposta === "nao_aplica").length;
  const elegivel = ok + problema;
  const pontuacao = elegivel > 0 ? Math.round((ok / elegivel) * 100) : null;
  return { ok, problema, naoAplica, pontuacao };
}
