// Composable para manejar el estado de carga global
export const useGlobalLoading = () => {
  // Estado global de carga compartido entre componentes
  // Protegido para SSR
  const globalLoadingState = useState('globalLoading', () => ({
    isNavigating: false,
    isLoadingData: false,
    currentRoute: null as string | null,
  }))

  // Computed que determina si algo está cargando
  // Solo mostrar overlay cuando estamos cargando datos, no durante navegación
  const isLoading = computed(() => 
    globalLoadingState.value.isLoadingData
  )

  // Función para iniciar navegación
  const startNavigation = (route: string) => {
    globalLoadingState.value.isNavigating = true
    globalLoadingState.value.currentRoute = route
  }

  // Función para terminar navegación (transicionar a carga de datos si es necesario)
  const finishNavigation = () => {
    globalLoadingState.value.isNavigating = false
    // Mantener currentRoute para que continúe el spinner hasta que se inicie la carga de datos
    // Si no se inicia carga de datos en 500ms, limpiar automáticamente
    setTimeout(() => {
      if (!globalLoadingState.value.isLoadingData && globalLoadingState.value.currentRoute) {
        globalLoadingState.value.currentRoute = null
      }
    }, 500)
  }

  // Función para iniciar carga de datos
  const startDataLoading = (route?: string) => {
    globalLoadingState.value.isLoadingData = true
    // Si no hay route especificado, mantener el currentRoute actual
    if (route) {
      globalLoadingState.value.currentRoute = route
    }
  }

  // Función para terminar carga de datos
  const finishDataLoading = () => {
    globalLoadingState.value.isLoadingData = false
    globalLoadingState.value.currentRoute = null
  }

  // Función para limpiar todo el estado
  const clearLoading = () => {
    globalLoadingState.value.isNavigating = false
    globalLoadingState.value.isLoadingData = false
    globalLoadingState.value.currentRoute = null
  }

  return {
    globalLoadingState: readonly(globalLoadingState),
    isLoading,
    startNavigation,
    finishNavigation,
    startDataLoading,
    finishDataLoading,
    clearLoading,
  }
}