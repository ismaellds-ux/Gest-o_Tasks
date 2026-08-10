import type { Periodicidade } from "@/lib/types";
import { addDaysISO } from "@/lib/domain/date";

const DIAS_POR_PERIODICIDADE: Record<Exclude<Periodicidade, "unica">, number> = {
  diario: 1,
  semanal: 7,
  mensal: 30,
};

export function proximaData(quando: string, periodicidade: Periodicidade): string {
  if (periodicidade === "unica") return quando;
  return addDaysISO(quando, DIAS_POR_PERIODICIDADE[periodicidade]);
}
