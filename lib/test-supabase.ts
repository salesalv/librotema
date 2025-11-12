// Función para probar la conexión con Supabase
import { supabase, isSupabaseConfigured } from './supabase'

export async function testSupabaseConnection(): Promise<{
  connected: boolean
  error?: string
  message: string
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase no está configurado. Verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY',
    }
  }

  if (!supabase) {
    return {
      connected: false,
      error: 'Cliente de Supabase no inicializado',
      message: 'No se pudo crear el cliente de Supabase',
    }
  }

  try {
    // Intentar hacer una consulta simple para verificar la conexión
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      // Si el error es de autenticación o permisos, la conexión funciona pero hay un problema de configuración
      if (error.code === 'PGRST116' || error.message.includes('permission')) {
        return {
          connected: true,
          message: 'Conexión exitosa. Las tablas pueden no existir o hay problemas de permisos. Verifica que hayas ejecutado el script SQL.',
          error: error.message,
        }
      }

      return {
        connected: false,
        error: error.message,
        message: `Error al conectar con Supabase: ${error.message}`,
      }
    }

    return {
      connected: true,
      message: 'Conexión con Supabase exitosa. Las tablas están accesibles.',
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error?.message || 'Error desconocido',
      message: `Error al verificar la conexión: ${error?.message || 'Error desconocido'}`,
    }
  }
}

