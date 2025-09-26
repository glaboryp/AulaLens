import { google } from 'googleapis'
import { getServerSession } from '#auth'

// Interfaz para la sesión extendida con tokens de OAuth
interface ExtendedSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
  accessToken?: string
  refreshToken?: string
}

export default defineEventHandler(async (event) => {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(event) as ExtendedSession
    
    if (!session || !session.accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autorizado. Debes iniciar sesión primero.'
      })
    }

    // Configurar el cliente OAuth2 de Google
    const oauth2Client = new google.auth.OAuth2(
      useRuntimeConfig().googleClientId,
      useRuntimeConfig().googleClientSecret
    )

    // Establecer las credenciales con el token de acceso del usuario
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    })

    // Crear el cliente de Google Classroom
    const classroom = google.classroom({
      version: 'v1',
      auth: oauth2Client
    })

    // Obtener la lista de cursos del usuario
    const response = await classroom.courses.list({
      courseStates: ['ACTIVE'], // Solo cursos activos para determinar rol
      pageSize: 100
    })

    const courses = response.data.courses || []
    const userId = session.user?.id

    // Analizar roles
    const ownedCourses = courses.filter(course => course.ownerId === userId)
    const enrolledCourses = courses.filter(course => course.ownerId !== userId)

    let primaryRole = 'student'
    
    // Si tiene al menos 1 curso como profesor, es profesor (incluso si tiene más como estudiante)
    if (ownedCourses.length > 0) {
      primaryRole = 'teacher'
    }

    return {
      primaryRole,
      roles: {
        teacher: ownedCourses.length > 0,
        student: enrolledCourses.length > 0,
      },
      stats: {
        ownedCourses: ownedCourses.length,
        enrolledCourses: enrolledCourses.length,
        totalCourses: courses.length
      }
    }

  } catch (error: unknown) {
    console.error('Error al analizar roles del usuario:', error)

    const errorCode = (error as { code?: number })?.code
    
    if (errorCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token de acceso expirado. Por favor, inicia sesión nuevamente.'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error al analizar los roles del usuario.'
    })
  }
})