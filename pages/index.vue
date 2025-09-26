<template>
  <div class="min-h-screen bg-gradient-bg">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
      
      <div class="relative px-6 lg:px-8">
        <div class="mx-auto max-w-4xl pt-20 pb-32 sm:pt-32 sm:pb-40">
          <!-- Logo y Título Principal -->
          <div class="text-center mb-16">
            <div class="flex justify-center mb-8">
              <div class="relative">
                <img 
                  src="/logo-bg.png" 
                  alt="AulaLens Logo" 
                  class="h-24 sm:h-32 w-auto rounded-2xl"
                >
              </div>
            </div>
            
            <p class="mt-6 text-xl sm:text-2xl leading-8 text-gray-600 max-w-2xl mx-auto">
              Una lente de claridad para 
              <span class="font-semibold text-aulalens-blue">Google Classroom</span>
            </p>
          </div>

          <!-- Descripción Principal -->
          <div class="text-center mb-16">
            <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl ring-1 ring-gray-900/5">
              <p class="text-lg sm:text-xl text-gray-700 mb-4">
                Dashboard complementario para la ONG 
                <span class="font-bold text-aulalens-purple">Semillero Digital</span>
              </p>
              <p class="text-gray-600">
                Soluciona problemas de seguimiento de alumnos, comunicación y métricas de Google Classroom
              </p>
            </div>
          </div>

          <div class="text-center mb-16">
            <button
              class="inline-flex items-center justify-center gap-3 text-white font-semibold px-12 py-4 rounded-2xl shadow-aulalens-blue cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xl"
              :disabled="loading"
              @click="handleSignIn"
            >
              <UIcon v-if="!loading" name="i-heroicons-rocket-launch" class="w-5 h-5" />
              <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión con Google' }}</span>
            </button>
            
            <!-- Mensaje de error -->
            <div v-if="error" class="mt-4 mx-auto max-w-md">
              <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-sm text-red-600">{{ error }}</p>
              </div>
            </div>
            
            <p class="mt-4 text-sm text-gray-500">
              Accede con tu cuenta de Google para comenzar
            </p>
          </div>

          <!-- Features Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div class="group">
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-aulalens-blue transition-all duration-300 border border-gray-100 hover:border-aulalens-blue">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 bg-aulalens-blue-light">
                  <UIcon name="i-heroicons-chart-bar-square" class="w-7 h-7 text-aulalens-blue" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Seguimiento</h3>
                <p class="text-gray-600 leading-relaxed">
                  Vista consolidada del progreso de cada alumno con métricas detalladas
                </p>
              </div>
            </div>
            
            <div class="group">
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-aulalens-green transition-all duration-300 border border-gray-100 hover:border-aulalens-green">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 bg-aulalens-green-light">
                  <UIcon name="i-heroicons-chat-bubble-left-right" class="w-7 h-7 text-aulalens-green" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Comunicación</h3>
                <p class="text-gray-600 leading-relaxed">
                  Notificaciones centralizadas y sistema de comunicación eficiente
                </p>
              </div>
            </div>
            
            <div class="group">
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-aulalens-purple transition-all duration-300 border border-gray-100 hover:border-aulalens-purple">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 bg-aulalens-purple-light">
                  <UIcon name="i-heroicons-presentation-chart-line" class="w-7 h-7 text-aulalens-purple" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">Métricas</h3>
                <p class="text-gray-600 leading-relaxed">
                  Análisis de asistencia y entregas con reportes automatizados
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 bg-white/70 backdrop-blur-sm">
      <div class="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <div class="text-center">
          <p class="text-sm text-gray-500">
            Desarrollado para <a class="font-semibold text-aulalens-purple" href="https://semillerodigital.org/" target="_blank">Semillero Digital</a> • 
            Potenciado por <a class="font-semibold text-aulalens-blue" href="https://developers.google.com/workspace/classroom/reference" target="_blank">Google Classroom API</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn, status } = useAuth()
const loading = ref(false)
const error = ref<string | null>(null)

// Función para manejar el inicio de sesión directamente
const handleSignIn = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('🚀 Iniciando proceso de login desde página principal...')
    console.log('🔍 Estado actual de auth:', status.value)
    
    await signIn('google', { 
      callbackUrl: '/dashboard-redirect',
      redirect: true 
    })
    
    console.log('ℹ️ SignIn ejecutado desde index, esperando redirección...')
    
  } catch (err) {
    console.error('💥 Error durante el login:', err)
    error.value = `Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`
    loading.value = false
  }
}

// Redireccionar automáticamente si ya está autenticado
watchEffect(() => {
  if (status.value === 'authenticated') {
    navigateTo('/dashboard-redirect')
  }
})

// Configurar meta tags para la página
useHead({
  title: 'AulaLens - Dashboard para Google Classroom',
  meta: [
    { name: 'description', content: 'Dashboard complementario a Google Classroom para la ONG Semillero Digital. Soluciona problemas de seguimiento, comunicación y métricas.' }
  ]
})
</script>
