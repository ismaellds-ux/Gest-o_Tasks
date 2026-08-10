"use client";

import type { MouseEvent } from "react";
import { CalendarClock, CheckCircle2, MapPin, Pencil, User } from "lucide-react";
import { StatusBadge, TipoBadge, corBordaTipo } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { getStatus } from "@/lib/domain/status";
import { formatDateBR } from "@/lib/domain/date";
import type { Adiamento, Tarefa } from "@/lib/types";

interface TaskCardProps {
  tarefa: Tarefa;
  ultimoAdiamento?: Adiamento;
  onAbrirDetalhes: () => void;
  onConcluir: () => void;
  onAdiar: () => void;
  onEditar: () => void;
}

export function TaskCard({ tarefa, ultimoAdiamento, onAbrirDetalhes, onConcluir, onAdiar, onEditar }: TaskCardProps) {
  const status = getStatus(tarefa);

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

      {tarefa.descricao && <p className="mt-1 line-clamp-2 text-sm text-fg-secondary">{tarefa.descricao}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-muted">
        <span className="flex items-center gap-1">
          <CalendarClock size={12} /> {formatDateBR(tarefa.quando)}
        </span>
        <span className="flex items-center gap-1">
          <User size={12} /> {tarefa.quem}
        </span>
        {tarefa.tipo === "externa" && (tarefa.local || tarefa.cidade) && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {[tarefa.local, tarefa.cidade].filter(Boolean).join(" — ")}
          </span>
        )}
        <TipoBadge tipo={tarefa.tipo} />
        {tarefa.periodicidade !== "unica" && <span className="label-caps">{tarefa.periodicidade}</span>}
      </div>

      {tarefa.concluido_por && (
        <p className="mt-2 text-xs text-green">Concluída por {tarefa.concluido_por}</p>
      )}
      {ultimoAdiamento && (
        <p className="mt-1 text-xs text-amber">Último adiamento: &ldquo;{ultimoAdiamento.motivo}&rdquo;</p>
      )}

      {status !== "concluida" && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border-soft pt-3">
          <Button tone="success" icon={<CheckCircle2 size={14} />} onClick={pararPropagacao(onConcluir)} className="px-2.5 py-1.5 text-xs">
            Concluir
          </Button>
          <Button tone="warn" icon={<CalendarClock size={14} />} onClick={pararPropagacao(onAdiar)} className="px-2.5 py-1.5 text-xs">
            Adiar
          </Button>
          <Button tone="default" icon={<Pencil size={14} />} onClick={pararPropagacao(onEditar)} className="px-2.5 py-1.5 text-xs">
            Editar
          </Button>
          <Button tone="ghost" onClick={pararPropagacao(onAbrirDetalhes)} className="ml-auto px-2.5 py-1.5 text-xs">
            Detalhes
          </Button>
        </div>
      )}
    </div>
  );
}
