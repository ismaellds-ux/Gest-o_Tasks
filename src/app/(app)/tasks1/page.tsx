import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { redirect } from "next/navigation";
import { acessoTasks1LiberadoAtual, acessoTasks2LiberadoAtual, isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { podeAcessarTasks1, podeAcessarTasks2, podeCriarTasks1 } from "@/lib/domain/permissoes";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks1Page() {
  const supabase = await createClient();

  const [admin, acesso1, acesso2] = await Promise.all([
    isAdminAtual(supabase),
    acessoTasks1LiberadoAtual(supabase),
    acessoTasks2LiberadoAtual(supabase),
  ]);
  if (!podeAcessarTasks1(admin, acesso1)) {
    redirect(podeAcessarTasks2(admin, acesso2) ? "/tasks2" : "/checklist5s");
  }

  const [{ tarefas, ultimoAdiamentoPorTarefa, conclusoes }, usuarioAtual, isAdmin, usuarios] = await Promise.all([
    getQuadroData(supabase, "tasks1"),
    getUsuarioAtual(supabase),
    isAdminAtual(supabase),
    listarUsuarios(supabase),
  ]);

  const minhaLinha = usuarios.find((u) => u.usuario === usuarioAtual);
  const podeCriar = podeCriarTasks1(
    isAdmin,
    minhaLinha?.janela_tasks1_inicio ?? null,
    minhaLinha?.janela_tasks1_fim ?? null
  );

  return (
    <QuadroBoard
      quadro="tasks1"
      tarefas={tarefas}
      ultimoAdiamentoPorTarefa={Object.fromEntries(ultimoAdiamentoPorTarefa)}
      conclusoes={conclusoes}
      usuarioAtual={usuarioAtual}
      isAdmin={isAdmin}
      usuarios={usuarios.filter((u) => !u.is_admin).map((u) => u.usuario)}
      todosUsuarios={usuarios.map((u) => u.usuario)}
      podeCriarTarefa={podeCriar}
    />
  );
}
