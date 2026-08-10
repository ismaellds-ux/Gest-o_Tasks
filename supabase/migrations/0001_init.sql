-- Sistema de Gestão de Tarefas — schema inicial
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase (ou via
-- `supabase db push` se estiver usando o CLI linkado ao projeto).

-- ============================================================================
-- Enums
-- ============================================================================
create type quadro_enum as enum ('tasks1', 'tasks2');
create type tipo_enum as enum ('interna', 'externa');
create type periodicidade_enum as enum ('unica', 'diario', 'semanal', 'mensal');

-- ============================================================================
-- usuarios — espelha auth.users; a senha em si (hash) fica só no auth.users,
-- gerenciada pelo Supabase Auth. Esta tabela guarda só o nome de usuário
-- público usado no app.
-- ============================================================================
create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  usuario text not null unique,
  criado_em timestamptz not null default now()
);

alter table public.usuarios enable row level security;

create policy "usuarios_select_authenticated"
  on public.usuarios for select
  to authenticated
  using (true);

-- Sem policy de insert/update/delete: a linha é criada só pelo trigger abaixo
-- (roda como security definer, ignora RLS).

-- Copia o nome de usuário (enviado em signUp -> options.data.usuario) pra
-- public.usuarios assim que o Supabase Auth cria o usuário em auth.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, usuario)
  values (new.id, new.raw_user_meta_data ->> 'usuario');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- tarefas
-- ============================================================================
create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  quadro quadro_enum not null,
  tipo tipo_enum not null,
  o_que text not null,
  descricao text,
  quando date not null,
  quem text not null,
  local text,
  cidade text,
  periodicidade periodicidade_enum not null default 'unica',
  concluida boolean not null default false,
  concluido_por text,
  criado_por text not null,
  criado_em timestamptz not null default now(),
  constraint tarefas_externa_requer_local_cidade check (
    tipo <> 'externa' or (local is not null and cidade is not null)
  )
);

create index tarefas_quadro_idx on public.tarefas (quadro);
create index tarefas_quando_idx on public.tarefas (quando);

alter table public.tarefas enable row level security;

create policy "tarefas_all_authenticated"
  on public.tarefas for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- adiamentos — histórico de postergação (1-N com tarefas)
-- ============================================================================
create table public.adiamentos (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  data_registro date not null default current_date,
  data_anterior date not null,
  nova_data date not null,
  motivo text not null
);

create index adiamentos_tarefa_id_idx on public.adiamentos (tarefa_id);

alter table public.adiamentos enable row level security;

create policy "adiamentos_all_authenticated"
  on public.adiamentos for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- conclusoes — histórico de conclusões (1-N com tarefas)
-- ============================================================================
create table public.conclusoes (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  data_conclusao date not null default current_date,
  data_prevista date not null,
  descricao_snapshot text,
  tipo_snapshot tipo_enum,
  local_snapshot text,
  cidade_snapshot text,
  concluido_por text not null
);

create index conclusoes_tarefa_id_idx on public.conclusoes (tarefa_id);

alter table public.conclusoes enable row level security;

create policy "conclusoes_all_authenticated"
  on public.conclusoes for all
  to authenticated
  using (true)
  with check (true);
