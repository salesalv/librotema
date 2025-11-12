"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronDown, ChevronUp, Filter, LogOut, Plus } from "lucide-react"
import type { ClassSession } from "@/lib/types"

interface Logbook {
  id: string
  subject: string
  course: string
  sessions: ClassSession[]
}

interface DashboardProps {
  teacherName: string
  onLogout: () => void
}

export function Dashboard({ teacherName, onLogout }: DashboardProps) {
  const [logbooks, setLogbooks] = useState<Logbook[]>([
    {
      id: "1",
      subject: "Matemática",
      course: "3° A",
      sessions: [
        {
          id: "1",
          date: "2025-11-06",
          dayOfWeek: "Miércoles",
          startTime: "08:00",
          endTime: "09:30",
          topic: "Ecuaciones de primer grado",
          observations: "Clase desarrollada con normalidad. Buena participación de los estudiantes.",
          supervisorVerified: true,
          supervisorName: "Prof. García",
          verifiedAt: "2025-11-06T09:35:00",
        },
        {
          id: "2",
          date: "2025-11-04",
          dayOfWeek: "Lunes",
          startTime: "08:00",
          endTime: "09:30",
          topic: "Introducción a ecuaciones",
          observations: "",
          supervisorVerified: true,
          supervisorName: "Prof. García",
        },
      ],
    },
    {
      id: "2",
      subject: "Lengua",
      course: "3° A",
      sessions: [
        {
          id: "3",
          date: "2025-11-06",
          dayOfWeek: "Miércoles",
          startTime: "09:45",
          endTime: "11:15",
          topic: "Análisis sintáctico de oraciones compuestas",
          observations: "",
          supervisorVerified: false,
        },
      ],
    },
    {
      id: "3",
      subject: "Matemática",
      course: "4° B",
      sessions: [
        {
          id: "4",
          date: "2025-11-05",
          dayOfWeek: "Martes",
          startTime: "10:00",
          endTime: "11:30",
          topic: "Funciones cuadráticas",
          observations: "Excelente participación",
          supervisorVerified: true,
          supervisorName: "Prof. Martínez",
        },
      ],
    },
  ])

  const [expandedLogbooks, setExpandedLogbooks] = useState<Set<string>>(new Set())
  const [filterCourse, setFilterCourse] = useState<string>("")
  const [filterSubject, setFilterSubject] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [showNewClassForm, setShowNewClassForm] = useState<string | null>(null)
  const [newSession, setNewSession] = useState<Partial<ClassSession>>({
    date: new Date().toISOString().split("T")[0],
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    topic: "",
    observations: "",
  })

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const toggleExpand = (logbookId: string) => {
    const newExpanded = new Set(expandedLogbooks)
    if (newExpanded.has(logbookId)) {
      newExpanded.delete(logbookId)
    } else {
      newExpanded.add(logbookId)
    }
    setExpandedLogbooks(newExpanded)
  }

  const handleAddSession = (logbookId: string) => {
    if (newSession.date && newSession.dayOfWeek && newSession.startTime && newSession.endTime && newSession.topic) {
      const session: ClassSession = {
        id: Date.now().toString(),
        date: newSession.date || "",
        dayOfWeek: newSession.dayOfWeek || "",
        startTime: newSession.startTime || "",
        endTime: newSession.endTime || "",
        topic: newSession.topic || "",
        observations: newSession.observations || "",
        supervisorVerified: false,
      }

      setLogbooks(
        logbooks.map((logbook) =>
          logbook.id === logbookId ? { ...logbook, sessions: [...logbook.sessions, session] } : logbook,
        ),
      )

      setNewSession({
        date: new Date().toISOString().split("T")[0],
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        topic: "",
        observations: "",
      })
      setShowNewClassForm(null)
    }
  }

  const handleVerifySession = (logbookId: string, sessionId: string, supervisorName: string) => {
    setLogbooks(
      logbooks.map((logbook) =>
        logbook.id === logbookId
          ? {
              ...logbook,
              sessions: logbook.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      supervisorVerified: true,
                      supervisorName,
                      verifiedAt: new Date().toISOString(),
                    }
                  : session,
              ),
            }
          : logbook,
      ),
    )
  }

  const courses = Array.from(new Set(logbooks.map((l) => l.course))).sort()
  const subjects = Array.from(new Set(logbooks.map((l) => l.subject))).sort()

  const filteredLogbooks = logbooks.filter((logbook) => {
    if (filterCourse && logbook.course !== filterCourse) return false
    if (filterSubject && logbook.subject !== filterSubject) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/20 bg-primary/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Libro de Temas</h1>
              <p className="text-muted-foreground">Bienvenido, {teacherName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-primary/20">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" onClick={onLogout} className="border-primary/20 bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-background rounded-lg border border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrar por Curso</label>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Todos los cursos</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrar por Materia</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Todas las materias</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(filterCourse || filterSubject) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterCourse("")
                    setFilterSubject("")
                  }}
                  className="mt-3"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logbooks */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-4">
          {filteredLogbooks.map((logbook) => {
            const isExpanded = expandedLogbooks.has(logbook.id)
            const verifiedCount = logbook.sessions.filter((s) => s.supervisorVerified).length

            return (
              <Card key={logbook.id} className="border-2 border-primary/20">
                {/* Collapsed View */}
                <div
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleExpand(logbook.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {logbook.subject} - {logbook.course}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="bg-background border border-primary/20">
                            {logbook.sessions.length} {logbook.sessions.length === 1 ? "clase" : "clases"}
                          </Badge>
                          {verifiedCount > 0 && (
                            <Badge className="bg-primary/10 text-primary border border-primary/30">
                              {verifiedCount} verificadas
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                  <div className="border-t border-primary/20">
                    <div className="p-4 bg-primary/5 border-b border-primary/10">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowNewClassForm(showNewClassForm === logbook.id ? null : logbook.id)
                        }}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Nueva Clase
                      </Button>
                    </div>

                    {/* New Class Form */}
                    {showNewClassForm === logbook.id && (
                      <div className="p-4 bg-accent/20 border-b border-primary/10">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Fecha</label>
                              <input
                                type="date"
                                value={newSession.date}
                                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Día de la Semana</label>
                              <select
                                value={newSession.dayOfWeek}
                                onChange={(e) => setNewSession({ ...newSession, dayOfWeek: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              >
                                <option value="">Seleccionar día</option>
                                {daysOfWeek.map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Hora de Inicio</label>
                              <input
                                type="time"
                                value={newSession.startTime}
                                onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Hora de Finalización</label>
                              <input
                                type="time"
                                value={newSession.endTime}
                                onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Tema Dictado</label>
                            <input
                              type="text"
                              value={newSession.topic}
                              onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                              placeholder="Ej: Ecuaciones de primer grado"
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Observaciones</label>
                            <textarea
                              value={newSession.observations}
                              onChange={(e) => setNewSession({ ...newSession, observations: e.target.value })}
                              placeholder="Notas sobre el desarrollo de la clase, incidentes, etc."
                              rows={3}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            />
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
                        </div>
                      </div>
                    )}

                    {/* Sessions Table */}
                    <CardContent className="p-4">
                      {logbook.sessions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-primary/5 border-b-2 border-primary/20">
                                <th className="text-left p-3 text-sm font-semibold border-r border-primary/10">Día</th>
                                <th className="text-left p-3 text-sm font-semibold border-r border-primary/10">Mes</th>
                                <th className="text-left p-3 text-sm font-semibold border-r border-primary/10">
                                  Clase N°
                                </th>
                                <th className="text-left p-3 text-sm font-semibold border-r border-primary/10">
                                  Horario
                                </th>
                                <th className="text-left p-3 text-sm font-semibold border-r border-primary/10">
                                  Contenido de la Clase
                                </th>
                                <th className="text-left p-3 text-sm font-semibold border-r border-primary/10">
                                  Observaciones
                                </th>
                                <th className="text-left p-3 text-sm font-semibold">Firma del Supervisor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logbook.sessions.map((session, index) => {
                                const date = new Date(session.date)
                                const day = date.getDate()
                                const month = date.toLocaleDateString("es-ES", { month: "long" })

                                return (
                                  <tr key={session.id} className="border-b border-primary/10 hover:bg-accent/30">
                                    <td className="p-3 border-r border-primary/10">{day}</td>
                                    <td className="p-3 border-r border-primary/10 capitalize">{month}</td>
                                    <td className="p-3 border-r border-primary/10">{index + 1}</td>
                                    <td className="p-3 border-r border-primary/10 text-sm">
                                      {session.startTime} - {session.endTime}
                                    </td>
                                    <td className="p-3 border-r border-primary/10">
                                      <div className="font-medium">{session.topic}</div>
                                      <div className="text-xs text-muted-foreground mt-1">{session.dayOfWeek}</div>
                                    </td>
                                    <td className="p-3 border-r border-primary/10 text-sm">
                                      {session.observations || "-"}
                                    </td>
                                    <td className="p-3">
                                      {session.supervisorVerified ? (
                                        <div className="text-sm">
                                          <Badge className="bg-primary/10 text-primary border border-primary/30">
                                            Verificado
                                          </Badge>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {session.supervisorName}
                                          </div>
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const name = prompt("Nombre del supervisor:")
                                            if (name) handleVerifySession(logbook.id, session.id, name)
                                          }}
                                          className="text-xs"
                                        >
                                          Verificar
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No hay clases registradas</p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {filteredLogbooks.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-20 w-20 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg text-center">
                No se encontraron libros de temas con los filtros seleccionados
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
