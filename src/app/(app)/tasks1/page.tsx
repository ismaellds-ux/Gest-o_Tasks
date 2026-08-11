import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { podeCriarTasks1 } from "@/lib/domain/permissoes";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks1Page() {
  const supabase = await createClient();
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
