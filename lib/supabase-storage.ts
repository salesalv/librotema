import { supabase } from './supabase'
import type { User, Subject, Course, SubjectCourse, TeacherSubject, Logbook, ClassSession, Especialidad } from './types'

// Funciones para Usuarios
export async function getUsers(): Promise<User[]> {
  if (!supabase) {
    console.error('Supabase no está configurado')
    return []
  }

  // Optimizar: solo seleccionar los campos necesarios
  const { data, error } = await supabase
    .from('users')
    .select('id, dni, name, password, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  if (!data) {
    return []
  }

  return data.map((user) => ({
    id: user.id,
    dni: user.dni,
    name: user.name,
    password: user.password,
    role: user.role as User['role'],
    createdAt: user.created_at,
  }))
}

export async function addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      dni: user.dni,
      name: user.name,
      password: user.password,
      role: user.role,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding user:', error)
    throw error
  }

  return {
    id: data.id,
    dni: data.dni,
    name: data.name,
    password: data.password,
    role: data.role as User['role'],
    createdAt: data.created_at,
  }
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const updateData: any = {}
  if (updates.dni !== undefined) updateData.dni = updates.dni
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.password !== undefined) updateData.password = updates.password
  if (updates.role !== undefined) updateData.role = updates.role

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }

  return {
    id: data.id,
    dni: data.dni,
    name: data.name,
    password: data.password,
    role: data.role as User['role'],
    createdAt: data.created_at,
  }
}

export async function deleteUser(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export async function deleteMultipleUsers(ids: string[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting multiple users:', error)
    throw error
  }
}

export async function getUserByDni(dni: string): Promise<User | undefined> {
  if (!supabase) {
    return undefined
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('dni', dni)
    .single()

  if (error || !data) {
    return undefined
  }

  return {
    id: data.id,
    dni: data.dni,
    name: data.name,
    password: data.password,
    role: data.role as User['role'],
    createdAt: data.created_at,
  }
}

export async function getUsersByRole(role: User['role']): Promise<User[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users by role:', error)
    return []
  }

  return data.map((user) => ({
    id: user.id,
    dni: user.dni,
    name: user.name,
    password: user.password,
    role: user.role as User['role'],
    createdAt: user.created_at,
  }))
}

// Funciones para Materias
export async function getSubjects(): Promise<Subject[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }

  return data.map((subject) => ({
    id: subject.id,
    name: subject.name,
    createdAt: subject.created_at,
  }))
}

export async function addSubject(subject: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      name: subject.name,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding subject:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  }
}

export async function updateSubject(id: string, updates: Partial<Omit<Subject, 'id' | 'createdAt'>>): Promise<Subject> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name

  const { data, error } = await supabase
    .from('subjects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating subject:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  }
}

export async function deleteSubject(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting subject:', error)
    throw error
  }
}

export async function deleteMultipleSubjects(ids: string[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('subjects')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting multiple subjects:', error)
    throw error
  }
}

// Funciones para Especialidades
export async function getEspecialidades(): Promise<Especialidad[]> {
  if (!supabase) {
    console.error('Supabase no está configurado')
    return []
  }

  const { data, error } = await supabase
    .from('especialidades')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching especialidades:', error)
    return []
  }

  if (!data) {
    return []
  }

  return data.map((esp) => ({
    id: esp.id,
    name: esp.name,
    descripcion: esp.descripcion,
    createdAt: esp.created_at,
  }))
}

