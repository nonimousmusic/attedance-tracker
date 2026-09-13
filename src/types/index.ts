export type Role = 'teacher' | 'student' | 'admin';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  studentId?: string; // If role is student, links to student record
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  section: string;
  teacherId: string;
  teacherName: string;
  attendanceRequirement: number; // e.g., 75
  scheduleTime?: string; // e.g., "10:00 AM"
  room?: string;
  color?: string;
}

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  name: string;
  email: string;
  class: string;
  section: string;
  semester: string;
  enrolledSubjectIds: string[];
}

export interface ClassSession {
  id: string;
  subjectId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "10:00 AM"
  endTime?: string;
  room?: string;
  topic?: string;
  isMarked: boolean;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
}

export interface AuditLog {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  subjectName: string;
  date: string;
  changedBy: string;
  oldStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  timestamp: string;
  reason?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
  subjectId?: string;
}

export interface StudentSubjectStats {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  requirement: number;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  lateClasses: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  maxSkippable: number;
  classesToAttend: number;
}
