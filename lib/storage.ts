import type { User, Subject, Course, SubjectCourse, TeacherSubject, Logbook } from "./types"

// Clave para localStorage
const STORAGE_KEYS = {
  USERS: "libro_temas_users",
  SUBJECTS: "libro_temas_subjects",
  COURSES: "libro_temas_courses",
  SUBJECT_COURSES: "libro_temas_subject_courses",
  TEACHER_SUBJECTS: "libro_temas_teacher_subjects",
  LOGBOOKS: "libro_temas_logbooks",
  CURRENT_USER: "libro_temas_current_user",
}

// Funciones para Usuarios
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getUsers()
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  saveUsers(users)
  return newUser
}

export function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): User {
  if (typeof window === "undefined") throw new Error("No se puede acceder a localStorage en el servidor")
  const users = getUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) throw new Error("Usuario no encontrado")
  
  const updatedUser = { ...users[index], ...updates }
  users[index] = updatedUser
  saveUsers(users)
  return updatedUser
}

export function deleteUser(id: string): void {
  if (typeof window === "undefined") throw new Error("No se puede acceder a localStorage en el servidor")
  const users = getUsers()
  const filteredUsers = users.filter((u) => u.id !== id)
  saveUsers(filteredUsers)
}

export function getUserByDni(dni: string): User | undefined {
  return getUsers().find((u) => u.dni === dni)
}

export function getUsersByRole(role: User["role"]): User[] {
  return getUsers().filter((u) => u.role === role)
}

// Funciones para Materias
export function getSubjects(): Subject[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS)
  return data ? JSON.parse(data) : []
}

export function saveSubjects(subjects: Subject[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects))
}

export function addSubject(subject: Omit<Subject, "id" | "createdAt">): Subject {
  const subjects = getSubjects()
  const newSubject: Subject = {
    ...subject,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  subjects.push(newSubject)
  saveSubjects(subjects)
  return newSubject
}

export function updateSubject(id: string, updates: Partial<Omit<Subject, "id" | "createdAt">>): Subject {
  if (typeof window === "undefined") throw new Error("No se puede acceder a localStorage en el servidor")
  const subjects = getSubjects()
  const index = subjects.findIndex((s) => s.id === id)
  if (index === -1) throw new Error("Materia no encontrada")
  
  const updatedSubject = { ...subjects[index], ...updates }
  subjects[index] = updatedSubject
  saveSubjects(subjects)
  return updatedSubject
}

export function deleteSubject(id: string): void {
  if (typeof window === "undefined") throw new Error("No se puede acceder a localStorage en el servidor")
  const subjects = getSubjects()
  const filteredSubjects = subjects.filter((s) => s.id !== id)
  saveSubjects(filteredSubjects)
}

// Funciones para Cursos
export function getCourses(): Course[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.COURSES)
  return data ? JSON.parse(data) : []
}

export function saveCourses(courses: Course[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))
}

export function addCourse(course: Omit<Course, "id" | "createdAt">): Course {
  const courses = getCourses()
  const newCourse: Course = {
    ...course,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  courses.push(newCourse)
  saveCourses(courses)
  return newCourse
}

export function updateCourse(id: string, updates: Partial<Omit<Course, "id" | "createdAt">>): Course {
  if (typeof window === "undefined") throw new Error("No se puede acceder a localStorage en el servidor")
  const courses = getCourses()
  const index = courses.findIndex((c) => c.id === id)
  if (index === -1) throw new Error("Curso no encontrado")
  
  const updatedCourse = { ...courses[index], ...updates }
  courses[index] = updatedCourse
  saveCourses(courses)
  return updatedCourse
}

export function deleteCourse(id: string): void {
  if (typeof window === "undefined") throw new Error("No se puede acceder a localStorage en el servidor")
  const courses = getCourses()
  const filteredCourses = courses.filter((c) => c.id !== id)
  saveCourses(filteredCourses)
}

// Funciones para Asignación Materia-Curso
export function getSubjectCourses(): SubjectCourse[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.SUBJECT_COURSES)
  return data ? JSON.parse(data) : []
}

export function saveSubjectCourses(subjectCourses: SubjectCourse[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SUBJECT_COURSES, JSON.stringify(subjectCourses))
}

