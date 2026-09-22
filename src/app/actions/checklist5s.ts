"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual } from "@/lib/data/admin";
import { USUARIO_TODOS } from "@/lib/domain/permissoes";
import type { ChecklistItem, RespostaChecklist, Turno } from "@/lib/types";

interface RespostaSubmetida {
  itemId: string;
  resposta: RespostaChecklist;
  observacao: string | null;
}

function extrairRespostas(formData: FormData): RespostaSubmetida[] {
  const respostas: RespostaSubmetida[] = [];
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^resposta:(.+)$/);
    if (!match) continue;
    const itemId = match[1];
    const resposta = String(value) as RespostaChecklist;
    if (!["ok", "problema", "nao_aplica"].includes(resposta)) continue;
    const observacao = str(formData, `observacao:${itemId}`) || null;
    respostas.push({ itemId, resposta, observacao });
  }
  return respostas;
}

async function gerarTarefasParaProblemas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  execucaoId: string,
  respostas: RespostaSubmetida[],
  realizadoPor: string,
  data: string,
) {
  const idsComProblema = respostas.filter((r) => r.resposta === "problema").map((r) => r.itemId);
  if (idsComProblema.length === 0) return;

  const { data: itens } = await supabase.from("checklist_itens").select("*").in("id", idsComProblema);

  for (const item of (itens ?? []) as ChecklistItem[]) {
    if (!item.permite_tarefa_automatica) continue;

    const { data: tarefaAberta } = await supabase
      .from("tarefas")
      .select("id")
      .eq("origem_checklist_item_id", item.id)
      .eq("concluida", false)
      .eq("cancelada", false)
      .limit(1)
      .maybeSingle();

    if (tarefaAberta) continue;

    const observacaoDoItem = respostas.find((r) => r.itemId === item.id)?.observacao ?? null;

    await supabase.from("tarefas").insert({
      quadro: "tasks1",
      tipo: "interna",
      o_que: `5S: ${item.pergunta}`,
      descricao: observacaoDoItem,
      quando: data,
      quem: USUARIO_TODOS,
      local: null,
      cidade: null,
      periodicidade: "unica",
      criado_por: realizadoPor,
      origem_checklist_item_id: item.id,
      origem_checklist_execucao_id: execucaoId,
    });
  }
}

