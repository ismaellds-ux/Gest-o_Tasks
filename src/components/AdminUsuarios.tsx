"use client";

import { useState, useTransition, type FormEvent } from "react";
import { KeyRound, Plus, ShieldCheck, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError, inputClass } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { criarUsuario, excluirUsuario, alternarAdmin, redefinirSenha } from "@/app/actions/admin";
import type { Usuario } from "@/lib/types";

type ModalState =
  | { type: "novo" }
  | { type: "senha"; usuario: Usuario }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-fg">Usuários</h2>
          <p className="text-sm text-fg-secondary">Só administradores criam novas contas de acesso.</p>
        </div>
        <Button tone="success" icon={<Plus size={16} />} onClick={() => setModal({ type: "novo" })}>
          Novo usuário
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border-soft text-left">
            <tr>
              <th className="label-caps px-4 py-3 font-normal">Usuário</th>
              <th className="label-caps px-4 py-3 font-normal">Criado em</th>
              <th className="label-caps px-4 py-3 font-normal">Nível</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border-soft last:border-0">
                <td className="px-4 py-3 font-medium text-fg">{u.usuario}</td>
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
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {u.id !== usuarioAtualId && (
                      <Button
                        tone="ghost"
                        icon={u.is_admin ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                        onClick={() => toggleAdmin(u)}
                        disabled={pendingId === u.id}
                        className="px-2.5 py-1.5 text-xs"
                      >
                        {u.is_admin ? "Remover admin" : "Tornar admin"}
                      </Button>
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
      {modal?.type === "senha" && <RedefinirSenhaModal usuario={modal.usuario} onClose={() => setModal(null)} />}
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
