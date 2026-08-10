import { ChipGroup } from "@/components/ChipGroup";
import type { FiltroStatus } from "@/lib/types";

const OPTIONS: { value: FiltroStatus; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "em_aberto", label: "Em Aberto" },
  { value: "pendentes", label: "Pendentes" },
  { value: "concluidas", label: "Concluídas" },
];

export function FilterBar({ value, onChange }: { value: FiltroStatus; onChange: (v: FiltroStatus) => void }) {
  return <ChipGroup options={OPTIONS} value={value} onChange={onChange} />;
}
