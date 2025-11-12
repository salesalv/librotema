# 🔧 Configurar Variables de Entorno en Vercel

## Problema
Los usuarios se guardan en localhost pero no en Vercel porque las variables de entorno no están configuradas en producción.

## Solución: Configurar Variables en Vercel

### Paso 1: Acceder a la Configuración de Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com
2. Selecciona tu proyecto **librotema**
3. Ve a **Settings** (Configuración)
4. En el menú lateral, haz clic en **Environment Variables** (Variables de Entorno)

### Paso 2: Agregar las Variables

Necesitas agregar **2 variables**:

#### Variable 1: `NEXT_PUBLIC_SUPABASE_URL`
1. Haz clic en **"Add New"** o **"Add"**
2. En **Key** (Clave), escribe: `NEXT_PUBLIC_SUPABASE_URL`
3. En **Value** (Valor), pega tu URL de Supabase:
   ```
   https://phiscwdunghqnvlnxpix.supabase.co
   ```
4. Selecciona los **Environments** (Entornos):
   - ✅ **Production** (Producción)
   - ✅ **Preview** (Vista previa)
   - ✅ **Development** (Desarrollo) - opcional
5. Haz clic en **Save**

#### Variable 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
1. Haz clic en **"Add New"** nuevamente
2. En **Key** (Clave), escribe: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. En **Value** (Valor), pega tu clave anónima de Supabase
   - Puedes copiarla desde: https://app.supabase.com/project/_/settings/api
   - Es la clave que empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Selecciona los **Environments**:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development** - opcional
5. Haz clic en **Save**

### Paso 3: Verificar las Variables

Deberías ver algo así:

```
NEXT_PUBLIC_SUPABASE_URL
  Production, Preview
  https://phiscwdunghqnvlnxpix.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
  Production, Preview
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 4: Redesplegar la Aplicación

⚠️ **IMPORTANTE:** Después de agregar las variables, necesitas hacer un nuevo despliegue:

**Opción A: Despliegue Automático**
- Haz un pequeño cambio en tu código (por ejemplo, un comentario)
- Haz commit y push a tu repositorio
- Vercel desplegará automáticamente con las nuevas variables

**Opción B: Despliegue Manual**
1. Ve a la pestaña **Deployments** (Despliegues)
2. Encuentra el último despliegue
3. Haz clic en los **3 puntos** (⋯)
4. Selecciona **Redeploy** (Redesplegar)
5. Confirma el redespliegue

### Paso 5: Verificar que Funciona

1. Espera a que termine el despliegue (puede tomar 1-2 minutos)
2. Abre tu aplicación en producción
3. Inicia sesión con:
   - DNI: `admin`
   - Contraseña: `admin123`
4. Crea un nuevo usuario
5. Verifica en Supabase que el usuario se haya guardado:
   - Ve a tu proyecto en Supabase
   - **Table Editor** → **users**
   - Deberías ver el nuevo usuario

## Verificación Rápida

Para verificar que las variables están configuradas correctamente:

1. Abre la consola del navegador en tu aplicación de Vercel (F12)
2. Busca el mensaje:
   - ✅ Si NO ves: `⚠️ Supabase no está configurado...` → **Está funcionando**
   - ❌ Si ves el mensaje de advertencia → Las variables no están configuradas

## Solución de Problemas

### Las variables no aparecen después del despliegue
- Asegúrate de haber seleccionado **Production** en los environments
- Verifica que hayas hecho un nuevo despliegue después de agregar las variables
- Las variables se aplican solo a nuevos despliegues, no a los existentes

### Sigue usando localStorage en producción
- Verifica que los nombres de las variables sean exactamente:
  - `NEXT_PUBLIC_SUPABASE_URL` (con guiones bajos)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (con guiones bajos)
- Asegúrate de que no haya espacios extra
- Verifica que los valores sean correctos (copia y pega desde Supabase)

### Error de conexión
- Verifica que la URL de Supabase sea correcta
- Verifica que la clave anónima sea válida
- Revisa que hayas ejecutado el script SQL en Supabase

## Notas Importantes

- ⚠️ Las variables con prefijo `NEXT_PUBLIC_` son públicas y se exponen al cliente
- ✅ Esto es correcto para Supabase, ya que usas la clave anónima (anon key)
- 🔒 La clave anónima es segura porque las políticas RLS protegen los datos
- ❌ **NUNCA** uses el Service Role Key en variables `NEXT_PUBLIC_`

