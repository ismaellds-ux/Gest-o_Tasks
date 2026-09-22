"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import {
  criarArea,
  editarArea,
  alternarAreaAtiva,
  excluirArea,
  criarItem,
  editarItem,
  alternarItemAtivo,
  excluirItem,
} from "@/app/actions/checklist5s";
import type { AreaComItens } from "@/lib/data/checklist5s";
import type { ChecklistArea, ChecklistItem } from "@/lib/types";

type ModalState =
  | { type: "nova_area" }
  | { type: "editar_area"; area: ChecklistArea }
  | { type: "excluir_area"; area: ChecklistArea }
  | { type: "novo_item"; areaId: string }
  | { type: "editar_item"; item: ChecklistItem }
  | { type: "excluir_item"; item: ChecklistItem };

export function ChecklistAdmin({ areas }: { areas: AreaComItens[] }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const showToast = useToast();

  function toggleAreaAtiva(area: ChecklistArea) {
    const formData = new FormData();
    formData.set("id", area.id);
    formData.set("ativo", String(!area.ativo));
    setPendingId(area.id);
    startTransition(async () => {
      const result = await alternarAreaAtiva(formData);
      setPendingId(null);
      if (result.error) return showToast(result.error, "error");
      showToast(area.ativo ? "Área desativada." : "Área ativada.", "success");
    });
  }

  function toggleItemAtivo(item: ChecklistItem) {
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("ativo", String(!item.ativo));
    setPendingId(item.id);
    startTransition(async () => {
      const result = await alternarItemAtivo(formData);
      setPendingId(null);
      if (result.error) return showToast(result.error, "error");
      showToast(item.ativo ? "Item desativado." : "Item ativado.", "success");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">Checklist 5S — áreas e itens</h2>
          <p className="text-sm text-fg-secondary">Desative em vez de excluir se já tiver histórico registrado.</p>
        </div>
        <Button tone="success" icon={<Plus size={16} />} onClick={() => setModal({ type: "nova_area" })} className="shrink-0 self-start">
          Nova área
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {areas.map((area) => (
          <div key={area.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-fg">{area.nome}</h3>
                {!area.ativo && (
                  <span className="inline-flex items-center rounded-lg bg-surface-light px-2 py-0.5 text-xs text-fg-muted">
                    Inativa
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button tone="ghost" icon={<Pencil size={13} />} onClick={() => setModal({ type: "editar_area", area })} className="px-2.5 py-1.5 text-xs">
                  Editar
                </Button>
                <Button
                  tone="ghost"
                  icon={<Power size={13} />}
                  onClick={() => toggleAreaAtiva(area)}
                  disabled={pendingId === area.id}
                  className="px-2.5 py-1.5 text-xs"
                >
                  {area.ativo ? "Desativar" : "Ativar"}
                </Button>
                <Button tone="danger" icon={<Trash2 size={13} />} onClick={() => setModal({ type: "excluir_area", area })} className="px-2.5 py-1.5 text-xs">
                  Excluir
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {area.itens.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-soft bg-surface-elevated px-3 py-2">
                  <div>
                    <p className="text-sm text-fg">{item.pergunta}</p>
                    <p className="text-xs text-fg-muted">
                      {item.resposta_ok_texto} / {item.resposta_problema_texto} / {item.resposta_na_texto}
                      {item.permite_tarefa_automatica && " · gera tarefa"}
                      {!item.ativo && " · inativo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button tone="ghost" icon={<Pencil size={13} />} onClick={() => setModal({ type: "editar_item", item })} className="px-2 py-1 text-xs">
                      Editar
                    </Button>
                    <Button
                      tone="ghost"
                      icon={<Power size={13} />}
                      onClick={() => toggleItemAtivo(item)}
                      disabled={pendingId === item.id}
                      className="px-2 py-1 text-xs"
                    >
                      {item.ativo ? "Desativar" : "Ativar"}
                    </Button>
                    <Button tone="danger" icon={<Trash2 size={13} />} onClick={() => setModal({ type: "excluir_item", item })} className="px-2 py-1 text-xs">
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
              {area.itens.length === 0 && <p className="text-sm text-fg-muted">Nenhum item nessa área ainda.</p>}
            </div>

            <Button
              tone="ghost"
              icon={<Plus size={14} />}
              onClick={() => setModal({ type: "novo_item", areaId: area.id })}
              className="mt-3 px-2.5 py-1.5 text-xs"
            >
              Novo item
            </Button>
          </div>
        ))}
        {areas.length === 0 && <p className="text-sm text-fg-muted">Nenhuma área cadastrada ainda.</p>}
      </div>

      {modal?.type === "nova_area" && <AreaModal onClose={() => setModal(null)} />}
      {modal?.type === "editar_area" && <AreaModal area={modal.area} onClose={() => setModal(null)} />}
      {modal?.type === "excluir_area" && <ExcluirAreaModal area={modal.area} onClose={() => setModal(null)} />}
      {modal?.type === "novo_item" && <ItemModal areaId={modal.areaId} onClose={() => setModal(null)} />}
      {modal?.type === "editar_item" && <ItemModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === "excluir_item" && <ExcluirItemModal item={modal.item} onClose={() => setModal(null)} />}
    </div>
  );
}

function AreaModal({ area, onClose }: { area?: ChecklistArea; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (area) formData.set("id", area.id);
    startTransition(async () => {
      const result = area ? await editarArea(formData) : await criarArea(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(area ? "Área atualizada!" : "Área criada!", "success");
      onClose();
    });
  }

  return (
    <Modal title={area ? "Editar área" : "Nova área"} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome da área">
          <input name="nome" required autoFocus defaultValue={area?.nome} className={inputClass} placeholder="ex.: Câmeras" />
        </Field>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ExcluirAreaModal({ area, onClose }: { area: ChecklistArea; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await excluirArea(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Área excluída.", "success");
      onClose();
    });
  }

  return (
    <Modal title="Excluir área" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={area.id} />
        <p className="text-sm text-fg-secondary">
          Tem certeza que quer excluir <span className="font-semibold text-fg">{area.nome}</span> e todos os itens dela?
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

function ItemModal({ item, areaId, onClose }: { item?: ChecklistItem; areaId?: string; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (item) formData.set("id", item.id);
    if (areaId) formData.set("area_id", areaId);
    startTransition(async () => {
      const result = item ? await editarItem(formData) : await criarItem(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(item ? "Item atualizado!" : "Item criado!", "success");
      onClose();
    });
  }

  return (
    <Modal title={item ? "Editar item" : "Novo item"} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Pergunta">
          <input
            name="pergunta"
            required
            autoFocus
            defaultValue={item?.pergunta}
            className={inputClass}
            placeholder="ex.: Câmera está organizada, limpa?"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Texto do OK">
            <input name="resposta_ok_texto" defaultValue={item?.resposta_ok_texto ?? "Sim"} className={inputClass} />
          </Field>
          <Field label="Texto do problema">
            <input name="resposta_problema_texto" defaultValue={item?.resposta_problema_texto ?? "Não"} className={inputClass} />
          </Field>
          <Field label="Texto do N/A">
            <input name="resposta_na_texto" defaultValue={item?.resposta_na_texto ?? "Não se aplica"} className={inputClass} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-fg-secondary">
          <input
            type="checkbox"
            name="permite_tarefa_automatica"
            defaultChecked={item?.permite_tarefa_automatica ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Gerar tarefa automática quando marcado como problema
        </label>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ExcluirItemModal({ item, onClose }: { item: ChecklistItem; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await excluirItem(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Item excluído.", "success");
      onClose();
    });
  }

  return (
    <Modal title="Excluir item" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={item.id} />
        <p className="text-sm text-fg-secondary">
          Tem certeza que quer excluir <span className="font-semibold text-fg">{item.pergunta}</span>?
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
