-- Migración: Agregar especialidades y actualizar tabla de cursos
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear tabla de especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar especialidades iniciales
INSERT INTO especialidades (name, descripcion) VALUES
  ('Informática', 'Especialidad en Informática - A partir de 3ro'),
  ('Automotor', 'Especialidad en Automotor - A partir de 3ro')
ON CONFLICT (name) DO NOTHING;

-- 3. Agregar columnas a la tabla courses
-- Primero verificamos si las columnas ya existen para evitar errores
DO $$ 
BEGIN
  -- Agregar columna year (año del 1 al 6)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'year') THEN
    ALTER TABLE courses ADD COLUMN year INTEGER CHECK (year >= 1 AND year <= 6);
  END IF;

  -- Agregar columna division (división del 1 al 5)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'division') THEN
    ALTER TABLE courses ADD COLUMN division INTEGER CHECK (division >= 1 AND division <= 5);
  END IF;

  -- Agregar columna turno (Mañana o Tarde)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'turno') THEN
    ALTER TABLE courses ADD COLUMN turno TEXT CHECK (turno IN ('Mañana', 'Tarde'));
  END IF;

  -- Agregar columna especialidad_id (nullable, solo para años 3-6)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'especialidad_id') THEN
    ALTER TABLE courses ADD COLUMN especialidad_id UUID REFERENCES especialidades(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Crear índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_courses_year ON courses(year);
CREATE INDEX IF NOT EXISTS idx_courses_division ON courses(division);
CREATE INDEX IF NOT EXISTS idx_courses_turno ON courses(turno);
CREATE INDEX IF NOT EXISTS idx_courses_especialidad ON courses(especialidad_id);

-- 5. Habilitar RLS para especialidades (solo si la tabla no tiene RLS)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'especialidades' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 6. Política RLS para especialidades (eliminar si existe y recrear)
DROP POLICY IF EXISTS "Allow all operations on especialidades" ON especialidades;
CREATE POLICY "Allow all operations on especialidades" ON especialidades
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Función para generar nombre automático del curso
CREATE OR REPLACE FUNCTION generate_course_name()
RETURNS TRIGGER AS $$
DECLARE
  year_text TEXT;
  division_text TEXT;
  especialidad_name TEXT;
BEGIN
  -- Convertir año a texto (1ro, 2do, 3ro, etc.)
  CASE NEW.year
    WHEN 1 THEN year_text := '1ro';
    WHEN 2 THEN year_text := '2do';
    WHEN 3 THEN year_text := '3ro';
    WHEN 4 THEN year_text := '4to';
    WHEN 5 THEN year_text := '5to';
    WHEN 6 THEN year_text := '6to';
  END CASE;

  -- Convertir división a texto (1ra, 2da, 3ra, etc.)
  CASE NEW.division
    WHEN 1 THEN division_text := '1ra';
    WHEN 2 THEN division_text := '2da';
    WHEN 3 THEN division_text := '3ra';
    WHEN 4 THEN division_text := '4ta';
    WHEN 5 THEN division_text := '5ta';
  END CASE;

  -- Si tiene especialidad, obtener su nombre
  IF NEW.especialidad_id IS NOT NULL THEN
    SELECT name INTO especialidad_name FROM especialidades WHERE id = NEW.especialidad_id;
    NEW.name := year_text || ' ' || division_text || ' - ' || especialidad_name || ' - ' || NEW.turno;
  ELSE
    NEW.name := year_text || ' ' || division_text || ' - ' || NEW.turno;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para generar nombre automático al insertar o actualizar
DROP TRIGGER IF EXISTS course_name_trigger ON courses;
CREATE TRIGGER course_name_trigger
  BEFORE INSERT OR UPDATE OF year, division, turno, especialidad_id ON courses
  FOR EACH ROW
  EXECUTE FUNCTION generate_course_name();

-- 9. Actualizar cursos existentes (si hay alguno)
-- Esto es opcional y depende de si ya tienes cursos creados
-- Puedes comentar o descomentar según necesites

/*
-- Ejemplo: actualizar cursos existentes
UPDATE courses SET 
  year = 1, 
  turno = 'Mañana'
WHERE name LIKE '1%' AND name LIKE '%Mañana%';

UPDATE courses SET 
  year = 1, 
  turno = 'Tarde'
WHERE name LIKE '1%' AND name LIKE '%Tarde%';
-- Continúa para otros cursos...
*/

-- Consulta de verificación
SELECT 
  c.id,
  c.name,
  c.year,
  c.division,
  c.turno,
  e.name as especialidad,
  c.created_at
FROM courses c
LEFT JOIN especialidades e ON c.especialidad_id = e.id
ORDER BY c.year, c.division, c.turno, e.name;


