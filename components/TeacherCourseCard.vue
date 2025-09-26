<template>
  <div class="teacher-course-card">
    <div class="course-header">
      <div class="course-info">
        <h3 class="course-title">{{ course.name }}</h3>
        <p v-if="course.section" class="course-section">{{ course.section }}</p>
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

    <div v-if="course.description" class="course-description">
      <p>{{ truncatedDescription }}</p>
    </div>

    <!-- Estadísticas del Curso -->
    <div class="course-stats">
      <div class="stat-item">
        <Icon name="i-heroicons-user-group" class="w-4 h-4 text-aulalens-blue" />
        <span>{{ course.studentCount }} {{ course.studentCount === 1 ? 'estudiante' : 'estudiantes' }}</span>
      </div>
      <div class="stat-item">
        <Icon name="i-heroicons-document-text" class="w-4 h-4 text-green-600" />
        <span>{{ course.assignmentCount }} {{ course.assignmentCount === 1 ? 'tarea' : 'tareas' }}</span>
      </div>
      <div v-if="course.room" class="stat-item">
        <Icon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-600" />
        <span>Aula {{ course.room }}</span>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="course-meta">
      <div class="meta-item">
        <span class="meta-label">Creado:</span>
        <span class="meta-value">{{ formatDate(course.creationTime) }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Actualizado:</span>
        <span class="meta-value">{{ formatDate(course.updateTime) }}</span>
      </div>
    </div>

    <!-- Acciones -->
    <div class="flex justify-end">
      <UButton
        :to="course.alternateLink"
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
interface Course {
  id: string
  name: string
  section?: string
  description?: string
  room?: string
  ownerId: string
  creationTime: string
  updateTime: string
  courseState: string
  alternateLink: string
}

interface Props {
  course: Course
}

const props = defineProps<Props>()
defineEmits<{
  viewStudents: [course: Course]
  viewAssignments: [course: Course]
}>()

// Computed properties
const truncatedDescription = computed(() => {
  if (!props.course.description) return ''
  return props.course.description.length > 100
    ? props.course.description.substring(0, 100) + '...'
    : props.course.description
})

const badgeClasses = computed(() => {
  return props.course.courseState === 'ACTIVE' 
    ? 'bg-green-100 text-green-800 border border-green-200' 
    : 'bg-gray-100 text-gray-800 border border-gray-200'
})

const courseStatusText = computed(() => {
  return props.course.courseState === 'ACTIVE' ? 'Activo' : 'Inactivo'
})

// Utility functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.teacher-course-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  cursor: pointer;
}

.teacher-course-card:hover {
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
}

.course-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.course-section {
  font-size: 0.875rem;
  color: #6b7280;
}

.course-description {
  margin-bottom: 1rem;
}

.course-description p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.course-stats {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.course-meta {
  margin-bottom: 1rem;
  font-size: 0.75rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.meta-label {
  color: #9ca3af;
}

.meta-value {
  color: #374151;
  font-weight: 500;
}

.teacher-course-card:hover .course-title {
  color: var(--aulalens-blue);
}

.course-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>