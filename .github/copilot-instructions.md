# SGMAN - CMMS Codebase Guide

## Project Overview
SGMAN is a Vue 3-based Computerized Maintenance Management System (CMMS) for tracking assets, work orders, maintenance plans, and related metrics. The project uses Vue 3 with Composition API, Pinia for state management, and TypeScript.

## Architecture Overview

### Core Concepts and Data Flow
- **Modular Architecture**: Organized by business domain in `src/modules/`
- **State Management**: Pinia stores in `src/stores/` with localStorage persistence
- **Core Types**: Central type definitions in `src/types/core.ts` define the domain model
- **UI Components**: Shared reusable components in `src/modules/shared/ui/`

### Data Persistence
- Local storage persistence handled through a Pinia plugin in `src/plugins/persist.ts`
- Initial seed data created through `src/seed.ts` when stores are empty
- Data can be reset through the UI's "Resetar Dados" button

## Key Workflows

### Development Setup
```sh
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

### Data Reset & Seeding
- UI: Use the "Resetar Dados" button in the top bar
- DevTools: `localStorage.clear()` in browser console
- PowerShell: `Remove-Item -Path $env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Storage -Recurse`

## Patterns and Conventions

### Store Pattern
```typescript
// Example from src/stores/assets.ts
export const useAssetStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([])

  function add(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = nowIso()
    assets.value.push({ ...asset, id: uuid(), createdAt: now, updatedAt: now })
  }

  function update(id: ID, patch: Partial<Asset>) {
    // Update logic with timestamps
  }

  // Other operations...
  
  return { assets, add, update, /* other exports */ }
})
```

### Vue Component Structure
- Single-file components with script setup
- Consistent organization: Props/emits, state, computed values, functions, template, styles
- UI components in `shared/ui` registered globally through plugin pattern

### Common Patterns
- Forms use standard InputField/SelectField/Button components from shared UI
- Modal dialog pattern for creating/editing records
- Date handling through shared date utilities (`src/modules/shared/date.ts`)
- KPI calculations in `src/modules/shared/kpi.ts`

## Key Files for Understanding

- **Domain Model**: `src/types/core.ts` - Core type definitions
- **App Layout**: `src/App.vue` - Main app shell and navigation
- **Store Example**: `src/stores/assets.ts` - Asset management store
- **View Example**: `src/modules/assets/AssetList.vue` - List view pattern

## Current Feature Status
- **Implemented**: Assets, Work Orders, KPIs (MTTR, MTBF, Availability), Dashboard
- **Partial/Stub**: Inventory, Maintenance Plans, Teams, Locations
- **Future Plans**: API integration, authentication, mobile integration, reports

## Known Limitations
- Data persistence is local only (localStorage)
- No authentication or user management
- Dashboard is informational only (no interactivity)
- KPI calculations are simplified versions of industry formulas