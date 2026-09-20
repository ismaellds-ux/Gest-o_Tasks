"use client";

import { useState, useTransition, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { alterarMinhaSenha } from "@/app/actions/auth";

export function TrocarSenhaModal({ isAdmin, onClose }: { isAdmin: boolean; onClose: () => void }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await alterarMinhaSenha(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast(isAdmin ? "Senha alterada!" : "PIN alterado!", "success");
      onClose();
    });
  }

  return (
    <Modal title={isAdmin ? "Trocar minha senha" : "Trocar meu PIN"} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-fg-secondary">
          Só você vai saber {isAdmin ? "essa senha nova" : "esse PIN novo"} — nem o administrador tem acesso a ele.
        </p>
        <Field label={isAdmin ? "Nova senha" : "Novo PIN"}>
          <PasswordInput
            name="nova_senha"
            required
            autoFocus
            inputMode={isAdmin ? undefined : "numeric"}
            pattern={isAdmin ? undefined : "[0-9]*"}
            maxLength={isAdmin ? undefined : 4}
            minLength={isAdmin ? 6 : 4}
            placeholder={isAdmin ? "mínimo 6 caracteres" : "4 números"}
          />
        </Field>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<KeyRound size={16} />} disabled={pending}>
            {pending ? "Salvando..." : isAdmin ? "Trocar senha" : "Trocar PIN"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
