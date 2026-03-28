@AGENTS.md

# KmLitro — Guia do Projeto

Aplicativo web de controle de abastecimento de veículos. Permite registrar abastecimentos, calcular consumo (km/l) e visualizar estatísticas por veículo.

## Stack

- **Next.js 16** (App Router, Turbopack) — leia `node_modules/next/dist/docs/` antes de escrever código
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** — sem config, usa CSS custom properties via `@theme inline` em `globals.css`
- **shadcn/ui** (Base UI + Radix) — componentes em `src/components/ui/`
- **Supabase** — autenticação (Auth) + banco de dados (PostgreSQL com RLS)
- **Zustand 5** (sem `persist`) — estado em memória, populado pelo Supabase no mount
- **Recharts** — gráficos de linha (km/l) e barras (gastos mensais)
- **React Hook Form + Zod** — formulários e validação
- **lucide-react** — ícones
- **date-fns + react-day-picker** — datas e calendário

## Comandos

```bash
npm run dev      # dev server
npm run build    # build de produção
npm run lint     # lint
```

## Estrutura

```
src/
  app/                      # Rotas (App Router)
    layout.tsx              # Root layout: ThemeProvider, TooltipProvider
    page.tsx                # Redireciona → /dashboard
    (app)/                  # Grupo protegido (requer autenticação)
      layout.tsx            # Server Component: valida session Supabase, SidebarProvider, StoreInitializer
      dashboard/            # Página de painel com KPIs e gráficos
      history/              # Página de abastecimentos (lista/histórico)
      vehicles/             # Página de veículos
      fillup/               # Redireciona → /history
      configuracao/         # Página de configurações
    (auth)/                 # Grupo público
      layout.tsx            # Layout centralizado para tela de login
      login/page.tsx        # Login + Cadastro (modo único, alterna com botão)
  components/
    layout/                 # AppSidebar, ThemeProvider, StoreInitializer
    shared/                 # Componentes reutilizáveis (VehicleSelector)
    ui/                     # Componentes shadcn/ui
    dashboard/              # KpiCard, DashboardStats, KmLChart, MonthlyExpenseChart
    history/                # HistoryTable (inclui dialog "Novo Abastecimento" inline), HistoryFilters, EditFillUpDialog, DeleteFillUpDialog
    fillup/                 # FillUpForm (prop onSuccess para fechar dialog ao salvar)
    vehicles/               # VehicleList, VehicleDialog, DeleteVehicleDialog
    configuracao/           # ConfiguracaoForm
  lib/
    types.ts                # Interfaces: Vehicle, FillUp, FuelType, FUEL_TYPE_LABELS
    store.ts                # Zustand store — carregado do Supabase via initialize(userId)
    schemas.ts              # Schemas Zod: vehicleSchema, fillUpSchema, settingsSchema
    calculations.ts         # km/l, dashboard stats, getLastKmLPoints, getMonthlyExpenses
    utils.ts                # formatNumber, formatKmL, cn()
  hooks/
    useSelectedVehicle      # Hook para acessar o veículo selecionado
  utils/supabase/
    client.ts               # createClient() — cliente browser
    server.ts               # createClient(cookieStore) — cliente server
    middleware.ts           # updateSession() — usado pelo proxy.ts
  proxy.ts                  # Middleware Next.js 16: protege rotas, redireciona /login ↔ /dashboard
```

## Autenticação

- **Supabase Auth** — email/senha + Google OAuth
- `proxy.ts` (raiz do `src/`) intercepta todas as requisições:
  - Usuário não autenticado tentando acessar rota protegida → `/login`
  - Usuário autenticado tentando acessar `/login` → `/dashboard`
- `(app)/layout.tsx` é Server Component: valida sessão com `supabase.auth.getUser()`, redireciona se inválido
- `StoreInitializer` é Client Component montado no layout: chama `store.initialize(userId)` uma vez

## Banco de Dados (Supabase)

Tabelas (com RLS habilitado, todas as políticas filtram por `user_id`):

- `vehicles` — id, user_id, nickname, brand, model, year, created_at
- `fillups` — id, user_id, vehicle_id, date, no_data, odometer, liters, price_per_liter, total_paid, fuel_type, full_tank, notes
- `user_settings` — user_id (PK), decimal_separator, color_theme, user_name, user_email, default_vehicle_id

Trigger `on_auth_user_created` cria automaticamente uma linha em `user_settings` ao signup.

Mapeamento snake_case (DB) ↔ camelCase (TypeScript) feito nos helpers `rowToVehicle`, `rowToFillUp`, `rowToSettings` no `store.ts`.

## Estado Global (Zustand)

Store em `src/lib/store.ts`. **Sem persist** — dados sempre vêm do Supabase.

