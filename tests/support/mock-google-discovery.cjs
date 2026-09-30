// Preload solo para tests (NODE_OPTIONS=--require ...).
// openid-client hace discovery contra https://accounts.google.com. Aquí se
// redirige esa petición a un servidor local (MOCK_GOOGLE_PORT) para que el flujo
// de signin sea determinista y no dependa de la red ni de credenciales reales.
const http = require('node:http')
const https = require('node:https')

const mockPort = process.env.MOCK_GOOGLE_PORT

if (mockPort) {
  const originalRequest = https.request

  https.request = function (input, ...rest) {
    // googleapis (gaxios + node-fetch) llama con un objeto de opciones o con una URL, según la versión.
    if (input && typeof input === 'object' && !(input instanceof URL) && input.hostname === 'classroom.googleapis.com') {
      const options = { ...input, protocol: 'http:', hostname: '127.0.0.1', host: '127.0.0.1', port: mockPort }
      delete options.agent
      return http.request(options, ...rest)
    }

    const href = typeof input === 'string' ? input : input instanceof URL ? input.href : null

    if (href && new URL(href).hostname === 'classroom.googleapis.com') {
      const url = new URL(href)
      const [options, ...others] = typeof rest[0] === 'object' ? rest : [{}, ...rest]
      const safeOptions = { ...options }
      delete safeOptions.agent
      return http.request(`http://127.0.0.1:${mockPort}${url.pathname}${url.search}`, safeOptions, ...others)
    }

    if (href && new URL(href).hostname === 'accounts.google.com') {
      const url = new URL(href)
      const [options, ...others] = typeof rest[0] === 'object' ? rest : [{}, ...rest]
      // El agent HTTPS por defecto no es válido para http.request.
      const safeOptions = { ...options }
      delete safeOptions.agent
      return http.request(`http://127.0.0.1:${mockPort}${url.pathname}${url.search}`, safeOptions, ...others)
    }

    return originalRequest.call(this, input, ...rest)
  }
}
