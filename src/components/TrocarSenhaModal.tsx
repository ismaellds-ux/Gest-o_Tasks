"use client";

import { useState, useTransition, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Field, FieldError } from "@/components/Field";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { alterarMinhaSenha } from "@/app/actions/auth";

export function TrocarSenhaModal({ onClose }: { onClose: () => void }) {
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
      showToast("Senha alterada!", "success");
      onClose();
    });
  }

  return (
    <Modal title="Trocar minha senha" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-fg-secondary">
          Só você vai saber essa senha nova — nem o administrador tem acesso a ela.
        </p>
        <Field label="Nova senha">
          <PasswordInput name="nova_senha" required minLength={6} autoFocus placeholder="mínimo 6 caracteres" />
        </Field>

        <FieldError message={error} />

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="success" icon={<KeyRound size={16} />} disabled={pending}>
            {pending ? "Salvando..." : "Trocar senha"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
