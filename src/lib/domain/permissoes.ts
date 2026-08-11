// Tasks 2 é o quadro de responsabilidade fixa do Felipe: só ele (ou um admin) acessa.
export const RESPONSAVEL_TASKS2 = "Felipe";

export function podeAcessarTasks2(usuario: string, isAdmin: boolean): boolean {
  return isAdmin || usuario === RESPONSAVEL_TASKS2;
}
