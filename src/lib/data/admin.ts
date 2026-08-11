import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { podeCriarTasks1 } from "@/lib/domain/permissoes";
import type { Database, Usuario } from "@/lib/types";

export async function isAdminAtual(supabase: SupabaseClient<Database>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from("usuarios").select("is_admin").eq("id", user.id).single();
  return data?.is_admin ?? false;
}

export async function podeCriarTasks1Atual(supabase: SupabaseClient<Database>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("usuarios")
    .select("is_admin, janela_tasks1_inicio, janela_tasks1_fim")
    .eq("id", user.id)
    .single();
  if (!data) return false;

  return podeCriarTasks1(data.is_admin, data.janela_tasks1_inicio, data.janela_tasks1_fim);
}

export async function listarUsuarios(supabase: SupabaseClient<Database>): Promise<Usuario[]> {
  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .order("is_admin", { ascending: false })
    .order("criado_em", { ascending: true });
  return data ?? [];
}
