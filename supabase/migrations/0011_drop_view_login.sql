-- Reverte a tentativa de login por seleção de nome (0010) — voltou ao
-- login tradicional de usuário + senha, essa view não é mais usada.
drop view if exists public.usuarios_login;
