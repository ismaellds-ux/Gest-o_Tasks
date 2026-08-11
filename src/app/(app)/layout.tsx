import { LogOut } from "lucide-react";
import { Tabs } from "@/components/Tabs";
import { Logo } from "@/components/Logo";
import { ToastProvider } from "@/components/Toast";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/data/tarefas";
import { isAdminAtual } from "@/lib/data/admin";
import { sair } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [usuario, admin] = await Promise.all([getUsuarioAtual(supabase), isAdminAtual(supabase)]);

  return (
    <ToastProvider>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <Logo />
            <Tabs isAdmin={admin} />
          </div>
          <form action={sair} className="flex items-center gap-3">
            <span className="hidden text-sm text-fg-secondary sm:inline">{usuario}</span>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-fg-secondary hover:bg-surface-light hover:text-fg"
            >
              <LogOut size={14} /> Sair
            </button>
          </form>
        </header>
        {children}
      </div>
    </ToastProvider>
  );
}
