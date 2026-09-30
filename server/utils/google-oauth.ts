import type { H3Event } from 'h3'
import { getToken } from '#auth'

// Los tokens OAuth de Google solo viven en el JWT cifrado de la cookie de sesión
// (httpOnly); el callback `session` no los copia, así que nunca llegan al cliente.
// El secreto se pasa explícito: getToken no puede depender de que el handler de
// /api/auth ya se haya cargado en este proceso.
export async function getGoogleOAuthTokens(event: H3Event) {
  const token = await getToken({ event, secret: useRuntimeConfig(event).authSecret })
  if (!token || typeof token.accessToken !== 'string') {
    return null
  }
  return {
    accessToken: token.accessToken,
    refreshToken: typeof token.refreshToken === 'string' ? token.refreshToken : undefined
  }
}
