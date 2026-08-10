const FRASES_VAGAS = [
  "sem tempo",
  "falta de tempo",
  "imprevisto",
  "não sei",
  "nao sei",
  "correria",
  "ocupado",
  "ocupada",
  "depois eu vejo",
  "depois vejo",
  "sem motivo",
  "outra hora",
  "não deu",
  "nao deu",
  "esqueci",
  "sem tempo hoje",
];

const TAMANHO_MINIMO = 12;

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function motivoEhGenerico(motivo: string): boolean {
  const normalizado = normalizar(motivo);
  if (normalizado.length < TAMANHO_MINIMO) return true;
  return FRASES_VAGAS.some((frase) => normalizado === normalizar(frase));
}
