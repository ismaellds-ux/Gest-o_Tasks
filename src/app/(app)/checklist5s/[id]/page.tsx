import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExecucaoDetalhe } from "@/lib/data/checklist5s";
import { computeChecklistScore, labelTurno } from "@/lib/domain/checklist5s";
import { formatDateBR } from "@/lib/domain/date";
import type { RespostaComItem } from "@/lib/data/checklist5s";

const RESPOSTA_BADGE: Record<string, string> = {
  ok: "bg-green-dim text-green",
  problema: "bg-coral-dim text-coral",
  nao_aplica: "bg-surface-light text-fg-secondary",
};

function textoResposta(r: RespostaComItem): string {
  if (!r.item) return r.resposta;
  if (r.resposta === "ok") return r.item.resposta_ok_texto;
  if (r.resposta === "problema") return r.item.resposta_problema_texto;
  return r.item.resposta_na_texto;
}

export default async function ChecklistDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const detalhe = await getExecucaoDetalhe(supabase, id);
  if (!detalhe) notFound();

  const score = computeChecklistScore(detalhe.respostas);

  const porArea = new Map<string, RespostaComItem[]>();
  for (const r of detalhe.respostas) {
    const areaNome = r.item?.area?.nome ?? "Outros";
    if (!porArea.has(areaNome)) porArea.set(areaNome, []);
    porArea.get(areaNome)!.push(r);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-fg">
          {labelTurno(detalhe.execucao.turno)} — {formatDateBR(detalhe.execucao.data)}
        </h1>
        <p className="text-sm text-fg-secondary">
          Por {detalhe.execucao.realizado_por}
          {score.pontuacao !== null && ` · ${score.pontuacao}% ok`}
          {score.problema > 0 && ` · ${score.problema} pendência${score.problema === 1 ? "" : "s"}`}
        </p>
      </div>

      {[...porArea.entries()].map(([areaNome, respostas]) => (
        <div key={areaNome} className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-display mb-3 text-base font-semibold text-fg">{areaNome}</h2>
          <div className="flex flex-col gap-3">
            {respostas.map((r) => (
              <div key={r.id} className="border-t border-border-soft pt-3 first:border-0 first:pt-0">
                <p className="text-sm text-fg">{r.item?.pergunta}</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${RESPOSTA_BADGE[r.resposta]}`}
                >
                  {textoResposta(r)}
                </span>
                {r.observacao && <p className="mt-1 text-sm text-fg-secondary">{r.observacao}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
