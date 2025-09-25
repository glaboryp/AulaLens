<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header del Dashboard -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mis Cursos
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gestiona y supervisa el progreso de tus estudiantes
        </p>
      </div>

      <!-- Estado de Carga -->
      <div v-if="pending" class="flex justify-center items-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"/>
          <p class="text-gray-600 dark:text-gray-400">Cargando cursos...</p>
        </div>
      </div>

      <!-- Estado de Error -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <div class="text-red-600 dark:text-red-400 mb-2">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error al cargar los cursos
          </h3>
          <p class="text-red-600 dark:text-red-400 text-sm mb-4">
            {{ error.message || 'Ha ocurrido un error inesperado' }}
          </p>
          <button 
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            @click="refresh()"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Lista de Cursos -->
      <div v-else-if="data && data.length > 0">
        <!-- Cuadrícula Responsive de Cursos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CourseCard
            v-for="course in data"
            :key="course.id"
            :course="course"
            class="transform hover:scale-105 transition-transform duration-200"
          />
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Resumen
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ data.length }}
              </div>
              <div class="text-sm text-blue-600 dark:text-blue-400">
                Cursos Activos
              </div>
            </div>
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ totalStudents }}
              </div>
              <div class="text-sm text-green-600 dark:text-green-400">
                Total Estudiantes
              </div>
            </div>
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ activeCoursesThisWeek }}
              </div>
              <div class="text-sm text-purple-600 dark:text-purple-400">
                Cursos Esta Semana
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div v-else class="text-center py-12">
        <div class="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 max-w-md mx-auto">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay cursos disponibles
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Aún no tienes cursos en Google Classroom o no tienes permisos para verlos.
          </p>
          <button 
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            @click="refresh()"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Definir el layout de la página
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Interface para el tipo de curso
interface Course {
  id: string
  name: string
  section?: string
  descriptionHeading?: string
  description?: string
  room?: string
  ownerId: string
  creationTime: string
  updateTime: string
  enrollmentCode?: string
  courseState: string
  alternateLink: string
}

// Obtener los cursos usando useFetch
const { data, pending, error, refresh } = await useFetch<Course[]>('/api/classroom/courses', {
  default: () => [],
  server: false, // Ejecutar solo en el cliente para manejar la autenticación
})

// Computed properties para estadísticas
const totalStudents = computed(() => {
  // Por ahora retornamos un valor simulado
  // En el futuro podrías hacer otra llamada API para obtener el número real de estudiantes
  return data.value ? data.value.length * 25 : 0
})

const activeCoursesThisWeek = computed(() => {
  if (!data.value) return 0
  
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return data.value.filter(course => {
    const updateTime = new Date(course.updateTime)
    return updateTime >= oneWeekAgo
  }).length
})

// Meta tags para SEO
useHead({
  title: 'Dashboard - AulaLens',
  meta: [
    {
      name: 'description',
      content: 'Dashboard principal de AulaLens para gestionar cursos y estudiantes de Google Classroom'
    }
  ]
})
</script>
