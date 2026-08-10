import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Cliente com a service role key: ignora RLS e pode usar a Admin API
// (criar/excluir usuário, redefinir senha). Nunca importar isso em código
// que roda no browser — só em Server Actions já protegidas por isAdminAtual().
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
