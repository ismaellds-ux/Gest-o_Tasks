"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Ban, Info } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { cancelarTarefa } from "@/app/actions/tarefas";
import type { Tarefa } from "@/lib/types";

export function CancelarTarefaModal({ tarefa, onClose }: { tarefa: Tarefa; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await cancelarTarefa(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Tarefa cancelada.", "success");
      onClose();
    });
  }

  return (
    <Modal title="Cancelar tarefa" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={tarefa.id} />

        <div className="flex items-start gap-2 rounded-lg border border-violet/25 bg-violet-dim px-3 py-2.5 text-sm text-violet">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            Só administradores podem excluir tarefas permanentemente — entre em contato com um se for necessário.
            Você pode cancelar essa tarefa: ela some das ações ativas, mas o motivo fica registrado no histórico.
          </span>
        </div>

        <Field label="Motivo do cancelamento">
          <input
            name="motivo"
            required
            autoFocus
            className={inputClass}
            placeholder="Por que essa tarefa está sendo cancelada?"
          />
        </Field>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Voltar
          </Button>
          <Button type="submit" tone="danger" icon={<Ban size={16} />} disabled={pending}>
            {pending ? "Cancelando..." : "Cancelar tarefa"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
