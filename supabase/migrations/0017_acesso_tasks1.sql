-- O admin também pode bloquear a Tasks 1 pra um usuário específico (ex.: quem
-- só usa a Tasks 2). Por padrão todo mundo continua com acesso.
alter table public.usuarios
  add column acesso_tasks1 boolean not null default true;
