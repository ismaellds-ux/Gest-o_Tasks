import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { podeAcessarTasks2 } from "@/lib/domain/permissoes";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks2Page() {
  const supabase = await createClient();
  const [usuarioAtual, isAdmin] = await Promise.all([getUsuarioAtual(supabase), isAdminAtual(supabase)]);

  if (!podeAcessarTasks2(usuarioAtual, isAdmin)) {
    redirect("/tasks1");
  }

  const [{ tarefas, ultimoAdiamentoPorTarefa, conclusoes }, usuarios] = await Promise.all([
    getQuadroData(supabase, "tasks2"),
    listarUsuarios(supabase),
  ]);

  return (
    <QuadroBoard
      quadro="tasks2"
      tarefas={tarefas}
      ultimoAdiamentoPorTarefa={Object.fromEntries(ultimoAdiamentoPorTarefa)}
      conclusoes={conclusoes}
      usuarioAtual={usuarioAtual}
      isAdmin={isAdmin}
      usuarios={usuarios.map((u) => u.usuario)}
    />
  );
}
