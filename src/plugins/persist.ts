import type { PiniaPluginContext } from 'pinia'

// Chave global para versionar schema
const STORAGE_PREFIX = 'sgman'
const VERSION = 'v1'

interface PersistOptions {
  key?: string
}

// Plugin de persistência simples por store usando localStorage
export function persistencePlugin(defaults?: PersistOptions) {
  return (context: PiniaPluginContext) => {
    const store = context.store
    const key = `${STORAGE_PREFIX}:${VERSION}:${defaults?.key || store.$id}`

    // Restaura
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        store.$patch(data)
      }
    } catch (e) {
      console.warn('Persist restore error', e)
    }

    // Salva (debounce simples via microtask)
    let scheduled = false
    store.$subscribe(() => {
      if (scheduled) return
      scheduled = true
      queueMicrotask(() => {
        try {
          localStorage.setItem(key, JSON.stringify(store.$state))
        } catch (e) {
          console.warn('Persist save error', e)
        } finally {
          scheduled = false
        }
      })
    }, { detached: true })
  }
}
