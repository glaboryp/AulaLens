// Tests de integración del flujo de autenticación contra el build (`.output`).
// Requisito: `pnpm build`. Ejecutar con `pnpm test:auth`.
//
// Contexto: next-auth >=4.23 ignora el `host` que le pasa @sidebase/nuxt-auth y
// deriva el origen solo de NEXTAUTH_URL / VERCEL / AUTH_TRUST_HOST. Sin ellos usa
// http://localhost:3000, lo que rompe `redirect_uri` y el atributo Secure de las
// cookies detrás de un proxy HTTPS que no sea Vercel.
import { after, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { GOOGLE_AUTH_ENDPOINT, parseSetCookies, startAuthServer } from './support/auth-server.mjs'

const PUBLIC_ORIGIN = 'https://aulalens.example.com'
const PUBLIC_HOST = 'aulalens.example.com'

const servers = []
async function boot(env) {
  const server = await startAuthServer(env)
  servers.push(server)
  return server
}
after(async () => {
  await Promise.all(servers.map(server => server.stop()))
})

/** Hace csrf + POST signin/google y devuelve la respuesta del signin y las cookies enviadas. */
async function signInWithGoogle(server, requestOptions) {
  const csrf = await server.request('/api/auth/csrf', requestOptions)
  const csrfCookies = parseSetCookies(csrf.headers)
  const csrfToken = JSON.parse(csrf.body).csrfToken
  const cookieHeader = csrfCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')

  const signin = await server.request('/api/auth/signin/google', {
    ...requestOptions,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: cookieHeader
    },
    body: new URLSearchParams({ csrfToken, callbackUrl: `${PUBLIC_ORIGIN}/`, json: 'true' }).toString()
  })
  return { csrf, csrfCookies, signin }
}

describe('origen público distinto de localhost, sin NEXTAUTH_URL/VERCEL/AUTH_TRUST_HOST', () => {
  const env = { AUTH_ORIGIN: PUBLIC_ORIGIN }
  const proxied = { publicHost: PUBLIC_HOST, proto: 'https' }
  let server

  test('arranca', async () => {
    server = await boot(env)
    assert.equal(server.started, true, server.getOutput())
  })

  test('redirect_uri de Google usa AUTH_ORIGIN', async () => {
    const { signin } = await signInWithGoogle(server, proxied)
    assert.equal(signin.status, 200, signin.body)
    const authorizationUrl = new URL(JSON.parse(signin.body).url)

    assert.equal(`${authorizationUrl.origin}${authorizationUrl.pathname}`, GOOGLE_AUTH_ENDPOINT)
    assert.equal(
      authorizationUrl.searchParams.get('redirect_uri'),
      `${PUBLIC_ORIGIN}/api/auth/callback/google`
    )
  })

  test('/api/auth/providers publica URLs con AUTH_ORIGIN', async () => {
    const res = await server.request('/api/auth/providers', proxied)
    const { google } = JSON.parse(res.body)
    assert.equal(google.signinUrl, `${PUBLIC_ORIGIN}/api/auth/signin/google`)
    assert.equal(google.callbackUrl, `${PUBLIC_ORIGIN}/api/auth/callback/google`)
  })

  test('la cookie csrf lleva Secure (y prefijo __Host-)', async () => {
    const res = await server.request('/api/auth/csrf', proxied)
    const cookies = parseSetCookies(res.headers)
    const csrfCookie = cookies.find(cookie => cookie.name.endsWith('next-auth.csrf-token'))

    assert.ok(csrfCookie, `no hay cookie csrf: ${JSON.stringify(res.headers['set-cookie'])}`)
    assert.ok(csrfCookie.attrs.includes('secure'), `cookie sin Secure: ${csrfCookie.raw}`)
    assert.ok(csrfCookie.name.startsWith('__Host-'), `nombre inesperado: ${csrfCookie.name}`)
  })

  test('las cookies state/pkce del signin llevan Secure', async () => {
    const { signin } = await signInWithGoogle(server, proxied)
    const cookies = parseSetCookies(signin.headers)
    const oauthCookies = cookies.filter(cookie => /state|pkce/.test(cookie.name))

    assert.ok(oauthCookies.length >= 2, `cookies OAuth ausentes: ${JSON.stringify(signin.headers['set-cookie'])}`)
    for (const cookie of oauthCookies) {
      assert.ok(cookie.attrs.includes('secure'), `cookie sin Secure: ${cookie.raw}`)
      assert.ok(cookie.name.startsWith('__Secure-'), `nombre inesperado: ${cookie.name}`)
    }
  })
})

describe('origen http://localhost (desarrollo): sin regresión', () => {
  const env = { AUTH_ORIGIN: 'http://localhost:3000' }
  const local = { publicHost: 'localhost:3000', proto: 'http' }
  let server

  test('arranca', async () => {
    server = await boot(env)
    assert.equal(server.started, true, server.getOutput())
  })

  test('redirect_uri apunta a localhost y las cookies no llevan Secure', async () => {
    const { csrfCookies, signin } = await signInWithGoogle(server, local)
    const authorizationUrl = new URL(JSON.parse(signin.body).url)

    assert.equal(authorizationUrl.searchParams.get('redirect_uri'), 'http://localhost:3000/api/auth/callback/google')
    for (const cookie of [...csrfCookies, ...parseSetCookies(signin.headers)]) {
      assert.ok(!cookie.attrs.includes('secure'), `no debería ser Secure: ${cookie.raw}`)
    }
  })
})

describe('NEXTAUTH_URL explícito y coherente con AUTH_ORIGIN', () => {
  test('se respeta y el redirect_uri es el esperado', async () => {
    const server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN, NEXTAUTH_URL: PUBLIC_ORIGIN })
    assert.equal(server.started, true, server.getOutput())

    const { signin } = await signInWithGoogle(server, { publicHost: PUBLIC_HOST, proto: 'https' })
    const authorizationUrl = new URL(JSON.parse(signin.body).url)
    assert.equal(authorizationUrl.searchParams.get('redirect_uri'), `${PUBLIC_ORIGIN}/api/auth/callback/google`)
  })

  test('acepta NEXTAUTH_URL con el basePath /api/auth', async () => {
    const server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN, NEXTAUTH_URL: `${PUBLIC_ORIGIN}/api/auth` })
    assert.equal(server.started, true, server.getOutput())
  })
})

describe('configuración inválida: falla al arrancar con un mensaje claro', () => {
  test('NEXTAUTH_URL distinto de AUTH_ORIGIN', async () => {
    const server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN, NEXTAUTH_URL: 'https://otro.example.com' })
    assert.equal(server.started, false, 'el servidor no debería arrancar')
    assert.notEqual(await server.exited, 0)
    assert.match(server.getOutput(), /NEXTAUTH_URL/)
    assert.match(server.getOutput(), /AUTH_ORIGIN/)
  })

  test('sin AUTH_ORIGIN ni NEXTAUTH_URL en producción', async () => {
    const server = await boot({})
    assert.equal(server.started, false, 'el servidor no debería arrancar')
    assert.notEqual(await server.exited, 0)
    assert.match(server.getOutput(), /AUTH_ORIGIN/)
  })

  test('AUTH_ORIGIN que no es una URL http(s)', async () => {
    const server = await boot({ AUTH_ORIGIN: 'aulalens.example.com' })
    assert.equal(server.started, false, 'el servidor no debería arrancar')
    assert.notEqual(await server.exited, 0)
    assert.match(server.getOutput(), /AUTH_ORIGIN/)
  })
})
