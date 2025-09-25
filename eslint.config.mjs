// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      // Permitir nombres de componentes de una sola palabra en páginas de Nuxt
      'vue/multi-word-component-names': ['error', {
        ignores: ['index', 'error', 'loading']
      }]
    }
  }
)
