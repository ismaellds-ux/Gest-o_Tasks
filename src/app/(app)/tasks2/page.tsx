import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual, listarUsuarios } from "@/lib/data/admin";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks2Page() {
  const supabase = await createClient();
  const [{ tarefas, ultimoAdiamentoPorTarefa, tarefasComConclusao, conclusoes }, usuarioAtual, isAdmin, usuarios] =
    await Promise.all([
      getQuadroData(supabase, "tasks2"),
      getUsuarioAtual(supabase),
      isAdminAtual(supabase),
      listarUsuarios(supabase),
    ]);

  return (
    <QuadroBoard
      quadro="tasks2"
      tarefas={tarefas}
      ultimoAdiamentoPorTarefa={Object.fromEntries(ultimoAdiamentoPorTarefa)}
      tarefasComConclusaoIds={Array.from(tarefasComConclusao)}
      conclusoes={conclusoes}
      usuarioAtual={usuarioAtual}
      isAdmin={isAdmin}
      usuarios={usuarios.map((u) => u.usuario)}
    />
  );
}
