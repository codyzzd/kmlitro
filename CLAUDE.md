@AGENTS.md

# KmLitro — Guia do Projeto

Aplicativo web de controle de abastecimento de veículos. Permite registrar abastecimentos, calcular consumo (km/l) e visualizar estatísticas por veículo.

## Stack

- **Next.js 16** (App Router, Turbopack) — leia `node_modules/next/dist/docs/` antes de escrever código
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** — sem config, usa CSS custom properties via `@theme inline` em `globals.css`
- **shadcn/ui** (Base UI + Radix) — componentes em `src/components/ui/`
- **Zustand 5** com `persist` middleware — todo estado da aplicação é local (localStorage)
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
  app/                  # Rotas (App Router)
    layout.tsx          # Root layout: SidebarProvider, ThemeProvider, TooltipProvider
    page.tsx            # Redireciona → /dashboard
    dashboard/          # Página de painel com estatísticas
    history/            # Página de abastecimentos (lista/histórico)
    vehicles/           # Página de veículos
    fillup/             # Redireciona → /history
    configuracao/       # Página de configurações
  components/
    layout/             # AppSidebar, ThemeProvider
    shared/             # Componentes reutilizáveis (VehicleSelector)
    ui/                 # Componentes shadcn/ui
    dashboard/          # Componentes da tela de painel
    history/            # HistoryTable (inclui dialog "Novo Abastecimento" inline), HistoryFilters, EditFillUpDialog, DeleteFillUpDialog
    fillup/             # FillUpForm (prop onSuccess para fechar dialog ao salvar)
    vehicles/           # VehicleList, VehicleDialog, DeleteVehicleDialog
    configuracao/       # SettingsForm
  lib/
    types.ts            # Interfaces: Vehicle, FillUp, FuelType, FUEL_TYPE_LABELS
    store.ts            # Zustand store (vehicles, fillups, settings, selectedVehicleId)
    schemas.ts          # Schemas Zod: vehicleSchema, fillUpSchema, settingsSchema
    calculations.ts     # Lógica de km/l, dashboard stats, último odômetro
    utils.ts            # formatNumber, formatKmL, cn()
  hooks/
    useSelectedVehicle  # Hook para acessar o veículo selecionado
```

## Estado Global (Zustand)

Store em `src/lib/store.ts`, persistido em localStorage com chave `kmlitro-storage`.

- `vehicles: Vehicle[]`
- `fillups: FillUp[]`
- `selectedVehicleId: string | null` — veículo ativo no seletor do sidebar
- `defaultVehicleId: string | null` — veículo padrão ao abrir o app
- `settings: AppSettings` — decimalSeparator, colorTheme, userName, userEmail

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

## Responsividade

Breakpoints usados no projeto:

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

## Convenções

- Componentes são `"use client"` quando usam hooks ou interatividade
- Formulários sempre com React Hook Form + schema Zod de `src/lib/schemas.ts`
- IDs gerados com `nanoid()`
- Datas armazenadas como ISO string, exibidas com `date-fns` locale `ptBR`
- Separador decimal configurável (`,` ou `.`) via `settings.decimalSeparator`
- Sem backend, sem autenticação — tudo local
