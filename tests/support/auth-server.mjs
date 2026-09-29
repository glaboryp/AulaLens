import { spawn } from 'node:child_process'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const serverEntry = path.join(root, '.output/server/index.mjs')
const preload = path.join(root, 'tests/support/mock-google-discovery.cjs')

export const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.once('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

function startMockGoogle() {
  const server = http.createServer((_req, res) => {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      issuer: 'https://accounts.google.com',
      authorization_endpoint: GOOGLE_AUTH_ENDPOINT,
      token_endpoint: 'https://oauth2.googleapis.com/token',
      userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
      jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
      response_types_supported: ['code']
    }))
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

/**
 * Arranca el build (`.output`) con un entorno controlado. Solo se pasa PATH/HOME
 * más `env`, de modo que NEXTAUTH_URL, VERCEL o AUTH_TRUST_HOST del shell del
 * desarrollador no contaminen el escenario.
 */
export async function startAuthServer(env = {}) {
  if (!existsSync(serverEntry)) {
    throw new Error('Falta .output/server/index.mjs. Ejecuta `pnpm build` antes de los tests.')
  }

  const port = await freePort()
  const mockGoogle = await startMockGoogle()

  const child = spawn(process.execPath, [serverEntry], {
    cwd: root,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      PORT: String(port),
      NITRO_HOST: '127.0.0.1',
      NUXT_AUTH_SECRET: 'test-secret-test-secret-test-secret',
      NUXT_GOOGLE_CLIENT_ID: 'test-client-id',
      NUXT_GOOGLE_CLIENT_SECRET: 'test-client-secret',
      MOCK_GOOGLE_PORT: String(mockGoogle.address().port),
      NODE_OPTIONS: `--require ${preload}`,
      ...env
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  let output = ''
  child.stdout.on('data', chunk => (output += chunk))
  child.stderr.on('data', chunk => (output += chunk))

  const exited = new Promise(resolve => child.once('exit', code => resolve(code)))

  let poll
  let deadline
  const started = await Promise.race([
    new Promise((resolve) => {
      poll = setInterval(() => {
        if (output.includes('Listening')) resolve(true)
      }, 50)
    }),
    exited.then(() => false),
    new Promise((resolve) => {
      deadline = setTimeout(() => resolve(false), 15000)
    })
  ])
  clearInterval(poll)
  clearTimeout(deadline)

  const stop = async () => {
    child.kill()
    await exited
    await new Promise(resolve => mockGoogle.close(resolve))
  }

  /** Petición como si llegara desde un proxy inverso en `publicHost`. */
  const request = (pathname, { method = 'GET', headers = {}, body, publicHost, proto = 'https' } = {}) =>
    new Promise((resolve, reject) => {
      const req = http.request({
        host: '127.0.0.1',
        port,
        path: pathname,
        method,
        headers: {
          ...(publicHost ? { host: publicHost, 'x-forwarded-host': publicHost, 'x-forwarded-proto': proto } : {}),
          ...headers
        }
      }, (res) => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }))
      })
      req.on('error', reject)
      if (body) req.write(body)
      req.end()
    })

  return { started, exited, stop, request, getOutput: () => output }
}

/** Convierte cabeceras Set-Cookie en [{ name, value, attrs, raw }]. */
export function parseSetCookies(headers) {
  return (headers['set-cookie'] ?? []).map((raw) => {
    const [pair, ...attrs] = raw.split(';').map(part => part.trim())
    const eq = pair.indexOf('=')
    return {
      name: pair.slice(0, eq),
      value: pair.slice(eq + 1),
      attrs: attrs.map(attr => attr.toLowerCase()),
      raw
    }
  })
}
