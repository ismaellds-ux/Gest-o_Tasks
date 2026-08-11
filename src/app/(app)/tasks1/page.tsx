import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks1Page() {
  const supabase = await createClient();
  const [{ tarefas, ultimoAdiamentoPorTarefa, conclusoes }, usuarioAtual, isAdmin, usuarios] = await Promise.all([
    getQuadroData(supabase, "tasks1"),
    getUsuarioAtual(supabase),
    isAdminAtual(supabase),
    listarUsuarios(supabase),
  ]);

  return (
    <QuadroBoard
      quadro="tasks1"
      tarefas={tarefas}
      ultimoAdiamentoPorTarefa={Object.fromEntries(ultimoAdiamentoPorTarefa)}
      conclusoes={conclusoes}
      usuarioAtual={usuarioAtual}
      isAdmin={isAdmin}
      usuarios={usuarios.filter((u) => !u.is_admin).map((u) => u.usuario)}
    />
  );
}
