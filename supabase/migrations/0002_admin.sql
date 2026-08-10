-- Controle de administradores: só um admin cria contas de usuário (sem
-- cadastro público). Rode este arquivo no SQL Editor do Supabase depois do
-- 0001_init.sql.

alter table public.usuarios
  add column is_admin boolean not null default false;

-- Promove o primeiro usuário a admin. Ajuste o nome de usuário se necessário
-- antes de rodar.
update public.usuarios
set is_admin = true
where usuario = 'ismael.teste';
