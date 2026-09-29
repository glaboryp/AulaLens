// Tests de integración del flujo de autenticación contra el build (`.output`).
// Requisito: `pnpm build`. Ejecutar con `pnpm test:auth`.
//
// Contexto: next-auth >=4.23 ignora el `host` que le pasa @sidebase/nuxt-auth y
// deriva el origen solo de NEXTAUTH_URL / VERCEL / AUTH_TRUST_HOST. Sin ellos usa
// http://localhost:3000, lo que rompe `redirect_uri` y el atributo Secure de las
// cookies detrás de un proxy HTTPS que no sea Vercel.
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { buildWithoutAuthOrigin, GOOGLE_AUTH_ENDPOINT, parseSetCookies, startAuthServer, startDevServer } from './support/auth-server.mjs'

const PUBLIC_ORIGIN = 'https://aulalens.example.com'
const PUBLIC_HOST = 'aulalens.example.com'

// Todos los tests corren contra un build hecho SIN AUTH_ORIGIN (como un CI
// genérico) y arrancado después con el origen público: el escenario real de despliegue.
before(() => buildWithoutAuthOrigin())

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

/** Extrae `window.__NUXT__.config` del HTML SSR: es la configuración que recibe el cliente. */
function extractClientConfig(html) {
  const script = html.match(/<script>(window\.__NUXT__=\{\};window\.__NUXT__\.config=.*?)<\/script>/s)?.[1]
  assert.ok(script, 'no se encontró window.__NUXT__.config en el HTML')
  const sandbox = { window: {} }
  vm.runInNewContext(script, sandbox)
  return sandbox.window.__NUXT__.config
}

describe('build sin AUTH_ORIGIN y arranque con origen HTTPS: configuración pública del cliente', () => {
  const proxied = { publicHost: PUBLIC_HOST, proto: 'https' }
  let server
  let html
  let config

  test('arranca y sirve la home', async () => {
    server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN })
    assert.equal(server.started, true, server.getOutput())
    const res = await server.request('/', proxied)
    assert.equal(res.status, 200)
    html = res.body
    config = extractClientConfig(html)
  })

  test('auth.computed (origin y fullBaseUrl) usa AUTH_ORIGIN, no localhost', () => {
    const { computed } = config.public.auth
    assert.equal(computed.origin, PUBLIC_ORIGIN)
    assert.equal(computed.pathname, '/api/auth')
    assert.equal(computed.fullBaseUrl, `${PUBLIC_ORIGIN}/api/auth`)
  })

  test('auth.baseURL y authUrl públicos usan AUTH_ORIGIN', () => {
    assert.equal(config.public.auth.baseURL, PUBLIC_ORIGIN)
    assert.equal(config.public.authUrl, `${PUBLIC_ORIGIN}/api/auth`)
  })

  test('ni la config ni el payload/HTML enviado al cliente contienen localhost', () => {
    assert.doesNotMatch(JSON.stringify(config), /localhost/)
    assert.doesNotMatch(html, /localhost/)
  })

  test('el origen sale del runtime, no del build: otro AUTH_ORIGIN en otro arranque se refleja', async () => {
    const other = await boot({ AUTH_ORIGIN: 'https://otra.example.org' })
    assert.equal(other.started, true, other.getOutput())
    const res = await other.request('/', { publicHost: 'otra.example.org', proto: 'https' })
    assert.equal(extractClientConfig(res.body).public.auth.computed.fullBaseUrl, 'https://otra.example.org/api/auth')
  })

  test('falla al arrancar si un NUXT_PUBLIC_AUTH_* explícito contradice AUTH_ORIGIN', async () => {
    const conflicting = await boot({
      AUTH_ORIGIN: PUBLIC_ORIGIN,
      NUXT_PUBLIC_AUTH_COMPUTED_ORIGIN: 'https://otro.example.com'
    })
    assert.equal(conflicting.started, false, 'el servidor no debería arrancar')
    assert.notEqual(await conflicting.exited, 0)
    assert.match(conflicting.getOutput(), /NUXT_PUBLIC_AUTH_COMPUTED_ORIGIN/)
    assert.match(conflicting.getOutput(), /AUTH_ORIGIN/)
  })
})

