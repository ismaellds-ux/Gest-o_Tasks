"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Field, FieldError, inputClass } from "@/components/Field";
import { ChipGroup } from "@/components/ChipGroup";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { registrarExecucao } from "@/app/actions/checklist5s";
import { TURNOS } from "@/lib/domain/checklist5s";
import type { RespostaChecklist, Turno } from "@/lib/types";
import type { AreaComItens } from "@/lib/data/checklist5s";

const RESPOSTA_COR: Record<RespostaChecklist, string> = {
  ok: "border-green/40 bg-green-dim text-green",
  problema: "border-coral/40 bg-coral-dim text-coral",
  nao_aplica: "border-border-soft bg-surface-light text-fg-secondary",
};

export function ChecklistForm({ areas }: { areas: AreaComItens[] }) {
  const [turno, setTurno] = useState<Turno>("manha");
  const [respostas, setRespostas] = useState<Record<string, RespostaChecklist>>({});
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();
  const router = useRouter();

  const totalItens = areas.reduce((acc, a) => acc + a.itens.length, 0);
  const respondidos = Object.keys(respostas).length;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (respondidos < totalItens) {
      setError("Responda todos os itens antes de salvar.");
      return;
    }

    const formData = new FormData();
    formData.set("turno", turno);
    for (const [itemId, resposta] of Object.entries(respostas)) {
      formData.set(`resposta:${itemId}`, resposta);
      if (observacoes[itemId]) formData.set(`observacao:${itemId}`, observacoes[itemId]);
    }

    startTransition(async () => {
      const result = await registrarExecucao(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Checklist registrado!", "success");
      router.push("/checklist5s");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <Field label="Turno">
          <ChipGroup options={TURNOS} value={turno} onChange={setTurno} />
        </Field>
      </div>

      {areas.map((area) => (
        <div key={area.id} className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-display mb-3 text-base font-semibold text-fg">{area.nome}</h2>
          <div className="flex flex-col gap-4">
            {area.itens.map((item) => (
              <div key={item.id} className="border-t border-border-soft pt-4 first:border-0 first:pt-0">
                <p className="mb-2 text-sm text-fg">{item.pergunta}</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["ok", item.resposta_ok_texto],
                      ["problema", item.resposta_problema_texto],
                      ["nao_aplica", item.resposta_na_texto],
                    ] as [RespostaChecklist, string][]
                  ).map(([valor, texto]) => {
                    const active = respostas[item.id] === valor;
                    return (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => setRespostas((r) => ({ ...r, [item.id]: valor }))}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                          active ? RESPOSTA_COR[valor] : "border-border bg-surface-elevated text-fg-secondary hover:text-fg"
                        }`}
                      >
                        {texto}
                      </button>
                    );
                  })}
                </div>
                {respostas[item.id] === "problema" && (
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Observação (opcional)"
                    value={observacoes[item.id] ?? ""}
                    onChange={(e) => setObservacoes((o) => ({ ...o, [item.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <FieldError message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
        <span className="text-sm text-fg-secondary">
          {respondidos} de {totalItens} respondidos
        </span>
        <Button type="submit" tone="success" icon={<Save size={16} />} disabled={pending}>
          {pending ? "Salvando..." : "Salvar checklist"}
        </Button>
      </div>
    </form>
  );
}
