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
import { LogOut, Users, BookOpen, GraduationCap, UserPlus, Plus, X, Database } from "lucide-react"
import type { User, Subject, Course, SubjectCourse, TeacherSubject } from "@/lib/types"
import {
  getUsers,
  addUser,
  getSubjects,
  addSubject,
  getCourses,
  addCourse,
  getSubjectCourses,
  addSubjectCourse,
  getTeacherSubjects,
  addTeacherSubject,
} from "@/lib/storage-index"
import { testSupabaseConnection } from "@/lib/test-supabase"
import { isSupabaseConfigured } from "@/lib/supabase"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjectCourses, setSubjectCourses] = useState<SubjectCourse[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([])
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; error?: string } | null>(null)

  // Estados para formularios
  const [newUser, setNewUser] = useState({ dni: "", name: "", password: "", role: "profesor" as User["role"] })
  const [newSubject, setNewSubject] = useState({ name: "" })
  const [newCourse, setNewCourse] = useState({ name: "" })
  const [newSubjectCourse, setNewSubjectCourse] = useState({ subjectId: "", courseId: "" })
  const [newTeacherSubject, setNewTeacherSubject] = useState({ teacherId: "", subjectId: "", courseId: "" })

  useEffect(() => {
    loadData()
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    const status = await testSupabaseConnection()
    setSupabaseStatus(status)
  }

  const loadData = async () => {
    const [usersData, subjectsData, coursesData, subjectCoursesData, teacherSubjectsData] = await Promise.all([
      getUsers(),
      getSubjects(),
      getCourses(),
      getSubjectCourses(),
      getTeacherSubjects(),
    ])
    setUsers(usersData)
    setSubjects(subjectsData)
    setCourses(coursesData)
    setSubjectCourses(subjectCoursesData)
    setTeacherSubjects(teacherSubjectsData)
  }

  const handleAddUser = async () => {
    if (!newUser.dni || !newUser.name || !newUser.password) {
      alert("Por favor complete todos los campos")
      return
    }

    const existingUsers = await getUsers()
    if (existingUsers.find((u) => u.dni === newUser.dni)) {
      alert("Ya existe un usuario con ese DNI")
      return
    }

    try {
      await addUser(newUser)
      setNewUser({ dni: "", name: "", password: "", role: "profesor" })
      await loadData()
      alert("Usuario creado exitosamente")
    } catch (error) {
      alert("Error al crear usuario")
      console.error(error)
    }
  }

  const handleAddSubject = async () => {
    if (!newSubject.name) {
      alert("Por favor ingrese el nombre de la materia")
      return
    }

    try {
      await addSubject(newSubject)
      setNewSubject({ name: "" })
      await loadData()
      alert("Materia creada exitosamente")
    } catch (error) {
      alert("Error al crear materia")
      console.error(error)
    }
  }

  const handleAddCourse = async () => {
    if (!newCourse.name) {
      alert("Por favor ingrese el nombre del curso")
      return
    }

    try {
      await addCourse(newCourse)
      setNewCourse({ name: "" })
      await loadData()
      alert("Curso creado exitosamente")
    } catch (error) {
      alert("Error al crear curso")
      console.error(error)
    }
  }

  const handleAddSubjectCourse = async () => {
    if (!newSubjectCourse.subjectId || !newSubjectCourse.courseId) {
      alert("Por favor seleccione materia y curso")
      return
    }

    const existing = await getSubjectCourses()
    if (
      existing.find(
        (sc) => sc.subjectId === newSubjectCourse.subjectId && sc.courseId === newSubjectCourse.courseId,
      )
    ) {
      alert("Esta asignación ya existe")
      return
    }

    try {
      await addSubjectCourse(newSubjectCourse)
      setNewSubjectCourse({ subjectId: "", courseId: "" })
      await loadData()
      alert("Asignación creada exitosamente")
    } catch (error) {
      alert("Error al crear asignación")
      console.error(error)
    }
  }

  const handleAddTeacherSubject = async () => {
    if (!newTeacherSubject.teacherId || !newTeacherSubject.subjectId || !newTeacherSubject.courseId) {
      alert("Por favor complete todos los campos")
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
      alert("Esta asignación ya existe")
      return
    }

    try {
      await addTeacherSubject(newTeacherSubject)
      setNewTeacherSubject({ teacherId: "", subjectId: "", courseId: "" })
      await loadData()
      alert("Profesor asignado exitosamente")
    } catch (error) {
      alert("Error al asignar profesor")
      console.error(error)
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
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
            <TabsTrigger value="supabase">
              <Database className="h-4 w-4 mr-2" />
              Supabase
            </TabsTrigger>
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
                  <Dialog>
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DNI</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
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
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                  <Dialog>
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Curso
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Curso</DialogTitle>
                        <DialogDescription>Ingrese el nombre del curso</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre del Curso</Label>
                          <Input
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({ name: e.target.value })}
                            placeholder="Ej: 3° A"
                          />
                        </div>
                        <Button onClick={handleAddCourse} className="w-full bg-primary hover:bg-primary/90">
                          Crear Curso
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Asignaciones */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Asignar Materia a Curso */}
              <Card>
                <CardHeader>
                  <CardTitle>Asignar Materia a Curso</CardTitle>
                  <CardDescription>Asigne materias a los cursos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Materia</Label>
                    <Select
                      value={newSubjectCourse.subjectId}
                      onValueChange={(value) => setNewSubjectCourse({ ...newSubjectCourse, subjectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Curso</Label>
                    <Select
                      value={newSubjectCourse.courseId}
                      onValueChange={(value) => setNewSubjectCourse({ ...newSubjectCourse, courseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddSubjectCourse} className="w-full bg-primary hover:bg-primary/90">
                    Asignar
                  </Button>
                </CardContent>
              </Card>

              {/* Asignar Profesor a Materia */}
              <Card>
                <CardHeader>
                  <CardTitle>Asignar Profesor a Materia</CardTitle>
                  <CardDescription>Asigne profesores a materias y cursos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profesor</Label>
                    <Select
                      value={newTeacherSubject.teacherId}
                      onValueChange={(value) => setNewTeacherSubject({ ...newTeacherSubject, teacherId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un profesor" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((u) => u.role === "profesor")
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Materia</Label>
                    <Select
                      value={newTeacherSubject.subjectId}
                      onValueChange={(value) => setNewTeacherSubject({ ...newTeacherSubject, subjectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Curso</Label>
                    <Select
                      value={newTeacherSubject.courseId}
                      onValueChange={(value) => setNewTeacherSubject({ ...newTeacherSubject, courseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddTeacherSubject} className="w-full bg-primary hover:bg-primary/90">
                    Asignar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Asignaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Asignaciones de Profesores</CardTitle>
                <CardDescription>Lista de profesores asignados a materias y cursos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Curso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherSubjects.map((ts) => (
                      <TableRow key={ts.id}>
                        <TableCell>{getUserName(ts.teacherId)}</TableCell>
                        <TableCell>{getSubjectName(ts.subjectId)}</TableCell>
                        <TableCell>{getCourseName(ts.courseId)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Supabase */}
          <TabsContent value="supabase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estado de Conexión con Supabase
                </CardTitle>
                <CardDescription>Verifica la conexión y configuración de Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estado de Configuración:</Label>
                  <div className="flex items-center gap-2">
                    {isSupabaseConfigured ? (
                      <Badge className="bg-green-500">Configurado</Badge>
                    ) : (
                      <Badge variant="destructive">No Configurado</Badge>
                    )}
                  </div>
                </div>

                {!isSupabaseConfigured && (
                  <Alert>
                    <AlertDescription>
                      <p className="font-semibold mb-2">Supabase no está configurado</p>
                      <p className="text-sm">
                        Para usar Supabase, crea un archivo <code className="bg-muted px-1 rounded">.env.local</code> en la raíz del proyecto con:
                      </p>
                      <pre className="bg-muted p-2 rounded mt-2 text-xs overflow-x-auto">
                        {`NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui`}
                      </pre>
                      <p className="text-sm mt-2">
                        Obtén estas credenciales desde:{" "}
                        <a
                          href="https://app.supabase.com/project/_/settings/api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Supabase Dashboard
                        </a>
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {isSupabaseConfigured && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Prueba de Conexión:</Label>
                      <Button onClick={checkSupabaseConnection} variant="outline" className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Probar Conexión
                      </Button>
                    </div>

                    {supabaseStatus && (
                      <div className="space-y-2">
                        <Label>Resultado:</Label>
                        <Alert variant={supabaseStatus.connected ? "default" : "destructive"}>
                          <AlertDescription>
                            <div className="flex items-center gap-2 mb-2">
                              {supabaseStatus.connected ? (
                                <Badge className="bg-green-500">✓ Conectado</Badge>
                              ) : (
                                <Badge variant="destructive">✗ Error</Badge>
                              )}
                            </div>
                            <p className="text-sm">{supabaseStatus.message}</p>
                            {supabaseStatus.error && (
                              <p className="text-xs mt-2 font-mono bg-muted p-2 rounded">
                                {supabaseStatus.error}
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Información:</Label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• El sistema está usando Supabase como base de datos</p>
                        <p>• Asegúrate de haber ejecutado el script SQL en Supabase</p>
                        <p>• Verifica que las políticas RLS estén configuradas correctamente</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isSupabaseConfigured && (
                  <div className="space-y-2">
                    <Label>Estado Actual:</Label>
                    <Alert>
                      <AlertDescription>
                        <p className="text-sm">
                          El sistema está usando <strong>localStorage</strong> para almacenar los datos.
                          Los datos se guardan solo en el navegador local.
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


