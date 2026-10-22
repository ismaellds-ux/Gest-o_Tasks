-- Item de checklist pode mostrar o botão do Google Forms ao lado da pergunta
-- (ex.: conferência de temperatura das câmaras). Configurável no Admin.
alter table public.checklist_itens
  add column exibe_link_formulario boolean not null default false;

update public.checklist_itens
set exibe_link_formulario = true
where pergunta ilike '%temperatura das câmaras%';
