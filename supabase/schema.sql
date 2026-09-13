-- ==============================================================================
-- Attendly: Minimal Attendance Management System
-- PostgreSQL / Supabase Schema (PRD Sections 20, 21 & 22)
-- Run this script in the Supabase SQL Editor to initialize all tables & policies.
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
    department TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table (user_id is nullable so students can be enrolled before creating logins)
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    roll_number TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    class TEXT NOT NULL DEFAULT 'B.Tech CSE',
    section TEXT NOT NULL DEFAULT 'CSE-A',
    semester TEXT NOT NULL DEFAULT '5th Sem',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If students table was already created with ON DELETE CASCADE in a previous run, safely update constraint:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'students_user_id_fkey' AND table_name = 'students'
    ) THEN
        ALTER TABLE students DROP CONSTRAINT students_user_id_fkey;
        ALTER TABLE students ADD CONSTRAINT students_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    semester TEXT NOT NULL DEFAULT '5th Sem',
    section TEXT NOT NULL DEFAULT 'CSE-A',
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    teacher_name TEXT NOT NULL,
    attendance_requirement NUMERIC NOT NULL DEFAULT 75,
    schedule_time TEXT,
    room TEXT,
    color TEXT DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enrollments Table (Many-to-Many: Students <-> Subjects)
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id)
);

-- 7. Classes / Sessions Table (Daily lectures)
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    room TEXT,
    topic TEXT,
    is_marked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 9. Audit Logs Table (PRD Section 19)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
    student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    date DATE NOT NULL,
    changed_by TEXT NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) - PRD Section 22
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies (Drops if already created to allow clean re-runs)
DROP POLICY IF EXISTS "Public Read Access for Users" ON users;
CREATE POLICY "Public Read Access for Users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access for Students" ON students;
CREATE POLICY "Public Read Access for Students" ON students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access for Subjects" ON subjects;
CREATE POLICY "Public Read Access for Subjects" ON subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access for Enrollments" ON enrollments;
CREATE POLICY "Public Read Access for Enrollments" ON enrollments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access for Classes" ON classes;
CREATE POLICY "Public Read Access for Classes" ON classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access for Attendance" ON attendance;
CREATE POLICY "Public Read Access for Attendance" ON attendance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Access for Audit Logs" ON audit_logs;
CREATE POLICY "Public Read Access for Audit Logs" ON audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable Insert for Attendance" ON attendance;
CREATE POLICY "Enable Insert for Attendance" ON attendance FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable Update for Attendance" ON attendance;
CREATE POLICY "Enable Update for Attendance" ON attendance FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable Insert for Classes" ON classes;
CREATE POLICY "Enable Insert for Classes" ON classes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable Update for Classes" ON classes;
CREATE POLICY "Enable Update for Classes" ON classes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable Insert for Audit" ON audit_logs;
CREATE POLICY "Enable Insert for Audit" ON audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable Insert/Update for Students" ON students;
CREATE POLICY "Enable Insert/Update for Students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable Insert/Update for Subjects" ON subjects;
CREATE POLICY "Enable Insert/Update for Subjects" ON subjects FOR ALL USING (true);

-- ==============================================================================
-- Sample Initial Seed Data (All user_id foreign keys properly populated)
-- ==============================================================================
INSERT INTO users (id, name, email, role, department, avatar)
VALUES
    ('user-teacher-1', 'Prof. Gurbaaz Singh', 'gurbaaz@college.edu', 'teacher', 'Computer Science & Engineering', '👨‍🏫'),
    ('user-student-1', 'Aarav Sharma', 'aarav.sharma@college.edu', 'student', 'Computer Science & Engineering', '👨‍🎓'),
    ('user-student-2', 'Rahul Kumar', 'rahul.k@college.edu', 'student', 'Computer Science & Engineering', '👨‍🎓'),
    ('user-student-3', 'Ananya Singh', 'ananya.s@college.edu', 'student', 'Computer Science & Engineering', '👩‍🎓'),
    ('user-student-4', 'Arjun Mehta', 'arjun.m@college.edu', 'student', 'Computer Science & Engineering', '👨‍🎓'),
    ('user-student-5', 'Diya Nair', 'diya.n@college.edu', 'student', 'Computer Science & Engineering', '👩‍🎓'),
    ('user-admin-1', 'Dr. Rajesh Mehta', 'admin@college.edu', 'admin', 'Academic Dean Office', '👨‍💼')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

INSERT INTO subjects (id, name, code, semester, section, teacher_id, teacher_name, attendance_requirement, schedule_time, room, color)
VALUES
    ('sub-cs301', 'Data Structures & Algorithms', 'CS301', '5th Sem', 'CSE-A', 'user-teacher-1', 'Prof. Gurbaaz Singh', 75, '10:00 AM', 'Hall 302', '#4F46E5'),
    ('sub-cs302', 'Database Management Systems', 'CS302', '5th Sem', 'CSE-A', 'user-teacher-1', 'Prof. Gurbaaz Singh', 75, '11:30 AM', 'Lab 204', '#2563EB'),
    ('sub-cs303', 'Operating Systems', 'CS303', '5th Sem', 'CSE-A', 'user-teacher-1', 'Prof. Gurbaaz Singh', 75, '02:00 PM', 'Hall 305', '#0D9488'),
    ('sub-cs304', 'Computer Networks', 'CS304', '5th Sem', 'CSE-A', 'user-teacher-1', 'Prof. Sneha Verma', 75, '03:30 PM', 'Hall 108', '#7C3AED'),
    ('sub-ma301', 'Discrete Mathematics', 'MA301', '5th Sem', 'CSE-A', 'user-teacher-1', 'Dr. Vikram Patel', 80, '09:00 AM', 'Hall 101', '#D97706')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, user_id, roll_number, name, email, class, section, semester)
VALUES
    ('student-101', 'user-student-1', '01', 'Aarav Sharma', 'aarav@college.edu', 'B.Tech CSE', 'CSE-A', '5th Sem'),
    ('student-102', 'user-student-2', '02', 'Rahul Kumar', 'rahul.k@college.edu', 'B.Tech CSE', 'CSE-A', '5th Sem'),
    ('student-103', 'user-student-3', '03', 'Ananya Singh', 'ananya.s@college.edu', 'B.Tech CSE', 'CSE-A', '5th Sem'),
    ('student-104', 'user-student-4', '04', 'Arjun Mehta', 'arjun.m@college.edu', 'B.Tech CSE', 'CSE-A', '5th Sem'),
    ('student-105', 'user-student-5', '05', 'Diya Nair', 'diya.n@college.edu', 'B.Tech CSE', 'CSE-A', '5th Sem')
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    roll_number = EXCLUDED.roll_number,
    name = EXCLUDED.name,
    email = EXCLUDED.email;