describe('endpoints /api/debug/* de configuración', () => {
  const proxied = { publicHost: PUBLIC_HOST, proto: 'https' }
  const debugPaths = ['/api/debug/auth-config', '/api/debug/google-config']
  const secretValues = ['test-secret', 'test-client-id', 'test-client-secret']

  test('en producción responden 404 y no filtran metadatos de secretos', async () => {
    const server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN })
    assert.equal(server.started, true, server.getOutput())

    for (const path of debugPaths) {
      const res = await server.request(path, proxied)
      assert.equal(res.status, 404, `${path} debería ser 404, fue ${res.status}: ${res.body.slice(0, 200)}`)
      for (const value of secretValues) {
        assert.ok(!res.body.includes(value), `${path} filtra ${value}`)
      }
      assert.doesNotMatch(res.body, /length|prefix|suffix|valid|hasAuthSecret|hasGoogle/i, `${path} expone metadatos: ${res.body}`)
    }
  })

  test('tampoco se sirven con otros métodos en producción', async () => {
    const server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN })
    for (const path of debugPaths) {
      const res = await server.request(path, { ...proxied, method: 'POST', body: '{}' })
      assert.notEqual(res.status, 200, `${path} respondió 200 a POST`)
      assert.ok(!res.body.includes('test-secret'))
    }
  })

  test('en desarrollo siguen disponibles pero sin prefijos, sufijos ni longitudes de secretos', async () => {
    const dev = {
      GOOGLE_CLIENT_ID: 'abcdefghijklmnop.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'GOCSPX-verysecretvalue1234567890',
      NUXT_AUTH_SECRET: 'dev-auth-secret-dev-auth-secret-1234'
    }
    const devServer = await startDevServer(dev)
    servers.push(devServer)
    assert.equal(devServer.started, true, devServer.getOutput())

    for (const path of debugPaths) {
      const res = await devServer.request(path)
      assert.equal(res.status, 200, `${path}: ${res.body.slice(0, 300)}`)
      const body = JSON.parse(res.body)
      for (const key of Object.keys(body)) {
        assert.doesNotMatch(key, /length|prefix|suffix/i, `${path} expone la clave ${key}`)
      }
      for (const value of Object.values(dev)) {
        for (const fragment of [value.slice(0, 8), value.slice(-8)]) {
          assert.ok(!res.body.includes(fragment), `${path} filtra un fragmento de un secreto: ${fragment}`)
        }
      }
    }
  })
})

const ACCESS_TOKEN = 'ya29.test-google-access-token'
const REFRESH_TOKEN = '1//test-google-refresh-token'

/** Cookie de sesión next-auth (JWT cifrado) como la que deja el callback de Google tras el login. */
async function forgeSessionCookie({ secret, secure }) {
  const { encode } = await import('next-auth/jwt')
  const user = { id: 'google-user-1', name: 'Docente Prueba', email: 'docente@example.com', image: null }
  const jwt = await encode({
    secret,
    token: { sub: user.id, name: user.name, email: user.email, user, accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN }
  })
  return `${secure ? '__Secure-' : ''}next-auth.session-token=${jwt}`
}

function assertNoOAuthTokens(body, where) {
  for (const value of [ACCESS_TOKEN, REFRESH_TOKEN]) {
    assert.ok(!body.includes(value), `${where} expone un token OAuth: ${body}`)
  }
  assert.doesNotMatch(body, /accessToken|refreshToken/, `${where} expone claves de tokens: ${body}`)
}

describe('tokens OAuth de Google: nunca llegan al navegador', () => {
  const proxied = { publicHost: PUBLIC_HOST, proto: 'https' }
  let server
  let cookie

  before(async () => {
    server = await boot({ AUTH_ORIGIN: PUBLIC_ORIGIN })
    cookie = await forgeSessionCookie({ secret: 'test-secret-test-secret-test-secret', secure: true })
  })

  test('/api/auth/session devuelve el usuario sin accessToken ni refreshToken', async () => {
    assert.equal(server.started, true, server.getOutput())
    const res = await server.request('/api/auth/session', { ...proxied, headers: { cookie } })
    assert.equal(res.status, 200, res.body)
    const session = JSON.parse(res.body)
    assert.equal(session.user?.email, 'docente@example.com')
    assert.equal(session.user?.id, 'google-user-1')
    assertNoOAuthTokens(res.body, '/api/auth/session')
  })

  test('/api/debug/session responde 404 en producción y no filtra tokens', async () => {
    const res = await server.request('/api/debug/session', { ...proxied, headers: { cookie } })
    assert.equal(res.status, 404, `debería ser 404, fue ${res.status}: ${res.body.slice(0, 200)}`)
    assertNoOAuthTokens(res.body, '/api/debug/session')
  })

  test('el servidor sigue usando el accessToken para llamar a Google Classroom', async () => {
    const res = await server.request('/api/classroom/courses', { ...proxied, headers: { cookie } })
    assert.equal(res.status, 200, res.body)
    assert.equal(JSON.parse(res.body).courses[0].id, 'course-1')
    assertNoOAuthTokens(res.body, '/api/classroom/courses')
    assert.ok(server.classroomRequests.length > 0, 'no se llamó a Classroom')
    assert.equal(server.classroomRequests.at(-1).headers.authorization, `Bearer ${ACCESS_TOKEN}`)
  })

  test('sin sesión, los endpoints de Classroom responden 401 sin llamar a Google', async () => {
    const before = server.classroomRequests.length
    for (const path of ['/api/classroom/courses', '/api/classroom/user-role', '/api/classroom/students', '/api/classroom/students/course-1']) {
      const res = await server.request(path, proxied)
      assert.equal(res.status, 401, `${path}: ${res.body.slice(0, 300)}`)
    }
    assert.equal(server.classroomRequests.length, before)
  })

  test('en desarrollo /api/debug/session tampoco devuelve tokens', async () => {
    const secret = 'dev-auth-secret-dev-auth-secret-1234'
    const devServer = await startDevServer({ NUXT_AUTH_SECRET: secret, GOOGLE_CLIENT_ID: 'x.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'dev-client-secret-1234567890' })
    servers.push(devServer)
    assert.equal(devServer.started, true, devServer.getOutput())

    const devCookie = await forgeSessionCookie({ secret, secure: false })
    const res = await devServer.request('/api/debug/session', { headers: { cookie: devCookie } })
    assert.equal(res.status, 200, res.body.slice(0, 300))
    assert.equal(JSON.parse(res.body).hasSession, true)
    assertNoOAuthTokens(res.body, '/api/debug/session (dev)')
  })
})
