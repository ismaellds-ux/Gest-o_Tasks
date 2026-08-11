-- Histórico de alterações só pode ser lido por administradores (qualquer
-- usuário autenticado ainda pode gerar o registro ao editar uma tarefa).

drop policy if exists "alteracoes_all_authenticated" on public.alteracoes;

create policy "alteracoes_insert_authenticated"
  on public.alteracoes for insert
  to authenticated
  with check (true);

create policy "alteracoes_select_admin"
  on public.alteracoes for select
  to authenticated
  using (
    exists (
      select 1 from public.usuarios
      where usuarios.id = auth.uid() and usuarios.is_admin = true
    )
  );
