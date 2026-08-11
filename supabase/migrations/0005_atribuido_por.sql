-- Registra quem atribuiu a tarefa a quem executa (não necessariamente quem
-- criou a tarefa — muda toda vez que o campo "Quem" é reatribuído na edição).

alter table public.tarefas
  add column atribuido_por text;

update public.tarefas set atribuido_por = criado_por where atribuido_por is null;
