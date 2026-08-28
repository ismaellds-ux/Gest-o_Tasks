# Prompt: Design System "Tasks" (dark, para reutilizar em outros projetos)

Aplique este sistema de design escuro ao projeto. Use exatamente estas cores,
tipografia e padrões de layout — não invente variações.

## Paleta de cores

Defina como CSS custom properties em `:root` (ou equivalente no seu stack):

```css
:root {
  /* fundos, em ordem de elevação */
  --bg: #10151a;              /* fundo da página */
  --surface: #171e24;         /* cards, modais */
  --surface-elevated: #1e2730; /* inputs, blocos dentro de cards */
  --surface-light: #243039;   /* hover states, botão "default" */

  /* bordas */
  --border: #2b3944;
  --border-soft: #233039;

  /* texto */
  --fg: #eef2f1;           /* texto principal */
  --fg-secondary: #8fa3ab; /* texto secundário */
  --fg-muted: #5f7079;     /* texto terciário, labels, ícones apagados */

  /* cores de destaque — cada uma tem uma variante "-dim" pra fundo de badge/botão */
  --amber: #e8a33d;
  --amber-dim: #4a3a20;
  --yellow: #f4c95d;
  --yellow-dim: #4a4020;
  --green: #4fb286;
  --green-dim: #1e352c;
  --coral: #d9694f;
  --coral-dim: #3a2620;
  --violet: #8b7ee8;
  --violet-dim: #2a2740;
}
```

Fundo da página tem um leve gradiente radial verde no canto superior direito, não é
chapado:

```css
body {
  background:
    radial-gradient(ellipse 900px 700px at 88% -8%, rgba(79, 178, 134, 0.16), transparent 60%),
    var(--bg);
  color: var(--fg);
  min-height: 100vh;
}
```

### Uso semântico das cores de destaque (mantenha esse mapeamento)

- **Âmbar**: estado "pendente"/atrasado, avisos, botão de ação "adiar"
- **Amarelo**: estado "em aberto"
- **Verde**: sucesso, "concluído", botões de ação positiva
- **Coral**: erro, "cancelado", perigo, exclusão
- **Violeta**: destaque neutro/informativo (badge "interna", foco de input, nível admin)

Badges e botões sempre usam o par cor-cheia + fundo "-dim" da mesma cor
(nunca fundo sólido com a cor forte) — ex.: `text-green` sobre `bg-green-dim`.

## Tipografia

Três fontes do Google Fonts, cada uma com um papel fixo:

- **Space Grotesk** (`--font-display`) — títulos, nomes de card, headers de modal
- **Inter** (`--font-sans`) — corpo do texto, padrão do `body`
- **JetBrains Mono** (`--font-label`) — só para labels/legendas em caixa alta

Classe utilitária pra legendas (usada acima de quase todo campo de dado):

```css
.label-caps {
  font-family: var(--font-label), monospace;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 10.5px;
  color: var(--fg-muted);
}
```

## Raio de borda e espaçamento

- Botões, inputs, badges: `border-radius: 8px` (`rounded-lg`)
- Cards: `border-radius: 12px` (`rounded-xl`)
- Modais: `border-radius: 16px` (`rounded-2xl`)
- Padding padrão de botão: `0.5rem 0.875rem` (py-2 px-3.5)
- Padding padrão de card: `1rem` (p-4)
- Padding padrão de modal: `1.5rem` (p-6)
- Gap padrão entre itens de lista/grid: `0.625rem`–`1rem`

## Componentes-chave

**Card** (ex.: item de lista): fundo `--surface`, borda `1px solid --border`,
`rounded-xl`, com uma borda esquerda colorida de 4px indicando categoria/tipo do item.
Hover: borda muda pra `--border-soft`.

**Botão**: 5 variações de tom, todas com fundo "-dim" + texto na cor cheia + borda
sutil na cor a 30% de opacidade:
- `success` → verde
- `warn` → âmbar
- `danger` → coral
- `default` → `bg-surface-light`, texto `--fg`, borda `--border` (neutro)
- `ghost` → transparente, texto `--fg-secondary`, hover `bg-surface-light`

**Badge/Status pill**: `rounded-lg`, padding `0.25rem 0.625rem`, texto `text-xs
font-semibold`, sempre no padrão cor-cheia sobre fundo "-dim" da mesma cor.

**Input/Select/Textarea**: fundo `--surface-elevated`, borda `--border`,
`rounded-lg`, foco com `ring-2` na cor violeta a 40% de opacidade
(`focus:ring-violet/40`), sem borda colorida sólida no foco.

**Modal**: overlay `bg-black/60` com `backdrop-blur-sm`, cobrindo a tela inteira,
conteúdo centralizado, `rounded-2xl`, fundo `--surface`, borda `--border`,
`shadow-2xl`, `max-h-[90vh]` com scroll interno. Fecha com Escape, clique fora
(mas cuidado: só fecha se o mousedown E o click começarem e terminarem fora do
conteúdo — evita fechar sem querer ao selecionar texto arrastando o mouse até
a borda). Título em Space Grotesk, botão de fechar (X) no canto superior direito.

**Label de campo**: sempre usa `.label-caps` acima do valor/input, nunca como
placeholder sozinho.

## Estilo geral

Interface densa e utilitária, tema escuro permanente (sem modo claro), hierarquia
visual construída por elevação de superfície (bg → surface → surface-elevated →
surface-light) mais do que por sombra. Bordas finas e sutis em todo canto. Nada de
gradientes decorativos além do sutil no fundo da página. Ícones da lucide-react,
tamanho pequeno (13–18px), sempre acompanhando texto, nunca sozinhos sem contexto.
