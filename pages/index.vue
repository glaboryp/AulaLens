<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div class="relative px-6 lg:px-8">
        <div class="mx-auto max-w-4xl pt-20 pb-32 sm:pt-32 sm:pb-40">
          <!-- Logo y Título Principal -->
          <div class="text-center mb-16">
            <div class="flex justify-center mb-8">
              <div class="relative">
                <img 
                  src="/logo-bg.png" 
                  alt="AulaLens Logo" 
                  class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-xl ring-1 ring-gray-900/10 dark:ring-white/10"
                >
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25" />
              </div>
            </div>
            
            <h1 class="text-5xl sm:text-7xl font-bold tracking-tight">
              <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AulaLens
              </span>
            </h1>
            
            <p class="mt-6 text-xl sm:text-2xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Una lente de claridad para 
              <span class="font-semibold text-blue-600 dark:text-blue-400">Google Classroom</span>
            </p>
          </div>

          <!-- Descripción Principal -->
          <div class="text-center mb-16">
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/5">
              <p class="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-4">
                Dashboard complementario para la ONG 
                <span class="font-bold text-indigo-600 dark:text-indigo-400">Semillero Digital</span>
              </p>
              <p class="text-gray-600 dark:text-gray-400">
                Soluciona problemas de seguimiento de alumnos, comunicación y métricas de Google Classroom
              </p>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div class="group">
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700">
                <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UIcon name="i-heroicons-chart-bar-square" class="w-7 h-7 text-white" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Seguimiento</h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Vista consolidada del progreso de cada alumno con métricas detalladas
                </p>
              </div>
            </div>
            
            <div class="group">
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700">
                <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UIcon name="i-heroicons-chat-bubble-left-right" class="w-7 h-7 text-white" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Comunicación</h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Notificaciones centralizadas y sistema de comunicación eficiente
                </p>
              </div>
            </div>
            
            <div class="group">
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700">
                <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UIcon name="i-heroicons-presentation-chart-line" class="w-7 h-7 text-white" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Métricas</h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Análisis de asistencia y entregas con reportes automatizados
                </p>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="text-center">
            <UButton
              to="/loginPage"
              size="xl"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 mr-2" />
              Comenzar Ahora
            </UButton>
            
            <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Inicia sesión con tu cuenta de Google para acceder
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div class="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Desarrollado para <span class="font-semibold">Semillero Digital</span> • 
            Potenciado por <span class="font-semibold">Google Classroom API</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Configurar meta tags para la página
useHead({
  title: 'AulaLens - Dashboard para Google Classroom',
  meta: [
    { name: 'description', content: 'Dashboard complementario a Google Classroom para la ONG Semillero Digital. Soluciona problemas de seguimiento, comunicación y métricas.' }
  ]
})
</script>