export function addSubjectCourse(
  subjectCourse: Omit<SubjectCourse, "id" | "createdAt">,
): SubjectCourse {
  const subjectCourses = getSubjectCourses()
  const newSubjectCourse: SubjectCourse = {
    ...subjectCourse,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  subjectCourses.push(newSubjectCourse)
  saveSubjectCourses(subjectCourses)
  return newSubjectCourse
}

export function deleteSubjectCourse(id: string): void {
  if (typeof window === "undefined")
    throw new Error("No se puede acceder a localStorage en el servidor")
  const subjectCourses = getSubjectCourses()
  const filteredSubjectCourses = subjectCourses.filter((sc) => sc.id !== id)
  saveSubjectCourses(filteredSubjectCourses)
}

// Funciones para Asignación Profesor-Materia
export function getTeacherSubjects(): TeacherSubject[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS)
  return data ? JSON.parse(data) : []
}

export function saveTeacherSubjects(teacherSubjects: TeacherSubject[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(teacherSubjects))
}

export function addTeacherSubject(
  teacherSubject: Omit<TeacherSubject, "id" | "createdAt">,
): TeacherSubject {
  const teacherSubjects = getTeacherSubjects()
  const newTeacherSubject: TeacherSubject = {
    ...teacherSubject,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  teacherSubjects.push(newTeacherSubject)
  saveTeacherSubjects(teacherSubjects)
  return newTeacherSubject
}

export function updateTeacherSubject(id: string, updates: Partial<Omit<TeacherSubject, "id" | "createdAt">>): TeacherSubject {
  if (typeof window === "undefined")
    throw new Error("No se puede acceder a localStorage en el servidor")
  const teacherSubjects = getTeacherSubjects()
  const index = teacherSubjects.findIndex((ts) => ts.id === id)
  if (index === -1) throw new Error("Asignación no encontrada")
  
  const updatedTeacherSubject = { ...teacherSubjects[index], ...updates }
  teacherSubjects[index] = updatedTeacherSubject
  saveTeacherSubjects(teacherSubjects)
  return updatedTeacherSubject
}

export function deleteTeacherSubject(id: string): void {
  if (typeof window === "undefined")
    throw new Error("No se puede acceder a localStorage en el servidor")
  const teacherSubjects = getTeacherSubjects()
  const filteredTeacherSubjects = teacherSubjects.filter((ts) => ts.id !== id)
  saveTeacherSubjects(filteredTeacherSubjects)
}

// Funciones para Libros de Temas
export function getLogbooks(): Logbook[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.LOGBOOKS)
  return data ? JSON.parse(data) : []
}

export function saveLogbooks(logbooks: Logbook[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.LOGBOOKS, JSON.stringify(logbooks))
}

export function getLogbookByTeacherAndSubject(
  teacherId: string,
  subjectId: string,
  courseId: string,
): Logbook | undefined {
  return getLogbooks().find(
    (l) => l.teacherId === teacherId && l.subjectId === subjectId && l.courseId === courseId,
  )
}

export function addOrUpdateLogbook(logbook: Logbook): Logbook {
  const logbooks = getLogbooks()
  
  // Si no tiene ID o el ID no existe, crear uno nuevo
  if (!logbook.id || !logbooks.find((l) => l.id === logbook.id)) {
    const newLogbook = {
      ...logbook,
      id: logbook.id || Date.now().toString() + Math.random().toString(),
      createdAt: logbook.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    logbooks.push(newLogbook)
    saveLogbooks(logbooks)
    return newLogbook
  } else {
    // Actualizar existente
    const index = logbooks.findIndex((l) => l.id === logbook.id)
    logbooks[index] = { ...logbook, updatedAt: new Date().toISOString() }
    saveLogbooks(logbooks)
    return logbooks[index]
  }
}

// Funciones para Usuario Actual
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

// Inicializar datos de ejemplo
export function initializeData(): void {
  if (typeof window === "undefined") return
  
  // Solo inicializar si no hay datos
  if (getUsers().length === 0) {
    // Crear usuario admin por defecto
    addUser({
      dni: "admin",
      name: "Administrador",
      password: "admin123",
      role: "admin",
    })
  }
}


