import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listarAreasComItens, getExecucaoDetalhe } from "@/lib/data/checklist5s";
import { ChecklistForm } from "@/components/checklist5s/ChecklistForm";

export default async function EditarChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [areas, detalhe] = await Promise.all([listarAreasComItens(supabase), getExecucaoDetalhe(supabase, id)]);
  if (!detalhe) notFound();

  const respostasPorItem = Object.fromEntries(
    detalhe.respostas.map((r) => [r.item_id, { resposta: r.resposta, observacao: r.observacao }]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-fg">Editar checklist</h1>
        <p className="text-sm text-fg-secondary">Ajuste o turno ou as respostas.</p>
      </div>
      <ChecklistForm
        areas={areas}
        execucaoExistente={{ id: detalhe.execucao.id, turno: detalhe.execucao.turno, respostasPorItem }}
      />
    </div>
  );
}
