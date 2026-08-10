"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { adiarTarefa } from "@/app/actions/tarefas";
import { motivoEhGenerico } from "@/lib/domain/motivoHeuristic";
import type { Tarefa } from "@/lib/types";

export function AdiarModal({ tarefa, onClose }: { tarefa: Tarefa; onClose: () => void }) {
  const [motivo, setMotivo] = useState("");
  const [novaData, setNovaData] = useState("");
  const [pedirConfirmacao, setPedirConfirmacao] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function submeter(formData: FormData) {
    startTransition(async () => {
      const result = await adiarTarefa(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Tarefa adiada!", "success");
      onClose();
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!pedirConfirmacao && motivoEhGenerico(motivo)) {
      setPedirConfirmacao(true);
      return;
    }

    submeter(formData);
  }

  return (
    <Modal title="Adiar tarefa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={tarefa.id} />

        <Field label="Data original">
          <input value={tarefa.quando} disabled className={`${inputClass} opacity-60`} />
        </Field>

        <Field label="Nova data">
          <input
            type="date"
            name="nova_data"
            required
            value={novaData}
            onChange={(e) => {
              setNovaData(e.target.value);
              setPedirConfirmacao(false);
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Motivo">
          <textarea
            name="motivo"
            required
            rows={3}
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              setPedirConfirmacao(false);
            }}
            className={inputClass}
            placeholder="Por que essa tarefa está sendo adiada?"
          />
        </Field>

        {pedirConfirmacao && (
          <div className="flex items-start gap-2 rounded-lg border border-amber/30 bg-amber-dim px-3 py-2.5 text-sm text-amber">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Esse motivo parece genérico. Confirma que quer adiar mesmo assim?</span>
          </div>
        )}

        <FieldError message={error} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="warn" icon={<CalendarClock size={16} />} disabled={pending}>
            {pending ? "Adiando..." : pedirConfirmacao ? "Confirmar adiamento" : "Adiar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
