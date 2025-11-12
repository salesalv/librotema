-- Esquema de base de datos para Libro de Temas
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dni TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'profesor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Asignación Materia-Curso
CREATE TABLE IF NOT EXISTS subject_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, course_id)
);

-- Tabla de Asignación Profesor-Materia
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, course_id)
);

-- Tabla de Libros de Temas
CREATE TABLE IF NOT EXISTS logbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, course_id)
);

-- Tabla de Sesiones de Clase
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logbook_id UUID NOT NULL REFERENCES logbooks(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  class_number INTEGER NOT NULL,
  class_character TEXT NOT NULL CHECK (class_character IN (
    'Presentación', 'Teórica', 'Práctica', 'Examen', 
    'Sin clase', 'Olimpiada Informática', 'Trabajo Final', 'Recuperatorio'
  )),
  content TEXT NOT NULL,
  task TEXT NOT NULL,
  teacher_verification BOOLEAN DEFAULT FALSE,
  observations TEXT DEFAULT '',
  director_verification JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_logbooks_teacher ON logbooks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_logbook ON class_sessions(logbook_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en logbooks
CREATE TRIGGER update_logbooks_updated_at
  BEFORE UPDATE ON logbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permite todo por ahora, puedes ajustarlas según tus necesidades)
-- Para producción, deberías crear políticas más restrictivas

-- Política para usuarios: todos pueden leer y escribir (ajustar según necesidades)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on subjects" ON subjects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on courses" ON courses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on subject_courses" ON subject_courses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on teacher_subjects" ON teacher_subjects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on logbooks" ON logbooks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on class_sessions" ON class_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Insertar usuario admin por defecto
-- La contraseña es 'admin123' (en producción, deberías usar hash)
INSERT INTO users (dni, name, password, role)
VALUES ('admin', 'Administrador', 'admin123', 'admin')
ON CONFLICT (dni) DO NOTHING;

