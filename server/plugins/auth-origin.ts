import { applyPublicAuthConfigEnv, resolveAuthOrigin } from '../utils/auth-origin'

// Se ejecuta al arrancar Nitro, antes de la primera petición a /api/auth/*.
// Falla rápido si la configuración es inválida o inconsistente.
// AUTH_ORIGIN (runtime) es la única fuente: alimenta NEXTAUTH_URL (next-auth) y la
// config pública que Nuxt envía al cliente. El build no lleva ningún origen.
export default defineNitroPlugin(() => {
  const origin = resolveAuthOrigin(process.env, import.meta.dev)
  process.env.NEXTAUTH_URL = origin
  applyPublicAuthConfigEnv(process.env, origin)
})
