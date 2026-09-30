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
