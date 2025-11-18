"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { DirectorDashboard } from "@/components/director-dashboard"
import { TeacherDashboard } from "@/components/teacher-dashboard"
import type { User } from "@/lib/types"
import { getCurrentUser, setCurrentUser, initializeData } from "@/lib/storage-index"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // Verificar primero si hay un usuario guardado (más rápido)
        const currentUser = getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setIsLoading(false)
          // Inicializar datos en segundo plano
          initializeData().catch(console.error)
          return
        }

        // Si no hay usuario, inicializar datos y luego verificar de nuevo
        await initializeData()
        const userAfterInit = getCurrentUser()
        if (userAfterInit) {
          setUser(userAfterInit)
        }
      } catch (error) {
        console.error('Error al inicializar datos:', error)
        // Verificar si hay usuario incluso si hay error
        const currentUser = getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUser(null)
  }

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} onLogout={handleLogout} />
      case "director":
        return <DirectorDashboard user={user} onLogout={handleLogout} />
      case "profesor":
        return <TeacherDashboard user={user} onLogout={handleLogout} />
      default:
        return null
    }
  }

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        renderDashboard()
      )}
    </main>
  )
}
