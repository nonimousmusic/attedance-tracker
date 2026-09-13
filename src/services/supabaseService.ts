import { getSupabaseClient } from '../lib/supabase';
import type {
  Subject,
  Student,
  ClassSession,
  AttendanceRecord,
  AttendanceStatus,
  AuditLog
} from '../types';

export async function fetchSupabaseData(): Promise<{
  subjects: Subject[];
  students: Student[];
  sessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  auditLogs: AuditLog[];
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // 1. Fetch Subjects
    const { data: subData, error: subError } = await client.from('subjects').select('*');
    if (subError) throw subError;

    // 2. Fetch Students
    const { data: stuData, error: stuError } = await client.from('students').select('*');
    if (stuError) throw stuError;

    // 3. Fetch Classes
    const { data: classData, error: classError } = await client.from('classes').select('*');
    if (classError) throw classError;

    // 4. Fetch Attendance
    const { data: attData, error: attError } = await client.from('attendance').select('*');
    if (attError) throw attError;

    // 5. Fetch Audit Logs
    const { data: auditData, error: auditError } = await client.from('audit_logs').select('*');
    if (auditError) throw auditError;

    // Map to App Types
    const subjects: Subject[] = (subData || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      semester: s.semester,
      section: s.section,
      teacherId: s.teacher_id,
      teacherName: s.teacher_name,
      attendanceRequirement: Number(s.attendance_requirement),
      scheduleTime: s.schedule_time,
      room: s.room,
      color: s.color
    }));

    const subjectIds = subjects.map((s) => s.id);

    const students: Student[] = (stuData || []).map((st: any) => ({
      id: st.id,
      userId: st.user_id || `user-${st.id}`,
      rollNumber: st.roll_number,
      name: st.name,
      email: st.email,
      class: st.class,
      section: st.section,
      semester: st.semester,
      enrolledSubjectIds: subjectIds // Default to all subjects in department
    }));

    const sessions: ClassSession[] = (classData || []).map((c: any) => ({
      id: c.id,
      subjectId: c.subject_id,
      teacherId: c.teacher_id,
      date: c.date,
      startTime: c.start_time,
      endTime: c.end_time,
      room: c.room,
      topic: c.topic,
      isMarked: Boolean(c.is_marked)
    }));

    const attendanceRecords: AttendanceRecord[] = (attData || []).map((a: any) => ({
      id: a.id,
      classId: a.class_id,
      studentId: a.student_id,
      status: a.status as AttendanceStatus,
      markedAt: a.marked_at
    }));

    const auditLogs: AuditLog[] = (auditData || []).map((l: any) => ({
      id: l.id,
      classId: l.class_id,
      studentId: l.student_id,
      studentName: l.student_name,
      subjectName: l.subject_name,
      date: l.date,
      changedBy: l.changed_by,
      oldStatus: l.old_status as AttendanceStatus,
      newStatus: l.new_status as AttendanceStatus,
      timestamp: l.timestamp,
      reason: l.reason
    }));

    return {
      subjects,
      students,
      sessions,
      attendanceRecords,
      auditLogs
    };
  } catch (err) {
    console.error('Failed to fetch data from Supabase:', err);
    return null;
  }
}

export async function saveAttendanceToSupabase(
  classId: string,
  records: { studentId: string; status: AttendanceStatus }[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = records.map((r) => ({
      class_id: classId,
      student_id: r.studentId,
      status: r.status,
      marked_at: new Date().toISOString()
    }));

    // Upsert attendance
    const { error: attError } = await client
      .from('attendance')
      .upsert(payload, { onConflict: 'class_id,student_id' });

    if (attError) throw attError;

    // Update class is_marked
    await client
      .from('classes')
      .update({ is_marked: true })
      .eq('id', classId);

    return true;
  } catch (err) {
    console.error('Failed to save attendance to Supabase:', err);
    return false;
  }
}

