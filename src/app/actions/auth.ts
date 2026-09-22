"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailSintetico } from "@/lib/domain/username";

export interface AuthFormState {
  error?: string;
}

export async function entrar(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const usuario = String(formData.get("usuario") ?? "");
  const senha = String(formData.get("senha") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailSintetico(usuario),
    password: senha,
  });

  if (error) {
    return { error: "Usuário ou senha inválidos." };
  }

  redirect("/tasks1");
}

export interface ActionResult {
  error?: string;
}

export async function alterarMinhaSenha(formData: FormData): Promise<ActionResult> {
  const novaSenha = String(formData.get("nova_senha") ?? "");
  if (novaSenha.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return { error: "Não foi possível trocar a senha." };

  return {};
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
