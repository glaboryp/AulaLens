import { resolveAuthOrigin } from '../utils/auth-origin'

// Se ejecuta al arrancar Nitro, antes de la primera petición a /api/auth/* y antes
// del plugin assertOrigin de @sidebase/nuxt-auth (ver nitro.plugins en nuxt.config.ts).
// Falla rápido si la configuración es inválida o inconsistente.
// AUTH_ORIGIN (runtime) es la única fuente. @sidebase/nuxt-auth 1.x espera que
// incluya el path de la API (https://host/api/auth), así que se normaliza aquí, y
// NEXTAUTH_URL (next-auth) se deriva del origen. El build no lleva ningún origen.
export default defineNitroPlugin(() => {
  const origin = resolveAuthOrigin(process.env, import.meta.dev)
  process.env.NEXTAUTH_URL = origin
  process.env.AUTH_ORIGIN = `${origin}/api/auth`
})
