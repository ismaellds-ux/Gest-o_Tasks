import { createClient } from "@/lib/supabase/server";
import { listarAreasComItens, listarExecucoes, listarPendenciasChecklist } from "@/lib/data/checklist5s";
import { agoraSaoPaulo, dataDoTurno, sugerirTurno } from "@/lib/domain/checklist5s";
import { ChecklistForm } from "@/components/checklist5s/ChecklistForm";

export default async function NovoChecklistPage() {
  const supabase = await createClient();
  const [areas, execucoes, pendencias] = await Promise.all([
    listarAreasComItens(supabase),
    listarExecucoes(supabase),
    listarPendenciasChecklist(supabase),
  ]);

  const agora = agoraSaoPaulo();
  const turnoSugerido = sugerirTurno(agora);
  const dataTurno = dataDoTurno(turnoSugerido, agora);
  const jaRecebeu = execucoes.some(
    (e) => e.data === dataTurno && e.turno === turnoSugerido && e.momento === "recebimento",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-fg">Novo checklist de turno</h1>
        <p className="text-sm text-fg-secondary">Checklist 5S — responda todos os itens antes de salvar.</p>
      </div>
      {areas.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhuma área/item cadastrado ainda. Peça a um administrador.</p>
      ) : (
        <ChecklistForm
          areas={areas}
          turnoSugerido={turnoSugerido}
          momentoSugerido={jaRecebeu ? "entrega" : "recebimento"}
          pendencias={pendencias}
        />
      )}
    </div>
  );
}
