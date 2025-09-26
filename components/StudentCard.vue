<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
    <!-- Header con foto y nombre -->
    <div class="flex items-start space-x-4 mb-4">
      <div class="flex-shrink-0">
        <img 
          v-if="student.photoUrl" 
          :src="student.photoUrl" 
          :alt="student.name"
          class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        >
        <div 
          v-else
          class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-gray-200"
        >
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
      
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 truncate">{{ student.name }}</h3>
        <p class="text-sm text-gray-600 truncate">{{ student.email }}</p>
      </div>

      <!-- Health Score Badge -->
      <div class="flex-shrink-0">
        <div 
          :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            healthScoreClass
          ]"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {{ student.healthScore }}%
        </div>
      </div>
    </div>

    <!-- Cursos -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Cursos inscritos:</h4>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="course in student.courses" 
          :key="course.id"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          {{ course.name }}
          <span v-if="course.section" class="ml-1 opacity-75">
            ({{ course.section }})
          </span>
        </span>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="border-t border-gray-200 pt-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-lg font-semibold text-gray-900">
            {{ student.completedAssignments }}
          </div>
          <div class="text-xs text-gray-600">Completadas</div>
        </div>
        <div>
          <div class="text-lg font-semibold text-gray-900">
            {{ student.totalAssignments }}
          </div>
          <div class="text-xs text-gray-600">Total</div>
        </div>
        <div>
          <div class="text-lg font-semibold text-gray-900">
            {{ student.onTimeSubmissions }}
          </div>
          <div class="text-xs text-gray-600">A tiempo</div>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progreso de tareas</span>
          <span>{{ completionPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${completionPercentage}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Course {
  id: string
  name: string
  section?: string
}

interface Student {
  id: string
  name: string
  email: string
  photoUrl?: string
  courses: Course[]
  healthScore: number
  completedAssignments: number
  totalAssignments: number
  onTimeSubmissions: number
}

interface Props {
  student: Student
}

const props = defineProps<Props>()

// Calcular porcentaje de completitud
const completionPercentage = computed(() => {
  if (props.student.totalAssignments === 0) return 100
  return Math.round((props.student.completedAssignments / props.student.totalAssignments) * 100)
})

// Clase CSS para el health score basada en el puntaje
const healthScoreClass = computed(() => {
  const score = props.student.healthScore
  
  if (score >= 80) {
    return 'bg-green-100 text-green-800'
  } else if (score >= 50) {
    return 'bg-yellow-100 text-yellow-800'
  } else {
    return 'bg-red-100 text-red-800'
  }
})
</script>