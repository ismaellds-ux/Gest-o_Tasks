import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStatus } from "@/lib/domain/status";
import { USUARIO_TODOS } from "@/lib/domain/permissoes";
import type { Adiamento, Conclusao, Quadro, Tarefa } from "@/lib/types";

export interface ConclusaoComTarefa extends Conclusao {
  tarefas: { o_que: string } | null;
}

export interface QuadroData {
  tarefas: Tarefa[];
  ultimoAdiamentoPorTarefa: Map<string, Adiamento>;
  conclusoes: ConclusaoComTarefa[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getQuadroData(supabase: SupabaseClient<any>, quadro: Quadro): Promise<QuadroData> {
  const [{ data: tarefas }, { data: conclusoesRows }] = await Promise.all([
    supabase.from("tarefas").select("*").eq("quadro", quadro).order("quando", { ascending: true }),
    supabase
      .from("conclusoes")
      .select(
        "id, tarefa_id, data_conclusao, data_prevista, descricao_snapshot, tipo_snapshot, local_snapshot, cidade_snapshot, concluido_por, tarefas!inner(o_que, quadro)",
      )
      .eq("tarefas.quadro", quadro)
      .order("data_conclusao", { ascending: false }),
  ]);

  const tarefaIds = (tarefas ?? []).map((t: Tarefa) => t.id);

  const { data: adiamentos } =
    tarefaIds.length > 0
      ? await supabase
          .from("adiamentos")
          .select("*")
          .in("tarefa_id", tarefaIds)
          .order("data_registro", { ascending: false })
      : { data: [] as Adiamento[] };

  const ultimoAdiamentoPorTarefa = new Map<string, Adiamento>();
  for (const a of adiamentos ?? []) {
    if (!ultimoAdiamentoPorTarefa.has(a.tarefa_id)) {
      ultimoAdiamentoPorTarefa.set(a.tarefa_id, a);
    }
  }

  const conclusoes = (conclusoesRows ?? []) as unknown as ConclusaoComTarefa[];

  return {
    tarefas: (tarefas ?? []) as Tarefa[],
    ultimoAdiamentoPorTarefa,
    conclusoes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUsuarioAtual(supabase: SupabaseClient<any>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (user?.user_metadata?.usuario as string | undefined) ?? "desconhecido";
}

export interface MinhasTarefasResumo {
  total: number;
  pendentes: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function contarMinhasTarefas(supabase: SupabaseClient<any>, usuario: string): Promise<MinhasTarefasResumo> {
  const { data } = await supabase
    .from("tarefas")
    .select("quando, concluida, cancelada")
    .in("quem", [usuario, USUARIO_TODOS])
    .eq("concluida", false)
    .eq("cancelada", false);

  const tarefas = (data ?? []) as Pick<Tarefa, "quando" | "concluida" | "cancelada">[];
  const pendentes = tarefas.filter((t) => getStatus(t) === "pendente").length;

  return { total: tarefas.length, pendentes };
}
