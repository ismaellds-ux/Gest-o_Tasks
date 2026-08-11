"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CalendarClock, KeyRound, Pencil, Plus, ShieldCheck, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import {
  criarUsuario,
  editarUsuario,
  excluirUsuario,
  alternarAdmin,
  redefinirSenha,
  definirJanelaTasks1,
} from "@/app/actions/admin";
import { formatDateBR } from "@/lib/domain/date";
import type { Usuario } from "@/lib/types";

type ModalState =
  | { type: "novo" }
  | { type: "editar"; usuario: Usuario }
  | { type: "senha"; usuario: Usuario }
  | { type: "janela"; usuario: Usuario }
  | { type: "excluir"; usuario: Usuario };

export function AdminUsuarios({ usuarios, usuarioAtualId }: { usuarios: Usuario[]; usuarioAtualId: string }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const showToast = useToast();

  function toggleAdmin(usuario: Usuario) {
    const formData = new FormData();
    formData.set("id", usuario.id);
    formData.set("is_admin", String(!usuario.is_admin));
    setPendingId(usuario.id);
    startTransition(async () => {
      const result = await alternarAdmin(formData);
      setPendingId(null);
      if (result.error) return showToast(result.error, "error");
      showToast(usuario.is_admin ? "Admin removido." : "Usuário promovido a admin.", "success");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">Usuários</h2>
          <p className="text-sm text-fg-secondary">Só administradores criam novas contas de acesso.</p>
        </div>
        <Button tone="success" icon={<Plus size={16} />} onClick={() => setModal({ type: "novo" })} className="shrink-0 self-start">
          Novo usuário
        </Button>
      </div>

      <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border-soft text-left">
            <tr>
              <th className="label-caps px-4 py-3 font-normal">Usuário</th>
              <th className="label-caps px-4 py-3 font-normal">Criado em</th>
              <th className="label-caps px-4 py-3 font-normal">Nível</th>
              <th className="label-caps px-4 py-3 font-normal">Cria na Tasks1</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border-soft last:border-0">
                <td className="px-4 py-3 font-medium text-fg">
                  {u.usuario}
                  {u.id === usuarioAtualId && <span className="ml-1.5 font-normal text-fg-muted">(você)</span>}
                </td>
                <td className="px-4 py-3 text-fg-muted">{u.criado_em.slice(0, 10).split("-").reverse().join("/")}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      u.is_admin ? "bg-violet-dim text-violet" : "bg-surface-light text-fg-secondary"
                    }`}
                  >
                    {u.is_admin ? "Admin" : "Comum"}
                  </span>
                </td>
                <td className="px-4 py-3 text-fg-secondary">
                  {u.is_admin
                    ? "Sempre"
                    : u.janela_tasks1_inicio && u.janela_tasks1_fim
                      ? `${formatDateBR(u.janela_tasks1_inicio)} – ${formatDateBR(u.janela_tasks1_fim)}`
                      : "Só admin"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {!u.is_admin && (
                      <Button
                        tone="ghost"
                        icon={<CalendarClock size={13} />}
                        onClick={() => setModal({ type: "janela", usuario: u })}
                        className="px-2.5 py-1.5 text-xs"
                      >
                        Janela Tasks1
                      </Button>
                    )}
                    {u.id !== usuarioAtualId && (
                      <>
                        <Button
                          tone="ghost"
                          icon={<Pencil size={13} />}
                          onClick={() => setModal({ type: "editar", usuario: u })}
                          className="px-2.5 py-1.5 text-xs"
                        >
                          Editar
                        </Button>
                        <Button
                          tone="ghost"
                          icon={u.is_admin ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                          onClick={() => toggleAdmin(u)}
                          disabled={pendingId === u.id}
                          className="px-2.5 py-1.5 text-xs"
                        >
                          {u.is_admin ? "Remover admin" : "Tornar admin"}
                        </Button>
                      </>
                    )}
                    <Button
                      tone="ghost"
                      icon={<KeyRound size={13} />}
                      onClick={() => setModal({ type: "senha", usuario: u })}
                      className="px-2.5 py-1.5 text-xs"
                    >
                      Redefinir senha
                    </Button>
                    {u.id !== usuarioAtualId && (
                      <Button
                        tone="danger"
                        icon={<Trash2 size={13} />}
                        onClick={() => setModal({ type: "excluir", usuario: u })}
                        className="px-2.5 py-1.5 text-xs"
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === "novo" && <NovoUsuarioModal onClose={() => setModal(null)} />}
      {modal?.type === "editar" && <EditarUsuarioModal usuario={modal.usuario} onClose={() => setModal(null)} />}
      {modal?.type === "senha" && <RedefinirSenhaModal usuario={modal.usuario} onClose={() => setModal(null)} />}
      {modal?.type === "janela" && <JanelaTasks1Modal usuario={modal.usuario} onClose={() => setModal(null)} />}
      {modal?.type === "excluir" && <ExcluirUsuarioModal usuario={modal.usuario} onClose={() => setModal(null)} />}
    </div>
  );
}

function NovoUsuarioModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await criarUsuario(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Usuário criado!", "success");
      onClose();
    });
  }

  return (
    <Modal title="Novo usuário" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Usuário">
          <input name="usuario" required autoFocus className={inputClass} placeholder="nome.usuario" />
        </Field>
        <Field label="Senha inicial">
          <PasswordInput name="senha" required minLength={6} placeholder="mínimo 6 caracteres" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-fg-secondary">
          <input type="checkbox" name="is_admin" className="h-4 w-4 rounded border-border" />
          Tornar administrador
        </label>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<UserPlus size={16} />} disabled={pending}>
            {pending ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditarUsuarioModal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", usuario.id);
    startTransition(async () => {
      const result = await editarUsuario(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Usuário atualizado!", "success");
      onClose();
    });
  }

  return (
    <Modal title={`Editar ${usuario.usuario}`} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Usuário">
          <input name="usuario" required autoFocus defaultValue={usuario.usuario} className={inputClass} placeholder="nome.usuario" />
        </Field>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<Pencil size={16} />} disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function RedefinirSenhaModal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", usuario.id);
    startTransition(async () => {
      const result = await redefinirSenha(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Senha redefinida!", "success");
      onClose();
    });
  }

  return (
    <Modal title={`Redefinir senha de ${usuario.usuario}`} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nova senha">
          <PasswordInput name="nova_senha" required minLength={6} autoFocus placeholder="mínimo 6 caracteres" />
        </Field>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="warn" icon={<KeyRound size={16} />} disabled={pending}>
            {pending ? "Salvando..." : "Redefinir"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function JanelaTasks1Modal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", usuario.id);
    startTransition(async () => {
      const result = await definirJanelaTasks1(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Janela atualizada!", "success");
      onClose();
    });
  }

  return (
    <Modal title={`Janela na Tasks1 — ${usuario.usuario}`} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-fg-secondary">
          Por padrão só administradores criam tarefas na Tasks1. Defina um período pra liberar a criação
          pra {usuario.usuario} nessa janela. Deixe os dois campos em branco pra bloquear de novo.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="De">
            <input type="date" name="inicio" defaultValue={usuario.janela_tasks1_inicio ?? ""} className={inputClass} />
          </Field>
          <Field label="Até">
            <input type="date" name="fim" defaultValue={usuario.janela_tasks1_fim ?? ""} className={inputClass} />
          </Field>
        </div>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<CalendarClock size={16} />} disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ExcluirUsuarioModal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await excluirUsuario(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Usuário excluído.", "success");
      onClose();
    });
  }

  return (
    <Modal title="Excluir usuário" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={usuario.id} />
        <p className="text-sm text-fg-secondary">
          Tem certeza que quer excluir o acesso de <span className="font-semibold text-fg">{usuario.usuario}</span>?
          Essa pessoa perde o login imediatamente.
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
