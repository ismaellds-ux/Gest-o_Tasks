"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { FieldError } from "@/components/Field";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { excluirExecucao } from "@/app/actions/checklist5s";

export function ChecklistDetalheAcoes({ execucaoId, isAdmin }: { execucaoId: string; isAdmin: boolean }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();
  const router = useRouter();

  function excluir() {
    const formData = new FormData();
    formData.set("id", execucaoId);
    startTransition(async () => {
      const result = await excluirExecucao(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Checklist excluído.", "success");
      router.push("/checklist5s");
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/checklist5s/${execucaoId}/editar`}>
          <Button tone="default" icon={<Pencil size={14} />} className="px-2.5 py-1.5 text-xs">
            Editar
          </Button>
        </Link>
        {isAdmin && (
          <Button
            tone="danger"
            icon={<Trash2 size={14} />}
            onClick={() => setConfirmando(true)}
            className="px-2.5 py-1.5 text-xs"
          >
            Excluir
          </Button>
        )}
      </div>
      {confirmando && (
        <Modal title="Excluir checklist" onClose={() => setConfirmando(false)} maxWidth="max-w-sm">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-fg-secondary">
              Tem certeza que quer excluir esse checklist? As respostas se perdem — as tarefas já geradas a partir
              dele continuam existindo.
            </p>
            <FieldError message={error} />
            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" tone="ghost" onClick={() => setConfirmando(false)}>
                Cancelar
              </Button>
              <Button type="button" tone="danger" icon={<Trash2 size={16} />} onClick={excluir} disabled={pending}>
                {pending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