// Funciones para Cursos
export async function getCourses(): Promise<Course[]> {
  if (!supabase) {
    console.error('Supabase no está configurado')
    return []
  }

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      especialidad:especialidades(id, name, descripcion, created_at)
    `)
    .order('year', { ascending: true })
    .order('turno', { ascending: true })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  if (!data) {
    return []
  }

  return data.map((course) => ({
    id: course.id,
    name: course.name,
    year: course.year,
    division: course.division,
    turno: course.turno,
    especialidadId: course.especialidad_id,
    especialidad: course.especialidad ? {
      id: course.especialidad.id,
      name: course.especialidad.name,
      descripcion: course.especialidad.descripcion,
      createdAt: course.especialidad.created_at,
    } : undefined,
    createdAt: course.created_at,
  }))
}

export async function addCourse(course: Omit<Course, 'id' | 'createdAt' | 'name'>): Promise<Course> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  // El nombre se genera automáticamente por el trigger en la base de datos
  const { data, error } = await supabase
    .from('courses')
    .insert({
      year: course.year,
      division: course.division,
      turno: course.turno,
      especialidad_id: course.especialidadId || null,
    })
    .select(`
      *,
      especialidad:especialidades(id, name, descripcion, created_at)
    `)
    .single()

  if (error) {
    console.error('Error adding course:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    year: data.year,
    division: data.division,
    turno: data.turno,
    especialidadId: data.especialidad_id,
    especialidad: data.especialidad ? {
      id: data.especialidad.id,
      name: data.especialidad.name,
      descripcion: data.especialidad.descripcion,
      createdAt: data.especialidad.created_at,
    } : undefined,
    createdAt: data.created_at,
  }
}

export async function updateCourse(id: string, updates: Partial<Omit<Course, 'id' | 'createdAt' | 'name'>>): Promise<Course> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const updateData: any = {}
  if (updates.year !== undefined) updateData.year = updates.year
  if (updates.division !== undefined) updateData.division = updates.division
  if (updates.turno !== undefined) updateData.turno = updates.turno
  if (updates.especialidadId !== undefined) updateData.especialidad_id = updates.especialidadId

  // El nombre se actualiza automáticamente por el trigger
  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      especialidad:especialidades(id, name, descripcion, created_at)
    `)
    .single()

  if (error) {
    console.error('Error updating course:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    year: data.year,
    division: data.division,
    turno: data.turno,
    especialidadId: data.especialidad_id,
    especialidad: data.especialidad ? {
      id: data.especialidad.id,
      name: data.especialidad.name,
      descripcion: data.especialidad.descripcion,
      createdAt: data.especialidad.created_at,
    } : undefined,
    createdAt: data.created_at,
  }
}

export async function deleteCourse(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error} = await supabase
    .from('courses')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

export async function deleteMultipleCourses(ids: string[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting multiple courses:', error)
    throw error
  }
}

// Funciones para Asignación Materia-Curso
export async function getSubjectCourses(): Promise<SubjectCourse[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('subject_courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subject courses:', error)
    return []
  }

  return data.map((sc) => ({
    id: sc.id,
    subjectId: sc.subject_id,
    courseId: sc.course_id,
    createdAt: sc.created_at,
  }))
}

export async function addSubjectCourse(
  subjectCourse: Omit<SubjectCourse, 'id' | 'createdAt'>
): Promise<SubjectCourse> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { data, error } = await supabase
    .from('subject_courses')
    .insert({
      subject_id: subjectCourse.subjectId,
      course_id: subjectCourse.courseId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding subject course:', error)
    throw error
  }

  return {
    id: data.id,
    subjectId: data.subject_id,
    courseId: data.course_id,
    createdAt: data.created_at,
  }
}

export async function deleteSubjectCourse(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('subject_courses')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting subject course:', error)
    throw error
  }
}

// Funciones para Asignación Profesor-Materia
export async function getTeacherSubjects(): Promise<TeacherSubject[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('teacher_subjects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching teacher subjects:', error)
    return []
  }

  return data.map((ts) => ({
    id: ts.id,
    teacherId: ts.teacher_id,
    subjectId: ts.subject_id,
    courseId: ts.course_id,
    createdAt: ts.created_at,
  }))
}

export async function addTeacherSubject(
  teacherSubject: Omit<TeacherSubject, 'id' | 'createdAt'>
): Promise<TeacherSubject> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { data, error } = await supabase
    .from('teacher_subjects')
    .insert({
      teacher_id: teacherSubject.teacherId,
      subject_id: teacherSubject.subjectId,
      course_id: teacherSubject.courseId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding teacher subject:', error)
    throw error
  }

  return {
    id: data.id,
    teacherId: data.teacher_id,
    subjectId: data.subject_id,
    courseId: data.course_id,
    createdAt: data.created_at,
  }
}

export async function updateTeacherSubject(id: string, updates: Partial<Omit<TeacherSubject, 'id' | 'createdAt'>>): Promise<TeacherSubject> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const updateData: any = {}
  if (updates.teacherId !== undefined) updateData.teacher_id = updates.teacherId
  if (updates.subjectId !== undefined) updateData.subject_id = updates.subjectId
  if (updates.courseId !== undefined) updateData.course_id = updates.courseId

  const { data, error } = await supabase
    .from('teacher_subjects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating teacher subject:', error)
    throw error
  }

  return {
    id: data.id,
    teacherId: data.teacher_id,
    subjectId: data.subject_id,
    courseId: data.course_id,
    createdAt: data.created_at,
  }
}

export async function deleteTeacherSubject(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('teacher_subjects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting teacher subject:', error)
    throw error
  }
}

export async function deleteMultipleTeacherSubjects(ids: string[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const { error } = await supabase
    .from('teacher_subjects')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error deleting multiple teacher subjects:', error)
    throw error
  }
}

