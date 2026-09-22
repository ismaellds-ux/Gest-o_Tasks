-- Módulo de checklist 5S: fechamento de turno passando por várias áreas
-- (Câmeras, Parte externa, Limpeza da parte externa, Manutenção e reposição...),
-- cada uma com uma lista de itens editável pelo admin. Cada item tem 3
-- respostas possíveis (ok / problema / não se aplica), com texto customizável
-- por item — assim um item comum ("Câmera está organizada?": Sim=ok, Não=
-- problema) e um item de verificação+ação ("Paletes pra consertar?": "Não há
-- pendência"=não se aplica, "Sim, já resolvido"=ok, "Sim, ainda pendente"=
-- problema) usam exatamente a mesma estrutura, só muda o texto do botão.

create table public.checklist_areas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.checklist_itens (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.checklist_areas (id) on delete cascade,
  pergunta text not null,
  resposta_ok_texto text not null default 'Sim',
  resposta_problema_texto text not null default 'Não',
  resposta_na_texto text not null default 'Não se aplica',
  permite_tarefa_automatica boolean not null default true,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.checklist_execucoes (
  id uuid primary key default gen_random_uuid(),
  turno text not null check (turno in ('manha', 'tarde', 'noite')),
  data date not null default current_date,
  realizado_por text not null,
  criado_em timestamptz not null default now()
);

create table public.checklist_respostas (
  id uuid primary key default gen_random_uuid(),
  execucao_id uuid not null references public.checklist_execucoes (id) on delete cascade,
  item_id uuid not null references public.checklist_itens (id),
  resposta text not null check (resposta in ('ok', 'problema', 'nao_aplica')),
  observacao text,
  unique (execucao_id, item_id)
);

-- Tarefa gerada automaticamente por um item de checklist marcado como
-- "problema" — usado pra não duplicar tarefa enquanto a mesma pendência
-- continuar em aberto entre um turno e outro.
alter table public.tarefas
  add column origem_checklist_item_id uuid references public.checklist_itens (id);

create index tarefas_origem_checklist_item_id_idx on public.tarefas (origem_checklist_item_id);

alter table public.checklist_areas enable row level security;
alter table public.checklist_itens enable row level security;
alter table public.checklist_execucoes enable row level security;
alter table public.checklist_respostas enable row level security;

-- Áreas e itens: todo mundo lê, só admin edita (mesmo padrão de "editável
-- pelo admin" já usado noutras partes do app).
create policy "checklist_areas_select_authenticated"
  on public.checklist_areas for select
  to authenticated
  using (true);

create policy "checklist_areas_all_admin"
  on public.checklist_areas for all
  to authenticated
  using (exists (select 1 from public.usuarios where usuarios.id = auth.uid() and usuarios.is_admin = true))
  with check (exists (select 1 from public.usuarios where usuarios.id = auth.uid() and usuarios.is_admin = true));

create policy "checklist_itens_select_authenticated"
  on public.checklist_itens for select
  to authenticated
  using (true);

create policy "checklist_itens_all_admin"
  on public.checklist_itens for all
  to authenticated
  using (exists (select 1 from public.usuarios where usuarios.id = auth.uid() and usuarios.is_admin = true))
  with check (exists (select 1 from public.usuarios where usuarios.id = auth.uid() and usuarios.is_admin = true));

-- Execuções e respostas: qualquer usuário autenticado registra o fechamento
-- de turno (dado compartilhado, mesmo padrão de tarefas/adiamentos/conclusoes).
create policy "checklist_execucoes_all_authenticated"
  on public.checklist_execucoes for all
  to authenticated
  using (true)
  with check (true);

create policy "checklist_respostas_all_authenticated"
  on public.checklist_respostas for all
  to authenticated
  using (true)
  with check (true);

-- Seed inicial dos itens já definidos.
insert into public.checklist_areas (nome, ordem) values
  ('Câmeras', 1),
  ('Parte externa', 2),
  ('Limpeza da parte externa', 3),
  ('Manutenção e reposição', 4);

insert into public.checklist_itens (area_id, pergunta, resposta_ok_texto, resposta_problema_texto, resposta_na_texto, ordem)
select id, item.pergunta, item.ok, item.problema, item.na, item.ordem
from public.checklist_areas,
  lateral (
    values
      ('Há chapas entre paletes?', 'Sim', 'Não', 'Não se aplica', 1),
      ('As camadas dos fardos estão padronizadas?', 'Sim', 'Não', 'Não se aplica', 2),
      ('Câmera está organizada, limpa?', 'Sim', 'Não', 'Não se aplica', 3)
  ) as item(pergunta, ok, problema, na, ordem)
where checklist_areas.nome = 'Câmeras';

insert into public.checklist_itens (area_id, pergunta, resposta_ok_texto, resposta_problema_texto, resposta_na_texto, ordem)
select id, item.pergunta, item.ok, item.problema, item.na, item.ordem
from public.checklist_areas,
  lateral (
    values
      ('Há objetos em cima dos paletes (copos, casacos, etc.)?', 'Não', 'Sim', 'Não se aplica', 1),
      ('Paleteiras no devido lugar e carregadas?', 'Sim', 'Não', 'Não se aplica', 2)
  ) as item(pergunta, ok, problema, na, ordem)
where checklist_areas.nome = 'Parte externa';

insert into public.checklist_itens (area_id, pergunta, resposta_ok_texto, resposta_problema_texto, resposta_na_texto, ordem)
select id, item.pergunta, item.ok, item.problema, item.na, item.ordem
from public.checklist_areas,
  lateral (
    values
      ('Lixeiras organizadas?', 'Sim', 'Não', 'Não se aplica', 1),
      ('Produtos no carregador (barris) foram conferidos?', 'Sim', 'Não', 'Não se aplica', 2),
      ('Romaneios e pedidos estão na pasta devida?', 'Sim', 'Não', 'Não se aplica', 3),
      ('Sala logística organizada?', 'Sim', 'Não', 'Não se aplica', 4),
      ('Descarga do almoxarifado deixou a sala/logística desorganizada?', 'Não', 'Sim', 'Não se aplica', 5),
      ('Área externa está limpa, sem necessidade de varrer?', 'Sim', 'Não', 'Não se aplica', 6)
  ) as item(pergunta, ok, problema, na, ordem)
where checklist_areas.nome = 'Limpeza da parte externa';

insert into public.checklist_itens (area_id, pergunta, resposta_ok_texto, resposta_problema_texto, resposta_na_texto, ordem)
select id, item.pergunta, item.ok, item.problema, item.na, item.ordem
from public.checklist_areas,
  lateral (
    values
      ('Paletes pra consertar', 'Sim, já consertado', 'Sim, ainda pendente', 'Não há pendência', 1),
      ('Fardos pra reembalar', 'Sim, já reembalado', 'Sim, ainda pendente', 'Não há pendência', 2),
      ('Produtos que podem ser realocados pra ganhar espaço', 'Sim, já realocado', 'Sim, ainda pendente', 'Não há pendência', 3)
  ) as item(pergunta, ok, problema, na, ordem)
where checklist_areas.nome = 'Manutenção e reposição';
