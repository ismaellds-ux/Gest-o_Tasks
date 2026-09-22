import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChecklistArea, ChecklistExecucao, ChecklistItem, ChecklistResposta } from "@/lib/types";

export type AreaComItens = ChecklistArea & { itens: ChecklistItem[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listarAreasComItens(supabase: SupabaseClient<any>): Promise<AreaComItens[]> {
  const { data } = await supabase
    .from("checklist_areas")
    .select("*, itens:checklist_itens(*)")
    .eq("ativo", true)
    .eq("checklist_itens.ativo", true)
    .order("ordem")
    .order("ordem", { referencedTable: "checklist_itens" });

  return ((data ?? []) as unknown as AreaComItens[]).map((area) => ({
    ...area,
    itens: (area.itens ?? []).filter((item) => item.ativo),
  }));
}

// Versão pro admin: inclui áreas e itens inativos, pra dar pra reativar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listarTodasAreasComItens(supabase: SupabaseClient<any>): Promise<AreaComItens[]> {
  const { data } = await supabase
    .from("checklist_areas")
    .select("*, itens:checklist_itens(*)")
    .order("ordem")
    .order("ordem", { referencedTable: "checklist_itens" });

  return (data ?? []) as unknown as AreaComItens[];
}

export interface ExecucaoComResumo extends ChecklistExecucao {
  respostas: Pick<ChecklistResposta, "resposta">[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listarExecucoes(supabase: SupabaseClient<any>): Promise<ExecucaoComResumo[]> {
  const { data } = await supabase
    .from("checklist_execucoes")
    .select("*, respostas:checklist_respostas(resposta)")
    .order("criado_em", { ascending: false })
    .limit(60);

  return (data ?? []) as unknown as ExecucaoComResumo[];
}

export type ItemComArea = ChecklistItem & { area: { nome: string } | null };
export type RespostaComItem = ChecklistResposta & { item: ItemComArea | null };

export interface ExecucaoDetalhe {
  execucao: ChecklistExecucao;
  respostas: RespostaComItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getExecucaoDetalhe(supabase: SupabaseClient<any>, id: string): Promise<ExecucaoDetalhe | null> {
  const { data: execucao } = await supabase.from("checklist_execucoes").select("*").eq("id", id).single();
  if (!execucao) return null;

  const { data: respostas } = await supabase
    .from("checklist_respostas")
    .select("*, item:checklist_itens(*, area:checklist_areas(nome))")
    .eq("execucao_id", id);

  return {
    execucao: execucao as ChecklistExecucao,
    respostas: (respostas ?? []) as unknown as RespostaComItem[],
  };
}
