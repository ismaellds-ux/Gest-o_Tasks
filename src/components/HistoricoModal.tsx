"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import type { Alteracao, CampoAlterado } from "@/lib/types";

const ROTULOS_CAMPO: Record<CampoAlterado, string> = {
  tipo: "Status da tarefa",
  o_que: "O que",
  descricao: "Descrição",
  quando: "Quando",
  quem: "Quem",
  local: "Local",
  cidade: "Cidade",
  periodicidade: "Periodicidade",
  atribuido_por: "Atribuída por",
};

function formatarValor(valor: string | null): string {
  if (!valor) return "(vazio)";
  return valor;
}

export function HistoricoModal({ tarefaId, onClose }: { tarefaId: string; onClose: () => void }) {
  const [alteracoes, setAlteracoes] = useState<Alteracao[] | null>(null);
  const [erro, setErro] = useState<string>();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("alteracoes")
      .select("*")
      .eq("tarefa_id", tarefaId)
      .order("alterado_em", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setErro("Não foi possível carregar o histórico.");
          return;
        }
        setAlteracoes((data ?? []) as Alteracao[]);
      });
  }, [tarefaId]);

  return (
    <Modal title="Histórico de alterações" onClose={onClose} maxWidth="max-w-lg">
      {erro && <p className="text-sm text-coral">{erro}</p>}

      {!erro && alteracoes === null && <p className="text-sm text-fg-muted">Carregando...</p>}

      {alteracoes?.length === 0 && <p className="text-sm text-fg-secondary">Nenhuma alteração registrada ainda.</p>}

      {alteracoes && alteracoes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {alteracoes.map((a) => (
            <li key={a.id} className="rounded-xl border border-border-soft bg-surface-elevated p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <History size={13} className="text-fg-muted" />
                  {a.alterado_por}
                </span>
                <span className="label-caps">{new Date(a.alterado_em).toLocaleString("pt-BR")}</span>
              </div>
              <ul className="flex flex-col gap-1 text-sm text-fg-secondary">
                {(Object.keys(a.mudancas) as CampoAlterado[]).map((campo) => {
                  const mudanca = a.mudancas[campo];
                  if (!mudanca) return null;
                  return (
                    <li key={campo}>
                      <span className="label-caps mr-1">{ROTULOS_CAMPO[campo]}</span>
                      <span className="text-fg-muted line-through">{formatarValor(mudanca.de)}</span>
                      {" → "}
                      <span className="text-fg">{formatarValor(mudanca.para)}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
