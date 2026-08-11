"use client";

import { useTransition } from "react";
import { Ban, CalendarClock, CheckCircle2, History, MapPin, Pencil, RotateCcw, Square, Trash2, User } from "lucide-react";
import { Modal } from "@/components/Modal";
import { StatusBadge, TipoBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { getStatus } from "@/lib/domain/status";
import { formatDateBR } from "@/lib/domain/date";
import { encerrarRecorrencia, reabrirTarefa } from "@/app/actions/tarefas";
import type { Adiamento, Tarefa } from "@/lib/types";

interface TaskDetailModalProps {
  tarefa: Tarefa;
  ultimoAdiamento?: Adiamento;
  isAdmin: boolean;
  onClose: () => void;
  onEditar: () => void;
  onAdiar: () => void;
  onConcluir: () => void;
  onExcluir: () => void;
  onCancelar: () => void;
  onHistorico: () => void;
}

export function TaskDetailModal({
  tarefa,
  ultimoAdiamento,
  isAdmin,
  onClose,
  onEditar,
  onAdiar,
  onConcluir,
  onExcluir,
  onCancelar,
  onHistorico,
}: TaskDetailModalProps) {
  const status = getStatus(tarefa);
  const ativa = status !== "concluida" && status !== "cancelada";
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function encerrar() {
    const formData = new FormData();
    formData.set("id", tarefa.id);
    startTransition(async () => {
      const result = await encerrarRecorrencia(formData);
      if (result.error) return showToast(result.error, "error");
      showToast("Recorrência encerrada.", "success");
      onClose();
    });
  }

  function reabrir() {
    const formData = new FormData();
    formData.set("id", tarefa.id);
    startTransition(async () => {
      const result = await reabrirTarefa(formData);
      if (result.error) return showToast(result.error, "error");
      showToast("Tarefa reaberta.", "success");
      onClose();
    });
  }

  return (
    <Modal title={tarefa.o_que} onClose={onClose} maxWidth="max-w-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <span className="label-caps">{tarefa.periodicidade}</span>
        </div>

        {tarefa.descricao && (
          <div>
            <span className="label-caps block">Descritivo da demanda</span>
            <p className="mt-0.5 text-sm text-fg-secondary">{tarefa.descricao}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-border-soft bg-surface-elevated p-4 text-sm">
          <div>
            <span className="label-caps block">Data</span>
            <span className="text-fg">{formatDateBR(tarefa.quando)}</span>
          </div>
          <div>
            <span className="label-caps block">Quem executa</span>
            <span className="flex items-center gap-1 text-fg">
              <User size={13} /> {tarefa.quem}
            </span>
          </div>
          {tarefa.atribuido_por && (
            <div>
              <span className="label-caps block">Atribuída por</span>
              <span className="text-fg">{tarefa.atribuido_por}</span>
            </div>
          )}
          <div>
            <span className="label-caps block">Demanda</span>
            <TipoBadge tipo={tarefa.tipo} />
          </div>
          {tarefa.tipo === "externa" && (
            <div className="col-span-2">
              <span className="label-caps block">Local</span>
              <span className="flex items-center gap-1 text-fg">
                <MapPin size={13} />
                {[tarefa.local, tarefa.cidade].filter(Boolean).join(" — ")}
              </span>
            </div>
          )}
          {tarefa.concluido_por && !tarefa.cancelada && (
            <div className="col-span-2">
              <span className="label-caps block">Concluída por (última vez)</span>
              <span className="text-green">{tarefa.concluido_por}</span>
            </div>
          )}
        </div>

        {tarefa.cancelada && (
          <div className="rounded-xl border border-coral/20 bg-coral-dim/40 p-4 text-sm">
            <span className="label-caps mb-1 block text-coral">Cancelada por {tarefa.cancelado_por}</span>
            <p className="text-fg-secondary">&ldquo;{tarefa.motivo_cancelamento}&rdquo;</p>
          </div>
        )}

        {ultimoAdiamento && (
          <div className="rounded-xl border border-amber/20 bg-amber-dim/40 p-4 text-sm">
            <span className="label-caps mb-1 block text-amber">Último adiamento</span>
            <p className="text-fg-secondary">&ldquo;{ultimoAdiamento.motivo}&rdquo;</p>
            <div className="mt-2 flex gap-4 text-xs text-fg-muted">
              <span>
                <span className="label-caps mr-1">Data original</span>
                {formatDateBR(ultimoAdiamento.data_anterior)}
              </span>
              <span>
                <span className="label-caps mr-1">Nova data</span>
                {formatDateBR(ultimoAdiamento.nova_data)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border-soft pt-4">
          {ativa && (
            <>
              <Button tone="success" icon={<CheckCircle2 size={15} />} onClick={onConcluir}>
                Concluir
              </Button>
              <Button tone="warn" icon={<CalendarClock size={15} />} onClick={onAdiar}>
                Adiar
              </Button>
            </>
          )}
          <Button tone="default" icon={<Pencil size={15} />} onClick={onEditar}>
            Editar
          </Button>
          {isAdmin && (
            <Button tone="ghost" icon={<History size={15} />} onClick={onHistorico}>
              Histórico
            </Button>
          )}
          {ativa && tarefa.periodicidade !== "unica" && (
            <Button tone="default" icon={<Square size={15} />} onClick={encerrar} disabled={pending}>
              Encerrar recorrência
            </Button>
          )}
          {tarefa.periodicidade === "unica" && tarefa.concluida && !tarefa.cancelada && (
            <Button tone="default" icon={<RotateCcw size={15} />} onClick={reabrir} disabled={pending}>
              Reabrir
            </Button>
          )}
          {isAdmin ? (
            <Button tone="danger" icon={<Trash2 size={15} />} onClick={onExcluir} className="ml-auto">
              Excluir
            </Button>
          ) : (
            ativa && (
              <Button tone="danger" icon={<Ban size={15} />} onClick={onCancelar} className="ml-auto">
                Cancelar
              </Button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
