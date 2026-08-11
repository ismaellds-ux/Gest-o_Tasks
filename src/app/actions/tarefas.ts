"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual } from "@/lib/data/admin";
import { proximaData } from "@/lib/domain/recurrence";
import type { Periodicidade, Quadro, Tarefa, Tipo } from "@/lib/types";

export interface ActionResult {
  error?: string;
}

function revalidarQuadros() {
  revalidatePath("/tasks1");
  revalidatePath("/tasks2");
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function criarTarefa(formData: FormData): Promise<ActionResult> {
  const quadro = str(formData, "quadro") as Quadro;
  const tipo = str(formData, "tipo") as Tipo;
  const o_que = str(formData, "o_que");
  const descricao = str(formData, "descricao");
  const quando = str(formData, "quando");
  const quem = str(formData, "quem");
  const local = str(formData, "local");
  const cidade = str(formData, "cidade");
  const periodicidade = str(formData, "periodicidade") as Periodicidade;

  if (!o_que || !quando || !quem) {
    return { error: "Preencha o que, quando e quem." };
  }
  if (tipo === "externa" && (!local || !cidade)) {
    return { error: "Tarefas externas exigem local e cidade." };
  }

  const supabase = await createClient();
  const criado_por = await getUsuarioAtual(supabase);

  const { error } = await supabase.from("tarefas").insert({
    quadro,
    tipo,
    o_que,
    descricao: descricao || null,
    quando,
    quem,
    local: tipo === "externa" ? local : null,
    cidade: tipo === "externa" ? cidade : null,
    periodicidade,
    criado_por,
  });

  if (error) return { error: "Não foi possível criar a tarefa." };

  revalidarQuadros();
  return {};
}

export async function editarTarefa(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const tipo = str(formData, "tipo") as Tipo;
  const o_que = str(formData, "o_que");
  const descricao = str(formData, "descricao");
  const quando = str(formData, "quando");
  const quem = str(formData, "quem");
  const local = str(formData, "local");
  const cidade = str(formData, "cidade");
  const periodicidade = str(formData, "periodicidade") as Periodicidade;

  if (!id || !o_que || !quando || !quem) {
    return { error: "Preencha o que, quando e quem." };
  }
  if (tipo === "externa" && (!local || !cidade)) {
    return { error: "Tarefas externas exigem local e cidade." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tarefas")
    .update({
      tipo,
      o_que,
      descricao: descricao || null,
      quando,
      quem,
      local: tipo === "externa" ? local : null,
      cidade: tipo === "externa" ? cidade : null,
      periodicidade,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar as alterações." };

  revalidarQuadros();
  return {};
}

export async function excluirTarefa(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  if (!id) return { error: "Tarefa inválida." };

  const supabase = await createClient();
  const admin = await isAdminAtual(supabase);
  if (!admin) return { error: "Só administradores podem excluir tarefas permanentemente." };

  const { error } = await supabase.from("tarefas").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir a tarefa." };

  revalidarQuadros();
  return {};
}

export async function cancelarTarefa(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const motivo = str(formData, "motivo");
  if (!id) return { error: "Tarefa inválida." };
  if (!motivo) return { error: "Informe o motivo do cancelamento." };

  const supabase = await createClient();
  const canceladoPor = await getUsuarioAtual(supabase);

  const { error } = await supabase
    .from("tarefas")
    .update({
      cancelada: true,
      motivo_cancelamento: motivo,
      cancelado_por: canceladoPor,
      cancelado_em: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: "Não foi possível cancelar a tarefa." };

  revalidarQuadros();
  return {};
}

export async function concluirTarefa(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const concluidoPor = str(formData, "concluido_por");
  if (!id || !concluidoPor) return { error: "Informe quem concluiu." };

  const supabase = await createClient();
  const { data: tarefa, error: fetchError } = await supabase
    .from("tarefas")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !tarefa) return { error: "Tarefa não encontrada." };
  const t = tarefa as Tarefa;

  const { error: insertError } = await supabase.from("conclusoes").insert({
    tarefa_id: id,
    data_prevista: t.quando,
    descricao_snapshot: t.descricao,
    tipo_snapshot: t.tipo,
    local_snapshot: t.local,
    cidade_snapshot: t.cidade,
    concluido_por: concluidoPor,
  });
  if (insertError) return { error: "Não foi possível registrar a conclusão." };

  const atualizacao =
    t.periodicidade === "unica"
      ? { concluida: true, concluido_por: concluidoPor }
      : { quando: proximaData(t.quando, t.periodicidade), concluido_por: concluidoPor };

  const { error: updateError } = await supabase.from("tarefas").update(atualizacao).eq("id", id);
  if (updateError) return { error: "Não foi possível atualizar a tarefa." };

  revalidarQuadros();
  return {};
}

export async function encerrarRecorrencia(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  if (!id) return { error: "Tarefa inválida." };

  const supabase = await createClient();
  const { error } = await supabase.from("tarefas").update({ concluida: true }).eq("id", id);
  if (error) return { error: "Não foi possível encerrar a recorrência." };

  revalidarQuadros();
  return {};
}

export async function reabrirTarefa(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  if (!id) return { error: "Tarefa inválida." };

  const supabase = await createClient();
  const { error } = await supabase.from("tarefas").update({ concluida: false }).eq("id", id);
  if (error) return { error: "Não foi possível reabrir a tarefa." };

  revalidarQuadros();
  return {};
}

export async function adiarTarefa(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const novaData = str(formData, "nova_data");
  const motivo = str(formData, "motivo");

  if (!id || !novaData || !motivo) {
    return { error: "Informe a nova data e o motivo." };
  }

  const supabase = await createClient();
  const { data: tarefa, error: fetchError } = await supabase
    .from("tarefas")
    .select("quando")
    .eq("id", id)
    .single();

  if (fetchError || !tarefa) return { error: "Tarefa não encontrada." };

  const { error: insertError } = await supabase.from("adiamentos").insert({
    tarefa_id: id,
    data_anterior: (tarefa as Pick<Tarefa, "quando">).quando,
    nova_data: novaData,
    motivo,
  });
  if (insertError) return { error: "Não foi possível registrar o adiamento." };

  const { error: updateError } = await supabase.from("tarefas").update({ quando: novaData }).eq("id", id);
  if (updateError) return { error: "Não foi possível atualizar a data." };

  revalidarQuadros();
  return {};
}
