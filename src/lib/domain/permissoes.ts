// Tasks 2 é o quadro de responsabilidade fixa do Felipe: só ele (ou um admin) acessa.
export const RESPONSAVEL_TASKS2 = "Felipe";

// Valor fictício pro campo "Quem executa": não é um usuário cadastrado, é uma
// opção especial indicando que qualquer um da equipe pode pegar a tarefa. Toda
// pessoa logada vê tarefas com esse valor contando como seu no "minhas tarefas".
export const USUARIO_TODOS = "Todos";

export function podeAcessarTasks2(usuario: string, isAdmin: boolean): boolean {
  return isAdmin || usuario === RESPONSAVEL_TASKS2;
}
