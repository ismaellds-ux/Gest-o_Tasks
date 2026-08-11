-- Histórico de alterações de tarefa (edições feitas via "Editar", com o antes/
-- depois de cada campo que mudou).

create table public.alteracoes (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  alterado_por text not null,
  alterado_em timestamptz not null default now(),
  mudancas jsonb not null
);

create index alteracoes_tarefa_id_idx on public.alteracoes (tarefa_id);

alter table public.alteracoes enable row level security;

create policy "alteracoes_all_authenticated"
  on public.alteracoes for all
  to authenticated
  using (true)
  with check (true);
