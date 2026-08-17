import { TaskCard } from "@/components/TaskCard";
import type { GrupoTarefas } from "@/lib/domain/grouping";
import type { Adiamento } from "@/lib/types";

interface DateGroupSectionProps {
  grupo: GrupoTarefas;
  numeroInicial: number;
  ultimoAdiamentoPorTarefa: Map<string, Adiamento>;
  isAdmin: boolean;
  onAbrirDetalhes: (id: string) => void;
  onConcluir: (id: string) => void;
  onAdiar: (id: string) => void;
  onEditar: (id: string) => void;
  onExcluir: (id: string) => void;
  onCancelar: (id: string) => void;
}

export function DateGroupSection({
  grupo,
  numeroInicial,
  ultimoAdiamentoPorTarefa,
  isAdmin,
  onAbrirDetalhes,
  onConcluir,
  onAdiar,
  onEditar,
  onExcluir,
  onCancelar,
}: DateGroupSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="font-display text-sm font-semibold text-fg">{grupo.label}</h2>
        <span className="label-caps">{grupo.itens.length}</span>
        <div className="h-px flex-1 bg-border-soft" />
      </div>

      {grupo.itens.length === 0 ? (
        <p className="pb-1 text-sm text-fg-muted">Nenhuma tarefa neste período.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {grupo.itens.map((tarefa, i) => (
            <TaskCard
              key={tarefa.id}
              tarefa={tarefa}
              numero={numeroInicial + i + 1}
              ultimoAdiamento={ultimoAdiamentoPorTarefa.get(tarefa.id)}
              isAdmin={isAdmin}
              onAbrirDetalhes={() => onAbrirDetalhes(tarefa.id)}
              onConcluir={() => onConcluir(tarefa.id)}
              onAdiar={() => onAdiar(tarefa.id)}
              onEditar={() => onEditar(tarefa.id)}
              onExcluir={() => onExcluir(tarefa.id)}
              onCancelar={() => onCancelar(tarefa.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
