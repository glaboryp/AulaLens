// next-auth >=4.23 deriva su URL base solo de NEXTAUTH_URL (o de VERCEL /
// AUTH_TRUST_HOST) e ignora el host que le pasa @sidebase/nuxt-auth. Sin ellos usa
// http://localhost:3000, lo que rompe `redirect_uri` y el atributo Secure de las
// cookies fuera de Vercel. Aquí se hace explícito: AUTH_ORIGIN es la fuente de
// verdad y NEXTAUTH_URL se deriva de ella (o debe coincidir si ya está definida).

const AUTH_BASE_PATH = '/api/auth'
const DEV_DEFAULT_ORIGIN = 'http://localhost:3000'

function toOrigin(name: string, value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name}="${value}" no es una URL válida. Usa el origen público completo, p. ej. https://aulalens.example.com`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name}="${value}" debe empezar por http:// o https://`)
  }

  const path = url.pathname.replace(/\/+$/, '')
  if (path !== '' && path !== AUTH_BASE_PATH) {
    throw new Error(`${name}="${value}" solo puede incluir el path ${AUTH_BASE_PATH}`)
  }

  return url.origin
}

/**
 * Variables NUXT_PUBLIC_* que Nitro aplica sobre el runtimeConfig en cada
 * petición (`useRuntimeConfig(event)`). Así la configuración pública que recibe
 * el cliente (`computed.fullBaseUrl`, `baseURL`, `authUrl`) sale del mismo
 * AUTH_ORIGIN de runtime y no de un valor horneado durante el build.
 */
export function publicAuthConfigEnv(origin: string): Record<string, string> {
  return {
    NUXT_PUBLIC_AUTH_BASE_URL: origin,
    NUXT_PUBLIC_AUTH_COMPUTED_ORIGIN: origin,
    NUXT_PUBLIC_AUTH_COMPUTED_FULL_BASE_URL: `${origin}${AUTH_BASE_PATH}`,
    NUXT_PUBLIC_AUTH_URL: `${origin}${AUTH_BASE_PATH}`
  }
}

/**
 * Aplica la config pública derivada de `origin`. Si alguna de esas variables ya
 * está definida con otro valor, falla en vez de duplicar orígenes en silencio.
 */
export function applyPublicAuthConfigEnv(env: Record<string, string | undefined>, origin: string): void {
  for (const [name, value] of Object.entries(publicAuthConfigEnv(origin))) {
    const current = env[name]?.trim()
    if (current && current.replace(/\/+$/, '') !== value) {
      throw new Error(
        `${name}="${current}" contradice AUTH_ORIGIN (${origin}). `
        + 'La config pública de auth se deriva de AUTH_ORIGIN en runtime; elimina esa variable o haz que coincida.'
      )
    }
    env[name] = value
  }
}

/**
 * Devuelve el origen que debe usarse como NEXTAUTH_URL.
 * - AUTH_ORIGIN es obligatorio salvo en desarrollo (por defecto http://localhost:3000).
 * - Si NEXTAUTH_URL ya está definida, debe apuntar al mismo origen que AUTH_ORIGIN.
 */
export function resolveAuthOrigin(env: Record<string, string | undefined>, isDev: boolean): string {
  const authOrigin = env.AUTH_ORIGIN?.trim()
  const nextAuthUrl = env.NEXTAUTH_URL?.trim()

  if (!authOrigin && !isDev) {
    throw new Error(
      'Falta AUTH_ORIGIN. Define el origen público de la app (p. ej. AUTH_ORIGIN=https://aulalens.example.com); '
      + 'NEXTAUTH_URL se deriva de él. No basta con VERCEL ni AUTH_TRUST_HOST.'
    )
  }

  const origin = authOrigin ? toOrigin('AUTH_ORIGIN', authOrigin) : DEV_DEFAULT_ORIGIN

  if (nextAuthUrl) {
    const nextAuthOrigin = toOrigin('NEXTAUTH_URL', nextAuthUrl)
    if (nextAuthOrigin !== origin) {
      throw new Error(
        `NEXTAUTH_URL (${nextAuthOrigin}) no coincide con AUTH_ORIGIN (${origin}). `
        + 'Deben apuntar al mismo origen; puedes omitir NEXTAUTH_URL y se derivará de AUTH_ORIGIN.'
      )
    }
  }

  return origin
}
