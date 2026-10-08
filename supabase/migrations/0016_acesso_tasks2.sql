-- O admin passa a liberar o acesso à Tasks 2 usuário por usuário (antes só o
-- Felipe e os admins entravam, fixo no código). O Felipe já começa liberado.
alter table public.usuarios
  add column acesso_tasks2 boolean not null default false;

update public.usuarios set acesso_tasks2 = true where usuario = 'Felipe';
