<template>
  <UCard class="p-6">
    <!-- Header con Avatar y Info del Estudiante -->
    <div class="flex items-center space-x-4 mb-4">
      <UAvatar 
        :src="student.avatarUrl" 
        :alt="student.name"
        size="lg"
        class="flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 truncate">
          {{ student.name }}
        </h3>
        <p class="text-sm text-gray-500 truncate">
          {{ student.email }}
        </p>
      </div>
    </div>

    <!-- Sección de Progreso -->
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">
          Progreso
        </span>
        <span class="text-sm font-semibold" :class="progressTextColor">
          {{ student.progress }}%
        </span>
      </div>
      
      <UProgress 
        :value="student.progress" 
        :color="progressColor"
        size="md"
        class="w-full"
      />
      
      <!-- Indicador de Estado -->
      <div class="flex items-center space-x-2 mt-3">
        <div 
          class="w-2 h-2 rounded-full" 
          :class="progressIndicatorColor"
        />
        <span class="text-xs text-gray-600">
          {{ progressStatus }}
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Student {
  name: string
  email: string
  avatarUrl: string
  progress: number
}

interface Props {
  student: Student
}

const props = defineProps<Props>()

// Computed para determinar el color de la barra de progreso
const progressColor = computed(() => {
  if (props.student.progress > 70) return 'green'
  if (props.student.progress >= 40) return 'yellow'
  return 'red'
})

// Computed para el color del texto del porcentaje
const progressTextColor = computed(() => {
  if (props.student.progress > 70) return 'text-green-600'
  if (props.student.progress >= 40) return 'text-yellow-600'
  return 'text-red-600'
})

// Computed para el indicador de color
const progressIndicatorColor = computed(() => {
  if (props.student.progress > 70) return 'bg-green-500'
  if (props.student.progress >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
})

// Computed para el estado textual del progreso
const progressStatus = computed(() => {
  if (props.student.progress > 70) return 'Excelente progreso'
  if (props.student.progress >= 40) return 'Progreso moderado'
  return 'Necesita atención'
})
</script>
