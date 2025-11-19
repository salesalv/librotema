"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LogOut, BookOpen, CheckCircle, ChevronDown, ChevronRight, Download } from "lucide-react"
import type { User, Logbook, ClassSession, Subject, Course } from "@/lib/types"
import {
  getUsers,
  getSubjects,
  getCourses,
  getLogbooks,
  getTeacherSubjects,
  addOrUpdateLogbook,
} from "@/lib/storage-index"
import { generateLogbookPDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

interface DirectorDashboardProps {
  user: User
  onLogout: () => void
}

export function DirectorDashboard({ user, onLogout }: DirectorDashboardProps) {
  const [teachers, setTeachers] = useState<User[]>([])
  const [logbooks, setLogbooks] = useState<Logbook[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([])
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [expandedLogbooks, setExpandedLogbooks] = useState<Set<string>>(new Set())
  
  // Filtros por logbook (cada logbook tiene sus propios filtros)
  const [sessionFilters, setSessionFilters] = useState<Record<string, {
    month: string
    character: string
    sortOrder: 'asc' | 'desc'
  }>>({})
  
  // Inicializar filtros para un logbook
  const getSessionFilter = (logbookId: string) => {
    return sessionFilters[logbookId] || { month: 'all', character: 'all', sortOrder: 'asc' }
  }
  
  // Actualizar filtro de un logbook específico
  const updateSessionFilter = (logbookId: string, filterKey: string, value: any) => {
    setSessionFilters(prev => ({
      ...prev,
      [logbookId]: {
        ...getSessionFilter(logbookId),
        [filterKey]: value
      }
    }))
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [allUsers, allLogbooks, allSubjects, allCourses, allTeacherSubjects] = await Promise.all([
      getUsers(),
      getLogbooks(),
      getSubjects(),
      getCourses(),
      getTeacherSubjects(),
    ])
    setTeachers(allUsers.filter((u) => u.role === "profesor"))
    setLogbooks(allLogbooks)
    setSubjects(allSubjects)
    setCourses(allCourses)
    setTeacherSubjects(allTeacherSubjects)
  }

  const getSubjectName = (id: string) => {
    return subjects.find((s) => s.id === id)?.name || "N/A"
  }

  const getCourseName = (id: string) => {
    return courses.find((c) => c.id === id)?.name || "N/A"
  }

  const getTeacherName = (id: string) => {
    return teachers.find((u) => u.id === id)?.name || "N/A"
  }

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return months[month - 1] || ""
  }

  const classCharacters = ["Teórica", "Práctica", "Teórico-Práctica", "Evaluación", "Otras"] as const

  // Filtrar y ordenar sesiones de un logbook
  const getFilteredAndSortedSessions = (logbook: Logbook) => {
    const filter = getSessionFilter(logbook.id)
    let filtered = [...logbook.sessions]

    // Filtrar por mes
    if (filter.month !== 'all') {
      filtered = filtered.filter(s => s.month === parseInt(filter.month))
    }

    // Filtrar por carácter
    if (filter.character !== 'all') {
      filtered = filtered.filter(s => s.classCharacter === filter.character)
    }

    // Ordenar por número de clase
    filtered.sort((a, b) => {
      if (filter.sortOrder === 'asc') {
        return (a.classNumber || 0) - (b.classNumber || 0)
      } else {
        return (b.classNumber || 0) - (a.classNumber || 0)
      }
    })

    return filtered
  }

  // Obtener materias disponibles según el curso seleccionado
  const getAvailableSubjects = () => {
    if (courseFilter === "all") {
      // Si no hay curso seleccionado, mostrar todas las materias
      return subjects
    }
    
    // Obtener las materias del curso seleccionado
    const subjectIds = teacherSubjects
      .filter(ts => ts.courseId === courseFilter)
      .map(ts => ts.subjectId)
    
    return subjects.filter(subject => subjectIds.includes(subject.id))
  }

  // Obtener profesores disponibles según curso y materia
  const getAvailableTeachers = () => {
    let filtered = teacherSubjects

    // Filtrar por curso
    if (courseFilter !== "all") {
      filtered = filtered.filter(ts => ts.courseId === courseFilter)
    }

    // Filtrar por materia
    if (subjectFilter !== "all") {
      filtered = filtered.filter(ts => ts.subjectId === subjectFilter)
    }

    // Obtener IDs únicos de profesores
    const teacherIds = Array.from(new Set(filtered.map(ts => ts.teacherId)))
    
    return teachers.filter(teacher => teacherIds.includes(teacher.id))
  }

  // Limpiar filtros en cascada cuando cambia el curso
  useEffect(() => {
    setSubjectFilter("all")
    setSelectedTeacher("")
  }, [courseFilter])

  // Autocompletar profesor y limpiar cuando cambia la materia
  useEffect(() => {
    setSelectedTeacher("")
    
    // Si hay materia seleccionada, verificar si solo hay un profesor
    if (subjectFilter !== "all" && courseFilter !== "all") {
      let filtered = teacherSubjects
        .filter(ts => ts.courseId === courseFilter)
        .filter(ts => ts.subjectId === subjectFilter)
      
      const teacherIds = Array.from(new Set(filtered.map(ts => ts.teacherId)))
      const availableTeachers = teachers.filter(teacher => teacherIds.includes(teacher.id))
      
      if (availableTeachers.length === 1) {
        setSelectedTeacher(availableTeachers[0].id)
      }
    }
  }, [subjectFilter, courseFilter, teacherSubjects, teachers])

  const filteredLogbooks = logbooks
    .filter((l) => {
      // Filtro por curso
      if (courseFilter !== "all" && l.courseId !== courseFilter) {
        return false
      }
      // Filtro por materia
      if (subjectFilter !== "all" && l.subjectId !== subjectFilter) {
        return false
      }
      // Filtro por profesor
      if (selectedTeacher && selectedTeacher !== "all" && l.teacherId !== selectedTeacher) {
        return false
      }
      return true
    })

  const toggleLogbook = (logbookId: string) => {
    setExpandedLogbooks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(logbookId)) {
        newSet.delete(logbookId)
      } else {
        newSet.add(logbookId)
      }
      return newSet
    })
  }

  const handleVerifySession = async (logbookId: string, sessionId: string) => {
    const logbook = logbooks.find((l) => l.id === logbookId)
    if (!logbook) return

    try {
      const updatedSessions = logbook.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              directorVerification: {
                verified: true,
                directorName: user.name,
                signature: user.name, // Usar el nombre del director como firma
                verifiedAt: new Date().toISOString(),
              },
            }
          : session,
      )

      const updatedLogbook: Logbook = {
        ...logbook,
        sessions: updatedSessions,
        updatedAt: new Date().toISOString(),
      }

      await addOrUpdateLogbook(updatedLogbook)
      
      // Actualizar el estado local
      setLogbooks(logbooks.map((l) => (l.id === logbookId ? updatedLogbook : l)))
      
      toast.success("Clase verificada", {
        description: `Verificado por ${user.name}`,
      })
    } catch (error: any) {
      console.error("Error al verificar clase:", error)
      toast.error("Error al verificar clase", {
        description: error?.message || "Ocurrió un error inesperado al intentar verificar la clase.",
      })
    }
  }

  const handleDownloadPDF = (logbook: Logbook) => {
    const subjectName = getSubjectName(logbook.subjectId)
    const courseName = getCourseName(logbook.courseId)
    const teacherName = getTeacherName(logbook.teacherId)
    
    generateLogbookPDF({
      logbook,
      teacherName,
      subjectName,
      courseName
    })
  }

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
                <h1 className="text-2xl font-bold text-foreground">Libro de Tema</h1>
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
        <div className="grid gap-6">
          {/* Filtros */}
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro de Curso */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="course-filter" className="font-semibold">1. Filtrar por Curso:</Label>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger id="course-filter">
                      <SelectValue placeholder="Todos los cursos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los cursos</SelectItem>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Materia */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subject-filter" className="font-semibold">2. Filtrar por Materia:</Label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger id="subject-filter">
                      <SelectValue placeholder="Todas las materias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las materias</SelectItem>
                      {getAvailableSubjects().map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Profesor */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="teacher-filter" className="font-semibold">3. Filtrar por Profesor:</Label>
                  <Select value={selectedTeacher || "all"} onValueChange={(value) => setSelectedTeacher(value === "all" ? "" : value)}>
                    <SelectTrigger id="teacher-filter">
                      <SelectValue placeholder="Todos los profesores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los profesores</SelectItem>
                      {getAvailableTeachers().map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Libros de Temas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Libros de Temas
              </CardTitle>
              <CardDescription>Contenidos y verificaciones de las clases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogbooks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay libros de temas disponibles</p>
                  </div>
                ) : (
                  filteredLogbooks.map((logbook) => {
                    const teacherName = getTeacherName(logbook.teacherId)
                    const subjectName = getSubjectName(logbook.subjectId)
                    const courseName = getCourseName(logbook.courseId)
                    const verifiedCount = logbook.sessions.filter(
                      (s) => s.directorVerification?.verified,
                    ).length
                    const isExpanded = expandedLogbooks.has(logbook.id)

                    return (
                      <Card key={logbook.id} className="border border-border hover:border-primary/50 transition-colors">
                        <div 
                          className="flex items-center justify-between p-6 cursor-pointer"
                          onClick={() => toggleLogbook(logbook.id)}
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {subjectName} - {courseName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Profesor: {teacherName}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="text-sm">
                              {verifiedCount} / {logbook.sessions.length} verificadas
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPDF(logbook)
                              }}
                              className="border-primary/30 hover:bg-primary/10"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLogbook(logbook.id)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <CardContent className="pt-0 pb-6">
                            {/* Filtros de sesiones */}
                            {logbook.sessions.length > 0 && (
                              <Card className="mb-4 bg-muted/30">
                                <CardContent className="pt-4">
                                  <div className="flex flex-wrap gap-3 items-end">
                                    {/* Filtro por mes */}
                                    <div className="flex-1 min-w-[150px]">
                                      <Label htmlFor={`month-filter-${logbook.id}`} className="text-sm font-medium">Filtrar por Mes:</Label>
                                      <Select 
                                        value={getSessionFilter(logbook.id).month} 
                                        onValueChange={(value) => updateSessionFilter(logbook.id, 'month', value)}
                                      >
                                        <SelectTrigger id={`month-filter-${logbook.id}`} className="mt-1">
                                          <SelectValue placeholder="Todos los meses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">Todos los meses</SelectItem>
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                                            <SelectItem key={month} value={month.toString()}>
                                              {getMonthName(month)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Filtro por carácter */}
                                    <div className="flex-1 min-w-[150px]">
                                      <Label htmlFor={`character-filter-${logbook.id}`} className="text-sm font-medium">Filtrar por Carácter:</Label>
                                      <Select 
                                        value={getSessionFilter(logbook.id).character} 
                                        onValueChange={(value) => updateSessionFilter(logbook.id, 'character', value)}
                                      >
                                        <SelectTrigger id={`character-filter-${logbook.id}`} className="mt-1">
                                          <SelectValue placeholder="Todos los caracteres" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">Todos los caracteres</SelectItem>
                                          {classCharacters.map(char => (
                                            <SelectItem key={char} value={char}>
                                              {char}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Botón de orden */}
                                    <div className="flex-1 min-w-[150px]">
                                      <Label className="text-sm font-medium">Ordenar por N° Clase:</Label>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateSessionFilter(
                                          logbook.id, 
                                          'sortOrder', 
                                          getSessionFilter(logbook.id).sortOrder === 'asc' ? 'desc' : 'asc'
                                        )}
                                        className="w-full mt-1"
                                      >
                                        {getSessionFilter(logbook.id).sortOrder === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            <div className="overflow-x-auto">
                              <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Día</TableHead>
                                  <TableHead>Mes</TableHead>
                                  <TableHead>Clase N°</TableHead>
                                  <TableHead>Carácter</TableHead>
                                  <TableHead>Contenido</TableHead>
                                  <TableHead>Tarea</TableHead>
                                  <TableHead>Observaciones</TableHead>
                                  <TableHead>Verificación</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getFilteredAndSortedSessions(logbook).map((session, index) => {
                                  const date = new Date(session.createdAt)
                                  const day = date.getDate()
                                  const month = date.getMonth() + 1

                                  return (
                                    <TableRow key={session.id}>
                                      <TableCell>{session.day || day}</TableCell>
                                      <TableCell>{getMonthName(session.month || month)}</TableCell>
                                      <TableCell>{session.classNumber || index + 1}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{session.classCharacter}</Badge>
                                      </TableCell>
                                      <TableCell className="max-w-xs truncate">{session.content}</TableCell>
                                      <TableCell className="max-w-xs truncate">{session.task}</TableCell>
                                      <TableCell className="max-w-xs truncate">
                                        {session.observations || "-"}
                                      </TableCell>
                                      <TableCell>
                                        {session.directorVerification?.verified ? (
                                          <div className="space-y-1">
                                            <Badge className="bg-green-500">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Verificado
                                            </Badge>
                                            <div className="text-xs text-muted-foreground">
                                              Firma: {session.directorVerification.directorName}
                                            </div>
                                          </div>
                                        ) : (
                                          <Button
                                            size="sm"
                                            onClick={() => handleVerifySession(logbook.id, session.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verificar
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                        )}
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


