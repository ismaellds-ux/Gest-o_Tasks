import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminAtual } from "@/lib/data/admin";
import { getLinkFormulario, listarTodasAreasComItens } from "@/lib/data/checklist5s";
import { ChecklistAdmin } from "@/components/checklist5s/ChecklistAdmin";

export default async function AdminChecklist5sPage() {
  const supabase = await createClient();
  const admin = await isAdminAtual(supabase);
  if (!admin) redirect("/tasks1");

  const [areas, linkFormulario] = await Promise.all([listarTodasAreasComItens(supabase), getLinkFormulario(supabase)]);

  return <ChecklistAdmin areas={areas} linkFormulario={linkFormulario} />;
}
