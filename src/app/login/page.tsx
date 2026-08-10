"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { entrar } from "@/app/actions/auth";
import { Field, FieldError, inputClass } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const [state, action, pending] = useActionState(entrar, undefined);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold text-fg">Tarefas</h1>
        <p className="mt-1 text-sm text-fg-secondary">Entre com seu usuário e senha.</p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <Field label="Usuário">
            <input name="usuario" required autoFocus className={inputClass} placeholder="seu.usuario" />
          </Field>
          <Field label="Senha">
            <PasswordInput name="senha" required placeholder="••••••••" />
          </Field>

          <FieldError message={state?.error} />

          <Button type="submit" tone="success" disabled={pending} icon={<LogIn size={16} />} className="justify-center">
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-fg-muted">
          Sem acesso? Peça a um administrador pra criar sua conta.
        </p>
      </div>
    </main>
  );
}
