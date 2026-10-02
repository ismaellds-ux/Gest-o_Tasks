import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listarExecucoes, listarPendenciasChecklist } from "@/lib/data/checklist5s";
import { isAdminAtual } from "@/lib/data/admin";
import {
  computeChecklistScore,
  computeCobertura,
  labelMomento,
  labelTurno,
  MOMENTOS,
  TURNOS,
} from "@/lib/domain/checklist5s";
import { formatDateBR } from "@/lib/domain/date";
import { Button } from "@/components/Button";
import { ChecklistDetalheAcoes } from "@/components/checklist5s/ChecklistDetalheAcoes";

export default async function Checklist5sPage() {
  const supabase = await createClient();
  const [execucoes, pendencias, isAdmin] = await Promise.all([
    listarExecucoes(supabase),
    listarPendenciasChecklist(supabase),
    isAdminAtual(supabase),
  ]);
  const cobertura = computeCobertura(execucoes, 7);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-fg">Checklist 5S</h1>
          <p className="text-sm text-fg-secondary">Recebimento e entrega de cada turno.</p>
        </div>
        <Link href="/checklist5s/novo">
          <Button tone="success" icon={<Plus size={16} />}>
            Novo checklist
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-display mb-3 text-base font-semibold text-amber">
          Pendências abertas ({pendencias.length})
        </h2>
        {pendencias.length === 0 ? (
          <p className="text-sm text-fg-muted">Nada pendente vindo dos checklists.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendencias.map((p) => (
              <div key={p.id} className="rounded-lg border border-border-soft bg-surface-elevated px-3 py-2">
                <p className="text-sm text-fg">{p.o_que}</p>
                <p className="text-xs text-fg-muted">
                  Desde {formatDateBR(p.quando)} · aberta por {p.criado_por}
                </p>
                {p.descricao && <p className="mt-0.5 text-xs text-fg-secondary">{p.descricao}</p>}
              </div>
            ))}
            <Link href="/tasks1" className="text-xs font-medium text-violet hover:underline">
              Resolver na Tasks 1
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-display mb-3 text-base font-semibold text-yellow">Cobertura dos últimos 7 dias</h2>
        <div className="flex flex-col gap-3">
          {cobertura.map((dia) => (
            <div key={dia.data} className="rounded-lg border border-border-soft bg-surface-elevated px-3 py-2.5">
              <p className="mb-2 text-sm font-medium text-fg-secondary">
                {formatDateBR(dia.data)}
                {dia.hoje && " (hoje)"}
              </p>
              <div className="flex flex-col gap-1.5">
                {TURNOS.map((t) => (
                  <div key={t.value} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="w-16 shrink-0 text-xs text-fg-muted">{t.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {MOMENTOS.map((m) => {
                        const slot = dia.turnos[t.value][m.value];
                        if (slot.execucoes.length > 0) {
                          return slot.execucoes.map((exec) => (
                            <Link
                              key={exec.id}
                              href={`/checklist5s/${exec.id}`}
                              className="rounded-lg bg-green-dim px-2 py-1 text-xs font-medium text-green hover:brightness-110"
                            >
                              {m.label} ✓ {exec.realizadoPor}
                            </Link>
                          ));
                        }
                        return (
                          <span
                            key={m.value}
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${
                              slot.atrasado ? "bg-coral-dim text-coral" : "bg-surface-light text-fg-muted"
                            }`}
                          >
                            {m.label}: {slot.atrasado ? "não feito" : "aguardando"}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {execucoes.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhum checklist registrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {execucoes.map((exec) => {
            const score = computeChecklistScore(exec.respostas);
            return (
              <div
                key={exec.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 hover:border-border-soft"
              >
                <Link href={`/checklist5s/${exec.id}`} className="flex flex-1 items-center justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold text-fg">
                      {labelTurno(exec.turno)} · {labelMomento(exec.momento)} — {formatDateBR(exec.data)}
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
                <ChecklistDetalheAcoes execucaoId={exec.id} isAdmin={isAdmin} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
