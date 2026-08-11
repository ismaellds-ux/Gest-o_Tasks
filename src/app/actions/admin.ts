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
    return { error: `Não foi possível criar o usuário: ${error?.message ?? "erro desconhecido"}` };
  }

  if (tornarAdmin) {
    await adminClient.from("usuarios").update({ is_admin: true }).eq("id", data.user.id);
  }

  revalidatePath("/admin");
  return {};
}

export async function editarUsuario(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const novoUsuario = str(formData, "usuario");
  if (!id) return { error: "Usuário inválido." };
  if (!usuarioValido(novoUsuario)) {
    return { error: "Escolha um usuário com pelo menos 3 caracteres." };
  }

  const adminClient = createAdminClient();
  const { error: authError } = await adminClient.auth.admin.updateUserById(id, {
    email: emailSintetico(novoUsuario),
    user_metadata: { usuario: novoUsuario.trim() },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes("already been registered")) {
      return { error: "Esse nome de usuário já está em uso." };
    }
    return { error: `Não foi possível editar o usuário: ${authError.message}` };
  }

  const { error: dbError } = await adminClient
    .from("usuarios")
    .update({ usuario: novoUsuario.trim() })
    .eq("id", id);
  if (dbError) return { error: `Não foi possível editar o usuário: ${dbError.message}` };

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
  if (error) return { error: `Não foi possível excluir o usuário: ${error.message}` };

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
  if (error) return { error: `Não foi possível atualizar o usuário: ${error.message}` };

  revalidatePath("/admin");
  return {};
}

export async function definirJanelaTasks1(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const inicio = str(formData, "inicio");
  const fim = str(formData, "fim");
  if (!id) return { error: "Usuário inválido." };
  if ((inicio && !fim) || (!inicio && fim)) {
    return { error: "Informe as duas datas, ou deixe as duas em branco pra bloquear." };
  }
  if (inicio && fim && inicio > fim) {
    return { error: "A data inicial precisa ser antes da data final." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("usuarios")
    .update({ janela_tasks1_inicio: inicio || null, janela_tasks1_fim: fim || null })
    .eq("id", id);
  if (error) return { error: `Não foi possível salvar a janela: ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/tasks1");
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
  if (error) return { error: `Não foi possível redefinir a senha: ${error.message}` };

  return {};
}
