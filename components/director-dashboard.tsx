"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, Users, BookOpen, CheckCircle, Eye } from "lucide-react"
import type { User, Logbook, ClassSession } from "@/lib/types"
import {
  getUsers,
  getSubjects,
  getCourses,
  getLogbooks,
  getTeacherSubjects,
  addOrUpdateLogbook,
} from "@/lib/storage-index"

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
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null)

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

  const handleVerifySession = (logbookId: string, sessionId: string, signature: string) => {
    const logbook = logbooks.find((l) => l.id === logbookId)
    if (!logbook) return

    const updatedSessions = logbook.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            directorVerification: {
              verified: true,
              directorName: user.name,
              signature,
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

    addOrUpdateLogbook(updatedLogbook)
    loadData()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/20 bg-primary/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel del Director</h1>
              <p className="text-muted-foreground">Bienvenido, {user.name}</p>
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
          {/* Lista de Profesores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profesores
              </CardTitle>
              <CardDescription>Lista de profesores del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DNI</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => {
                      const teacherLogbooks = logbooks.filter((l) => l.teacherId === teacher.id)
                      return (
                        <TableRow key={teacher.id}>
                          <TableCell>{teacher.dni}</TableCell>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {teacherLogbooks.length} {teacherLogbooks.length === 1 ? "libro" : "libros"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
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

                    return (
                      <Card key={logbook.id} className="border-2 border-primary/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>
                                {subjectName} - {courseName}
                              </CardTitle>
                              <CardDescription>Profesor: {teacherName}</CardDescription>
                            </div>
                            <Badge variant="secondary">
                              {verifiedCount} / {logbook.sessions.length} verificadas
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
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
                                              {session.directorVerification.directorName}
                                            </div>
                                            {session.directorVerification.signature && (
                                              <div className="text-xs text-muted-foreground">
                                                Firma: {session.directorVerification.signature}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button size="sm" variant="outline">
                                                <Eye className="h-3 w-3 mr-1" />
                                                Verificar
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Verificar Clase</DialogTitle>
                                                <DialogDescription>
                                                  Verifique el contenido de la clase y agregue su firma
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4 py-4">
                                                <div>
                                                  <Label>Contenido:</Label>
                                                  <p className="text-sm text-muted-foreground">{session.content}</p>
                                                </div>
                                                <div>
                                                  <Label>Tarea:</Label>
                                                  <p className="text-sm text-muted-foreground">{session.task}</p>
                                                </div>
                                                <div>
                                                  <Label>Observaciones:</Label>
                                                  <p className="text-sm text-muted-foreground">
                                                    {session.observations || "Sin observaciones"}
                                                  </p>
                                                </div>
                                                <div className="space-y-2">
                                                  <Label htmlFor="signature">Firma</Label>
                                                  <Input
                                                    id="signature"
                                                    placeholder="Ingrese su firma"
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        const signature = e.currentTarget.value
                                                        if (signature) {
                                                          handleVerifySession(logbook.id, session.id, signature)
                                                          e.currentTarget.value = ""
                                                        }
                                                      }
                                                    }}
                                                  />
                                                </div>
                                                <Button
                                                  onClick={(e) => {
                                                    const input = document.getElementById(
                                                      "signature",
                                                    ) as HTMLInputElement
                                                    if (input?.value) {
                                                      handleVerifySession(logbook.id, session.id, input.value)
                                                      input.value = ""
                                                    }
                                                  }}
                                                  className="w-full bg-primary hover:bg-primary/90"
                                                >
                                                  Verificar
                                                </Button>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
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


