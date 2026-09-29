import { resolveAuthOrigin } from '../utils/auth-origin'

// Se ejecuta al arrancar Nitro, antes de la primera petición a /api/auth/*.
// Falla rápido si la configuración es inválida o inconsistente.
export default defineNitroPlugin(() => {
  process.env.NEXTAUTH_URL = resolveAuthOrigin(process.env, import.meta.dev)
})
