"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { LogOut, BookOpen, Plus, CheckCircle, Eye, Download } from "lucide-react"
import type { User, Logbook, ClassSession, ClassCharacter, Subject, Course } from "@/lib/types"
import {
  getSubjects,
  getCourses,
  getLogbooks,
  getTeacherSubjects,
  getLogbookByTeacherAndSubject,
  addOrUpdateLogbook,
} from "@/lib/storage-index"
import { generateLogbookPDF } from "@/lib/pdf-generator"

interface TeacherDashboardProps {
  user: User
  onLogout: () => void
}

export function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [logbooks, setLogbooks] = useState<Logbook[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([])
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null)
  const [showNewClassForm, setShowNewClassForm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [subjectFilter, setSubjectFilter] = useState<string>("all")
  
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

  const [newSession, setNewSession] = useState<Partial<ClassSession>>({
    day: undefined,
    month: undefined,
    classNumber: 1,
    classCharacter: "Teórica",
    content: "",
    task: "",
    teacherVerification: false,
    observations: "",
  })

  // Inicializar valores de fecha solo en el cliente
  useEffect(() => {
    setNewSession((prev) => ({
      ...prev,
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
    }))
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const teacherSubjectsData = await getTeacherSubjects()
      const filtered = teacherSubjectsData.filter((ts) => ts.teacherId === user.id)
      setTeacherSubjects(filtered)
      const allLogbooks: Logbook[] = []

      for (const ts of filtered) {
        let logbook = await getLogbookByTeacherAndSubject(user.id, ts.subjectId, ts.courseId)
        if (!logbook) {
          // Crear libro nuevo si no existe
          const newLogbook: Omit<Logbook, 'id' | 'createdAt' | 'updatedAt'> & { id?: string, createdAt?: string, updatedAt?: string } = {
            teacherId: user.id,
            subjectId: ts.subjectId,
            courseId: ts.courseId,
            sessions: [],
          }
          logbook = await addOrUpdateLogbook(newLogbook as Logbook)
        }
        allLogbooks.push(logbook)
      }

      const [subjectsData, coursesData] = await Promise.all([getSubjects(), getCourses()])
      setLogbooks(allLogbooks)
      setSubjects(subjectsData)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSubjectName = (id: string) => {
    return subjects.find((s) => s.id === id)?.name || "N/A"
  }

  const getCourseName = (id: string) => {
    return courses.find((c) => c.id === id)?.name || "N/A"
  }

  // Obtener cursos disponibles del profesor
  const getAvailableCourses = () => {
    const coursesIds = Array.from(new Set(teacherSubjects.map(ts => ts.courseId)))
    return courses.filter(course => coursesIds.includes(course.id))
  }

  // Obtener materias disponibles según el curso seleccionado
  const getAvailableSubjects = () => {
    if (courseFilter === "all") {
      // Si no hay curso seleccionado, mostrar todas las materias del profesor
      const subjectIds = Array.from(new Set(teacherSubjects.map(ts => ts.subjectId)))
      return subjects.filter(subject => subjectIds.includes(subject.id))
    }
    
    // Obtener las materias del curso seleccionado
    const subjectIds = teacherSubjects
      .filter(ts => ts.courseId === courseFilter)
      .map(ts => ts.subjectId)
    
    return subjects.filter(subject => subjectIds.includes(subject.id))
  }

  // Limpiar el filtro de materia cuando cambie el curso
  useEffect(() => {
    setSubjectFilter("all")
  }, [courseFilter])

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

  const handleAddSession = async (logbookId: string) => {
    const logbook = logbooks.find((l) => l.id === logbookId)
    if (!logbook) return

    if (!newSession.content || !newSession.task || !newSession.classCharacter) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    const session: ClassSession = {
      id: Date.now().toString(),
      day: newSession.day || new Date().getDate(),
      month: newSession.month || new Date().getMonth() + 1,
      classNumber: newSession.classNumber || logbook.sessions.length + 1,
      classCharacter: newSession.classCharacter as ClassCharacter,
      content: newSession.content,
      task: newSession.task,
      teacherVerification: newSession.teacherVerification || false,
      observations: newSession.observations || "",
      createdAt: new Date().toISOString(),
    }

    const updatedLogbook: Logbook = {
      ...logbook,
      sessions: [...logbook.sessions, session],
      updatedAt: new Date().toISOString(),
    }

    try {
      await addOrUpdateLogbook(updatedLogbook)
      setNewSession({
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        classNumber: logbook.sessions.length + 2,
        classCharacter: "Teórica",
        content: "",
        task: "",
        teacherVerification: false,
        observations: "",
      })
      setShowNewClassForm(null)
      await loadData()
    } catch (error) {
      alert("Error al guardar la clase")
      console.error(error)
    }
  }

  const handleUpdateTeacherVerification = async (logbookId: string, sessionId: string, verified: boolean) => {
    const logbook = logbooks.find((l) => l.id === logbookId)
    if (!logbook) return

    const updatedSessions = logbook.sessions.map((session) =>
      session.id === sessionId ? { ...session, teacherVerification: verified } : session,
    )

    const updatedLogbook: Logbook = {
      ...logbook,
      sessions: updatedSessions,
      updatedAt: new Date().toISOString(),
    }

    try {
      await addOrUpdateLogbook(updatedLogbook)
      await loadData()
    } catch (error) {
      alert("Error al actualizar la verificación")
      console.error(error)
    }
  }

  const handleDownloadPDF = (logbook: Logbook) => {
    const subjectName = getSubjectName(logbook.subjectId)
    const courseName = getCourseName(logbook.courseId)
    
    generateLogbookPDF({
      logbook,
      teacherName: user.name,
      subjectName,
      courseName
    })
  }

  const classCharacters: ClassCharacter[] = [
    "Presentación",
    "Teórica",
    "Práctica",
    "Examen",
    "Sin clase",
    "Olimpiada Informática",
    "Trabajo Final",
    "Recuperatorio",
  ]

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
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-muted-foreground text-lg text-center">
                Cargando tus libros de temas...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logbooks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-20 w-20 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg text-center">
                    No tienes materias asignadas. Contacta al administrador.
                  </p>
                </CardContent>
              </Card>
            ) : (
            <>
              {/* Filtros */}
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Filtro de Curso */}
                    <div className="flex items-center gap-4 flex-1">
                      <Label htmlFor="course-filter" className="text-base font-semibold whitespace-nowrap">
                        Filtrar por curso:
                      </Label>
                      <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger id="course-filter" className="w-full max-w-xs">
                          <SelectValue placeholder="Todos los cursos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los cursos</SelectItem>
                          {getAvailableCourses().map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro de Materia */}
                    <div className="flex items-center gap-4 flex-1">
                      <Label htmlFor="subject-filter" className="text-base font-semibold whitespace-nowrap">
                        Filtrar por materia:
                      </Label>
                      <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger id="subject-filter" className="w-full max-w-xs">
                          <SelectValue placeholder="Todas las materias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las materias</SelectItem>
                          {getAvailableSubjects().map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Planillas */}
              {(() => {
                const filteredLogbooks = logbooks.filter(logbook => {
                  // Filtro por curso
                  if (courseFilter !== "all" && logbook.courseId !== courseFilter) {
                    return false
                  }
                  // Filtro por materia
                  if (subjectFilter !== "all" && logbook.subjectId !== subjectFilter) {
                    return false
                  }
                  return true
                })

                if (filteredLogbooks.length === 0) {
                  return (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-16 w-16 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-center">
                          No se encontraron planillas con los filtros seleccionados.
                        </p>
                      </CardContent>
                    </Card>
                  )
                }

                return filteredLogbooks.map((logbook) => {
              const subjectName = getSubjectName(logbook.subjectId)
              const courseName = getCourseName(logbook.courseId)
              const verifiedCount = logbook.sessions.filter((s) => s.teacherVerification).length

              return (
                <Card key={logbook.id} className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {subjectName} - {courseName}
                        </CardTitle>
                        <CardDescription>
                          {logbook.sessions.length} {logbook.sessions.length === 1 ? "clase" : "clases"} registradas
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {verifiedCount} verificadas por profesor
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(logbook)}
                          className="border-primary/30 hover:bg-primary/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Botón para agregar nueva clase */}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            const now = new Date()
                            setShowNewClassForm(showNewClassForm === logbook.id ? null : logbook.id)
                            setNewSession({
                              day: now.getDate(),
                              month: now.getMonth() + 1,
                              classNumber: logbook.sessions.length + 1,
                              classCharacter: "Teórica",
                              content: "",
                              task: "",
                              teacherVerification: false,
                              observations: "",
                            })
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir Nueva Clase
                        </Button>
                      </div>

                      {/* Formulario para nueva clase */}
                      {showNewClassForm === logbook.id && (
                        <Card className="bg-accent/20 border-primary/10">
                          <CardHeader>
                            <CardTitle className="text-lg">Nueva Clase</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label>Día</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={newSession.day || ""}
                                  onChange={(e) =>
                                    setNewSession({ ...newSession, day: parseInt(e.target.value) || undefined })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Mes</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={newSession.month || ""}
                                  onChange={(e) =>
                                    setNewSession({ ...newSession, month: parseInt(e.target.value) || undefined })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Número de Clase</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={newSession.classNumber || ""}
                                  onChange={(e) =>
                                    setNewSession({
                                      ...newSession,
                                      classNumber: parseInt(e.target.value) || undefined,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Carácter de la Clase</Label>
                                <Select
                                  value={newSession.classCharacter}
                                  onValueChange={(value) =>
                                    setNewSession({ ...newSession, classCharacter: value as ClassCharacter })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {classCharacters.map((char) => (
                                      <SelectItem key={char} value={char}>
                                        {char}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Contenido de la Clase del Día *</Label>
                              <Textarea
                                value={newSession.content || ""}
                                onChange={(e) => setNewSession({ ...newSession, content: e.target.value })}
                                placeholder="Describa el contenido de la clase"
                                rows={3}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Tarea a Realizar *</Label>
                              <Textarea
                                value={newSession.task || ""}
                                onChange={(e) => setNewSession({ ...newSession, task: e.target.value })}
                                placeholder="Describa las tareas a realizar"
                                rows={2}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Observaciones</Label>
                              <Textarea
                                value={newSession.observations || ""}
                                onChange={(e) => setNewSession({ ...newSession, observations: e.target.value })}
                                placeholder="Observaciones adicionales"
                                rows={2}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="teacher-verification"
                                checked={newSession.teacherVerification || false}
                                onCheckedChange={(checked) =>
                                  setNewSession({ ...newSession, teacherVerification: checked === true })
                                }
                              />
                              <Label htmlFor="teacher-verification" className="cursor-pointer">
                                Verificación del Profesor
                              </Label>
                            </div>

                            <div className="flex gap-3 justify-end">
                              <Button variant="outline" onClick={() => setShowNewClassForm(null)}>
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => handleAddSession(logbook.id)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Guardar Clase
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

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

                      {/* Tabla de clases */}
                      {logbook.sessions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Día</TableHead>
                                <TableHead>Mes</TableHead>
                                <TableHead>Clase N°</TableHead>
                                <TableHead>Carácter</TableHead>
                                <TableHead>Contenido</TableHead>
                                <TableHead>Tarea a Realizar</TableHead>
                                <TableHead>Verificación Profesor</TableHead>
                                <TableHead>Observaciones</TableHead>
                                <TableHead>Verificación Director</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getFilteredAndSortedSessions(logbook).map((session) => (
                                <TableRow key={session.id}>
                                  <TableCell>{session.day}</TableCell>
                                  <TableCell>{getMonthName(session.month)}</TableCell>
                                  <TableCell>{session.classNumber}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{session.classCharacter}</Badge>
                                  </TableCell>
                                  <TableCell className="max-w-xs">{session.content}</TableCell>
                                  <TableCell className="max-w-xs">{session.task}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={session.teacherVerification}
                                        onCheckedChange={(checked) =>
                                          handleUpdateTeacherVerification(
                                            logbook.id,
                                            session.id,
                                            checked === true,
                                          )
                                        }
                                      />
                                      {session.teacherVerification && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-xs">{session.observations || "-"}</TableCell>
                                  <TableCell>
                                    {session.directorVerification?.verified ? (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="outline">
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver Verificación
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Verificación del Director</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div>
                                              <Label>Director:</Label>
                                              <p className="text-sm font-medium">
                                                {session.directorVerification.directorName}
                                              </p>
                                            </div>
                                            {session.directorVerification.signature && (
                                              <div>
                                                <Label>Firma:</Label>
                                                <p className="text-sm font-medium">
                                                  {session.directorVerification.signature}
                                                </p>
                                              </div>
                                            )}
                                            {session.directorVerification.verifiedAt && (
                                              <div>
                                                <Label>Fecha de Verificación:</Label>
                                                <p className="text-sm text-muted-foreground">
                                                  {new Date(session.directorVerification.verifiedAt).toLocaleString()}
                                                </p>
                                              </div>
                                            )}
                                            <Badge className="bg-green-500">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Verificado
                                            </Badge>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">Pendiente</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {(() => {
                            const filter = getSessionFilter(logbook.id)
                            const hasFilters = filter.month !== 'all' || filter.character !== 'all'
                            
                            if (logbook.sessions.length === 0) {
                              return <p>No hay clases registradas. Agrega una nueva clase para comenzar.</p>
                            } else if (hasFilters) {
                              return <p>No se encontraron clases con los filtros seleccionados.</p>
                            }
                            return null
                          })()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
              })()}
            </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


