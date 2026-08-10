"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { ChipGroup } from "@/components/ChipGroup";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { concluirTarefa } from "@/app/actions/tarefas";
import type { Tarefa } from "@/lib/types";

interface ConcluirModalProps {
  tarefa: Tarefa;
  usuarioAtual: string;
  onClose: () => void;
}

type QuemConcluiu = "eu" | "outra";

export function ConcluirModal({ tarefa, usuarioAtual, onClose }: ConcluirModalProps) {
  const [quem, setQuem] = useState<QuemConcluiu>("eu");
  const [nomeOutra, setNomeOutra] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("concluido_por", quem === "eu" ? usuarioAtual : nomeOutra.trim());

    if (quem === "outra" && !nomeOutra.trim()) {
      setError("Informe o nome de quem concluiu.");
      return;
    }

    startTransition(async () => {
      const result = await concluirTarefa(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Tarefa concluída!", "success");
      onClose();
    });
  }

  return (
    <Modal title="Concluir tarefa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={tarefa.id} />

        <Field label="Quem concluiu?">
          <ChipGroup
            options={[
              { value: "eu", label: `Eu (${usuarioAtual})` },
              { value: "outra", label: "Outra pessoa" },
            ]}
            value={quem}
            onChange={setQuem}
          />
        </Field>

        {quem === "outra" && (
          <Field label="Nome de quem concluiu">
            <input
              value={nomeOutra}
              onChange={(e) => setNomeOutra(e.target.value)}
              className={inputClass}
              placeholder="Nome"
            />
          </Field>
        )}

        <FieldError message={error} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<CheckCircle2 size={16} />} disabled={pending}>
            {pending ? "Concluindo..." : "Concluir"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
