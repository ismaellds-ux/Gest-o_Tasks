# Tarefas

Sistema de gestão de tarefas em produção: Next.js (App Router) + Supabase (Postgres +
Auth), multiusuário, dados compartilhados entre quem está logado. Acesso por convite:
só administradores criam contas — não existe cadastro público.

## 1. Criar o projeto Supabase

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Abra **SQL Editor** e rode, nessa ordem, o conteúdo de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e depois
   [`supabase/migrations/0002_admin.sql`](supabase/migrations/0002_admin.sql) (em
   queries separadas). O primeiro cria as tabelas (`usuarios`, `tarefas`,
   `adiamentos`, `conclusoes`), os enums, o trigger que sincroniza `auth.users` →
   `usuarios`, e as políticas de RLS. O segundo adiciona a coluna `is_admin` e
   promove o usuário `ismael.teste` a administrador — troque esse nome antes de
   rodar se o primeiro admin for outra pessoa (ou rode o `update` manualmente depois
   de criar o usuário pelo painel).
3. Em **Authentication → Providers → Email**, desligue **Confirm email**. O login
   deste app é só usuário/senha — por baixo dos panos cada usuário vira um e-mail
   sintético (`usuario@tarefas.local`) que não existe de verdade, então a confirmação
   por e-mail precisa estar desligada ou ninguém consegue entrar.
4. Em **Project Settings → API Keys**, copie a **Project URL**, a **Publishable key**
   (era chamada de "anon key") e a **Secret key** (era "service_role key").

## 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os dados do passo anterior:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=chave-publishable-aqui
SUPABASE_SERVICE_ROLE_KEY=chave-secret-aqui
```

A `SUPABASE_SERVICE_ROLE_KEY` é sensível — nunca prefixar com `NEXT_PUBLIC_`, nunca
commitar (`.env*` já está no `.gitignore`). Ela só é usada em Server Actions, para a
Admin API do Supabase (criar/excluir usuário, redefinir senha).

## 3. Criar o primeiro usuário (admin)

Como não existe cadastro público, o primeiro usuário precisa ser criado direto no
banco (os seguintes já podem ser criados pelo painel `/admin` por esse primeiro
usuário):

1. No dashboard do Supabase, vá em **Authentication → Users → Add user → Create new
   user**. Preencha um e-mail (pode ser o sintético, ex: `seuusuario@tarefas.local`)
   e uma senha, com **Auto Confirm User** marcado.
2. No **SQL Editor**, rode:
   ```sql
   update public.usuarios set usuario = 'seuusuario', is_admin = true
   where id = (select id from auth.users where email = 'seuusuario@tarefas.local');
   ```
   (o trigger já criou a linha em `usuarios` com `usuario` vazio/nulo a partir do
   e-mail; esse update só corrige o nome de usuário e marca como admin).

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), faça login com o usuário criado
no passo 3. Como admin, use a aba **Admin** pra criar as contas dos demais usuários
(usuário + senha inicial, com opção de já criar como admin).

## 5. Build de produção

```bash
npm run build
npm run start
```

## Decisões e desvios pontuais da especificação original

- **Senha**: a especificação original descrevia uma tabela `usuarios` com
  `senha_hash`. Aqui, o hash da senha fica inteiramente dentro do `auth.users`
  gerenciado pelo Supabase Auth — não é duplicado em `public.usuarios`. É mais seguro
  (evita reimplementar hashing) e a tabela `public.usuarios` guarda só o nome de
  usuário público, sincronizado por trigger.
- **Login "só usuário"**: como o Supabase Auth exige um e-mail único por conta, cada
  usuário ganha um e-mail sintético determinístico (`usuario-normalizado@tarefas.local`)
  gerado a partir do nome escolhido. Isso é 100% interno — a UI nunca pede nem mostra
  e-mail.
- **Acesso por convite**: não existe `/cadastro` público. Só administradores (coluna
  `usuarios.is_admin`) criam contas, via `/admin`, usando a Admin API do Supabase
  Auth (`SUPABASE_SERVICE_ROLE_KEY`, só no servidor). Admins também podem promover/
  remover outros admins, redefinir senha de qualquer usuário e excluir acesso — exceto
  o próprio (nunca é possível se auto-rebaixar ou se auto-excluir pela UI).
- **Deploy sugerido**: Vercel (frontend + Server Actions) com o banco no Supabase.
  Configure as três variáveis de ambiente do `.env.local` (incluindo a
  `SUPABASE_SERVICE_ROLE_KEY`) no painel da Vercel como variáveis de servidor.

## Estrutura

- `supabase/migrations/` — `0001_init.sql` (schema base) e `0002_admin.sql` (coluna
  `is_admin` + admin inicial).
- `src/lib/domain/` — regras de negócio puras (status calculado, agrupamento por data,
  recorrência, heurística de motivo genérico no adiamento, estatísticas).
- `src/app/actions/` — Server Actions: `auth.ts` (login/logout), `tarefas.ts`
  (CRUD/ações de tarefas), `admin.ts` (gestão de usuários, via Admin API).
- `src/lib/supabase/admin.ts` — cliente privilegiado (service role), só server-side.
- `src/components/` — design system (Button, Modal, Toast, Carimbo, cards, modais,
  `AdminUsuarios`).
- `src/app/(app)/tasks1`, `tasks2` e `admin` — os dois quadros de tarefas e o painel
  de administração (rota protegida: redireciona quem não é admin).

## Verificação manual sugerida

Depois de configurar o Supabase e criar o primeiro admin (passos 1–3):

1. Faça login como admin, abra a aba **Admin** e crie um segundo usuário (comum).
2. Faça logout, logue com o novo usuário e confirme que a aba Admin não aparece e
   que acessar `/admin` direto pela URL redireciona de volta pro board.
3. Crie uma tarefa interna única em Tasks 1 e confira o agrupamento por data.
4. Conclua a tarefa e veja o histórico em "Conclusões (histórico)".
5. Crie uma tarefa recorrente diária, conclua e confirme que a data avança 1 dia e a
   tarefa continua ativa (não vai para "Concluída").
6. Adie uma tarefa com um motivo vago (ex: "sem tempo") e confirme que aparece o aviso
   extra antes de salvar.
7. Vá para Tasks 2 e confira que "Quem" já vem preenchido com "Felipe" ao criar uma
   tarefa nova.
8. Exclua uma tarefa e confirme o modal de confirmação.
9. De volta como admin, promova o segundo usuário a admin, depois remova, depois
   exclua a conta — confirme que some da lista e não consegue mais logar.
