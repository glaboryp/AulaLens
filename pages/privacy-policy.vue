<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <NuxtLink to="/" class="inline-block mb-6">
          <img 
            src="/logo-bg.png" 
            alt="AulaLens Logo" 
            class="h-16 w-auto rounded-xl mx-auto"
          >
        </NuxtLink>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Política de Privacidad
        </h1>
        <p class="text-gray-600">
          Última actualización: {{ lastUpdated }}
        </p>
      </div>

      <!-- Contenido -->
      <div class="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
        <div class="max-w-none text-gray-700">
          
          <!-- Introducción -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">1. Introducción</h2>
            <p class="text-gray-700 mb-4">
              En AulaLens, valoramos y protegemos su privacidad. Esta Política de Privacidad explica cómo recopilamos, 
              utilizamos y protegemos su información personal cuando utiliza nuestra aplicación web complementaria a 
              Google Classroom. Al usar AulaLens, aceptas las prácticas descritas en esta política.
            </p>
          </section>

          <!-- Información que recopilamos -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">2. Información que Recopilamos</h2>
            
            <h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">2.1 Información de Google Classroom</h3>
            <p class="text-gray-700 mb-3">Cuando inicias sesión en AulaLens con tu cuenta de Google, obtenemos la información básica de tu perfil para identificarte y gestionar tu sesión. Esto incluye:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Información del perfil (nombre, email, foto de perfil)</li>
              <li>Lista de cursos en los que está inscrito</li>
              <li>Tareas y trabajos de clase</li>
              <li>Estados de entrega de tareas</li>
              <li>Fechas de entrega y calificaciones</li>
            </ul>

            <h3 class="text-xl font-medium text-gray-800 mt-6 mb-3">2.2 Información de Uso</h3>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Registros de acceso y uso de la aplicación</li>
              <li>Preferencias de configuración</li>
              <li>Datos de navegación y interacción con la interfaz</li>
            </ul>
            <p class="text-gray-700 mb-3">Es fundamental destacar que AulaLens solo solicita permisos de solo lectura (readonly) a la API de Google Classroom. Nuestra aplicación no modifica, crea ni elimina tus datos en Classroom.</p>
          </section>

          <!-- Cómo utilizamos la información -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">3. Cómo Utilizamos su Información</h2>
            <p class="text-gray-700 mb-3">Utilizamos la información recopilada para:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li><strong class="text-gray-900">Proporcionar el servicio:</strong> Mostrarte los dashboards, visualizar el progreso de los alumnos, calcular métricas y aplicar los filtros de la aplicación</li>
              <li><strong>Análisis de rendimiento:</strong> Calcular métricas como el "Health Score" académico</li>
              <li><strong>Mejorar la experiencia:</strong> Optimizar la interfaz y funcionalidades</li>
              <li><strong>Comunicación:</strong> Enviar notificaciones relevantes sobre tareas y fechas importantes</li>
            </ul>
          </section>

          <!-- Compartir información -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">4. Compartir Información</h2>
            <p class="text-gray-700 mb-4">
              <strong class="text-gray-900">No vendemos, alquilamos ni compartimos</strong> su información personal identificable con terceros para 
              fines comerciales. Solo compartimos información en las siguientes circunstancias:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Con Google:</strong> A través de su API oficial para obtener datos de Classroom</li>
              <li><strong>Por requerimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
              <li><strong>Con su consentimiento:</strong> Cuando haya dado autorización explícita</li>
            </ul>
          </section>

          <!-- Seguridad -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">5. Seguridad de Datos</h2>
            <p class="text-gray-700 mb-3">Implementamos medidas de seguridad técnicas y organizacionales para proteger su información:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Cifrado:</strong> Todas las comunicaciones utilizan HTTPS/TLS</li>
              <li><strong>Autenticación OAuth 2.0:</strong> Acceso seguro a través del sistema de Google</li>
              <li><strong>Acceso limitado:</strong> Solo el personal autorizado puede acceder a los datos</li>
              <li><strong>Actualizaciones:</strong> Mantenemos los sistemas actualizados con los últimos parches de seguridad</li>
            </ul>
            <p class="text-gray-700 mb-3">La información se obtiene de la API de Google en tiempo real, se procesa en memoria para ser mostrada en el dashboard y se descarta al finalizar la sesión o tras un corto periodo de caché para mejorar el rendimiento.</p>
          </section>

          <!-- Sus derechos -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">6. Sus Derechos</h2>
            <p class="text-gray-700 mb-3">Usted tiene los siguientes derechos respecto a su información personal:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Acceso:</strong> Solicitar una copia de la información que tenemos sobre usted</li>
              <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
              <li><strong>Revocación:</strong> Retirar el consentimiento para el procesamiento de datos</li>
            </ul>
          </section>

          <!-- Cookies y tecnologías -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">7. Cookies y Tecnologías de Seguimiento</h2>
            <p class="text-gray-700 mb-3">Utilizamos cookies y tecnologías similares para:</p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li>Mantener su sesión iniciada</li>
              <li>Recordar sus preferencias</li>
              <li>Analizar el uso de la aplicación</li>
              <li>Mejorar la seguridad</li>
            </ul>
            <p class="text-gray-700">
              Puede desactivar las cookies en su navegador, aunque esto puede afectar la funcionalidad de la aplicación.
            </p>
          </section>

          <!-- Menores de edad -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">8. Menores de Edad</h2>
            <p class="text-gray-700 mb-4">
              AulaLens puede ser utilizada por estudiantes menores de 18 años como parte de programas educativos. En estos casos:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li>Se requiere autorización de padres o tutores</li>
              <li>Los datos se procesan únicamente para fines educativos</li>
              <li>Se aplican protecciones adicionales de privacidad</li>
              <li>Los padres pueden solicitar acceso o eliminación de los datos de sus hijos</li>
            </ul>
          </section>

          <!-- Cambios en la política -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">9. Cambios en esta Política</h2>
            <p class="text-gray-700 mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Los cambios significativos serán 
              notificados através de:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700">
              <li>Un aviso en la aplicación</li>
              <li>Correo electrónico a usuarios registrados</li>
              <li>Actualización de la fecha "Última actualización" en esta página</li>
            </ul>
          </section>

          <!-- Contacto -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">10. Contacto</h2>
            <p class="text-gray-700 mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, puede contactarnos:
            </p>
            <div class="bg-gray-50 rounded-lg p-6">
              <h4 class="font-semibold text-gray-900 mb-2">AulaLens</h4>
              <p class="text-gray-700 text-sm mb-2">
              Email: <a href="mailto:privacy@aulalens.com" class="text-aulalens-blue hover:text-blue-700 transition-colors hover:underline">privacy@aulalens.com</a>
              </p>
              <p class="text-gray-700 text-sm">
              Proyecto desarrollado para fines educativos
                </p>
            </div>
          </section>

        </div>
      </div>

      <!-- Botón de regreso -->
      <div class="text-center mt-8">
        <NuxtLink 
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-aulalens-blue text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          Volver al Inicio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Fecha de última actualización
const lastUpdated = '29 de Septiembre de 2025'

// Configurar meta tags
useHead({
  title: 'Política de Privacidad - AulaLens',
  meta: [
    { 
      name: 'description', 
      content: 'Política de Privacidad de AulaLens - Dashboard complementario a Google Classroom. Conoce cómo protegemos tu información personal.' 
    },
    { name: 'robots', content: 'index,follow' }
  ]
})
</script>