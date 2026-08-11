import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Usuario } from "@/lib/types";

export async function isAdminAtual(supabase: SupabaseClient<Database>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from("usuarios").select("is_admin").eq("id", user.id).single();
  return data?.is_admin ?? false;
}

export async function listarUsuarios(supabase: SupabaseClient<Database>): Promise<Usuario[]> {
  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .order("is_admin", { ascending: false })
    .order("criado_em", { ascending: true });
  return data ?? [];
}
