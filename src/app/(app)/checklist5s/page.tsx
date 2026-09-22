import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listarExecucoes } from "@/lib/data/checklist5s";
import { computeChecklistScore, labelTurno } from "@/lib/domain/checklist5s";
import { formatDateBR } from "@/lib/domain/date";
import { Button } from "@/components/Button";

export default async function Checklist5sPage() {
  const supabase = await createClient();
  const execucoes = await listarExecucoes(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-fg">Checklist 5S</h1>
          <p className="text-sm text-fg-secondary">Fechamento de turno por área.</p>
        </div>
        <Link href="/checklist5s/novo">
          <Button tone="success" icon={<Plus size={16} />}>
            Novo fechamento
          </Button>
        </Link>
      </div>

      {execucoes.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhum checklist registrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {execucoes.map((exec) => {
            const score = computeChecklistScore(exec.respostas);
            return (
              <Link
                key={exec.id}
                href={`/checklist5s/${exec.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 hover:border-border-soft"
              >
                <div>
                  <p className="font-display font-semibold text-fg">
                    {labelTurno(exec.turno)} — {formatDateBR(exec.data)}
                  </p>
                  <p className="text-sm text-fg-muted">Por {exec.realizado_por}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      score.pontuacao === null
                        ? "text-fg-muted"
                        : score.pontuacao >= 80
                          ? "text-green"
                          : score.pontuacao >= 50
                            ? "text-amber"
                            : "text-coral"
                    }`}
                  >
                    {score.pontuacao === null ? "—" : `${score.pontuacao}%`}
                  </p>
                  {score.problema > 0 && (
                    <p className="text-xs text-coral">
                      {score.problema} pendência{score.problema === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
