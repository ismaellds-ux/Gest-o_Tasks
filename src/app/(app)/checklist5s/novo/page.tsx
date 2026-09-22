import { createClient } from "@/lib/supabase/server";
import { listarAreasComItens } from "@/lib/data/checklist5s";
import { ChecklistForm } from "@/components/checklist5s/ChecklistForm";

export default async function NovoChecklistPage() {
  const supabase = await createClient();
  const areas = await listarAreasComItens(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-fg">Novo fechamento de turno</h1>
        <p className="text-sm text-fg-secondary">Checklist 5S — responda todos os itens antes de salvar.</p>
      </div>
      {areas.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhuma área/item cadastrado ainda. Peça a um administrador.</p>
      ) : (
        <ChecklistForm areas={areas} />
      )}
    </div>
  );
}
