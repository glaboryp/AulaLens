<template>
  <UCard class="h-full shadow-aulalens-blue hover:shadow-xl transition-all duration-300 transform hover:scale-105">
    <!-- Header del curso -->
    <template #header>
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate" :title="course.name">
            {{ course.name }}
          </h3>
          <p v-if="course.section" class="text-sm text-gray-500 truncate">
            {{ course.section }}
          </p>
        </div>
        <UBadge 
          :color="courseStatusColor"
          variant="subtle"
          size="sm"
        >
          {{ courseStatusText }}
        </UBadge>
      </div>
    </template>

    <!-- Contenido del curso -->
    <div class="space-y-4">
      <!-- Descripción del curso -->
      <div v-if="course.description" class="text-sm text-gray-600 line-clamp-2">
        {{ course.description }}
      </div>

      <!-- Información del aula -->
      <div v-if="course.room" class="flex items-center text-sm text-gray-500">
        <Icon name="i-heroicons-map-pin" class="w-4 h-4 mr-2" />
        {{ course.room }}
      </div>

      <!-- Estadísticas rápidas para estudiantes -->
      <div class="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
        <div class="text-center">
          <div class="text-lg font-semibold text-aulalens-blue">
            {{ pendingAssignments }}
          </div>
          <div class="text-xs text-gray-500">
            Tareas Pendientes
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-aulalens-green">
            {{ completionPercentage }}%
          </div>
          <div class="text-xs text-gray-500">
            Completado
          </div>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-gray-700">
            Progreso del curso
          </span>
          <span class="text-xs text-gray-500">
            {{ completionPercentage }}%
          </span>
        </div>
        <UProgress 
          :value="completionPercentage" 
          :color="progressColor"
          size="sm"
        />
      </div>

      <!-- Próxima fecha de entrega -->
      <div v-if="nextDueDate" class="flex items-center text-sm">
        <Icon name="i-heroicons-clock" class="w-4 h-4 mr-2" :class="dueDateColor" />
        <span :class="dueDateColor">
          Próxima entrega: {{ formatDueDate(nextDueDate) }}
        </span>
      </div>
    </div>

    <!-- Footer del curso -->
    <template #footer>
      <div class="flex justify-between items-center">
        <UButton
          :to="`/course/${course.id}`"
          color="primary"
          variant="ghost"
          size="sm"
        >
          Ver Detalles
        </UButton>
        <UButton
          :href="course.alternateLink"
          target="_blank"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-top-right-on-square"
        >
          Classroom
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Course {
  id: string
  name: string
  section?: string
  description?: string
  room?: string
  ownerId: string
  creationTime: string
  updateTime: string
  enrollmentCode?: string
  courseState: string
  alternateLink: string
}

interface Props {
  course: Course
}

const props = defineProps<Props>()

// Por ahora usamos datos simulados - en el futuro se obtendrán de la API
const pendingAssignments = computed(() => {
  // Simulado: número aleatorio entre 0 y 5 basado en el ID del curso
  const hash = props.course.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return hash % 6
})

const completionPercentage = computed(() => {
  // Simulado: porcentaje basado en el hash del curso
  const hash = props.course.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return Math.max(20, (hash % 100))
})

const nextDueDate = computed(() => {
  // Simulado: próxima fecha de entrega (algunos cursos no tienen)
  const hash = props.course.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  if (hash % 3 === 0) return null // Algunos cursos no tienen fechas próximas
  
  const days = (hash % 7) + 1
  const future = new Date()
  future.setDate(future.getDate() + days)
  return future
})

// Computed para colores y estados
const courseStatusColor = computed(() => {
  return props.course.courseState === 'ACTIVE' ? 'success' : 'neutral'
})

const courseStatusText = computed(() => {
  return props.course.courseState === 'ACTIVE' ? 'Activo' : 'Inactivo'
})

const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning' 
  if (percentage >= 40) return 'info'
  return 'error'
})

const dueDateColor = computed(() => {
  if (!nextDueDate.value) return ''
  
  const now = new Date()
  const dueDate = nextDueDate.value
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 1) return 'text-red-600 dark:text-red-400'
  if (daysDiff <= 3) return 'text-orange-600 dark:text-orange-400'
  return 'text-gray-600 dark:text-gray-400'
})

// Función para formatear fechas
const formatDueDate = (date: Date) => {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays <= 7) return `En ${diffDays} días`
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>