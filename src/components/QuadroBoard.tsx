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
import { getStatus } from "@/lib/domain/status";
import { agruparPorData } from "@/lib/domain/grouping";
import { computeStats } from "@/lib/domain/stats";
import type { ConclusaoComTarefa } from "@/lib/data/tarefas";
import type { Adiamento, FiltroStatus, Quadro, Tarefa } from "@/lib/types";

interface QuadroBoardProps {
  quadro: Quadro;
  tarefas: Tarefa[];
  ultimoAdiamentoPorTarefa: Record<string, Adiamento>;
  tarefasComConclusaoIds: string[];
  conclusoes: ConclusaoComTarefa[];
  usuarioAtual: string;
  isAdmin: boolean;
}

type ModalState =
  | { type: "form"; tarefa?: Tarefa }
  | { type: "detalhes"; tarefa: Tarefa }
  | { type: "adiar"; tarefa: Tarefa }
  | { type: "concluir"; tarefa: Tarefa }
  | { type: "excluir"; tarefa: Tarefa }
  | { type: "cancelar"; tarefa: Tarefa }
  | { type: "conclusoes" };

export function QuadroBoard({
  quadro,
  tarefas,
  ultimoAdiamentoPorTarefa,
  tarefasComConclusaoIds,
  conclusoes,
  usuarioAtual,
  isAdmin,
}: QuadroBoardProps) {
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [modal, setModal] = useState<ModalState | null>(null);

  const tarefasComConclusao = useMemo(() => new Set(tarefasComConclusaoIds), [tarefasComConclusaoIds]);
  const adiamentoMap = useMemo(() => new Map(Object.entries(ultimoAdiamentoPorTarefa)), [ultimoAdiamentoPorTarefa]);

  const stats = useMemo(() => computeStats(tarefas, tarefasComConclusao), [tarefas, tarefasComConclusao]);

  const tarefasFiltradas = useMemo(() => {
    if (filtro === "todas") return tarefas;
    return tarefas.filter((t) => {
      const status = getStatus(t);
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

      <div className="flex flex-col gap-6">
        {grupos.map((grupo) => (
          <DateGroupSection
            key={grupo.key}
            grupo={grupo}
            ultimoAdiamentoPorTarefa={adiamentoMap}
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
          />
        ))}
      </div>

      {modal?.type === "form" && (
        <TaskFormModal quadro={quadro} tarefa={modal.tarefa} onClose={() => setModal(null)} />
      )}
      {modal?.type === "adiar" && <AdiarModal tarefa={modal.tarefa} onClose={() => setModal(null)} />}
      {modal?.type === "concluir" && (
        <ConcluirModal tarefa={modal.tarefa} usuarioAtual={usuarioAtual} onClose={() => setModal(null)} />
      )}
      {modal?.type === "excluir" && <DeleteConfirmModal tarefa={modal.tarefa} onClose={() => setModal(null)} />}
      {modal?.type === "cancelar" && <CancelarTarefaModal tarefa={modal.tarefa} onClose={() => setModal(null)} />}
      {modal?.type === "conclusoes" && (
        <ConclusoesListModal conclusoes={conclusoes} onClose={() => setModal(null)} />
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
        />
      )}
    </div>
  );
}
