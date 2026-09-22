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

export interface CoberturaExecucao {
  id: string;
  realizadoPor: string;
}

export interface CoberturaTurno {
  execucoes: CoberturaExecucao[];
}

export interface CoberturaDia {
  data: string;
  hoje: boolean;
  turnos: Record<Turno, CoberturaTurno>;
}

// Painel de cobertura: pra cada dia dos últimos N, mostra quem fez o
// checklist em cada turno (manhã/tarde/noite) — o mesmo turno pode ter mais
// de um registro no dia (mais de uma pessoa avaliando), por isso é uma
// lista, não um booleano. Turno sem nenhum registro aparece como "não feito".
export function computeCobertura(
  execucoes: { id: string; data: string; turno: Turno; realizado_por: string }[],
  dias = 7,
): CoberturaDia[] {
  const hoje = todayISO();
  const porDiaTurno = new Map<string, CoberturaExecucao[]>();
  for (const e of execucoes) {
    const chave = `${e.data}|${e.turno}`;
    if (!porDiaTurno.has(chave)) porDiaTurno.set(chave, []);
    porDiaTurno.get(chave)!.push({ id: e.id, realizadoPor: e.realizado_por });
  }

  const resultado: CoberturaDia[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const data = addDaysISO(hoje, -i);
    const turnos = {} as Record<Turno, CoberturaTurno>;
    for (const turno of TURNOS.map((t) => t.value)) {
      turnos[turno] = { execucoes: porDiaTurno.get(`${data}|${turno}`) ?? [] };
    }
    resultado.push({ data, hoje: data === hoje, turnos });
  }
  return resultado.reverse();
}
