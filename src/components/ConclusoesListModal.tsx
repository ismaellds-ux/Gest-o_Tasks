"use client";

import { useState, useTransition } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { formatDateBR } from "@/lib/domain/date";
import { excluirConclusao } from "@/app/actions/tarefas";
import type { ConclusaoComTarefa } from "@/lib/data/tarefas";

interface ConclusoesListModalProps {
  conclusoes: ConclusaoComTarefa[];
  isAdmin: boolean;
  onClose: () => void;
}

export function ConclusoesListModal({ conclusoes, isAdmin, onClose }: ConclusoesListModalProps) {
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const showToast = useToast();

  function excluir(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    setPendingId(id);
    startTransition(async () => {
      const result = await excluirConclusao(formData);
      setPendingId(null);
      setConfirmandoId(null);
      if (result.error) return showToast(result.error, "error");
      showToast("Registro excluído.", "success");
    });
  }

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
                <div className="flex shrink-0 items-center gap-2">
                  <span className="label-caps text-green">{c.concluido_por}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setConfirmandoId(c.id)}
                      className="rounded-lg p-1 text-fg-muted hover:bg-coral-dim hover:text-coral"
                      aria-label="Excluir registro"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
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

              {confirmandoId === c.id && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-coral/25 bg-coral-dim px-3 py-2">
                  <span className="text-xs text-coral">Excluir esse registro do histórico? Não dá pra desfazer.</span>
                  <div className="flex shrink-0 gap-2">
                    <Button tone="ghost" onClick={() => setConfirmandoId(null)} className="px-2.5 py-1 text-xs">
                      Cancelar
                    </Button>
                    <Button
                      tone="danger"
                      icon={<Trash2 size={13} />}
                      onClick={() => excluir(c.id)}
                      disabled={pendingId === c.id}
                      className="px-2.5 py-1 text-xs"
                    >
                      {pendingId === c.id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
