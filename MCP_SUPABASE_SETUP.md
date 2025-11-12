# Configuración de Supabase MCP en Cursor

Esta guía te ayudará a integrar el servidor MCP de Supabase en Cursor para que el asistente pueda interactuar directamente con tu base de datos.

## ¿Qué es MCP?

MCP (Model Context Protocol) es un protocolo que permite a los asistentes de IA acceder a herramientas y contextos externos. Con Supabase MCP, puedes ejecutar consultas SQL, gestionar datos y más directamente desde Cursor.

## Pasos para configurar

### 1. Instalar el servidor MCP de Supabase

Primero, necesitas instalar el servidor MCP de Supabase. Puedes hacerlo de dos formas:

#### Opción A: Usar npm globalmente
```bash
npm install -g @supabase/mcp-server
```

#### Opción B: Clonar el repositorio
```bash
git clone https://github.com/supabase/mcp-server
cd mcp-server
npm install
```

### 2. Obtener tu cadena de conexión de Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Ve a **Settings** → **Database**
3. Busca la sección **Connection string**
4. Copia la cadena de conexión (formato URI o connection pooling)
   - Ejemplo: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### 3. Configurar MCP en Cursor

1. Abre Cursor
2. Ve a **Settings** (⚙️) → **Features** → **MCP**
3. Haz clic en **"+ Add New MCP Server"**
4. Completa el formulario con la siguiente información:

   **Name:** `Supabase`
   
   **Type:** `command` (transporte `stdio`)
   
   **Command:** 
   ```bash
   npx -y @supabase/mcp-server
   ```
   
   O si lo instalaste globalmente:
   ```bash
   supabase-mcp-server
   ```

5. En **Environment Variables**, agrega:
   ```
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```
   
   **Nota:** Para obtener el Service Role Key:
   - Ve a **Settings** → **API** en tu proyecto de Supabase
   - Copia el **service_role key** (⚠️ Mantén esto secreto, tiene permisos completos)

### 4. Configuración alternativa (usando archivo de configuración)

Si prefieres usar un archivo de configuración, puedes crear un archivo `mcp-config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "tu_url_de_supabase",
        "SUPABASE_SERVICE_ROLE_KEY": "tu_service_role_key"
      }
    }
  }
}
```

## Verificación

Una vez configurado:

1. Reinicia Cursor
2. Abre el chat del asistente
3. Prueba con un comando como: "Muestra los usuarios en la base de datos"
4. El asistente debería poder consultar tu base de datos Supabase

## Funcionalidades disponibles

Con Supabase MCP configurado, podrás:
- Ejecutar consultas SQL directamente
- Ver la estructura de tus tablas
- Insertar, actualizar y eliminar datos
- Gestionar usuarios y permisos
- Y más operaciones de base de datos

## Seguridad

⚠️ **Importante:**
- El Service Role Key tiene permisos completos en tu base de datos
- No lo compartas ni lo subas a repositorios públicos
- Considera usar variables de entorno para mantenerlo seguro
- En producción, usa políticas RLS más restrictivas

## Solución de problemas

### El servidor MCP no se conecta
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el Service Role Key sea válido
- Revisa los logs de Cursor para ver errores específicos

### No puedo ejecutar consultas
- Verifica que las políticas RLS permitan las operaciones necesarias
- Asegúrate de que el Service Role Key tenga los permisos correctos

## Recursos adicionales

- [Documentación oficial de Supabase MCP](https://github.com/supabase/mcp-server)
- [Documentación de MCP](https://modelcontextprotocol.io/)
- [Guía de Supabase](https://supabase.com/docs)

