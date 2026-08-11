"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { StatsPanel } from "@/components/StatsPanel";
import { FilterBar } from "@/components/FilterBar";
import { DateGroupSection } from "@/components/DateGroupSection";
import { TaskFormModal } from "@/components/TaskFormModal";
import { AdiarModal } from "@/components/AdiarModal";
import { ConcluirModal } from "@/components/ConcluirModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CancelarTarefaModal } from "@/components/CancelarTarefaModal";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { ConclusoesListModal } from "@/components/ConclusoesListModal";
import { HistoricoModal } from "@/components/HistoricoModal";
import { getStatus } from "@/lib/domain/status";
import { agruparPorData } from "@/lib/domain/grouping";
import { computeStats } from "@/lib/domain/stats";
import type { ConclusaoComTarefa } from "@/lib/data/tarefas";
import type { Adiamento, FiltroStatus, Quadro, Tarefa } from "@/lib/types";

interface QuadroBoardProps {
  quadro: Quadro;
  tarefas: Tarefa[];
  ultimoAdiamentoPorTarefa: Record<string, Adiamento>;
  conclusoes: ConclusaoComTarefa[];
  usuarioAtual: string;
  isAdmin: boolean;
  usuarios: string[];
  todosUsuarios: string[];
}

type ModalState =
  | { type: "form"; tarefa?: Tarefa }
  | { type: "detalhes"; tarefa: Tarefa }
  | { type: "adiar"; tarefa: Tarefa }
  | { type: "concluir"; tarefa: Tarefa }
  | { type: "excluir"; tarefa: Tarefa }
  | { type: "cancelar"; tarefa: Tarefa }
  | { type: "historico"; tarefa: Tarefa }
  | { type: "conclusoes" };

export function QuadroBoard({
  quadro,
  tarefas,
  ultimoAdiamentoPorTarefa,
  conclusoes,
  usuarioAtual,
  isAdmin,
  usuarios,
  todosUsuarios,
}: QuadroBoardProps) {
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [modal, setModal] = useState<ModalState | null>(null);

  const adiamentoMap = useMemo(() => new Map(Object.entries(ultimoAdiamentoPorTarefa)), [ultimoAdiamentoPorTarefa]);

  const stats = useMemo(() => computeStats(tarefas), [tarefas]);

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      const status = getStatus(t);
      if (filtro === "todas") return status === "em_aberto" || status === "pendente";
      if (filtro === "em_aberto") return status === "em_aberto";
      if (filtro === "pendentes") return status === "pendente";
      if (filtro === "canceladas") return status === "cancelada";
      return status === "concluida";
    });
  }, [tarefas, filtro]);

  const grupos = useMemo(() => agruparPorData(tarefasFiltradas), [tarefasFiltradas]);

  function tarefaPorId(id: string) {
    return tarefas.find((t) => t.id === id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar value={filtro} onChange={setFiltro} />
        <Button tone="success" icon={<Plus size={16} />} onClick={() => setModal({ type: "form" })} className="shrink-0">
          Nova tarefa
        </Button>
      </div>

      <StatsPanel
        stats={stats}
        totalConclusoesHistorico={conclusoes.length}
        onAbrirConclusoes={() => setModal({ type: "conclusoes" })}
      />

      {filtro === "todas" && tarefasFiltradas.length === 0 && (stats.concluidas > 0 || stats.canceladas > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-soft bg-surface-elevated px-4 py-3 text-sm text-fg-secondary">
          <span>Nenhuma tarefa ativa no momento.</span>
          {stats.concluidas > 0 && (
            <button type="button" onClick={() => setFiltro("concluidas")} className="font-medium text-green hover:underline">
              Ver {stats.concluidas} concluída{stats.concluidas === 1 ? "" : "s"}
            </button>
          )}
          {stats.canceladas > 0 && (
            <button type="button" onClick={() => setFiltro("canceladas")} className="font-medium text-coral hover:underline">
              Ver {stats.canceladas} cancelada{stats.canceladas === 1 ? "" : "s"}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {grupos.map((grupo) => (
          <DateGroupSection
            key={grupo.key}
            grupo={grupo}
            ultimoAdiamentoPorTarefa={adiamentoMap}
            isAdmin={isAdmin}
            onAbrirDetalhes={(id) => {
              const t = tarefaPorId(id);
              if (t) setModal({ type: "detalhes", tarefa: t });
            }}
            onConcluir={(id) => {
              const t = tarefaPorId(id);
              if (t) setModal({ type: "concluir", tarefa: t });
            }}
            onAdiar={(id) => {
              const t = tarefaPorId(id);
              if (t) setModal({ type: "adiar", tarefa: t });
            }}
            onEditar={(id) => {
              const t = tarefaPorId(id);
              if (t) setModal({ type: "form", tarefa: t });
            }}
            onExcluir={(id) => {
              const t = tarefaPorId(id);
              if (t) setModal({ type: "excluir", tarefa: t });
            }}
            onCancelar={(id) => {
              const t = tarefaPorId(id);
              if (t) setModal({ type: "cancelar", tarefa: t });
            }}
          />
        ))}
      </div>

      {modal?.type === "form" && (
        <TaskFormModal
          quadro={quadro}
          tarefa={modal.tarefa}
          usuarios={usuarios}
          todosUsuarios={todosUsuarios}
          isAdmin={isAdmin}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "adiar" && <AdiarModal tarefa={modal.tarefa} onClose={() => setModal(null)} />}
      {modal?.type === "concluir" && (
        <ConcluirModal tarefa={modal.tarefa} usuarioAtual={usuarioAtual} onClose={() => setModal(null)} />
      )}
      {modal?.type === "excluir" && <DeleteConfirmModal tarefa={modal.tarefa} onClose={() => setModal(null)} />}
      {modal?.type === "cancelar" && <CancelarTarefaModal tarefa={modal.tarefa} onClose={() => setModal(null)} />}
      {modal?.type === "historico" && <HistoricoModal tarefaId={modal.tarefa.id} onClose={() => setModal(null)} />}
      {modal?.type === "conclusoes" && (
        <ConclusoesListModal conclusoes={conclusoes} isAdmin={isAdmin} onClose={() => setModal(null)} />
      )}
      {modal?.type === "detalhes" && (
        <TaskDetailModal
          tarefa={modal.tarefa}
          ultimoAdiamento={adiamentoMap.get(modal.tarefa.id)}
          isAdmin={isAdmin}
          onClose={() => setModal(null)}
          onEditar={() => setModal({ type: "form", tarefa: modal.tarefa })}
          onAdiar={() => setModal({ type: "adiar", tarefa: modal.tarefa })}
          onConcluir={() => setModal({ type: "concluir", tarefa: modal.tarefa })}
          onExcluir={() => setModal({ type: "excluir", tarefa: modal.tarefa })}
          onCancelar={() => setModal({ type: "cancelar", tarefa: modal.tarefa })}
          onHistorico={() => setModal({ type: "historico", tarefa: modal.tarefa })}
        />
      )}
    </div>
  );
}
