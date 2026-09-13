import type { User, Subject, Student, ClassSession, AttendanceRecord, AuditLog, NotificationItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-teacher-1',
    name: 'Prof. Gurbaaz Singh',
    email: 'gurbaaz@college.edu',
    role: 'teacher',
    department: 'Computer Science & Engineering',
    avatar: '👨‍🏫'
  },
  {
    id: 'user-student-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    role: 'student',
    studentId: 'student-101',
    department: 'Computer Science & Engineering',
    avatar: '👨‍🎓'
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Rajesh Mehta',
    email: 'admin@college.edu',
    role: 'admin',
    department: 'Academic Dean Office',
    avatar: '👨‍💼'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cs301',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    semester: '5th Sem',
    section: 'CSE-A',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Gurbaaz Singh',
    attendanceRequirement: 75,
    scheduleTime: '10:00 AM',
    room: 'Hall 302',
    color: '#4F46E5'
  },
  {
    id: 'sub-cs302',
    name: 'Database Management Systems',
    code: 'CS302',
    semester: '5th Sem',
    section: 'CSE-A',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Gurbaaz Singh',
    attendanceRequirement: 75,
    scheduleTime: '11:30 AM',
    room: 'Lab 204',
    color: '#2563EB'
  },
  {
    id: 'sub-cs303',
    name: 'Operating Systems',
    code: 'CS303',
    semester: '5th Sem',
    section: 'CSE-A',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Gurbaaz Singh',
    attendanceRequirement: 75,
    scheduleTime: '02:00 PM',
    room: 'Hall 305',
    color: '#0D9488'
  },
  {
    id: 'sub-cs304',
    name: 'Computer Networks',
    code: 'CS304',
    semester: '5th Sem',
    section: 'CSE-A',
    teacherId: 'user-teacher-2',
    teacherName: 'Prof. Sneha Verma',
    attendanceRequirement: 75,
    scheduleTime: '03:30 PM',
    room: 'Hall 108',
    color: '#7C3AED'
  },
  {
    id: 'sub-ma301',
    name: 'Discrete Mathematics',
    code: 'MA301',
    semester: '5th Sem',
    section: 'CSE-A',
    teacherId: 'user-teacher-3',
    teacherName: 'Dr. Vikram Patel',
    attendanceRequirement: 80,
    scheduleTime: '09:00 AM',
    room: 'Hall 101',
    color: '#D97706'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'student-101', userId: 'user-student-1', rollNumber: '01', name: 'Aarav Sharma', email: 'aarav@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-102', userId: 'user-student-2', rollNumber: '02', name: 'Rahul Kumar', email: 'rahul.k@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-103', userId: 'user-student-3', rollNumber: '03', name: 'Ananya Singh', email: 'ananya.s@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-104', userId: 'user-student-4', rollNumber: '04', name: 'Arjun Mehta', email: 'arjun.m@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-105', userId: 'user-student-5', rollNumber: '05', name: 'Diya Nair', email: 'diya.n@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-106', userId: 'user-student-6', rollNumber: '06', name: 'Ishaan Verma', email: 'ishaan.v@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-107', userId: 'user-student-7', rollNumber: '07', name: 'Kavya Iyer', email: 'kavya.i@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-108', userId: 'user-student-8', rollNumber: '08', name: 'Rohan Gupta', email: 'rohan.g@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-109', userId: 'user-student-9', rollNumber: '09', name: 'Priya Joshi', email: 'priya.j@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-110', userId: 'user-student-10', rollNumber: '10', name: 'Siddharth Rao', email: 'sid.r@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-111', userId: 'user-student-11', rollNumber: '11', name: 'Sneha Kulkarni', email: 'sneha.k@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-112', userId: 'user-student-12', rollNumber: '12', name: 'Varun Bhatia', email: 'varun.b@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-113', userId: 'user-student-13', rollNumber: '13', name: 'Tanvi Deshmukh', email: 'tanvi.d@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-114', userId: 'user-student-14', rollNumber: '14', name: 'Aditya Pillai', email: 'aditya.p@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-115', userId: 'user-student-15', rollNumber: '15', name: 'Meera Nambiar', email: 'meera.n@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-116', userId: 'user-student-16', rollNumber: '16', name: 'Kunal Kapoor', email: 'kunal.k@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-117', userId: 'user-student-17', rollNumber: '17', name: 'Riya Sen', email: 'riya.s@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-118', userId: 'user-student-18', rollNumber: '18', name: 'Gaurav Banerjee', email: 'gaurav.b@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-119', userId: 'user-student-19', rollNumber: '19', name: 'Tara Choudhury', email: 'tara.c@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-120', userId: 'user-student-20', rollNumber: '20', name: 'Nikhil Saxena', email: 'nikhil.s@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-121', userId: 'user-student-21', rollNumber: '21', name: 'Pooja Reddy', email: 'pooja.r@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-122', userId: 'user-student-22', rollNumber: '22', name: 'Akash Das', email: 'akash.d@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-123', userId: 'user-student-23', rollNumber: '23', name: 'Shruti Mishra', email: 'shruti.m@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-124', userId: 'user-student-24', rollNumber: '24', name: 'Vikramaditya Bose', email: 'vikram.b@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] },
  { id: 'student-125', userId: 'user-student-25', rollNumber: '25', name: 'Neha Chawla', email: 'neha.c@college.edu', class: 'B.Tech CSE', section: 'CSE-A', semester: '5th Sem', enrolledSubjectIds: ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'] }
];

// Helper to seed realistic sessions and records for the last 20 days
export function generateInitialAttendance(): { sessions: ClassSession[]; records: AttendanceRecord[] } {
  const sessions: ClassSession[] = [];
  const records: AttendanceRecord[] = [];

  const subjectIds = ['sub-cs301', 'sub-cs302', 'sub-cs303', 'sub-cs304', 'sub-ma301'];
  
  // Last 18 working days dates (excluding weekends)
  const pastDates: string[] = [
    '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22',
    '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-29',
    '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05',
    '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'
  ];

  pastDates.forEach((dateStr, dateIdx) => {
    // Generate sessions for 3-4 subjects per day
    subjectIds.forEach((subId, subIdx) => {
      // Alternate schedule slightly
      if ((dateIdx + subIdx) % 5 === 0) return;

      const sub = INITIAL_SUBJECTS.find(s => s.id === subId)!;
      const sessionId = `session-${subId}-${dateStr}`;
      
      sessions.push({
        id: sessionId,
        subjectId: subId,
        teacherId: sub.teacherId,
        date: dateStr,
        startTime: sub.scheduleTime || '10:00 AM',
        endTime: '11:00 AM',
        room: sub.room,
        topic: `Lecture ${dateIdx + 1}: Core Concepts & Lab Exercise`,
        isMarked: true
      });

      // Generate records for each student
      INITIAL_STUDENTS.forEach((student) => {
        let isPresent = true;
        
        // Custom distribution for Aarav Sharma (student-101) to match PRD numbers:
        if (student.id === 'student-101') {
          if (subId === 'sub-cs301') {
            // Data Structures: 92% (absent only on 1-2 specific days)
            isPresent = dateIdx !== 4 && dateIdx !== 14;
          } else if (subId === 'sub-cs302') {
            // DBMS: 72% (warning: absent on 5 days)
            isPresent = ![2, 5, 8, 12, 16].includes(dateIdx);
          } else if (subId === 'sub-cs303') {
            // OS: 85%
            isPresent = ![3, 11].includes(dateIdx);
          } else if (subId === 'sub-cs304') {
            // CN: 80%
            isPresent = ![1, 7, 13].includes(dateIdx);
          } else {
            // Maths: 95%
            isPresent = dateIdx !== 6;
          }
        } else if (student.id === 'student-103') {
          // Ananya Singh: Critical attendance (~65%)
          isPresent = (dateIdx % 3 !== 0);
        } else {
          // Standard student distribution (~85-95%)
          const hash = (student.rollNumber.charCodeAt(0) + dateIdx * 7 + subIdx * 13) % 100;
          isPresent = hash > 15; // 85% attendance
        }

        records.push({
          id: `att-${sessionId}-${student.id}`,
          classId: sessionId,
          studentId: student.id,
          status: isPresent ? 'present' : 'absent',
          markedAt: `${dateStr}T10:30:00.000Z`
        });
      });
    });
  });

  // Add Today's Classes (2026-09-13) - Unmarked to test the teacher flow!
  const today = '2026-09-13';
  sessions.push({
    id: `session-sub-cs301-${today}`,
    subjectId: 'sub-cs301',
    teacherId: 'user-teacher-1',
    date: today,
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    room: 'Hall 302',
    topic: 'Binary Search Trees & Balancing',
    isMarked: false
  });

  sessions.push({
    id: `session-sub-cs302-${today}`,
    subjectId: 'sub-cs302',
    teacherId: 'user-teacher-1',
    date: today,
    startTime: '11:30 AM',
    endTime: '12:30 PM',
    room: 'Lab 204',
    topic: 'Relational Algebra & SQL Joins',
    isMarked: false
  });

  sessions.push({
    id: `session-sub-cs303-${today}`,
    subjectId: 'sub-cs303',
    teacherId: 'user-teacher-1',
    date: today,
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    room: 'Hall 305',
    topic: 'Process Synchronization & Semaphores',
    isMarked: false
  });

  return { sessions, records };
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    classId: 'session-sub-cs301-2026-09-11',
    studentId: 'student-101',
    studentName: 'Aarav Sharma',
    subjectName: 'Data Structures & Algorithms',
    date: '2026-09-11',
    changedBy: 'Prof. Gurbaaz Singh',
    oldStatus: 'absent',
    newStatus: 'present',
    timestamp: '2026-09-11T16:32:00.000Z',
    reason: 'Medical certificate approved by HOD'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    title: 'Attendance Warning for DBMS',
    message: 'Your DBMS attendance is currently 72.2%. You need to attend the next 3 consecutive classes to return above 75%.',
    type: 'warning',
    timestamp: '2026-09-12T14:30:00.000Z',
    read: false,
    subjectId: 'sub-cs302'
  },
  {
    id: 'notif-2',
    userId: 'user-teacher-1',
    title: "Today's Classes Ready",
    message: 'You have 3 classes scheduled today. Data Structures (CS301) begins at 10:00 AM.',
    type: 'info',
    timestamp: '2026-09-13T08:00:00.000Z',
    read: false
  }
];
