"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAtual } from "@/lib/data/admin";
import { emailSintetico, usuarioValido } from "@/lib/domain/username";

export interface ActionResult {
  error?: string;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function exigirAdmin(): Promise<{ error?: string; usuarioId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const admin = await isAdminAtual(supabase);
  if (!admin) return { error: "Acesso restrito a administradores." };

  return { usuarioId: user.id };
}

export async function criarUsuario(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const usuario = str(formData, "usuario");
  const senha = str(formData, "senha");
  const tornarAdmin = formData.get("is_admin") === "on";

  if (!usuarioValido(usuario)) {
    return { error: "Escolha um usuário com pelo menos 3 caracteres." };
  }
  if (senha.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email: emailSintetico(usuario),
    password: senha,
    email_confirm: true,
    user_metadata: { usuario: usuario.trim() },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already been registered")) {
      return { error: "Esse nome de usuário já está em uso." };
    }
    return { error: "Não foi possível criar o usuário." };
  }

  if (tornarAdmin) {
    await adminClient.from("usuarios").update({ is_admin: true }).eq("id", data.user.id);
  }

  revalidatePath("/admin");
  return {};
}

export async function excluirUsuario(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  if (!id) return { error: "Usuário inválido." };
  if (id === acesso.usuarioId) return { error: "Você não pode excluir a própria conta." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) return { error: "Não foi possível excluir o usuário." };

  revalidatePath("/admin");
  return {};
}

export async function alternarAdmin(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const novoValor = str(formData, "is_admin") === "true";
  if (!id) return { error: "Usuário inválido." };
  if (id === acesso.usuarioId) return { error: "Você não pode alterar seu próprio nível de acesso." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("usuarios").update({ is_admin: novoValor }).eq("id", id);
  if (error) return { error: "Não foi possível atualizar o usuário." };

  revalidatePath("/admin");
  return {};
}

export async function redefinirSenha(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const novaSenha = str(formData, "nova_senha");
  if (!id) return { error: "Usuário inválido." };
  if (novaSenha.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(id, { password: novaSenha });
  if (error) return { error: "Não foi possível redefinir a senha." };

  return {};
}