- `vehicles: Vehicle[]`
- `fillups: FillUp[]`
- `selectedVehicleId: string | null` — veículo ativo no seletor do sidebar
- `defaultVehicleId: string | null` — veículo padrão (salvo em `user_settings`)
- `settings: AppSettings` — decimalSeparator, colorTheme, userName, userEmail
- `isLoading: boolean` — true durante `initialize()`
- `userId: string | null` — ID do usuário autenticado

Ações CRUD são async e salvam no Supabase antes de atualizar o estado local.
`addVehicle(data, userId)` e `addFillUp(data, userId)` recebem `userId` explicitamente.
`updateSettings(s, userId)` usa upsert em `user_settings`.

O `userEmail` vem sempre do `supabase.auth.getUser()` (não da tabela), sobrescrito no `initialize()`.

## Tipos Principais

```ts
interface Vehicle { id, nickname, brand, model?, year, createdAt }
interface FillUp  { id, vehicleId, date, noData, odometer, liters,
                    pricePerLiter, totalPaid, fuelType, fullTank, notes? }
type FuelType = "gasoline" | "ethanol" | "diesel" | "gnv"
```

## Cálculo de km/l

- Só calcula entre abastecimentos `fullTank === true && noData === false`
- Ordenação por odômetro crescente
- km/l = (odômetro_atual − odômetro_anterior) / litros_atual
- Funções: `getEligibleFillUps`, `calculateKmPerLiter`, `getFillUpsWithKmL`, `getDashboardStats`
- `getLastKmLPoints(fillups, vehicleId, count=7)` → pontos para o gráfico de linha
- `getMonthlyExpenses(fillups, vehicleId, months=7)` → pontos para o gráfico de barras

## Dashboard (KPIs + Gráficos)

Componente `DashboardStats` exibe:
- Cards KPI: melhor km/l (verde + TrendingUp), pior km/l (vermelho + TrendingDown), média (amarelo + BarChart2), último (Gauge)
- `KmLChart` — LineChart Recharts, últimos 7 km/l (requer ≥ 2 pontos)
- `MonthlyExpenseChart` — BarChart Recharts, últimos 7 meses de gastos

**Atenção Recharts:** SVG não resolve CSS variables (`hsl(var(--primary))`). Usar hex hardcoded (`#3b82f6`) para `stroke`, `fill`, `CartesianGrid stroke`.

## Responsividade

| Tamanho   | Breakpoint | Comportamento                        |
|-----------|------------|--------------------------------------|
| Mobile    | `< md`     | Cards, FAB visível                   |
| Tablet    | `md–lg`    | Cards, FAB visível                   |
| Desktop   | `lg+`      | Tabela, botão normal no header       |

- Tabelas usam `hidden lg:block` — aparecem só em desktop
- Cards usam `lg:hidden` — aparecem em mobile e tablet
- FAB (botão flutuante `fixed bottom-6 right-6`) usa `lg:hidden`
- Botão de ação no header usa `hidden lg:flex`

## Navegação (sidebar)

Ordem dos itens do menu:
1. Painel (`/dashboard`)
2. Abastecimentos (`/history`)
3. Veículos (`/vehicles`)
4. Configurações (`/configuracao`)

Rodapé do sidebar: nome + email do usuário + dropdown com "Configurações" e "Sair".

## Convenções

- Componentes são `"use client"` quando usam hooks ou interatividade
- Formulários sempre com React Hook Form + schema Zod de `src/lib/schemas.ts`
- IDs gerados pelo Supabase (UUID), não mais `nanoid()`
- Datas armazenadas como ISO string, exibidas com `date-fns` locale `ptBR`
- Separador decimal configurável (`,` ou `.`) via `settings.decimalSeparator`
- `userEmail` é sempre read-only — vem do Supabase Auth, não é editável pelo usuário

## Base UI — Gotchas Conhecidos

**Animações de saída:** Base UI v1.x usa `data-ending-style` (não `data-closed`) para animações de fechamento. Nos componentes `ui/`:
- ✅ Use `data-[ending-style]:animate-out` / `data-[ending-style]:fade-out-0`
- ❌ Não use `data-closed:animate-out` — o atributo `data-closed` não é setado pelo Base UI

**Transições no backdrop (Dialog/Sheet):** Use `transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0` — evitar `duration-100` sem propriedade de transição real (Base UI fica esperando `transitionend` que nunca dispara).

**`render` prop em vez de `asChild`:** Base UI usa `render={<Component />}` onde shadcn/Radix usaria `asChild`. Ex:
```tsx
<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
```

**Select com valor vazio:** `<Select value={value ?? ""}>` é válido — Base UI aceita string vazia como "sem seleção".

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
