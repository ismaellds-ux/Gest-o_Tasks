-- Turnos reais da operação (em vez de manhã/tarde/noite genéricos):
--   Turno 1: 05:30–15:00 | Turno 2: 17:00–02:00 | Turno 3: 00:00–09:00
-- e cada turno passa a fazer dois checklists: um de RECEBIMENTO (ao assumir,
-- conferindo o que o turno anterior deixou) e um de ENTREGA (antes de passar
-- pro próximo). A data da execução é sempre o dia em que o turno COMEÇOU —
-- a entrega do Turno 2 feita depois da meia-noite conta pro dia anterior.

alter table public.checklist_execucoes drop constraint if exists checklist_execucoes_turno_check;

update public.checklist_execucoes
set turno = case turno
  when 'manha' then 'turno1'
  when 'tarde' then 'turno2'
  when 'noite' then 'turno3'
  else turno
end;

alter table public.checklist_execucoes
  add constraint checklist_execucoes_turno_check check (turno in ('turno1', 'turno2', 'turno3'));

alter table public.checklist_execucoes
  add column momento text not null default 'entrega' check (momento in ('recebimento', 'entrega'));
