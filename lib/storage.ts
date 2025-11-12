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
  const index = logbooks.findIndex((l) => l.id === logbook.id)
  if (index >= 0) {
    logbooks[index] = { ...logbook, updatedAt: new Date().toISOString() }
  } else {
    logbooks.push(logbook)
  }
  saveLogbooks(logbooks)
  return logbook
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


