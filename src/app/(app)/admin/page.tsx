import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { AdminUsuarios } from "@/components/AdminUsuarios";

export default async function AdminPage() {
  const supabase = await createClient();
  const admin = await isAdminAtual(supabase);
  if (!admin) redirect("/tasks1");

  const usuarios = await listarUsuarios(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AdminUsuarios usuarios={usuarios} usuarioAtualId={user?.id ?? ""} />;
}
