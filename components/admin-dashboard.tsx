"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { LogOut, Users, BookOpen, GraduationCap, UserPlus, Plus, X, Pencil, Search } from "lucide-react"
import type { User, Subject, Course, SubjectCourse, TeacherSubject, Especialidad, Turno } from "@/lib/types"
import {
  getUsers,
  addUser,
  updateUser,
  deleteMultipleUsers,
  getSubjects,
  addSubject,
  updateSubject,
  deleteMultipleSubjects,
  getEspecialidades,
  getCourses,
  addCourse,
  updateCourse,
  deleteMultipleCourses,
  getSubjectCourses,
  addSubjectCourse,
  deleteSubjectCourse,
  getTeacherSubjects,
  addTeacherSubject,
  updateTeacherSubject,
  deleteMultipleTeacherSubjects,
} from "@/lib/storage-index"
import { toast } from "sonner"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [subjectCourses, setSubjectCourses] = useState<SubjectCourse[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para controlar los diálogos
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false)
  const [isEditSubjectDialogOpen, setIsEditSubjectDialogOpen] = useState(false)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Estados para formularios
  const [newUser, setNewUser] = useState({ dni: "", name: "", password: "", role: "profesor" as User["role"] })
  const [editUser, setEditUser] = useState({ dni: "", name: "", password: "", role: "profesor" as User["role"] })
  const [newSubject, setNewSubject] = useState({ name: "" })
  const [editSubject, setEditSubject] = useState({ name: "" })
  const [newCourse, setNewCourse] = useState({ year: 1, division: 1, turno: "Mañana" as Turno, especialidadId: "" })
  const [editCourse, setEditCourse] = useState({ year: 1, division: 1, turno: "Mañana" as Turno, especialidadId: "" })
  const [searchSubject, setSearchSubject] = useState("")
  const [courseSubjects, setCourseSubjects] = useState<string[]>([])
  const [originalCourseSubjects, setOriginalCourseSubjects] = useState<string[]>([])
  const [newTeacherSubject, setNewTeacherSubject] = useState({ teacherId: "", subjectId: "", courseId: "" })
  
  // Estados para búsqueda en asignación de profesor
  const [searchTeacher, setSearchTeacher] = useState("")
  const [searchSubjectForTeacher, setSearchSubjectForTeacher] = useState("")
  const [searchCourseForTeacher, setSearchCourseForTeacher] = useState("")
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false)
  const [showSubjectForTeacherDropdown, setShowSubjectForTeacherDropdown] = useState(false)
  const [showCourseForTeacherDropdown, setShowCourseForTeacherDropdown] = useState(false)
  
  // Estados para editar asignación de profesor
  const [isEditTeacherSubjectDialogOpen, setIsEditTeacherSubjectDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<{ id: string; name: string } | null>(null)
  const [teacherAssignments, setTeacherAssignments] = useState<Array<{ subjectId: string; courseId: string }>>([])
  const [originalTeacherAssignments, setOriginalTeacherAssignments] = useState<Array<{ id: string; subjectId: string; courseId: string }>>([])
  const [searchSubjectForEdit, setSearchSubjectForEdit] = useState("")
  const [searchCourseForEdit, setSearchCourseForEdit] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")

  // Estados para selección múltiple
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set())
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar usuarios primero (lo más importante)
      const usersData = await getUsers()
      setUsers(usersData)
      
      // Luego cargar el resto en paralelo
      const [subjectsData, especialidadesData, coursesData, subjectCoursesData, teacherSubjectsData] = await Promise.all([
        getSubjects(),
        getEspecialidades(),
        getCourses(),
        getSubjectCourses(),
        getTeacherSubjects(),
      ])
      
      setSubjects(subjectsData)
      setEspecialidades(especialidadesData)
      setCourses(coursesData)
      setSubjectCourses(subjectCoursesData)
      setTeacherSubjects(teacherSubjectsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    // Validar campos requeridos
    if (!newUser.dni || !newUser.name || !newUser.password) {
      toast.error("Campos incompletos", {
        description: "Por favor complete todos los campos requeridos (DNI, Nombre y Contraseña).",
      })
      return
    }

    // Validar formato de DNI (solo números)
    if (!/^\d+$/.test(newUser.dni.trim())) {
      toast.error("DNI inválido", {
        description: "El DNI debe contener solo números.",
      })
      return
    }

    // Validar longitud mínima de contraseña
    if (newUser.password.length < 4) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña debe tener al menos 4 caracteres.",
      })
      return
    }

    try {
      // Guardar el nombre antes de limpiar el formulario
      const userName = newUser.name.trim()
      const userDni = newUser.dni.trim()

      // Verificar si el usuario ya existe (usando la lista actual en memoria para ser más rápido)
      if (users.find((u) => u.dni === userDni)) {
        toast.error("Usuario duplicado", {
          description: `Ya existe un usuario con el DNI ${userDni}. Por favor, use un DNI diferente.`,
        })
        return
      }

      // Crear el usuario
      const createdUser = await addUser({
        dni: userDni,
        name: userName,
        password: newUser.password,
        role: newUser.role,
      })

      // Actualizar la lista de usuarios inmediatamente sin recargar todos los datos
      setUsers([...users, createdUser])

      // Limpiar formulario
      setNewUser({ dni: "", name: "", password: "", role: "profesor" })

      // Cerrar el diálogo
      setIsUserDialogOpen(false)

      // Mostrar mensaje de éxito inmediatamente
      toast.success("Usuario creado exitosamente", {
        description: `El usuario ${userName} ha sido creado correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al crear usuario:", error)
      
      // Mensajes de error específicos según el tipo de error
      if (error?.message?.includes("duplicate") || error?.code === "23505") {
        toast.error("Error al crear usuario", {
          description: "Ya existe un usuario con ese DNI en la base de datos.",
        })
      } else if (error?.message?.includes("permission") || error?.code === "42501") {
        toast.error("Error de permisos", {
          description: "No tienes permisos para crear usuarios. Verifica la configuración de Supabase.",
        })
      } else if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
        toast.error("Error de conexión", {
          description: "No se pudo conectar con la base de datos. Verifica tu conexión a internet.",
        })
      } else {
        toast.error("Error al crear usuario", {
          description: error?.message || "Ocurrió un error inesperado al intentar crear el usuario.",
        })
      }
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    // Validar campos requeridos
    if (!editUser.dni || !editUser.name || !editUser.password) {
      toast.error("Campos incompletos", {
        description: "Por favor complete todos los campos requeridos (DNI, Nombre y Contraseña).",
      })
      return
    }

    // Validar formato de DNI (solo números)
    if (!/^\d+$/.test(editUser.dni.trim())) {
      toast.error("DNI inválido", {
        description: "El DNI debe contener solo números.",
      })
      return
    }

    // Validar longitud mínima de contraseña
    if (editUser.password.length < 4) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña debe tener al menos 4 caracteres.",
      })
      return
    }

    try {
      const userName = editUser.name.trim()
      const userDni = editUser.dni.trim()

      // Verificar si el DNI ya existe en otro usuario
      const existingUser = users.find((u) => u.dni === userDni && u.id !== editingUser.id)
      if (existingUser) {
        toast.error("DNI duplicado", {
          description: `Ya existe otro usuario con el DNI ${userDni}.`,
        })
        return
      }

      // Actualizar el usuario
      await updateUser(editingUser.id, {
        dni: userDni,
        name: userName,
        password: editUser.password,
        role: editUser.role,
      })

      // Actualizar la lista de usuarios en memoria
      setUsers(users.map((u) => 
        u.id === editingUser.id 
          ? { ...u, dni: userDni, name: userName, password: editUser.password, role: editUser.role }
          : u
      ))

      // Cerrar el diálogo y limpiar el estado
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setEditUser({ dni: "", name: "", password: "", role: "profesor" })

      toast.success("Usuario actualizado", {
        description: `El usuario ${userName} ha sido actualizado correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error)
      toast.error("Error al actualizar usuario", {
        description: error?.message || "Ocurrió un error inesperado al intentar actualizar el usuario.",
      })
    }
  }


  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditUser({
      dni: user.dni,
      name: user.name,
      password: user.password,
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const openEditSubjectDialog = (subject: Subject) => {
    setEditingSubject(subject)
    setEditSubject({ name: subject.name })
    setIsEditSubjectDialogOpen(true)
  }

  const handleEditSubject = async () => {
    if (!editingSubject) return

    if (!editSubject.name.trim()) {
      toast.error("Campo incompleto", {
        description: "Por favor ingrese el nombre de la materia.",
      })
      return
    }

    try {
      const subjectName = editSubject.name.trim()

      // Verificar si ya existe otra materia con ese nombre
      const existingSubject = subjects.find(
        (s) => s.name.toLowerCase() === subjectName.toLowerCase() && s.id !== editingSubject.id
      )
      if (existingSubject) {
        toast.error("Nombre duplicado", {
          description: `Ya existe otra materia con el nombre "${subjectName}".`,
        })
        return
      }

      await updateSubject(editingSubject.id, { name: subjectName })

      // Actualizar la lista en memoria
      setSubjects(subjects.map((s) => (s.id === editingSubject.id ? { ...s, name: subjectName } : s)))

      // Cerrar el diálogo y limpiar el estado
      setIsEditSubjectDialogOpen(false)
      setEditingSubject(null)
      setEditSubject({ name: "" })

      toast.success("Materia actualizada", {
        description: `La materia ${subjectName} ha sido actualizada correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al actualizar materia:", error)
      toast.error("Error al actualizar materia", {
        description: error?.message || "Ocurrió un error inesperado al intentar actualizar la materia.",
      })
    }
  }

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      toast.error("Campo incompleto", {
        description: "Por favor ingrese el nombre de la materia.",
      })
      return
    }

    try {
      const subjectName = newSubject.name.trim()
      
      // Verificar si la materia ya existe
      if (subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase())) {
        toast.error("Materia duplicada", {
          description: `Ya existe una materia con el nombre "${subjectName}".`,
        })
        return
      }

      const createdSubject = await addSubject({ name: subjectName })
      
      // Actualizar la lista en memoria
      setSubjects([...subjects, createdSubject])
      
      // Limpiar formulario
      setNewSubject({ name: "" })
      
      // Cerrar el diálogo
      setIsSubjectDialogOpen(false)
      
      toast.success("Materia creada exitosamente", {
        description: `La materia ${subjectName} ha sido creada correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al crear materia:", error)
      toast.error("Error al crear materia", {
        description: error?.message || "Ocurrió un error inesperado al intentar crear la materia.",
      })
    }
  }

  const openEditCourseDialog = (course: Course) => {
    setEditingCourse(course)
    setEditCourse({ 
      year: course.year,
      division: course.division,
      turno: course.turno,
      especialidadId: course.especialidadId || ""
    })
    setSearchSubject("")
    
    // Obtener las materias asignadas a este curso
    const assignedSubjects = subjectCourses
      .filter((sc) => sc.courseId === course.id)
      .map((sc) => sc.subjectId)
    setCourseSubjects(assignedSubjects)
    setOriginalCourseSubjects(assignedSubjects) // Guardar el estado original
    
    setIsEditCourseDialogOpen(true)
  }

  const handleAddSubjectToCourse = (subjectId: string) => {
    if (!editingCourse) return

    // Verificar si la materia ya está asignada
    if (courseSubjects.includes(subjectId)) {
      toast.error("Materia ya asignada", {
        description: "Esta materia ya está asignada a este curso.",
      })
      return
    }

    // Solo actualizar el estado local, no guardar en la base de datos aún
    setCourseSubjects([...courseSubjects, subjectId])
  }

  const handleRemoveSubjectFromCourse = (subjectId: string) => {
    if (!editingCourse) return

    // Solo actualizar el estado local, no guardar en la base de datos aún
    setCourseSubjects(courseSubjects.filter((id) => id !== subjectId))
  }

  const handleEditCourse = async () => {
    if (!editingCourse) return

    // Validar especialidad requerida para años 3-6
    if (editCourse.year >= 3 && !editCourse.especialidadId) {
      toast.error("Campo incompleto", {
        description: "Por favor seleccione una especialidad para cursos de 3ro en adelante.",
      })
      return
    }

    try {
      // Verificar si ya existe otro curso con la misma combinación
      const isDuplicate = courses.some((c) => 
        c.id !== editingCourse.id &&
        c.year === editCourse.year && 
        c.division === editCourse.division &&
        c.turno === editCourse.turno && 
        c.especialidadId === (editCourse.especialidadId || null)
      )
      
      if (isDuplicate) {
        toast.error("Curso duplicado", {
          description: `Ya existe otro curso con esta combinación de año, división, turno y especialidad.`,
        })
        return
      }

      // Actualizar el curso
      const updatedCourse = await updateCourse(editingCourse.id, { 
        year: editCourse.year,
        division: editCourse.division,
        turno: editCourse.turno,
        especialidadId: editCourse.year >= 3 ? editCourse.especialidadId : null,
      })

      // Actualizar la lista de cursos en memoria
      setCourses(courses.map((c) => (c.id === editingCourse.id ? updatedCourse : c)))

      // Sincronizar las materias asignadas
      // 1. Encontrar materias que se eliminaron
      const removedSubjects = originalCourseSubjects.filter((id) => !courseSubjects.includes(id))
      
      // 2. Encontrar materias que se agregaron
      const addedSubjects = courseSubjects.filter((id) => !originalCourseSubjects.includes(id))

      // 3. Encontrar las asignaciones que se deben eliminar
      const assignmentsToRemove = subjectCourses.filter(
        (sc) => removedSubjects.includes(sc.subjectId) && sc.courseId === editingCourse.id
      )

      // 4. Eliminar las asignaciones de la base de datos
      for (const assignment of assignmentsToRemove) {
        await deleteSubjectCourse(assignment.id)
      }

      // 5. Agregar las nuevas asignaciones
      const newAssignments: SubjectCourse[] = []
      for (const subjectId of addedSubjects) {
        const createdAssignment = await addSubjectCourse({ subjectId, courseId: editingCourse.id })
        newAssignments.push(createdAssignment)
      }

      // 6. Actualizar la lista global de una sola vez
      setSubjectCourses((prev) => {
        // Eliminar las asignaciones que se quitaron
        const filtered = prev.filter((sc) => !assignmentsToRemove.some((a) => a.id === sc.id))
        // Agregar las nuevas asignaciones
        return [...filtered, ...newAssignments]
      })

      // Cerrar el diálogo y limpiar el estado
      setIsEditCourseDialogOpen(false)
      setEditingCourse(null)
      setEditCourse({ year: 1, division: 1, turno: "Mañana", especialidadId: "" })
      setCourseSubjects([])
      setOriginalCourseSubjects([])
      setSearchSubject("")

      toast.success("Curso actualizado", {
        description: `El curso ${updatedCourse.name} y sus materias han sido actualizados correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al actualizar curso:", error)
      toast.error("Error al actualizar curso", {
        description: error?.message || "Ocurrió un error inesperado al intentar actualizar el curso.",
      })
    }
  }

  const handleAddCourse = async () => {
    // Validar especialidad requerida para años 3-6
    if (newCourse.year >= 3 && !newCourse.especialidadId) {
      toast.error("Campo incompleto", {
        description: "Por favor seleccione una especialidad para cursos de 3ro en adelante.",
      })
      return
    }

    try {
      // Verificar si ya existe un curso con la misma combinación
      const isDuplicate = courses.some((c) => 
        c.year === newCourse.year && 
        c.division === newCourse.division &&
        c.turno === newCourse.turno && 
        c.especialidadId === (newCourse.especialidadId || null)
      )
      
      if (isDuplicate) {
        toast.error("Curso duplicado", {
          description: `Ya existe un curso con esta combinación de año, división, turno y especialidad.`,
        })
        return
      }

      const createdCourse = await addCourse({ 
        year: newCourse.year,
        division: newCourse.division,
        turno: newCourse.turno,
        especialidadId: newCourse.year >= 3 ? newCourse.especialidadId : null,
      })
      
      // Actualizar la lista en memoria
      setCourses([...courses, createdCourse])
      
      // Limpiar formulario
      setNewCourse({ year: 1, division: 1, turno: "Mañana", especialidadId: "" })
      
      // Cerrar el diálogo
      setIsCourseDialogOpen(false)
      
      toast.success("Curso creado exitosamente", {
        description: `El curso ${createdCourse.name} ha sido creado correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al crear curso:", error)
      toast.error("Error al crear curso", {
        description: error?.message || "Ocurrió un error inesperado al intentar crear el curso.",
      })
    }
  }

  const handleAddTeacherSubject = async () => {
    if (!newTeacherSubject.teacherId || !newTeacherSubject.subjectId || !newTeacherSubject.courseId) {
      toast.error("Campos incompletos", {
        description: "Por favor seleccione profesor, materia y curso.",
      })
      return
    }

    const existing = await getTeacherSubjects()
    if (
      existing.find(
        (ts) =>
          ts.teacherId === newTeacherSubject.teacherId &&
          ts.subjectId === newTeacherSubject.subjectId &&
          ts.courseId === newTeacherSubject.courseId,
      )
    ) {
      toast.error("Asignación duplicada", {
        description: "Este profesor ya está asignado a esta materia y curso.",
      })
      return
    }

    try {
      await addTeacherSubject(newTeacherSubject)
      
      // Actualizar la lista en memoria
      const newAssignment = {
        id: Date.now().toString(),
        teacherId: newTeacherSubject.teacherId,
        subjectId: newTeacherSubject.subjectId,
        courseId: newTeacherSubject.courseId,
        createdAt: new Date().toISOString(),
      }
      setTeacherSubjects([...teacherSubjects, newAssignment])
      
      // Limpiar los campos
      setNewTeacherSubject({ teacherId: "", subjectId: "", courseId: "" })
      setSearchTeacher("")
      setSearchSubjectForTeacher("")
      setSearchCourseForTeacher("")
      
      const teacherName = users.find((u) => u.id === newTeacherSubject.teacherId)?.name || "Profesor"
      const subjectName = subjects.find((s) => s.id === newTeacherSubject.subjectId)?.name || "Materia"
      const courseName = courses.find((c) => c.id === newTeacherSubject.courseId)?.name || "Curso"
      
      toast.success("Asignación creada", {
        description: `${teacherName} asignado a ${subjectName} en ${courseName}.`,
      })
    } catch (error: any) {
      console.error("Error adding teacher subject:", error)
      toast.error("Error al asignar", {
        description: error?.message || "Ocurrió un error inesperado al intentar crear la asignación.",
      })
    }
  }

  const openEditTeacherSubjectDialog = (ts: TeacherSubject) => {
    const teacher = users.find((u) => u.id === ts.teacherId)
    if (!teacher) return

    setEditingTeacher({ id: teacher.id, name: teacher.name })
    
    // Obtener todas las asignaciones del profesor
    const allAssignments = teacherSubjects.filter((t) => t.teacherId === teacher.id)
    
    // Guardar las asignaciones originales
    setOriginalTeacherAssignments(allAssignments.map((a) => ({
      id: a.id,
      subjectId: a.subjectId,
      courseId: a.courseId
    })))
    
    // Setear las asignaciones actuales (solo subjectId y courseId para edición)
    setTeacherAssignments(allAssignments.map((a) => ({
      subjectId: a.subjectId,
      courseId: a.courseId
    })))
    
    // Limpiar búsquedas
    setSearchSubjectForEdit("")
    setSearchCourseForEdit("")
    setSelectedSubjectId("")
    setSelectedCourseId("")
    
    setIsEditTeacherSubjectDialogOpen(true)
  }

  const handleAddAssignmentToTeacher = () => {
    if (!selectedSubjectId || !selectedCourseId) {
      toast.error("Campos incompletos", {
        description: "Debes seleccionar una materia y un curso.",
      })
      return
    }

    // Verificar que no exista ya
    const exists = teacherAssignments.some(
      (a) => a.subjectId === selectedSubjectId && a.courseId === selectedCourseId
    )
    if (exists) {
      toast.error("Asignación duplicada", {
        description: "Esta combinación de materia y curso ya está asignada.",
      })
      return
    }
    
    setTeacherAssignments([...teacherAssignments, { subjectId: selectedSubjectId, courseId: selectedCourseId }])
    
    // Limpiar los campos
    setSearchSubjectForEdit("")
    setSearchCourseForEdit("")
    setSelectedSubjectId("")
    setSelectedCourseId("")
  }

  const handleRemoveAssignmentFromTeacher = (subjectId: string, courseId: string) => {
    setTeacherAssignments(
      teacherAssignments.filter(
        (a) => !(a.subjectId === subjectId && a.courseId === courseId)
      )
    )
  }

  const handleEditTeacherSubject = async () => {
    if (!editingTeacher) return

    if (teacherAssignments.length === 0) {
      toast.error("Sin asignaciones", {
        description: "El profesor debe tener al menos una asignación.",
      })
      return
    }

    try {
      // 1. Encontrar asignaciones que se eliminaron
      const removedAssignments = originalTeacherAssignments.filter(
        (original) =>
          !teacherAssignments.some(
            (current) =>
              current.subjectId === original.subjectId &&
              current.courseId === original.courseId
          )
      )

      // 2. Encontrar asignaciones que se agregaron
      const addedAssignments = teacherAssignments.filter(
        (current) =>
          !originalTeacherAssignments.some(
            (original) =>
              original.subjectId === current.subjectId &&
              original.courseId === current.courseId
          )
      )

      // 3. Eliminar asignaciones de la base de datos
      for (const assignment of removedAssignments) {
        await deleteTeacherSubject(assignment.id)
      }

      // 4. Agregar nuevas asignaciones
      const newAssignments: TeacherSubject[] = []
      for (const assignment of addedAssignments) {
        const created = await addTeacherSubject({
          teacherId: editingTeacher.id,
          subjectId: assignment.subjectId,
          courseId: assignment.courseId,
        })
        newAssignments.push(created)
      }

      // 5. Actualizar la lista global
      setTeacherSubjects((prev) => {
        // Eliminar las asignaciones quitadas
        const filtered = prev.filter(
          (ts) => !removedAssignments.some((a) => a.id === ts.id)
        )
        // Agregar las nuevas asignaciones
        return [...filtered, ...newAssignments]
      })

      // Cerrar el diálogo y limpiar el estado
      setIsEditTeacherSubjectDialogOpen(false)
      setEditingTeacher(null)
      setTeacherAssignments([])
      setOriginalTeacherAssignments([])
      setSearchSubjectForEdit("")
      setSearchCourseForEdit("")

      toast.success("Asignaciones actualizadas", {
        description: `Las asignaciones de ${editingTeacher.name} han sido actualizadas correctamente.`,
      })
    } catch (error: any) {
      console.error("Error al actualizar asignaciones:", error)
      toast.error("Error al actualizar asignaciones", {
        description: error?.message || "Ocurrió un error inesperado al intentar actualizar las asignaciones.",
      })
    }
  }

  // Funciones para selección múltiple de Usuarios
  const toggleUserSelection = (id: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedUsers(newSelection)
  }

  const toggleAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const handleDeleteSelectedUsers = async () => {
    if (selectedUsers.size === 0) return
    
    if (!confirm(`¿Está seguro de eliminar ${selectedUsers.size} usuario(s)?`)) {
      return
    }

    try {
      await deleteMultipleUsers(Array.from(selectedUsers))
      setSelectedUsers(new Set())
      await loadData()
      toast.success("Usuarios eliminados", {
        description: `${selectedUsers.size} usuario(s) eliminado(s) correctamente.`,
      })
    } catch (error: any) {
      toast.error("Error al eliminar usuarios", {
        description: error?.message || "Ocurrió un error inesperado.",
      })
    }
  }

  // Funciones para selección múltiple de Materias
  const toggleSubjectSelection = (id: string) => {
    const newSelection = new Set(selectedSubjects)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedSubjects(newSelection)
  }

  const toggleAllSubjects = () => {
    if (selectedSubjects.size === subjects.length) {
      setSelectedSubjects(new Set())
    } else {
      setSelectedSubjects(new Set(subjects.map(s => s.id)))
    }
  }

  const handleDeleteSelectedSubjects = async () => {
    if (selectedSubjects.size === 0) return
    
    if (!confirm(`¿Está seguro de eliminar ${selectedSubjects.size} materia(s)?`)) {
      return
    }

    try {
      await deleteMultipleSubjects(Array.from(selectedSubjects))
      setSelectedSubjects(new Set())
      await loadData()
      toast.success("Materias eliminadas", {
        description: `${selectedSubjects.size} materia(s) eliminada(s) correctamente.`,
      })
    } catch (error: any) {
      toast.error("Error al eliminar materias", {
        description: error?.message || "Ocurrió un error inesperado.",
      })
    }
  }

  // Funciones para selección múltiple de Cursos
  const toggleCourseSelection = (id: string) => {
    const newSelection = new Set(selectedCourses)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedCourses(newSelection)
  }

  const toggleAllCourses = () => {
    if (selectedCourses.size === courses.length) {
      setSelectedCourses(new Set())
    } else {
      setSelectedCourses(new Set(courses.map(c => c.id)))
    }
  }

  const handleDeleteSelectedCourses = async () => {
    if (selectedCourses.size === 0) return
    
    if (!confirm(`¿Está seguro de eliminar ${selectedCourses.size} curso(s)?`)) {
      return
    }

    try {
      await deleteMultipleCourses(Array.from(selectedCourses))
      setSelectedCourses(new Set())
      await loadData()
      toast.success("Cursos eliminados", {
        description: `${selectedCourses.size} curso(s) eliminado(s) correctamente.`,
      })
    } catch (error: any) {
      toast.error("Error al eliminar cursos", {
        description: error?.message || "Ocurrió un error inesperado.",
      })
    }
  }

  // Funciones para selección múltiple de Asignaciones
  const toggleTeacherSelection = (teacherId: string) => {
    const newSelection = new Set(selectedTeachers)
    if (newSelection.has(teacherId)) {
      newSelection.delete(teacherId)
    } else {
      newSelection.add(teacherId)
    }
    setSelectedTeachers(newSelection)
  }

  const toggleAllTeachers = () => {
    // Obtener todos los teacherIds únicos
    const allTeacherIds = Array.from(new Set(teacherSubjects.map(ts => ts.teacherId)))
    
    if (selectedTeachers.size === allTeacherIds.length) {
      setSelectedTeachers(new Set())
    } else {
      setSelectedTeachers(new Set(allTeacherIds))
    }
  }

  const handleDeleteSelectedTeachers = async () => {
    if (selectedTeachers.size === 0) return
    
    // Obtener todas las asignaciones de los profesores seleccionados
    const assignmentIdsToDelete = teacherSubjects
      .filter(ts => selectedTeachers.has(ts.teacherId))
      .map(ts => ts.id)
    
    if (!confirm(`¿Está seguro de eliminar todas las asignaciones de ${selectedTeachers.size} profesor(es)?`)) {
      return
    }

    try {
      await deleteMultipleTeacherSubjects(assignmentIdsToDelete)
      setSelectedTeachers(new Set())
      await loadData()
      toast.success("Asignaciones eliminadas", {
        description: `Se eliminaron ${assignmentIdsToDelete.length} asignación(es) de ${selectedTeachers.size} profesor(es).`,
      })
    } catch (error: any) {
      toast.error("Error al eliminar asignaciones", {
        description: error?.message || "Ocurrió un error inesperado.",
      })
    }
  }

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "N/A"
  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.name || "N/A"
  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || "N/A"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/20 bg-primary/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Libro Tema</h1>
                <p className="text-muted-foreground">Bienvenido, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="border-primary/20">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="subjects">
              <BookOpen className="h-4 w-4 mr-2" />
              Materias
            </TabsTrigger>
            <TabsTrigger value="courses">
              <GraduationCap className="h-4 w-4 mr-2" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          </TabsList>

          {/* Tab Usuarios */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>Crear y administrar usuarios del sistema</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUsers.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedUsers}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Eliminar {selectedUsers.size} {selectedUsers.size === 1 ? 'usuario' : 'usuarios'}
                      </Button>
                    )}
                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Crear Usuario
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                          <DialogDescription>Complete los datos del nuevo usuario</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>DNI</Label>
                            <Input
                              value={newUser.dni}
                              onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
                              placeholder="Ingrese el DNI"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              placeholder="Ingrese el nombre"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contraseña</Label>
                            <Input
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              placeholder="Ingrese la contraseña"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select
                              value={newUser.role}
                              onValueChange={(value) => setNewUser({ ...newUser, role: value as User["role"] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="director">Director</SelectItem>
                                <SelectItem value="profesor">Profesor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleAddUser} className="w-full bg-primary hover:bg-primary/90">
                            Crear Usuario
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading && users.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>DNI</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Fecha de Creación</TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>Acciones</span>
                            <Checkbox
                              checked={selectedUsers.size === users.length && users.length > 0}
                              onCheckedChange={toggleAllUsers}
                            />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No hay usuarios registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        users
                          .filter((u) => u.role !== "admin")
                          .map((u) => (
                            <TableRow key={u.id}>
                              <TableCell>{u.dni}</TableCell>
                              <TableCell>{u.name}</TableCell>
                              <TableCell>
                                <Badge variant={u.role === "director" ? "default" : "secondary"}>
                                  {u.role === "director" ? "Director" : "Profesor"}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(u)}
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Checkbox
                                    checked={selectedUsers.has(u.id)}
                                    onCheckedChange={() => toggleUserSelection(u.id)}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Diálogo de Edición de Usuario */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Usuario</DialogTitle>
                  <DialogDescription>Modifique los datos del usuario</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>DNI</Label>
                    <Input
                      value={editUser.dni}
                      onChange={(e) => setEditUser({ ...editUser, dni: e.target.value })}
                      onFocus={(e) => {
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                      }}
                      placeholder="Ingrese el DNI"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      onFocus={(e) => {
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                      }}
                      placeholder="Ingrese el nombre"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <Input
                      type="password"
                      value={editUser.password}
                      onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                      onFocus={(e) => {
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                      }}
                      placeholder="Ingrese la contraseña"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select
                      value={editUser.role}
                      onValueChange={(value) => setEditUser({ ...editUser, role: value as User["role"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="profesor">Profesor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleEditUser} className="w-full bg-blue-600 hover:bg-blue-700">
                    Guardar Cambios
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Tab Materias */}
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Materias</CardTitle>
                    <CardDescription>Crear y administrar materias</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSubjects.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedSubjects}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Eliminar {selectedSubjects.size} {selectedSubjects.size === 1 ? 'materia' : 'materias'}
                      </Button>
                    )}
                    <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Materia
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Nueva Materia</DialogTitle>
                          <DialogDescription>Ingrese el nombre de la materia</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Nombre de la Materia</Label>
                            <Input
                              value={newSubject.name}
                              onChange={(e) => setNewSubject({ name: e.target.value })}
                              placeholder="Ej: Matemática"
                            />
                          </div>
                          <Button onClick={handleAddSubject} className="w-full bg-primary hover:bg-primary/90">
                            Crear Materia
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>Acciones</span>
                          <Checkbox
                            checked={selectedSubjects.size === subjects.length && subjects.length > 0}
                            onCheckedChange={toggleAllSubjects}
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No hay materias registradas
                        </TableCell>
                      </TableRow>
                    ) : (
                      subjects.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditSubjectDialog(s)}
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Checkbox
                                checked={selectedSubjects.has(s.id)}
                                onCheckedChange={() => toggleSubjectSelection(s.id)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Diálogo de Edición de Materia */}
            <Dialog open={isEditSubjectDialogOpen} onOpenChange={setIsEditSubjectDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Materia</DialogTitle>
                  <DialogDescription>Modifique el nombre de la materia</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Materia</Label>
                    <Input
                      value={editSubject.name}
                      onChange={(e) => setEditSubject({ name: e.target.value })}
                      onFocus={(e) => {
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                      }}
                      placeholder="Ej: Matemática"
                      autoComplete="off"
                    />
                  </div>
                  <Button onClick={handleEditSubject} className="w-full bg-blue-600 hover:bg-blue-700">
                    Guardar Cambios
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Tab Cursos */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Cursos</CardTitle>
                    <CardDescription>Crear y administrar cursos</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCourses.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedCourses}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Eliminar {selectedCourses.size} {selectedCourses.size === 1 ? 'curso' : 'cursos'}
                      </Button>
                    )}
                    <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Curso
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Curso</DialogTitle>
                          <DialogDescription>Configure el año, turno y especialidad del curso</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {/* Año */}
                          <div className="space-y-2">
                            <Label>Año del Curso</Label>
                            <Select
                              value={newCourse.year.toString()}
                              onValueChange={(value) => setNewCourse({ ...newCourse, year: parseInt(value), especialidadId: parseInt(value) < 3 ? "" : newCourse.especialidadId })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1ro</SelectItem>
                                <SelectItem value="2">2do</SelectItem>
                                <SelectItem value="3">3ro</SelectItem>
                                <SelectItem value="4">4to</SelectItem>
                                <SelectItem value="5">5to</SelectItem>
                                <SelectItem value="6">6to</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* División */}
                          <div className="space-y-2">
                            <Label>División</Label>
                            <Select
                              value={newCourse.division.toString()}
                              onValueChange={(value) => setNewCourse({ ...newCourse, division: parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1ra</SelectItem>
                                <SelectItem value="2">2da</SelectItem>
                                <SelectItem value="3">3ra</SelectItem>
                                <SelectItem value="4">4ta</SelectItem>
                                <SelectItem value="5">5ta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Turno */}
                          <div className="space-y-2">
                            <Label>Turno</Label>
                            <Select
                              value={newCourse.turno}
                              onValueChange={(value) => setNewCourse({ ...newCourse, turno: value as Turno })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mañana">Mañana</SelectItem>
                                <SelectItem value="Tarde">Tarde</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Especialidad (solo para 3ro en adelante) */}
                          {newCourse.year >= 3 && (
                            <div className="space-y-2">
                              <Label>Especialidad *</Label>
                              <Select
                                value={newCourse.especialidadId}
                                onValueChange={(value) => setNewCourse({ ...newCourse, especialidadId: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una especialidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  {especialidades.map((esp) => (
                                    <SelectItem key={esp.id} value={esp.id}>
                                      {esp.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                La especialidad es requerida para cursos de 3ro en adelante
                              </p>
                            </div>
                          )}

                          <Button onClick={handleAddCourse} className="w-full bg-primary hover:bg-primary/90">
                            Crear Curso
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>División</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Materias Asignadas</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>Acciones</span>
                          <Checkbox
                            checked={selectedCourses.size === courses.length && courses.length > 0}
                            onCheckedChange={toggleAllCourses}
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No hay cursos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((c) => {
                        // Obtener las materias asignadas a este curso
                        const assignedSubjectIds = subjectCourses
                          .filter((sc) => sc.courseId === c.id)
                          .map((sc) => sc.subjectId)
                        const assignedSubjectNames = subjects
                          .filter((s) => assignedSubjectIds.includes(s.id))
                          .map((s) => s.name)
                        
                        // Mapeo de año a texto
                        const yearText = ["", "1ro", "2do", "3ro", "4to", "5to", "6to"][c.year] || c.year
                        const divisionText = ["", "1ra", "2da", "3ra", "4ta", "5ta"][c.division] || c.division
                        
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>{yearText}</TableCell>
                            <TableCell>{divisionText}</TableCell>
                            <TableCell>
                              <Badge variant={c.turno === "Mañana" ? "default" : "secondary"}>
                                {c.turno}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {c.especialidad ? (
                                <Badge variant="outline">{c.especialidad.name}</Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {assignedSubjectNames.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {assignedSubjectNames.map((name, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                                    >
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">Sin materias</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditCourseDialog(c)}
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Checkbox
                                  checked={selectedCourses.has(c.id)}
                                  onCheckedChange={() => toggleCourseSelection(c.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Diálogo de Edición de Curso */}
            <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Curso</DialogTitle>
                  <DialogDescription>Modifique el año, turno, especialidad y gestione las materias asignadas</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Año */}
                  <div className="space-y-2">
                    <Label>Año del Curso</Label>
                    <Select
                      value={editCourse.year.toString()}
                      onValueChange={(value) => setEditCourse({ ...editCourse, year: parseInt(value), especialidadId: parseInt(value) < 3 ? "" : editCourse.especialidadId })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1ro</SelectItem>
                        <SelectItem value="2">2do</SelectItem>
                        <SelectItem value="3">3ro</SelectItem>
                        <SelectItem value="4">4to</SelectItem>
                        <SelectItem value="5">5to</SelectItem>
                        <SelectItem value="6">6to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* División */}
                  <div className="space-y-2">
                    <Label>División</Label>
                    <Select
                      value={editCourse.division.toString()}
                      onValueChange={(value) => setEditCourse({ ...editCourse, division: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1ra</SelectItem>
                        <SelectItem value="2">2da</SelectItem>
                        <SelectItem value="3">3ra</SelectItem>
                        <SelectItem value="4">4ta</SelectItem>
                        <SelectItem value="5">5ta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Turno */}
                  <div className="space-y-2">
                    <Label>Turno</Label>
                    <Select
                      value={editCourse.turno}
                      onValueChange={(value) => setEditCourse({ ...editCourse, turno: value as Turno })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mañana">Mañana</SelectItem>
                        <SelectItem value="Tarde">Tarde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Especialidad (solo para 3ro en adelante) */}
                  {editCourse.year >= 3 && (
                    <div className="space-y-2">
                      <Label>Especialidad *</Label>
                      <Select
                        value={editCourse.especialidadId}
                        onValueChange={(value) => setEditCourse({ ...editCourse, especialidadId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {especialidades.map((esp) => (
                            <SelectItem key={esp.id} value={esp.id}>
                              {esp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        La especialidad es requerida para cursos de 3ro en adelante
                      </p>
                    </div>
                  )}

                  {/* Materias Asignadas */}
                  <div className="space-y-2">
                    <Label>Materias Asignadas</Label>
                    {courseSubjects.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                        No hay materias asignadas a este curso
                      </div>
                    ) : (
                      <div className="space-y-2 border rounded-md p-3">
                        {courseSubjects.map((subjectId) => {
                          const subject = subjects.find((s) => s.id === subjectId)
                          return (
                            <div
                              key={subjectId}
                              className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                            >
                              <span className="text-sm font-medium">{subject?.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSubjectFromCourse(subjectId)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Buscar y Agregar Materias */}
                  <div className="space-y-2">
                    <Label>Agregar Materia</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchSubject}
                        onChange={(e) => setSearchSubject(e.target.value)}
                        placeholder="Buscar materia..."
                        className="pl-9"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      {subjects
                        .filter((s) => {
                          const matchesSearch = s.name.toLowerCase().includes(searchSubject.toLowerCase())
                          const notAssigned = !courseSubjects.includes(s.id)
                          return matchesSearch && notAssigned
                        })
                        .map((subject) => (
                          <div
                            key={subject.id}
                            className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleAddSubjectToCourse(subject.id)}
                          >
                            <span className="text-sm">{subject.name}</span>
                            <Plus className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      {subjects.filter((s) => {
                        const matchesSearch = s.name.toLowerCase().includes(searchSubject.toLowerCase())
                        const notAssigned = !courseSubjects.includes(s.id)
                        return matchesSearch && notAssigned
                      }).length === 0 && (
                        <div className="text-sm text-muted-foreground py-4 text-center">
                          {searchSubject ? "No se encontraron materias" : "Todas las materias están asignadas"}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleEditCourse} className="w-full bg-blue-600 hover:bg-blue-700">
                    Guardar Cambios
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Tab Asignaciones */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="max-w-2xl mx-auto">
              {/* Asignar Profesor a Materia */}
              <Card>
                <CardHeader>
                  <CardTitle>Asignar Profesor a Materia</CardTitle>
                  <CardDescription>Seleccione profesor, luego curso, y finalmente la materia del curso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Búsqueda de Profesor */}
                  <div className="space-y-2">
                    <Label>Profesor</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchTeacher}
                        onChange={(e) => {
                          setSearchTeacher(e.target.value)
                          setShowTeacherDropdown(true)
                        }}
                        onFocus={() => setShowTeacherDropdown(true)}
                        placeholder="Buscar profesor..."
                        className="pl-9"
                      />
                    </div>
                    {showTeacherDropdown && searchTeacher && (
                      <div className="relative">
                        <div className="absolute z-50 w-full max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
                          {users
                            .filter((u) => u.role === "profesor" && u.name.toLowerCase().includes(searchTeacher.toLowerCase()))
                            .map((teacher) => (
                              <div
                                key={teacher.id}
                                className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  setNewTeacherSubject({ ...newTeacherSubject, teacherId: teacher.id })
                                  setSearchTeacher(teacher.name)
                                  setShowTeacherDropdown(false)
                                }}
                              >
                                <span className="text-sm">{teacher.name}</span>
                              </div>
                            ))}
                          {users.filter((u) => u.role === "profesor" && u.name.toLowerCase().includes(searchTeacher.toLowerCase())).length === 0 && (
                            <div className="text-sm text-muted-foreground py-4 text-center">
                              No se encontraron profesores
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {newTeacherSubject.teacherId && !showTeacherDropdown && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <span className="text-sm font-medium text-blue-700">
                          {users.find((u) => u.id === newTeacherSubject.teacherId)?.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewTeacherSubject({ ...newTeacherSubject, teacherId: "" })
                            setSearchTeacher("")
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Búsqueda de Curso */}
                  <div className="space-y-2">
                    <Label>Curso</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchCourseForTeacher}
                        onChange={(e) => {
                          setSearchCourseForTeacher(e.target.value)
                          setShowCourseForTeacherDropdown(true)
                        }}
                        onFocus={() => setShowCourseForTeacherDropdown(true)}
                        placeholder="Buscar curso..."
                        className="pl-9"
                      />
                    </div>
                    {showCourseForTeacherDropdown && searchCourseForTeacher && (
                      <div className="relative">
                        <div className="absolute z-50 w-full max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
                          {courses
                            .filter((c) => c.name.toLowerCase().includes(searchCourseForTeacher.toLowerCase()))
                            .map((course) => (
                              <div
                                key={course.id}
                                className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  // Limpiar materia cuando se cambia el curso
                                  setNewTeacherSubject({ ...newTeacherSubject, courseId: course.id, subjectId: "" })
                                  setSearchCourseForTeacher(course.name)
                                  setSearchSubjectForTeacher("")
                                  setShowCourseForTeacherDropdown(false)
                                }}
                              >
                                <span className="text-sm">{course.name}</span>
                              </div>
                            ))}
                          {courses.filter((c) => c.name.toLowerCase().includes(searchCourseForTeacher.toLowerCase())).length === 0 && (
                            <div className="text-sm text-muted-foreground py-4 text-center">
                              No se encontraron cursos
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {newTeacherSubject.courseId && !showCourseForTeacherDropdown && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <span className="text-sm font-medium text-blue-700">
                          {courses.find((c) => c.id === newTeacherSubject.courseId)?.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewTeacherSubject({ ...newTeacherSubject, courseId: "", subjectId: "" })
                            setSearchCourseForTeacher("")
                            setSearchSubjectForTeacher("")
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Búsqueda de Materia (solo si se seleccionó curso) */}
                  <div className="space-y-2">
                    <Label>Materia</Label>
                    {!newTeacherSubject.courseId ? (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <span className="text-sm text-yellow-800">
                          Primero seleccione un curso para ver las materias disponibles
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={searchSubjectForTeacher}
                            onChange={(e) => {
                              setSearchSubjectForTeacher(e.target.value)
                              setShowSubjectForTeacherDropdown(true)
                            }}
                            onFocus={() => setShowSubjectForTeacherDropdown(true)}
                            placeholder="Buscar materia..."
                            className="pl-9"
                          />
                        </div>
                        {showSubjectForTeacherDropdown && searchSubjectForTeacher && (
                          <div className="relative">
                            <div className="absolute z-50 w-full max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
                              {(() => {
                                // Filtrar materias que pertenecen al curso seleccionado
                                const courseSubjectIds = subjectCourses
                                  .filter((sc) => sc.courseId === newTeacherSubject.courseId)
                                  .map((sc) => sc.subjectId)
                                
                                const filteredSubjects = subjects
                                  .filter((s) => 
                                    courseSubjectIds.includes(s.id) &&
                                    s.name.toLowerCase().includes(searchSubjectForTeacher.toLowerCase())
                                  )
                                
                                if (filteredSubjects.length === 0) {
                                  return (
                                    <div className="text-sm text-muted-foreground py-4 text-center">
                                      {courseSubjectIds.length === 0 
                                        ? "Este curso no tiene materias asignadas" 
                                        : "No se encontraron materias"}
                                    </div>
                                  )
                                }
                                
                                return filteredSubjects.map((subject) => (
                                  <div
                                    key={subject.id}
                                    className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setNewTeacherSubject({ ...newTeacherSubject, subjectId: subject.id })
                                      setSearchSubjectForTeacher(subject.name)
                                      setShowSubjectForTeacherDropdown(false)
                                    }}
                                  >
                                    <span className="text-sm">{subject.name}</span>
                                  </div>
                                ))
                              })()}
                            </div>
                          </div>
                        )}
                        {newTeacherSubject.subjectId && !showSubjectForTeacherDropdown && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                            <span className="text-sm font-medium text-blue-700">
                              {subjects.find((s) => s.id === newTeacherSubject.subjectId)?.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewTeacherSubject({ ...newTeacherSubject, subjectId: "" })
                                setSearchSubjectForTeacher("")
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Button onClick={handleAddTeacherSubject} className="w-full bg-green-600 hover:bg-green-700">
                    Asignar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Asignaciones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Asignaciones de Profesores</CardTitle>
                    <CardDescription>Lista de profesores asignados a materias y cursos</CardDescription>
                  </div>
                  {selectedTeachers.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelectedTeachers}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Eliminar {selectedTeachers.size} {selectedTeachers.size === 1 ? 'asignación' : 'asignaciones'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Asignaciones</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>Acciones</span>
                          <Checkbox
                            checked={selectedTeachers.size === Array.from(new Set(teacherSubjects.map(ts => ts.teacherId))).length && teacherSubjects.length > 0}
                            onCheckedChange={toggleAllTeachers}
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherSubjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No hay asignaciones registradas
                        </TableCell>
                      </TableRow>
                    ) : (
                      (() => {
                        // Agrupar asignaciones por profesor
                        const grouped = teacherSubjects.reduce((acc, ts) => {
                          if (!acc[ts.teacherId]) {
                            acc[ts.teacherId] = []
                          }
                          acc[ts.teacherId].push(ts)
                          return acc
                        }, {} as Record<string, TeacherSubject[]>)
                        
                        return Object.entries(grouped).map(([teacherId, assignments]) => (
                          <TableRow key={teacherId}>
                            <TableCell className="font-medium">{getUserName(teacherId)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {assignments.map((ts) => (
                                  <Badge key={ts.id} variant="secondary" className="text-xs">
                                    {getSubjectName(ts.subjectId)} - {getCourseName(ts.courseId)}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditTeacherSubjectDialog(assignments[0])}
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Gestionar asignaciones"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Checkbox
                                  checked={selectedTeachers.has(teacherId)}
                                  onCheckedChange={() => toggleTeacherSelection(teacherId)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      })()
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Diálogo de Edición de Asignaciones del Profesor */}
            <Dialog open={isEditTeacherSubjectDialogOpen} onOpenChange={setIsEditTeacherSubjectDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gestionar Asignaciones del Profesor</DialogTitle>
                  <DialogDescription>
                    Profesor: <span className="font-semibold text-foreground">{editingTeacher?.name}</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Asignaciones Actuales */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Asignaciones Actuales</Label>
                    {teacherAssignments.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                        No hay asignaciones. Agrega al menos una materia y curso.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {teacherAssignments.map((assignment, index) => (
                          <div
                            key={`${assignment.subjectId}-${assignment.courseId}-${index}`}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200"
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-sm font-medium text-blue-900">
                                  {subjects.find((s) => s.id === assignment.subjectId)?.name || "N/A"}
                                </span>
                                <span className="text-sm text-blue-700 mx-2">-</span>
                                <span className="text-sm text-blue-700">
                                  {courses.find((c) => c.id === assignment.courseId)?.name || "N/A"}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveAssignmentFromTeacher(assignment.subjectId, assignment.courseId)
                              }
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4" />

                  {/* Agregar Nueva Asignación */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Agregar Nueva Asignación</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Búsqueda de Materia */}
                      <div className="space-y-2">
                        <Label>Materia</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={searchSubjectForEdit}
                            onChange={(e) => {
                              setSearchSubjectForEdit(e.target.value)
                              if (!e.target.value) setSelectedSubjectId("")
                            }}
                            placeholder="Buscar materia..."
                            className="pl-9"
                            autoComplete="off"
                          />
                        </div>
                        {searchSubjectForEdit && !selectedSubjectId && (
                          <div className="relative">
                            <div className="absolute z-50 w-full max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
                              {subjects
                                .filter((s) => s.name.toLowerCase().includes(searchSubjectForEdit.toLowerCase()))
                                .map((subject) => (
                                  <div
                                    key={subject.id}
                                    className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setSelectedSubjectId(subject.id)
                                      setSearchSubjectForEdit(subject.name)
                                    }}
                                  >
                                    <span className="text-sm">{subject.name}</span>
                                  </div>
                                ))}
                              {subjects.filter((s) => s.name.toLowerCase().includes(searchSubjectForEdit.toLowerCase()))
                                .length === 0 && (
                                <div className="text-sm text-muted-foreground py-4 text-center">
                                  No se encontraron materias
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Búsqueda de Curso */}
                      <div className="space-y-2">
                        <Label>Curso</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={searchCourseForEdit}
                            onChange={(e) => {
                              setSearchCourseForEdit(e.target.value)
                              if (!e.target.value) setSelectedCourseId("")
                            }}
                            placeholder="Buscar curso..."
                            className="pl-9"
                            autoComplete="off"
                          />
                        </div>
                        {searchCourseForEdit && !selectedCourseId && (
                          <div className="relative">
                            <div className="absolute z-50 w-full max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
                              {courses
                                .filter((c) => c.name.toLowerCase().includes(searchCourseForEdit.toLowerCase()))
                                .map((course) => (
                                  <div
                                    key={course.id}
                                    className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b last:border-b-0"
                                    onClick={() => {
                                      setSelectedCourseId(course.id)
                                      setSearchCourseForEdit(course.name)
                                    }}
                                  >
                                    <span className="text-sm">{course.name}</span>
                                  </div>
                                ))}
                              {courses.filter((c) => c.name.toLowerCase().includes(searchCourseForEdit.toLowerCase()))
                                .length === 0 && (
                                <div className="text-sm text-muted-foreground py-4 text-center">
                                  No se encontraron cursos
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botón para agregar la asignación */}
                    <Button 
                      onClick={handleAddAssignmentToTeacher} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!selectedSubjectId || !selectedCourseId}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Asignación
                    </Button>
                  </div>

                  <Button onClick={handleEditTeacherSubject} className="w-full bg-blue-600 hover:bg-blue-700">
                    Guardar Cambios
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


