import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { acessoTasks2LiberadoAtual, isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { podeAcessarTasks2 } from "@/lib/domain/permissoes";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks2Page() {
  const supabase = await createClient();
  const [usuarioAtual, isAdmin, acessoLiberado] = await Promise.all([
    getUsuarioAtual(supabase),
    isAdminAtual(supabase),
    acessoTasks2LiberadoAtual(supabase),
  ]);

  if (!podeAcessarTasks2(isAdmin, acessoLiberado)) {
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
      usuarios={usuarios.filter((u) => !u.is_admin).map((u) => u.usuario)}
      todosUsuarios={usuarios.map((u) => u.usuario)}
      podeCriarTarefa
    />
  );
}
