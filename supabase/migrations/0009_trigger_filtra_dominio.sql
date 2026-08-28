-- Esse projeto Supabase é compartilhado com o financas-app (mesmo
-- auth.users pra ambos). Sem filtro, o trigger abaixo copiava QUALQUER
-- novo usuário criado em qualquer um dos dois apps pra esta tabela — foi
-- assim que contas do financas-app (ex.: Aline, Josoel) apareceram no
-- dropdown "Quem" do Tasks. Agora só copia usuários com e-mail sintético
-- @tarefas.local.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email like '%@tarefas.local' then
    insert into public.usuarios (id, usuario)
    values (new.id, new.raw_user_meta_data ->> 'usuario');
  end if;
  return new;
end;
$$;

-- Remove os usuários que já tinham vazado de outro app antes desse fix.
delete from public.usuarios u
using auth.users au
where au.id = u.id
  and au.email not like '%@tarefas.local';