export async function recordAuditLogToSupabase(log: AuditLog): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('audit_logs').insert({
      id: log.id,
      class_id: log.classId,
      student_id: log.studentId,
      student_name: log.studentName,
      subject_name: log.subjectName,
      date: log.date,
      changed_by: log.changedBy,
      old_status: log.oldStatus,
      new_status: log.newStatus,
      reason: log.reason || 'Manual attendance correction',
      timestamp: log.timestamp
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to record audit log in Supabase:', err);
    return false;
  }
}

export async function seedSupabaseDatabase(
  subjects: Subject[],
  students: Student[],
  sessions: ClassSession[],
  records: AttendanceRecord[],
  auditLogs: AuditLog[]
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    // 0. Insert Users
    const userPayload = [
      { id: 'user-teacher-1', name: 'Prof. Gurbaaz Singh', email: 'gurbaaz@college.edu', role: 'teacher', department: 'Computer Science & Engineering', avatar: '👨‍🏫' },
      { id: 'user-student-1', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', role: 'student', department: 'Computer Science & Engineering', avatar: '👨‍🎓' },
      { id: 'user-admin-1', name: 'Dr. Rajesh Mehta', email: 'admin@college.edu', role: 'admin', department: 'Academic Dean Office', avatar: '👨‍💼' }
    ];
    await client.from('users').upsert(userPayload);

    // 1. Insert Subjects
    const subPayload = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      semester: s.semester,
      section: s.section,
      teacher_name: s.teacherName,
      attendance_requirement: s.attendanceRequirement,
      schedule_time: s.scheduleTime,
      room: s.room,
      color: s.color
    }));
    const { error: subErr } = await client.from('subjects').upsert(subPayload);
    if (subErr) throw new Error(`Subjects: ${subErr.message}`);

    // 2. Insert Students
    const stuPayload = students.map((st) => ({
      id: st.id,
      roll_number: st.rollNumber,
      name: st.name,
      email: st.email,
      class: st.class,
      section: st.section,
      semester: st.semester
    }));
    const { error: stuErr } = await client.from('students').upsert(stuPayload);
    if (stuErr) throw new Error(`Students: ${stuErr.message}`);

    // 3. Insert Classes
    const classPayload = sessions.map((c) => ({
      id: c.id,
      subject_id: c.subjectId,
      teacher_id: c.teacherId,
      date: c.date,
      start_time: c.startTime,
      room: c.room,
      topic: c.topic,
      is_marked: c.isMarked
    }));
    const { error: classErr } = await client.from('classes').upsert(classPayload);
    if (classErr) throw new Error(`Classes: ${classErr.message}`);

    // 4. Insert Attendance (Batches of 100)
    for (let i = 0; i < records.length; i += 100) {
      const batch = records.slice(i, i + 100).map((r) => ({
        class_id: r.classId,
        student_id: r.studentId,
        status: r.status,
        marked_at: r.markedAt
      }));
      const { error: attErr } = await client
        .from('attendance')
        .upsert(batch, { onConflict: 'class_id,student_id' });
      if (attErr) throw new Error(`Attendance: ${attErr.message}`);
    }

    // 5. Insert Audit Logs
    if (auditLogs.length > 0) {
      const auditPayload = auditLogs.map((l) => ({
        id: l.id,
        class_id: l.classId,
        student_id: l.studentId,
        student_name: l.studentName,
        subject_name: l.subjectName,
        date: l.date,
        changed_by: l.changedBy,
        old_status: l.oldStatus,
        new_status: l.newStatus,
        reason: l.reason || 'Initial log',
        timestamp: l.timestamp
      }));
      await client.from('audit_logs').upsert(auditPayload);
    }

    return {
      success: true,
      message: `Successfully seeded Supabase with ${subjects.length} subjects, ${students.length} students, and ${records.length} attendance records!`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Seeding error: ${err.message || err}`
    };
  }
}
