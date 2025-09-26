<template>
  <div class="min-h-screen bg-gradient-bg flex items-center justify-center">
    <div class="max-w-md mx-auto text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        Procesando autenticación...
      </h1>
      
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-aulalens-blue mx-auto mb-4" />
        
        <p class="text-gray-600 mb-4">
          Completando el proceso de inicio de sesión
        </p>
        
        <div v-if="error" class="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>
        
        <div class="text-xs text-gray-500">
          <p>URL actual: {{ currentUrl }}</p>
          <p>Estado de auth: {{ status }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { status } = useAuth()
const error = ref<string | null>(null)
const currentUrl = ref('')

onMounted(() => {
  currentUrl.value = window.location.href
  
  // Verificar si hay parámetros de error en la URL
  const urlParams = new URLSearchParams(window.location.search)
  const errorParam = urlParams.get('error')
  
  if (errorParam) {
    error.value = `Error de autenticación: ${errorParam}`
  }
  
  // Esperar un momento y luego redirigir
  setTimeout(() => {
    if (status.value === 'authenticated') {
      navigateTo('/dashboard-redirect')
    } else if (status.value === 'unauthenticated') {
      navigateTo('/')
    }
  }, 2000)
})

useHead({
  title: 'Procesando autenticación - AulaLens'
})
</script>
