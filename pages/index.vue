<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <UCard class="w-full max-w-2xl">
      <template #header>
        <div class="text-center">
          <img src="/logo-bg.png" alt="AulaLens Logo" class="w-32 h-32 mx-auto mb-6" />
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AulaLens
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Una lente de claridad para Google Classroom
          </p>
        </div>
      </template>

      <div class="space-y-8">
        <div class="text-center">
          <p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Dashboard complementario para la ONG <strong>Semillero Digital</strong>
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            Soluciona problemas de seguimiento de alumnos, comunicación y métricas de Google Classroom
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Seguimiento</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Vista consolidada del progreso de cada alumno</p>
          </div>
          
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="i-heroicons-chat-bubble-left-right" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Comunicación</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Notificaciones centralizadas y claras</p>
          </div>
          
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="i-heroicons-presentation-chart-line" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Métricas</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Datos de asistencia y entregas ágiles</p>
          </div>
        </div>

        <div class="text-center">
          <UButton
            to="/login"
            color="primary"
            size="xl"
            class="px-8"
          >
            Comenzar
          </UButton>
        </div>
      </div>
    </UCard>
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
