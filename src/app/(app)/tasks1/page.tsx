import { createClient } from "@/lib/supabase/server";
import { getQuadroData, getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual } from "@/lib/data/admin";
import { QuadroBoard } from "@/components/QuadroBoard";

export default async function Tasks1Page() {
  const supabase = await createClient();
  const [{ tarefas, ultimoAdiamentoPorTarefa, tarefasComConclusao, conclusoes }, usuarioAtual, isAdmin] =
    await Promise.all([getQuadroData(supabase, "tasks1"), getUsuarioAtual(supabase), isAdminAtual(supabase)]);

  return (
    <QuadroBoard
      quadro="tasks1"
      tarefas={tarefas}
      ultimoAdiamentoPorTarefa={Object.fromEntries(ultimoAdiamentoPorTarefa)}
      tarefasComConclusaoIds={Array.from(tarefasComConclusao)}
      conclusoes={conclusoes}
      usuarioAtual={usuarioAtual}
      isAdmin={isAdmin}
    />
  );
}
