-- Por padrão só administradores criam tarefas na Tasks1. Essas colunas
-- permitem que o admin libere um usuário comum (ex.: Felipe) pra criar
-- tarefas na Tasks1 durante um período específico. As duas ficam nulas
-- (bloqueado) até o admin definir uma janela.

alter table public.usuarios
  add column janela_tasks1_inicio date,
  add column janela_tasks1_fim date;
