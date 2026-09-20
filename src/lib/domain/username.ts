const DOMINIO_SINTETICO = "tarefas.local";

export function normalizarUsuario(usuario: string): string {
  return usuario
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function emailSintetico(usuario: string): string {
  return `${normalizarUsuario(usuario)}@${DOMINIO_SINTETICO}`;
}

export function usuarioValido(usuario: string): boolean {
  return normalizarUsuario(usuario).length >= 3;
}

// PIN de acesso pros usuários comuns (login simplificado, seleção por lista).
// Admin continua com senha normal (mínimo 6 caracteres) — só o PIN é curto.
export function pinValido(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
