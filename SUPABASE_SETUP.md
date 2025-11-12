# Configuración de Supabase

## Pasos para configurar Supabase

### 1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2. Obtener credenciales
1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia la **URL** del proyecto
3. Copia la **anon/public key**

### 3. Configurar variables de entorno
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 4. Crear las tablas
1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql` de este proyecto
3. Copia y pega todo el contenido en el SQL Editor
4. Ejecuta el script (botón "Run")

### 5. Verificar la instalación
- El script creará automáticamente:
  - Todas las tablas necesarias
  - Los índices para mejorar el rendimiento
  - Las políticas de seguridad (RLS)
  - Un usuario admin por defecto (DNI: `admin`, Contraseña: `admin123`)

### 6. Actualizar el código
El código ya está preparado para usar Supabase. Solo necesitas:
1. Configurar las variables de entorno
2. Ejecutar el script SQL
3. Reiniciar el servidor de desarrollo

## Notas importantes

- **Seguridad**: Las políticas RLS están configuradas para permitir todo por ahora. En producción, deberías crear políticas más restrictivas.
- **Contraseñas**: Actualmente las contraseñas se guardan en texto plano. En producción, deberías usar hash (bcrypt, etc.).
- **Backup**: Supabase ofrece backups automáticos en el plan gratuito.

## Solución de problemas

Si tienes errores de conexión:
1. Verifica que las variables de entorno estén correctamente configuradas
2. Verifica que el proyecto de Supabase esté activo
3. Revisa la consola del navegador para ver errores específicos

