import { TaskCard } from "@/components/TaskCard";
import type { GrupoTarefas } from "@/lib/domain/grouping";
import type { Adiamento } from "@/lib/types";

interface DateGroupSectionProps {
  grupo: GrupoTarefas;
  ultimoAdiamentoPorTarefa: Map<string, Adiamento>;
  onAbrirDetalhes: (id: string) => void;
  onConcluir: (id: string) => void;
  onAdiar: (id: string) => void;
  onEditar: (id: string) => void;
}

export function DateGroupSection({
  grupo,
  ultimoAdiamentoPorTarefa,
  onAbrirDetalhes,
  onConcluir,
  onAdiar,
  onEditar,
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
          {grupo.itens.map((tarefa) => (
            <TaskCard
              key={tarefa.id}
              tarefa={tarefa}
              ultimoAdiamento={ultimoAdiamentoPorTarefa.get(tarefa.id)}
              onAbrirDetalhes={() => onAbrirDetalhes(tarefa.id)}
              onConcluir={() => onConcluir(tarefa.id)}
              onAdiar={() => onAdiar(tarefa.id)}
              onEditar={() => onEditar(tarefa.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
