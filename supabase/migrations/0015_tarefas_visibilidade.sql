-- Tarefa atribuída por um admin a uma pessoa específica (quem != 'Todos') só
-- é visível pra essa pessoa e pros admins. Todo o resto continua visível pra
-- equipe: tarefas pra 'Todos', tarefas atribuídas por usuário comum e as sem
-- "atribuída por". A regra vale no banco (RLS), não só na tela.

drop policy if exists "tarefas_all_authenticated" on public.tarefas;

create policy "tarefas_all_authenticated"
  on public.tarefas for all
  to authenticated
  using (
    quem = 'Todos'
    or not exists (
      select 1 from public.usuarios atribuidor
      where atribuidor.usuario = tarefas.atribuido_por and atribuidor.is_admin = true
    )
    or exists (
      select 1 from public.usuarios eu
      where eu.id = auth.uid() and (eu.is_admin = true or eu.usuario = tarefas.quem)
    )
  )
  with check (true);
