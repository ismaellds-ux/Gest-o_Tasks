import { addDaysISO, todayISO } from "@/lib/domain/date";
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

export interface CoberturaTurno {
  realizado: boolean;
  execucaoId?: string;
}

export interface CoberturaDia {
  data: string;
  hoje: boolean;
  turnos: Record<Turno, CoberturaTurno>;
}

// Painel de cobertura: pra cada dia dos últimos N, mostra se cada turno
// (manhã/tarde/noite) registrou o checklist — assim dá pra notar rápido um
// turno que ficou sem fazer, em vez de só ver o que já foi feito.
export function computeCobertura(execucoes: { id: string; data: string; turno: Turno }[], dias = 7): CoberturaDia[] {
  const hoje = todayISO();
  const idPorDiaTurno = new Map<string, string>();
  for (const e of execucoes) idPorDiaTurno.set(`${e.data}|${e.turno}`, e.id);

  const resultado: CoberturaDia[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const data = addDaysISO(hoje, -i);
    const turnos = {} as Record<Turno, CoberturaTurno>;
    for (const turno of TURNOS.map((t) => t.value)) {
      const execucaoId = idPorDiaTurno.get(`${data}|${turno}`);
      turnos[turno] = { realizado: !!execucaoId, execucaoId };
    }
    resultado.push({ data, hoje: data === hoje, turnos });
  }
  return resultado.reverse();
}
