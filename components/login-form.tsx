"use client"

import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, LogIn } from "lucide-react"
import type { User } from "@/lib/types"
import { getUserByDni, setCurrentUser } from "@/lib/storage-index"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [dni, setDni] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    
    if (!dni || !password) {
      setError("Por favor complete todos los campos")
      return
    }

    try {
      const user = await getUserByDni(dni)
      
      if (!user) {
        setError("Usuario no encontrado")
        return
      }

      if (user.password !== password) {
        setError("Contraseña incorrecta")
        return
      }

      setCurrentUser(user)
      onLogin(user)
    } catch (error) {
      setError("Error al iniciar sesión. Por favor, intente nuevamente.")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="space-y-4 text-center bg-primary/5">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">Libro de Temas</CardTitle>
            <CardDescription className="text-base mt-2">Sistema de Registro de Clases</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ingrese su DNI"
                value={dni}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setDni(e.target.value)
                  setError("")
                }}
                className="bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="bg-background"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
              <LogIn className="h-5 w-5 mr-2" />
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
