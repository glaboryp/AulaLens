// Los endpoints de diagnóstico solo existen en desarrollo. `import.meta.dev` se fija
// en el build (no depende de NODE_ENV en el servidor), así que un build de
// producción siempre responde 404, incluso con un entorno mal configurado.
export function assertDevOnly() {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}
