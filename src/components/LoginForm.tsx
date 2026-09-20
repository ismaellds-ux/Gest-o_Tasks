"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, LogIn, ShieldCheck } from "lucide-react";
import { entrar } from "@/app/actions/auth";
import { Field, FieldError } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import type { UsuarioLogin } from "@/lib/types";

export function LoginForm({ usuarios }: { usuarios: UsuarioLogin[] }) {
  const [selecionado, setSelecionado] = useState<UsuarioLogin | null>(null);
  const [state, action, pending] = useActionState(entrar, undefined);

  if (!selecionado) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm text-fg-secondary">Quem é você?</p>
        {usuarios.length === 0 ? (
          <p className="text-center text-sm text-fg-muted">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {usuarios.map((u) => (
              <button
                key={u.usuario}
                type="button"
                onClick={() => setSelecionado(u)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm font-medium text-fg hover:border-violet/40 hover:bg-surface-light"
              >
                {u.is_admin && <ShieldCheck size={13} className="text-violet" />}
                {u.usuario}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="usuario" value={selecionado.usuario} />

      <button
        type="button"
        onClick={() => setSelecionado(null)}
        className="flex items-center gap-1 self-start text-xs text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={13} /> Trocar usuário
      </button>

      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm font-medium text-fg">
        {selecionado.is_admin && <ShieldCheck size={14} className="text-violet" />}
        {selecionado.usuario}
      </div>

      <Field label={selecionado.is_admin ? "Senha" : "PIN"}>
        <PasswordInput
          name="senha"
          required
          autoFocus
          inputMode={selecionado.is_admin ? undefined : "numeric"}
          pattern={selecionado.is_admin ? undefined : "[0-9]*"}
          maxLength={selecionado.is_admin ? undefined : 4}
          placeholder={selecionado.is_admin ? "••••••••" : "••••"}
        />
      </Field>

      <FieldError message={state?.error} />

      <Button type="submit" tone="success" disabled={pending} icon={<LogIn size={16} />} className="justify-center">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
