"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LogOut, BookOpen, CheckCircle, ChevronDown, ChevronRight } from "lucide-react"
import type { User, Logbook, ClassSession, Subject, Course } from "@/lib/types"
import {
  getUsers,
  getSubjects,
  getCourses,
  getLogbooks,
  getTeacherSubjects,
  addOrUpdateLogbook,
} from "@/lib/storage-index"
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
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [expandedLogbooks, setExpandedLogbooks] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [allUsers, allLogbooks, allSubjects, allCourses] = await Promise.all([
      getUsers(),
      getLogbooks(),
      getSubjects(),
      getCourses(),
    ])
    setTeachers(allUsers.filter((u) => u.role === "profesor"))
    setLogbooks(allLogbooks)
    setSubjects(allSubjects)
    setCourses(allCourses)
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

  const filteredLogbooks = selectedTeacher && selectedTeacher !== "all"
    ? logbooks.filter((l) => l.teacherId === selectedTeacher)
    : logbooks

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
        <div className="grid gap-6">
          {/* Filtro de Profesor */}
          <div className="flex items-center gap-4">
            <Label>Filtrar por Profesor:</Label>
            <Select value={selectedTeacher || "all"} onValueChange={(value) => setSelectedTeacher(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Todos los profesores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los profesores</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                                {logbook.sessions.map((session, index) => {
                                  const date = new Date(session.createdAt)
                                  const day = date.getDate()
                                  const month = date.getMonth() + 1

                                  return (
                                    <TableRow key={session.id}>
                                      <TableCell>{session.day || day}</TableCell>
                                      <TableCell>{session.month || month}</TableCell>
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


