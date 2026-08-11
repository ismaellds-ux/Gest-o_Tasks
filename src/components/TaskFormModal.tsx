"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { ChipGroup } from "@/components/ChipGroup";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { criarTarefa, editarTarefa } from "@/app/actions/tarefas";
import type { Periodicidade, Quadro, Tarefa, Tipo } from "@/lib/types";

interface TaskFormModalProps {
  quadro: Quadro;
  tarefa?: Tarefa;
  usuarios: string[];
  onClose: () => void;
}

const TIPO_OPTIONS: { value: Tipo; label: string }[] = [
  { value: "interna", label: "Interna" },
  { value: "externa", label: "Externa" },
];

const PERIODICIDADE_OPTIONS: { value: Periodicidade; label: string }[] = [
  { value: "unica", label: "Única" },
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
];

export function TaskFormModal({ quadro, tarefa, usuarios, onClose }: TaskFormModalProps) {
  const [tipo, setTipo] = useState<Tipo>(tarefa?.tipo ?? "interna");
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>(tarefa?.periodicidade ?? "unica");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  const quemInicial =
    tarefa?.quem ?? (quadro === "tasks2" && usuarios.includes("Felipe") ? "Felipe" : "");
  const quemForaDaLista = tarefa?.quem && !usuarios.includes(tarefa.quem) ? tarefa.quem : null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = tarefa ? await editarTarefa(formData) : await criarTarefa(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(tarefa ? "Tarefa atualizada!" : "Tarefa criada!", "success");
      onClose();
    });
  }

  return (
    <Modal title={tarefa ? "Editar tarefa" : "Nova tarefa"} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="quadro" value={quadro} />
        <input type="hidden" name="tipo" value={tipo} />
        <input type="hidden" name="periodicidade" value={periodicidade} />
        {tarefa && <input type="hidden" name="id" value={tarefa.id} />}

        <Field label="Status da tarefa">
          <ChipGroup options={TIPO_OPTIONS} value={tipo} onChange={setTipo} />
        </Field>

        <Field label="O que">
          <input name="o_que" required defaultValue={tarefa?.o_que} className={inputClass} placeholder="Título da tarefa" />
        </Field>

        <Field label="Descrição">
          <textarea
            name="descricao"
            defaultValue={tarefa?.descricao ?? ""}
            rows={3}
            className={inputClass}
            placeholder="Detalhes opcionais"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Quando">
            <input type="date" name="quando" required defaultValue={tarefa?.quando} className={inputClass} />
          </Field>
          <Field label="Quem">
            <select name="quem" required defaultValue={quemInicial} className={inputClass}>
              <option value="" disabled>
                Selecione
              </option>
              {quemForaDaLista && (
                <option value={quemForaDaLista}>{quemForaDaLista} (fora da lista atual)</option>
              )}
              {usuarios.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {tipo === "externa" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Local">
              <input name="local" defaultValue={tarefa?.local ?? ""} className={inputClass} placeholder="Local" />
            </Field>
            <Field label="Cidade">
              <input name="cidade" defaultValue={tarefa?.cidade ?? ""} className={inputClass} placeholder="Cidade" />
            </Field>
          </div>
        )}

        <Field label="Periodicidade">
          <ChipGroup options={PERIODICIDADE_OPTIONS} value={periodicidade} onChange={setPeriodicidade} />
        </Field>

        <FieldError message={error} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<Save size={16} />} disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