export interface ActionResult {
  error?: string;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function exigirAdmin(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const admin = await isAdminAtual(supabase);
  if (!admin) return { error: "Acesso restrito a administradores." };
  return {};
}

function revalidarChecklist() {
  revalidatePath("/checklist5s");
  revalidatePath("/admin/checklist5s");
}

export async function registrarExecucao(formData: FormData): Promise<ActionResult> {
  const turno = str(formData, "turno") as Turno;
  if (!["manha", "tarde", "noite"].includes(turno)) {
    return { error: "Selecione o turno." };
  }

  const respostas = extrairRespostas(formData);
  if (respostas.length === 0) {
    return { error: "Responda pelo menos um item." };
  }

  const supabase = await createClient();
  const realizadoPor = await getUsuarioAtual(supabase);

  const { data: execucao, error: execucaoError } = await supabase
    .from("checklist_execucoes")
    .insert({ turno, realizado_por: realizadoPor })
    .select()
    .single();
  if (execucaoError || !execucao) return { error: "Não foi possível registrar o checklist." };

  const { error: respostasError } = await supabase.from("checklist_respostas").insert(
    respostas.map((r) => ({
      execucao_id: execucao.id,
      item_id: r.itemId,
      resposta: r.resposta,
      observacao: r.observacao,
    })),
  );
  if (respostasError) return { error: "Não foi possível salvar as respostas." };

  await gerarTarefasParaProblemas(supabase, execucao.id, respostas, realizadoPor, execucao.data);

  revalidarChecklist();
  revalidatePath("/tasks1");
  return {};
}

export async function editarExecucao(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const turno = str(formData, "turno") as Turno;
  if (!id) return { error: "Checklist inválido." };
  if (!["manha", "tarde", "noite"].includes(turno)) {
    return { error: "Selecione o turno." };
  }

  const respostas = extrairRespostas(formData);
  if (respostas.length === 0) {
    return { error: "Responda pelo menos um item." };
  }

  const supabase = await createClient();

  const { data: execucao, error: execucaoError } = await supabase
    .from("checklist_execucoes")
    .update({ turno })
    .eq("id", id)
    .select()
    .single();
  if (execucaoError || !execucao) return { error: "Não foi possível salvar o checklist." };

  const { error: respostasError } = await supabase.from("checklist_respostas").upsert(
    respostas.map((r) => ({
      execucao_id: id,
      item_id: r.itemId,
      resposta: r.resposta,
      observacao: r.observacao,
    })),
    { onConflict: "execucao_id,item_id" },
  );
  if (respostasError) return { error: "Não foi possível salvar as respostas." };

  await gerarTarefasParaProblemas(supabase, id, respostas, execucao.realizado_por, execucao.data);

  revalidarChecklist();
  revalidatePath(`/checklist5s/${id}`);
  revalidatePath("/tasks1");
  return {};
}

export async function excluirExecucao(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  if (!id) return { error: "Checklist inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_execucoes").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir o checklist." };

  revalidarChecklist();
  revalidatePath("/tasks1");
  return {};
}

export async function criarArea(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const nome = str(formData, "nome");
  if (!nome) return { error: "Informe o nome da área." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_areas").insert({ nome });
  if (error) return { error: "Não foi possível criar a área." };

  revalidarChecklist();
  return {};
}

export async function editarArea(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const nome = str(formData, "nome");
  if (!id || !nome) return { error: "Informe o nome da área." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_areas").update({ nome }).eq("id", id);
  if (error) return { error: "Não foi possível salvar a área." };

  revalidarChecklist();
  return {};
}

export async function alternarAreaAtiva(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const ativo = str(formData, "ativo") === "true";
  if (!id) return { error: "Área inválida." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_areas").update({ ativo }).eq("id", id);
  if (error) return { error: "Não foi possível atualizar a área." };

  revalidarChecklist();
  return {};
}

export async function excluirArea(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  if (!id) return { error: "Área inválida." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("checklist_areas").delete().eq("id", id);
  if (error) {
    return { error: "Essa área tem itens com respostas já registradas — desative em vez de excluir." };
  }

  revalidarChecklist();
  return {};
}

export async function criarItem(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const areaId = str(formData, "area_id");
  const pergunta = str(formData, "pergunta");
  const respostaOkTexto = str(formData, "resposta_ok_texto") || "Sim";
  const respostaProblemaTexto = str(formData, "resposta_problema_texto") || "Não";
  const respostaNaTexto = str(formData, "resposta_na_texto") || "Não se aplica";
  const permiteTarefaAutomatica = formData.get("permite_tarefa_automatica") === "on";

  if (!areaId || !pergunta) return { error: "Preencha a área e a pergunta." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_itens").insert({
    area_id: areaId,
    pergunta,
    resposta_ok_texto: respostaOkTexto,
    resposta_problema_texto: respostaProblemaTexto,
    resposta_na_texto: respostaNaTexto,
    permite_tarefa_automatica: permiteTarefaAutomatica,
  });
  if (error) return { error: "Não foi possível criar o item." };

  revalidarChecklist();
  return {};
}

export async function editarItem(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const pergunta = str(formData, "pergunta");
  const respostaOkTexto = str(formData, "resposta_ok_texto") || "Sim";
  const respostaProblemaTexto = str(formData, "resposta_problema_texto") || "Não";
  const respostaNaTexto = str(formData, "resposta_na_texto") || "Não se aplica";
  const permiteTarefaAutomatica = formData.get("permite_tarefa_automatica") === "on";

  if (!id || !pergunta) return { error: "Preencha a pergunta." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_itens")
    .update({
      pergunta,
      resposta_ok_texto: respostaOkTexto,
      resposta_problema_texto: respostaProblemaTexto,
      resposta_na_texto: respostaNaTexto,
      permite_tarefa_automatica: permiteTarefaAutomatica,
    })
    .eq("id", id);
  if (error) return { error: "Não foi possível salvar o item." };

  revalidarChecklist();
  return {};
}

export async function alternarItemAtivo(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  const ativo = str(formData, "ativo") === "true";
  if (!id) return { error: "Item inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_itens").update({ ativo }).eq("id", id);
  if (error) return { error: "Não foi possível atualizar o item." };

  revalidarChecklist();
  return {};
}

export async function excluirItem(formData: FormData): Promise<ActionResult> {
  const acesso = await exigirAdmin();
  if (acesso.error) return { error: acesso.error };

  const id = str(formData, "id");
  if (!id) return { error: "Item inválido." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("checklist_itens").delete().eq("id", id);
  if (error) {
    return { error: "Esse item já tem respostas ou tarefas geradas — desative em vez de excluir." };
  }

  revalidarChecklist();
  return {};
}
