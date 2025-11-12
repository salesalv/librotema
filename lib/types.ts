// Tipos de usuario
export type UserRole = "admin" | "director" | "profesor"

// Usuario
export interface User {
  id: string
  dni: string
  name: string
  password: string
  role: UserRole
  createdAt: string
}

// Materia
export interface Subject {
  id: string
  name: string
  createdAt: string
}

// Curso
export interface Course {
  id: string
  name: string
  createdAt: string
}

// Asignación de materia a curso
export interface SubjectCourse {
  id: string
  subjectId: string
  courseId: string
  createdAt: string
}

// Asignación de profesor a materia
export interface TeacherSubject {
  id: string
  teacherId: string
  subjectId: string
  courseId: string
  createdAt: string
}

// Carácter de la clase
export type ClassCharacter = 
  | "Presentación"
  | "Teórica"
  | "Práctica"
  | "Examen"
  | "Sin clase"
  | "Olimpiada Informática"
  | "Trabajo Final"
  | "Recuperatorio"

// Sesión de clase
export interface ClassSession {
  id: string
  day: number // Día del mes
  month: number // Mes (1-12)
  classNumber: number // Número de clase
  classCharacter: ClassCharacter
  content: string // Contenido de la clase del día
  task: string // Tarea a realizar
  teacherVerification: boolean // Verificación del profesor
  observations: string
  directorVerification?: {
    verified: boolean
    directorName: string
    signature?: string
    verifiedAt?: string
  }
  createdAt: string
}

// Libro de temas
export interface Logbook {
  id: string
  teacherId: string
  subjectId: string
  courseId: string
  sessions: ClassSession[]
  createdAt: string
  updatedAt: string
}


