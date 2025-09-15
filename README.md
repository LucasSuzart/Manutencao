# SGMAN - CMMS (Sistema de Gestão de Manutenção)

Protótipo inicial de um CMMS construído em Vue 3 + Pinia + Vite.

## Módulos Implementados (MVP)
- Ativos: cadastro básico de ativos
- Ordens de Serviço: criação e listagem simples
- Planos de Manutenção: estrutura de dados para geração automática (logic parcial)
- Inventário (estrutura de store)
- Técnicos (estrutura de store)
- KPIs: MTTR, MTBF, Disponibilidade (simplificada), taxa de conclusão, custo total
- Dashboard: cards de métricas principais

## Próximos Passos Sugeridos
1. Persistência (LocalStorage / IndexedDB / API REST)
2. Autenticação e controle de perfis
3. Plano de manutenção por medição (meter / condition)
4. Relatórios detalhados e exportação (PDF/CSV)
5. Integração mobile / QR Code (geração e leitura)
6. Controle de estoque detalhado (movimentações, custo médio ponderado)
7. Workflow de aprovação de OS
8. Anexos (imagens / documentos)
9. Gestão de downtime por ativo e causa raiz (RCA)
10. Multi-tenant / multi-planta.

## Scripts
- `npm run dev` - ambiente de desenvolvimento
- `npm run build` - build de produção
- `npm run preview` - servir build

## Estrutura de Pastas
```
src/
  modules/
    assets/
    workorders/
    dashboard/
    shared/ (utilidades)
  stores/ (Pinia)
  types/ (tipos TypeScript centrais)
```

## Observações
Este é um ponto de partida. Expanda gradualmente adotando testes, design system, controle de erros e logs estruturados.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Persistência Temporária
Persistência em `localStorage` via plugin (`src/plugins/persist.ts`).
Seed inicial automático em `src/seed.ts` se não houver dados gravados.

Para limpar e resemear:
```powershell
Remove-Item -Path $env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Storage -Recurse # (ou limpar storage via DevTools)
```
Ou simplesmente limpar o localStorage no console do browser:
```js
localStorage.clear()
```
