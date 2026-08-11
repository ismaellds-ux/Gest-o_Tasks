-- "Atribuída por" deve ser sempre quem criou a tarefa, fixo — uma versão
-- anterior do app trocava esse valor toda vez que alguém editava o campo
-- "Quem". Esse update corrige os registros que ficaram com o valor errado.

update public.tarefas set atribuido_por = criado_por;
