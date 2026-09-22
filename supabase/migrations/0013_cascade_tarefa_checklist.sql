-- origem_checklist_item_id (0012) identifica o item, usado pra checar se já
-- existe tarefa aberta antes de gerar outra (dedup). Essa nova coluna
-- identifica a EXECUÇÃO que gerou a tarefa, com cascade: excluir o
-- checklist agora exclui também as tarefas que ele gerou.
alter table public.tarefas
  add column origem_checklist_execucao_id uuid references public.checklist_execucoes (id) on delete cascade;

create index tarefas_origem_checklist_execucao_id_idx on public.tarefas (origem_checklist_execucao_id);
