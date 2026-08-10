"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { FieldError } from "@/components/Field";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { excluirTarefa } from "@/app/actions/tarefas";
import type { Tarefa } from "@/lib/types";

export function DeleteConfirmModal({ tarefa, onClose }: { tarefa: Tarefa; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await excluirTarefa(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Tarefa excluída.", "success");
      onClose();
    });
  }

  return (
    <Modal title="Excluir tarefa" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={tarefa.id} />
        <p className="text-sm text-fg-secondary">
          Tem certeza que quer excluir <span className="font-semibold text-fg">&ldquo;{tarefa.o_que}&rdquo;</span>?
          Essa ação não pode ser desfeita e vai apagar todo o histórico de adiamentos e conclusões dela.
        </p>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="danger" icon={<Trash2 size={16} />} disabled={pending}>
            {pending ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
