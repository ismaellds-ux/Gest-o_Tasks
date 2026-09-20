-- A tela de login agora mostra uma lista de nomes pra escolher (em vez de
-- digitar o usuário), então precisa listar usuário/nível ANTES de
-- autenticar. Expõe só essas duas colunas via view — não usuario.id,
-- criado_em nem janela_tasks1_* — pra quem ainda não tem sessão.
create view public.usuarios_login as
  select usuario, is_admin from public.usuarios;

grant select on public.usuarios_login to anon, authenticated;
