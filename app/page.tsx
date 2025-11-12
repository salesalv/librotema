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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const init = async () => {
      await initializeData()
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
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

  // Evitar renderizar hasta que estemos en el cliente para evitar problemas de hidratación
  if (!isClient) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center" suppressHydrationWarning>
        <div className="text-muted-foreground" suppressHydrationWarning>Cargando...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        renderDashboard()
      )}
    </main>
  )
}
