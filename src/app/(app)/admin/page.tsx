import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-8">
      <AdminUsuarios usuarios={usuarios} usuarioAtualId={user?.id ?? ""} />

      <div className="rounded-2xl border border-border bg-surface p-4">
        <Link
          href="/admin/checklist5s"
          className="flex items-center gap-2 text-sm font-medium text-fg hover:text-violet"
        >
          <ClipboardList size={16} />
          Gerenciar áreas e itens do Checklist 5S
        </Link>
      </div>
    </div>
  );
}
