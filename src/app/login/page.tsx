import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("usuarios_login").select("usuario, is_admin").order("usuario");

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <Logo variant="stacked" size={44} />
        <p className="mt-3 text-center text-sm text-fg-secondary">Escolha seu usuário pra entrar.</p>

        <div className="mt-6">
          <LoginForm usuarios={data ?? []} />
        </div>

        <p className="mt-5 text-center text-sm text-fg-muted">
          Sem acesso? Peça a um administrador pra criar sua conta.
        </p>
      </div>
    </main>
  );
}