// Funciones para Libros de Temas
export async function getLogbooks(): Promise<Logbook[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('logbooks')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching logbooks:', error)
    return []
  }

  const logbooks: Logbook[] = []

  for (const logbook of data) {
    const sessions = await getClassSessions(logbook.id)
    logbooks.push({
      id: logbook.id,
      teacherId: logbook.teacher_id,
      subjectId: logbook.subject_id,
      courseId: logbook.course_id,
      sessions,
      createdAt: logbook.created_at,
      updatedAt: logbook.updated_at,
    })
  }

  return logbooks
}

export async function getLogbookByTeacherAndSubject(
  teacherId: string,
  subjectId: string,
  courseId: string
): Promise<Logbook | undefined> {
  if (!supabase) {
    return undefined
  }

  const { data, error } = await supabase
    .from('logbooks')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('subject_id', subjectId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (error) {
    console.error('Error getting logbook by teacher and subject:', error)
    return undefined
  }
  
  if (!data) {
    return undefined
  }

  const sessions = await getClassSessions(data.id)

  return {
    id: data.id,
    teacherId: data.teacher_id,
    subjectId: data.subject_id,
    courseId: data.course_id,
    sessions,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function addOrUpdateLogbook(logbook: Logbook): Promise<Logbook> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  // Verificar si existe por ID o por combinación teacher/subject/course
  let existing = null
  if (logbook.id) {
    const { data, error } = await supabase
      .from('logbooks')
      .select('*')
      .eq('id', logbook.id)
      .maybeSingle()
    
    // Ignorar error si no existe, solo si es otro tipo de error
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking existing logbook by ID:', error)
    }
    existing = data
  }
  
  // Si no existe por ID, verificar por combinación
  if (!existing) {
    existing = await getLogbookByTeacherAndSubject(
      logbook.teacherId,
      logbook.subjectId,
      logbook.courseId
    )
  }

  if (existing) {
    // Actualizar
    const { data, error } = await supabase
      .from('logbooks')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating logbook:', error)
      throw error
    }

    // Actualizar sesiones
    await updateClassSessions(existing.id, logbook.sessions || [])

    return {
      ...logbook,
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } else {
    // Crear nuevo
    const { data, error } = await supabase
      .from('logbooks')
      .insert({
        teacher_id: logbook.teacherId,
        subject_id: logbook.subjectId,
        course_id: logbook.courseId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating logbook:', error)
      throw error
    }

    // Agregar sesiones
    if (logbook.sessions && logbook.sessions.length > 0) {
      await addClassSessions(data.id, logbook.sessions)
    }

    return {
      ...logbook,
      id: data.id,
      sessions: logbook.sessions || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}

// Funciones auxiliares para sesiones
async function getClassSessions(logbookId: string): Promise<ClassSession[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('logbook_id', logbookId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching class sessions:', error)
    return []
  }

  return data.map((session) => ({
    id: session.id,
    day: session.day,
    month: session.month,
    classNumber: session.class_number,
    classCharacter: session.class_character as ClassSession['classCharacter'],
    content: session.content,
    task: session.task,
    teacherVerification: session.teacher_verification,
    observations: session.observations || '',
    directorVerification: session.director_verification
      ? {
          verified: session.director_verification.verified,
          directorName: session.director_verification.directorName,
          signature: session.director_verification.signature,
          verifiedAt: session.director_verification.verifiedAt,
        }
      : undefined,
    createdAt: session.created_at,
  }))
}

async function addClassSessions(logbookId: string, sessions: ClassSession[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const sessionsToInsert = sessions.map((session) => ({
    logbook_id: logbookId,
    day: session.day,
    month: session.month,
    class_number: session.classNumber,
    class_character: session.classCharacter,
    content: session.content,
    task: session.task,
    teacher_verification: session.teacherVerification,
    observations: session.observations,
    director_verification: session.directorVerification || null,
  }))

  const { error } = await supabase.from('class_sessions').insert(sessionsToInsert)

  if (error) {
    console.error('Error adding class sessions:', error)
    throw error
  }
}

async function updateClassSessions(logbookId: string, sessions: ClassSession[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  // Eliminar sesiones existentes
  await supabase.from('class_sessions').delete().eq('logbook_id', logbookId)

  // Agregar nuevas sesiones
  if (sessions.length > 0) {
    await addClassSessions(logbookId, sessions)
  }
}

// Funciones para Usuario Actual (usar localStorage como caché)
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('libro_temas_current_user')
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('libro_temas_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('libro_temas_current_user')
  }
}

// Inicializar datos (verificar si existe usuario admin)
export async function initializeData(): Promise<void> {
  const admin = await getUserByDni('admin')
  if (!admin) {
    await addUser({
      dni: 'admin',
      name: 'Administrador',
      password: 'admin123',
      role: 'admin',
    })
  }
}

