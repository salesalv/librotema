# ✅ Lista de Verificación - Configuración de Supabase

## Configuración Local (Desarrollo)

### ✅ Variables de Entorno
- [x] Archivo `.env.local` creado en la raíz del proyecto
- [x] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada

### ⚠️ Script SQL en Supabase
- [ ] **IMPORTANTE:** Ejecutar el script SQL en Supabase
  1. Ve a tu proyecto en Supabase: https://app.supabase.com
  2. Abre el **SQL Editor**
  3. Copia todo el contenido del archivo `supabase-schema.sql`
  4. Pégalo en el SQL Editor
  5. Haz clic en **"Run"** para ejecutar el script
  
  Esto creará:
  - ✅ Todas las tablas necesarias
  - ✅ El usuario admin por defecto (DNI: `admin`, Contraseña: `admin123`)
  - ✅ Las políticas de seguridad (RLS)

## Configuración en Vercel (Producción)

### ⚠️ Variables de Entorno en Vercel (URGENTE - Esto es lo que falta)
- [ ] **Configurar variables de entorno en Vercel:**
  1. Ve a tu proyecto en Vercel
  2. **Settings** → **Environment Variables**
  3. Agrega:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://phiscwdunghqnvlnxpix.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu clave anónima)
  4. Selecciona **Production** y **Preview** en los environments
  5. Guarda cada variable
  6. **IMPORTANTE:** Haz un nuevo despliegue (Redeploy)
  
  📖 **Ver guía detallada en:** `CONFIGURAR_VERCEL.md`

## Verificación

### Pruebas Locales
1. [ ] Reinicia el servidor de desarrollo (`npm run dev`)
2. [ ] Abre la aplicación en el navegador
3. [ ] Inicia sesión con:
   - DNI: `admin`
   - Contraseña: `admin123`
4. [ ] Verifica en el dashboard de admin que aparezca:
   - "El sistema está usando Supabase como base de datos"
   - NO debe aparecer el mensaje de "localStorage"

### Pruebas en Producción
1. [ ] Después de configurar las variables en Vercel
2. [ ] Espera a que se complete el nuevo despliegue
3. [ ] Abre tu aplicación en producción
4. [ ] Verifica que los datos se guarden en Supabase

## Solución de Problemas

### Si ves el mensaje "localStorage" en el dashboard:
- Verifica que las variables de entorno estén correctamente escritas
- Asegúrate de reiniciar el servidor después de crear/modificar `.env.local`
- Verifica que no haya espacios extra en las variables

### Si no puedes iniciar sesión:
- Verifica que hayas ejecutado el script SQL en Supabase
- Confirma que el usuario admin se creó correctamente
- Revisa la consola del navegador para ver errores

### Si hay errores de conexión:
- Verifica que la URL de Supabase sea correcta
- Verifica que la clave anónima sea válida
- Revisa que las políticas RLS estén configuradas (el script SQL las crea)

## Estado Actual

Según tu configuración:
- ✅ Variables de entorno locales configuradas
- ⚠️ **Falta:** Ejecutar el script SQL en Supabase
- ⚠️ **Falta:** Configurar variables en Vercel para producción

