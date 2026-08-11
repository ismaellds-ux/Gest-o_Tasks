"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { TrocarSenhaModal } from "@/components/TrocarSenhaModal";

export function TrocarSenhaButton() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center gap-1 text-xs text-fg-muted hover:text-fg hover:underline"
      >
        <KeyRound size={12} />
        Trocar senha
      </button>
      {aberto && <TrocarSenhaModal onClose={() => setAberto(false)} />}
    </>
  );
}
