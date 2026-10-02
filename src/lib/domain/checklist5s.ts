import { addDaysISO, diffDaysISO } from "@/lib/domain/date";
import type { Momento, RespostaChecklist, Turno } from "@/lib/types";

export const TURNOS: { value: Turno; label: string; horario: string }[] = [
  { value: "turno1", label: "Turno 1", horario: "05:30–15:00" },
  { value: "turno2", label: "Turno 2", horario: "17:00–02:00" },
  { value: "turno3", label: "Turno 3", horario: "00:00–09:00" },
];

export const TURNO_OPTIONS = TURNOS.map((t) => ({ value: t.value, label: `${t.label} (${t.horario})` }));

export const MOMENTOS: { value: Momento; label: string }[] = [
  { value: "recebimento", label: "Recebimento" },
  { value: "entrega", label: "Entrega" },
];

export function labelTurno(turno: Turno): string {
  return TURNOS.find((t) => t.value === turno)?.label ?? turno;
}

export function labelMomento(momento: Momento): string {
  return MOMENTOS.find((m) => m.value === momento)?.label ?? momento;
}

// Janelas em minutos desde 00:00 do dia em que o turno COMEÇA (Turno 2 termina
// às 02:00 do dia seguinte, por isso fim = 26h).
const JANELA_TURNO: Record<Turno, { inicio: number; fim: number }> = {
  turno1: { inicio: 5 * 60 + 30, fim: 15 * 60 },
  turno2: { inicio: 17 * 60, fim: 26 * 60 },
  turno3: { inicio: 0, fim: 9 * 60 },
};

// Depois desse prazo o slot sem registro passa a contar como "não feito".
const PRAZO_RECEBIMENTO_APOS_INICIO_MIN = 120;
const PRAZO_ENTREGA_APOS_FIM_MIN = 60;

export interface AgoraSaoPaulo {
  data: string;
  minutos: number;
}

// O servidor roda em UTC; os turnos são em horário de Brasília.
export function agoraSaoPaulo(agora = new Date()): AgoraSaoPaulo {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "00";
  return {
    data: `${get("year")}-${get("month")}-${get("day")}`,
    minutos: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

// Sugestão pelo horário: o turno que começou mais recentemente
// (00:00 → T3, 05:30 → T1, 17:00 → T2). Nas sobreposições o colaborador troca.
export function sugerirTurno(agora: AgoraSaoPaulo): Turno {
  if (agora.minutos < JANELA_TURNO.turno1.inicio) return "turno3";
  if (agora.minutos < JANELA_TURNO.turno2.inicio) return "turno1";
  return "turno2";
}

// Data do turno = dia em que ele começou. A parte do Turno 2 depois da
// meia-noite (00:00–02:00) ainda pertence ao dia anterior.
export function dataDoTurno(turno: Turno, agora: AgoraSaoPaulo): string {
  if (turno === "turno2" && agora.minutos < 12 * 60) return addDaysISO(agora.data, -1);
  return agora.data;
}

function slotAtrasado(data: string, turno: Turno, momento: Momento, agora: AgoraSaoPaulo): boolean {
  const janela = JANELA_TURNO[turno];
  const prazo =
    momento === "recebimento"
      ? janela.inicio + PRAZO_RECEBIMENTO_APOS_INICIO_MIN
      : janela.fim + PRAZO_ENTREGA_APOS_FIM_MIN;
  const minutosAgoraDesdeDataDoSlot = diffDaysISO(data, agora.data) * 1440 + agora.minutos;
  return minutosAgoraDesdeDataDoSlot >= prazo;
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

export interface CoberturaSlot {
  execucoes: CoberturaExecucao[];
  atrasado: boolean;
}

export interface CoberturaDia {
  data: string;
  hoje: boolean;
  turnos: Record<Turno, Record<Momento, CoberturaSlot>>;
}

// Painel de cobertura: pra cada dia dos últimos N e cada turno, mostra quem
// fez o recebimento e a entrega. O mesmo slot pode ter mais de um registro
// (mais de uma pessoa avaliando), por isso é uma lista. Slot sem registro só
// vira "atrasado" depois do prazo (recebimento: 2h após o início do turno;
// entrega: 1h após o fim).
export function computeCobertura(
  execucoes: { id: string; data: string; turno: Turno; momento: Momento; realizado_por: string }[],
  dias = 7,
): CoberturaDia[] {
  const agora = agoraSaoPaulo();
  const porSlot = new Map<string, CoberturaExecucao[]>();
  for (const e of execucoes) {
    const chave = `${e.data}|${e.turno}|${e.momento}`;
    if (!porSlot.has(chave)) porSlot.set(chave, []);
    porSlot.get(chave)!.push({ id: e.id, realizadoPor: e.realizado_por });
  }

  const resultado: CoberturaDia[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const data = addDaysISO(agora.data, -i);
    const turnos = {} as Record<Turno, Record<Momento, CoberturaSlot>>;
    for (const { value: turno } of TURNOS) {
      const slots = {} as Record<Momento, CoberturaSlot>;
      for (const { value: momento } of MOMENTOS) {
        slots[momento] = {
          execucoes: porSlot.get(`${data}|${turno}|${momento}`) ?? [],
          atrasado: slotAtrasado(data, turno, momento, agora),
        };
      }
      turnos[turno] = slots;
    }
    resultado.push({ data, hoje: data === agora.data, turnos });
  }
  return resultado.reverse();
}
