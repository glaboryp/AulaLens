<template>
  <div class="student-course-card">
    <!-- Header del curso -->
    <div class="course-header">
      <div class="course-info">
        <h3 class="course-title" :title="course.name">
          {{ course.name }}
        </h3>
        <p v-if="course.section" class="course-section">
          {{ course.section }}
        </p>
      </div>
      <div class="course-status">
        <span 
          :class="badgeClasses"
          class="course-badge"
        >
          {{ courseStatusText }}
        </span>
      </div>
    </div>

    <!-- Estadísticas rápidas para estudiantes -->
    <div class="course-stats">
      <div class="stat-item">
        <div class="stat-number text-aulalens-blue">{{ pendingAssignments }}</div>
        <div class="stat-label">Tareas Pendientes</div>
      </div>
      <div class="stat-item">
        <div class="stat-number text-aulalens-green">{{ completionPercentage }}%</div>
        <div class="stat-label">Completado</div>
      </div>
    </div>

    <!-- Barra de progreso -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Progreso del curso</span>
        <span class="progress-percentage">{{ completionPercentage }}%</span>
      </div>
      <div class="progress-container">
        <div 
          class="progress-bar"
          :class="progressBarClasses"
          :style="{ width: `${completionPercentage}%` }"
        />
      </div>
    </div>

    <!-- Próxima fecha de entrega -->
    <div v-if="nextDueDate" class="due-date">
      <Icon name="i-heroicons-clock" class="w-4 h-4" :class="dueDateColor" />
      <span :class="dueDateColor">
        Próxima entrega: {{ formatDueDate(nextDueDate) }}
      </span>
    </div>

    <!-- Información adicional -->
    <div class="course-meta h-3">
      <div class="meta-item">
        <Icon v-if="course.room" name="i-heroicons-map-pin" class="w-4 h-4 text-purple-600" />
        <span>{{ course.room }}</span>
      </div>
    </div>

    <!-- Acciones -->
    <div class="flex justify-end items-center mt-4">
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
  </div>
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
const badgeClasses = computed(() => {
  return props.course.courseState === 'ACTIVE' 
    ? 'bg-green-100 text-green-800 border border-green-200' 
    : 'bg-gray-100 text-gray-800 border border-gray-200'
})

const courseStatusText = computed(() => {
  return props.course.courseState === 'ACTIVE' ? 'Activo' : 'Inactivo'
})

const progressBarClasses = computed(() => {
  const percentage = completionPercentage.value
  if (percentage >= 80) return 'bg-aulalens-green'
  if (percentage >= 60) return 'bg-aulalens-blue' 
  if (percentage >= 40) return 'bg-aulalens-orange'
  return 'bg-red-500'
})

const dueDateColor = computed(() => {
  if (!nextDueDate.value) return ''
  
  const now = new Date()
  const dueDate = nextDueDate.value
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff <= 1) return 'text-red-600'
  if (daysDiff <= 3) return 'text-orange-600'
  return 'text-gray-600'
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
.student-course-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  height: 100%;
}

.student-course-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: rgba(60, 164, 216, 0.3);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-section {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-status {
  flex-shrink: 0;
}

.course-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.course-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.progress-percentage {
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-container {
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease-in-out, background-color 0.3s ease-in-out;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.course-meta {
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.student-course-card:hover .course-title {
  color: var(--aulalens-blue);
}
</style>