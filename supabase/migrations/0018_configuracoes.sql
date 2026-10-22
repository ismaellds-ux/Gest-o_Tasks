-- Configurações gerais do app (chave/valor). Por enquanto guarda o link do
-- Google Forms que aparece no Checklist 5S (chave 'checklist_forms_url').
-- Todo mundo lê; só admin altera.
create table public.configuracoes (
  chave text primary key,
  valor text not null
);

alter table public.configuracoes enable row level security;

create policy "configuracoes_select_authenticated"
  on public.configuracoes for select
  to authenticated
  using (true);

create policy "configuracoes_all_admin"
  on public.configuracoes for all
  to authenticated
  using (exists (select 1 from public.usuarios where usuarios.id = auth.uid() and usuarios.is_admin = true))
  with check (exists (select 1 from public.usuarios where usuarios.id = auth.uid() and usuarios.is_admin = true));
