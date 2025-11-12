import { createClient } from '@supabase/supabase-js'

// Estas variables deben configurarse con tus credenciales de Supabase
// Puedes obtenerlas desde: https://app.supabase.com/project/_/settings/api
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar si Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Solo mostrar warning en el cliente para evitar problemas en Edge Runtime
if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase no está configurado. El sistema usará localStorage. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
