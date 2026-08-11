import { ListChecks, LogOut } from "lucide-react";
import { Tabs } from "@/components/Tabs";
import { Logo } from "@/components/Logo";
import { ToastProvider } from "@/components/Toast";
import { TrocarSenhaButton } from "@/components/TrocarSenhaButton";
import { createClient } from "@/lib/supabase/server";
import { contarMinhasTarefas, getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual } from "@/lib/data/admin";
import { podeAcessarTasks2 } from "@/lib/domain/permissoes";
import { sair } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [usuario, admin] = await Promise.all([getUsuarioAtual(supabase), isAdminAtual(supabase)]);
  const minhasTarefas = await contarMinhasTarefas(supabase, usuario);

  return (
    <ToastProvider>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <Logo />
            <Tabs isAdmin={admin} podeVerTasks2={podeAcessarTasks2(usuario, admin)} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="hidden text-sm text-fg-secondary sm:inline">{usuario}</span>
              <TrocarSenhaButton />
            </div>
            <form action={sair}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-fg-secondary hover:bg-surface-light hover:text-fg"
              >
                <LogOut size={14} /> Sair
              </button>
            </form>
          </div>
        </header>

        {minhasTarefas.total > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow/25 bg-black px-4 py-3 text-sm text-yellow">
            <ListChecks size={16} className="shrink-0" />
            <span>
              Você tem <span className="font-semibold">{minhasTarefas.total}</span>{" "}
              {minhasTarefas.total === 1 ? "tarefa" : "tarefas"} em aberto atribuída
              {minhasTarefas.total === 1 ? "" : "s"} a você
              {minhasTarefas.pendentes > 0 &&
                `, ${minhasTarefas.pendentes} ${minhasTarefas.pendentes === 1 ? "atrasada" : "atrasadas"}`}
              .
            </span>
          </div>
        )}

        {children}
      </div>
    </ToastProvider>
  );
}
