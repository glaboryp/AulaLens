import { google } from 'googleapis'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  try {
    // Verificar que el usuario esté autenticado
    const session = await getServerSession(event)
    
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

    const userId = session.user?.id

    // Primero obtener los cursos donde el usuario es profesor
    const coursesResponse = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 100
    })

    const teacherCourses = (coursesResponse.data.courses || [])
      .filter(course => course.ownerId === userId)

    if (teacherCourses.length === 0) {
      return { students: [] }
    }

    // Obtener estudiantes de todos los cursos del profesor
    const studentsMap = new Map() // Para evitar duplicados
    
    await Promise.all(
      teacherCourses.map(async (course) => {
        try {
          // Obtener estudiantes del curso
          const studentsResponse = await classroom.courses.students.list({
            courseId: course.id!,
            pageSize: 100
          })

          const students = studentsResponse.data.students || []

          // Obtener detalles de cada estudiante y sus tareas
          await Promise.all(
            students.map(async (student) => {
              try {
                // Obtener perfil del estudiante
                const profileResponse = await classroom.userProfiles.get({
                  userId: student.userId!
                })

                const profile = profileResponse.data

                // Si el estudiante ya existe, solo agregar el curso
                if (studentsMap.has(student.userId)) {
                  const existingStudent = studentsMap.get(student.userId)
                  existingStudent.courses.push({
                    id: course.id,
                    name: course.name,
                    section: course.section
                  })
                } else {
                  // Obtener tareas del curso para calcular health score
                  let completedAssignments = 0
                  let totalAssignments = 0
                  let onTimeSubmissions = 0

                  try {
                    // Obtener trabajos del curso
                    const courseworkResponse = await classroom.courses.courseWork.list({
                      courseId: course.id!,
                      pageSize: 100
                    })

                    const courseworks = courseworkResponse.data.courseWork || []
                    totalAssignments += courseworks.length

                    // Para cada tarea, verificar si el estudiante la completó
                    await Promise.all(
                      courseworks.map(async (coursework) => {
                        try {
                          const submissionsResponse = await classroom.courses.courseWork.studentSubmissions.list({
                            courseId: course.id!,
                            courseWorkId: coursework.id!,
                            userId: student.userId!
                          })

                          const submissions = submissionsResponse.data.studentSubmissions || []
                          if (submissions.length > 0) {
                            const submission = submissions[0]
                            if (submission.state === 'TURNED_IN' || submission.state === 'RETURNED') {
                              completedAssignments++

                              // Verificar si se entregó a tiempo
                              if (coursework.dueDate && submission.creationTime) {
                                const dueDate = new Date(
                                  coursework.dueDate.year!,
                                  coursework.dueDate.month! - 1,
                                  coursework.dueDate.day!
                                )
                                const submissionDate = new Date(submission.creationTime)
                                
                                if (submissionDate <= dueDate) {
                                  onTimeSubmissions++
                                }
                              }
                            }
                          }
                        } catch (submissionError) {
                          console.error(`Error obteniendo submissions para ${coursework.id}:`, submissionError)
                        }
                      })
                    )
                  } catch (courseworkError) {
                    console.error(`Error obteniendo coursework para ${course.id}:`, courseworkError)
                  }

                  // Calcular Health Score
                  // Fórmula: (% de tareas completadas * 0.6) + (% de entregas a tiempo * 0.4)
                  const completionRate = totalAssignments > 0 ? completedAssignments / totalAssignments : 0
                  const punctualityRate = completedAssignments > 0 ? onTimeSubmissions / completedAssignments : 0
                  const healthScore = Math.round((completionRate * 60) + (punctualityRate * 40))

                  // Agregar estudiante al mapa
                  studentsMap.set(student.userId, {
                    id: student.userId,
                    name: profile.name?.fullName || 'Nombre no disponible',
                    email: profile.emailAddress,
                    photoUrl: profile.photoUrl,
                    courses: [{
                      id: course.id,
                      name: course.name,
                      section: course.section
                    }],
                    healthScore: healthScore,
                    completedAssignments: completedAssignments,
                    totalAssignments: totalAssignments,
                    onTimeSubmissions: onTimeSubmissions
                  })
                }
              } catch (profileError) {
                console.error(`Error obteniendo perfil del estudiante ${student.userId}:`, profileError)
              }
            })
          )
        } catch (studentsError) {
          console.error(`Error obteniendo estudiantes del curso ${course.id}:`, studentsError)
        }
      })
    )

    // Convertir el mapa a array y ordenar por health score
    const students = Array.from(studentsMap.values())
      .sort((a, b) => b.healthScore - a.healthScore)

    return { students }

  } catch (error: unknown) {
    console.error('Error al obtener estudiantes:', error)

    const errorCode = (error as { code?: number })?.code
    
    if (errorCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token de acceso expirado. Por favor, inicia sesión nuevamente.'
      })
    }

    if (errorCode === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para acceder a Google Classroom.'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al obtener estudiantes.'
    })
  }
})