-- Cancelamento de tarefa: usuários comuns não podem excluir tarefas
-- permanentemente (isso fica restrito a admins), mas podem cancelar, com
-- motivo obrigatório que fica registrado.

alter table public.tarefas
  add column cancelada boolean not null default false,
  add column motivo_cancelamento text,
  add column cancelado_por text,
  add column cancelado_em timestamptz;
