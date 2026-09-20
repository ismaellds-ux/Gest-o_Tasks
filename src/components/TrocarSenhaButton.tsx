"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { TrocarSenhaModal } from "@/components/TrocarSenhaModal";

export function TrocarSenhaButton({ isAdmin }: { isAdmin: boolean }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center gap-1 text-xs text-fg-muted hover:text-fg hover:underline"
      >
        <KeyRound size={12} />
        {isAdmin ? "Trocar senha" : "Trocar PIN"}
      </button>
      {aberto && <TrocarSenhaModal isAdmin={isAdmin} onClose={() => setAberto(false)} />}
    </>
  );
}
