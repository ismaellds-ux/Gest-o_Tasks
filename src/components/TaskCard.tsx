"use client";

import type { MouseEvent } from "react";
import { Ban, CalendarClock, CheckCircle2, MapPin, Pencil, Trash2, User } from "lucide-react";
import { StatusBadge, TipoBadge, corBordaTipo } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { getStatus } from "@/lib/domain/status";
import { formatDateBR } from "@/lib/domain/date";
import type { Adiamento, Tarefa } from "@/lib/types";

interface TaskCardProps {
  tarefa: Tarefa;
  ultimoAdiamento?: Adiamento;
  isAdmin: boolean;
  onAbrirDetalhes: () => void;
  onConcluir: () => void;
  onAdiar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
  onCancelar: () => void;
}

export function TaskCard({
  tarefa,
  ultimoAdiamento,
  isAdmin,
  onAbrirDetalhes,
  onConcluir,
  onAdiar,
  onEditar,
  onExcluir,
  onCancelar,
}: TaskCardProps) {
  const status = getStatus(tarefa);
  const ativa = status !== "concluida" && status !== "cancelada";

  function pararPropagacao(fn: () => void) {
    return (e: MouseEvent) => {
      e.stopPropagation();
      fn();
    };
  }

  return (
    <div
      onClick={onAbrirDetalhes}
      className="cursor-pointer rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-soft"
      style={{ borderLeft: `4px solid ${corBordaTipo(tarefa.tipo)}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-fg">{tarefa.o_que}</h3>
        <StatusBadge status={status} />
      </div>

      {tarefa.descricao && (
        <div className="mt-2">
          <span className="label-caps block">Descritivo da demanda</span>
          <p className="mt-0.5 line-clamp-2 text-sm text-fg-secondary">{tarefa.descricao}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-start gap-x-5 gap-y-2 text-xs">
        <div>
          <span className="label-caps block">Data</span>
          <span className="mt-0.5 flex items-center gap-1 text-fg-muted">
            <CalendarClock size={12} /> {formatDateBR(tarefa.quando)}
          </span>
        </div>
        <div>
          <span className="label-caps block">Quem executa</span>
          <span className="mt-0.5 flex items-center gap-1 text-fg-muted">
            <User size={12} /> {tarefa.quem}
          </span>
        </div>
        {tarefa.atribuido_por && (
          <div>
            <span className="label-caps block">Atribuída por</span>
            <span className="mt-0.5 inline-block text-fg-muted">{tarefa.atribuido_por}</span>
          </div>
        )}
        {tarefa.tipo === "externa" && (tarefa.local || tarefa.cidade) && (
          <div>
            <span className="label-caps block">Local</span>
            <span className="mt-0.5 flex items-center gap-1 text-fg-muted">
              <MapPin size={12} /> {[tarefa.local, tarefa.cidade].filter(Boolean).join(" — ")}
            </span>
          </div>
        )}
        <div>
          <span className="label-caps block">Demanda</span>
          <span className="mt-0.5 inline-block">
            <TipoBadge tipo={tarefa.tipo} />
          </span>
        </div>
        {tarefa.periodicidade !== "unica" && (
          <div>
            <span className="label-caps block">Periodicidade</span>
            <span className="mt-0.5 inline-block text-fg-muted">{tarefa.periodicidade}</span>
          </div>
        )}
      </div>

      {tarefa.cancelada ? (
        <p className="mt-2 text-xs text-coral">
          Cancelada por {tarefa.cancelado_por}: &ldquo;{tarefa.motivo_cancelamento}&rdquo;
        </p>
      ) : (
        tarefa.concluido_por && <p className="mt-2 text-xs text-green">Concluída por {tarefa.concluido_por}</p>
      )}
      {ultimoAdiamento && !tarefa.cancelada && (
        <p className="mt-1 text-xs text-amber">Último adiamento: &ldquo;{ultimoAdiamento.motivo}&rdquo;</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border-soft pt-3">
        {ativa && (
          <>
            <Button tone="success" icon={<CheckCircle2 size={14} />} onClick={pararPropagacao(onConcluir)} className="px-2.5 py-1.5 text-xs">
              Concluir
            </Button>
            <Button tone="warn" icon={<CalendarClock size={14} />} onClick={pararPropagacao(onAdiar)} className="px-2.5 py-1.5 text-xs">
              Adiar
            </Button>
            <Button tone="default" icon={<Pencil size={14} />} onClick={pararPropagacao(onEditar)} className="px-2.5 py-1.5 text-xs">
              Editar
            </Button>
          </>
        )}
        {isAdmin ? (
          <Button tone="danger" icon={<Trash2 size={14} />} onClick={pararPropagacao(onExcluir)} className="px-2.5 py-1.5 text-xs">
            Excluir
          </Button>
        ) : (
          ativa && (
            <Button tone="danger" icon={<Ban size={14} />} onClick={pararPropagacao(onCancelar)} className="px-2.5 py-1.5 text-xs">
              Cancelar
            </Button>
          )
        )}
        <Button tone="ghost" onClick={pararPropagacao(onAbrirDetalhes)} className="ml-auto px-2.5 py-1.5 text-xs">
          Detalhes
        </Button>
      </div>
    </div>
  );
}
