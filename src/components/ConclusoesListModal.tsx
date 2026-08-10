import { MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { formatDateBR } from "@/lib/domain/date";
import type { ConclusaoComTarefa } from "@/lib/data/tarefas";

export function ConclusoesListModal({
  conclusoes,
  onClose,
}: {
  conclusoes: ConclusaoComTarefa[];
  onClose: () => void;
}) {
  return (
    <Modal title={`Conclusões (${conclusoes.length})`} onClose={onClose} maxWidth="max-w-2xl">
      {conclusoes.length === 0 ? (
        <p className="text-sm text-fg-secondary">Nenhuma conclusão registrada ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {conclusoes.map((c) => (
            <li key={c.id} className="rounded-xl border border-border-soft bg-surface-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-display font-semibold text-fg">{c.tarefas?.o_que ?? "Tarefa"}</span>
                <span className="label-caps shrink-0 text-green">{c.concluido_por}</span>
              </div>
              {c.descricao_snapshot && <p className="mt-1 text-sm text-fg-secondary">{c.descricao_snapshot}</p>}
              {c.tipo_snapshot === "externa" && (c.local_snapshot || c.cidade_snapshot) && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-fg-muted">
                  <MapPin size={12} />
                  {[c.local_snapshot, c.cidade_snapshot].filter(Boolean).join(" — ")}
                </div>
              )}
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 border-t border-border-soft pt-2.5">
                <span className="text-xs text-fg-muted">
                  <span className="label-caps mr-1">Prevista</span>
                  {formatDateBR(c.data_prevista)}
                </span>
                <span className="text-xs text-fg-muted">
                  <span className="label-caps mr-1">Concluída em</span>
                  {formatDateBR(c.data_conclusao)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
