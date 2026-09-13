import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Role,
  Subject,
  Student,
  ClassSession,
  AttendanceRecord,
  AttendanceStatus,
  AuditLog,
  NotificationItem,
  StudentSubjectStats
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  generateInitialAttendance,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import {
  isSupabaseConfigured,
  checkSupabaseConnection,
  saveSupabaseCredentials
} from '../lib/supabase';
import {
  fetchSupabaseData,
  saveAttendanceToSupabase,
  recordAuditLogToSupabase,
  seedSupabaseDatabase
} from '../services/supabaseService';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  users: User[];
  subjects: Subject[];
  students: Student[];
  sessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Actions
  quickMarkSession: (sessionId: string) => void;
  markSessionAttendance: (
    sessionId: string,
    records: { studentId: string; status: AttendanceStatus }[],
    sessionMeta?: {
      subjectId?: string;
      date?: string;
      startTime?: string;
      room?: string;
      topic?: string;
    }
  ) => void;
  updateSingleAttendance: (
    sessionId: string,
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string
  ) => void;
  createSubject: (newSubject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  createStudent: (newStudent: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudentsFromCSV: (
    parsed: { name: string; rollNumber: string; email: string; section: string }[]
  ) => { count: number; error?: string };
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToDemoData: () => void;

  // Supabase Integration
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  supabaseStatusMessage: string;
  testSupabaseConnection: () => Promise<boolean>;
  saveSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  syncLocalToSupabase: () => Promise<{ success: boolean; message: string }>;
  pullFromSupabase: () => Promise<boolean>;

  // Analytics & Calculators
  getSubjectStats: (subjectId: string) => {
    subject: Subject;
    totalStudents: number;
    totalClasses: number;
    averageAttendance: number;
    above75Count: number;
    below75Count: number;
    studentBreakdown: {
      student: Student;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      totalCount: number;
      percentage: number;
      status: 'safe' | 'warning' | 'critical';
    }[];
  } | null;
  getStudentSubjectStats: (studentId: string, subjectId: string) => StudentSubjectStats;
  getAllStudentSubjectStats: (studentId: string) => {
    overallPercentage: number;
    totalClassesAll: number;
    totalPresentAll: number;
    status: 'safe' | 'warning' | 'critical';
    subjectsStats: StudentSubjectStats[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'attendly_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Users
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS[0]; // Default: Teacher
  });

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'subjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUBJECTS;
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STUDENTS;
  });

  // Sessions & Attendance
  const [sessions, setSessions] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const { sessions } = generateInitialAttendance();
    return sessions;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const { records } = generateInitialAttendance();
    return records;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'auditLogs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Supabase Integration State
  const [isSupabaseCfg, setIsSupabaseCfg] = useState<boolean>(isSupabaseConfigured());
  const [isSupabaseConn, setIsSupabaseConn] = useState<boolean>(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string>(
    isSupabaseConfigured() ? 'Connecting to Supabase...' : 'Not configured'
  );

  // Auto-connect to Supabase on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      checkSupabaseConnection().then((res) => {
        setIsSupabaseConn(res.connected && Boolean(res.tablesAvailable));
        setSupabaseStatusMsg(res.message);
        if (res.connected && res.tablesAvailable) {
          fetchSupabaseData().then((remoteData) => {
            if (remoteData && remoteData.subjects.length > 0) {
              setSubjects(remoteData.subjects);
              if (remoteData.students.length > 0) {
                setStudents(remoteData.students);
              }
              if (remoteData.sessions.length > 0) {
                setSessions(remoteData.sessions);
              }
              if (remoteData.attendanceRecords.length > 0) {
                setAttendanceRecords(remoteData.attendanceRecords);
              }
              if (remoteData.auditLogs.length > 0) {
                setAuditLogs(remoteData.auditLogs);
              }
              showToast('Connected to Supabase PostgreSQL!');
            }
          });
        }
      });
    }
  }, []);

  const testSupabaseConnection = async () => {
    setIsSupabaseCfg(isSupabaseConfigured());
    const res = await checkSupabaseConnection();
    setIsSupabaseConn(res.connected && Boolean(res.tablesAvailable));
    setSupabaseStatusMsg(res.message);
    showToast(res.message);
    return res.connected;
  };

  const saveSupabaseConfig = async (url: string, key: string) => {
    saveSupabaseCredentials(url, key);
    const configured = isSupabaseConfigured();
    setIsSupabaseCfg(configured);
    if (!configured) {
      setIsSupabaseConn(false);
      setSupabaseStatusMsg('Supabase not configured');
      showToast('Supabase configuration cleared.');
      return false;
    }
    const res = await checkSupabaseConnection();
    setIsSupabaseConn(res.connected && Boolean(res.tablesAvailable));
    setSupabaseStatusMsg(res.message);
    showToast(res.message);
    return res.connected;
  };

  const syncLocalToSupabase = async () => {
    const res = await seedSupabaseDatabase(subjects, students, sessions, attendanceRecords, auditLogs);
    showToast(res.message);
    if (res.success) {
      setIsSupabaseConn(true);
      setSupabaseStatusMsg('Connected and synchronized with Supabase!');
    }
    return res;
  };

  const pullFromSupabase = async () => {
    const data = await fetchSupabaseData();
    if (data && data.subjects.length > 0) {
      setSubjects(data.subjects);
      setStudents(data.students);
      setSessions(data.sessions);
      setAttendanceRecords(data.attendanceRecords);
      setAuditLogs(data.auditLogs);
      showToast('Loaded latest dataset from Supabase.');
      return true;
    }
    showToast('No tables found in Supabase yet. Please run supabase/schema.sql in SQL Editor.');
    return false;
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Switch User Role
  const switchRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
    setActiveTab('dashboard');
    showToast(`Switched view to ${targetUser.name} (${role.toUpperCase()})`);
  };

  // Quick Mark CTA
  const quickMarkSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const sess = sessions.find((s) => s.id === sessionId);
    if (sess) {
      setSelectedSubjectId(sess.subjectId);
    }
    setActiveTab('mark');
  };

  // Mark Session Attendance (<30s UX)
  const markSessionAttendance = (
    sessionId: string,
    recordsToSave: { studentId: string; status: AttendanceStatus }[],
    sessionMeta?: {
      subjectId?: string;
      date?: string;
      startTime?: string;
      room?: string;
      topic?: string;
    }
  ) => {
    const now = new Date().toISOString();
    
    // Remove existing records for this session if any (e.g. re-marking)
    const existingFiltered = attendanceRecords.filter((r) => r.classId !== sessionId);

    const newRecords: AttendanceRecord[] = recordsToSave.map((r) => ({
      id: `att-${sessionId}-${r.studentId}-${Date.now()}`,
      classId: sessionId,
      studentId: r.studentId,
      status: r.status,
      markedAt: now
    }));

    setAttendanceRecords([...existingFiltered, ...newRecords]);

    // Mark session as completed / ensure session exists in sessions list
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === sessionId);
      if (exists) {
        return prev.map((s) => (s.id === sessionId ? { ...s, isMarked: true } : s));
      }
      const matchedSubject = subjects.find(
        (sub) => sessionMeta?.subjectId === sub.id || sessionId.includes(sub.id)
      ) || subjects[0];

      const newSession: ClassSession = {
        id: sessionId,
        subjectId: sessionMeta?.subjectId || matchedSubject?.id || '',
        teacherId: matchedSubject?.teacherId || currentUser.id,
        date: sessionMeta?.date || new Date().toISOString().split('T')[0],
        startTime: sessionMeta?.startTime || matchedSubject?.scheduleTime || '10:00 AM',
        room: sessionMeta?.room || matchedSubject?.room,
        topic: sessionMeta?.topic || 'Lecture Session',
        isMarked: true
      };
      return [newSession, ...prev];
    });

    const presentCount = recordsToSave.filter((r) => r.status === 'present').length;
    const totalCount = recordsToSave.length;
    showToast(`Attendance saved: ${presentCount}/${totalCount} students marked Present.`);

    if (isSupabaseConn) {
      saveAttendanceToSupabase(sessionId, recordsToSave, sessionMeta);
    }
  };

  // Single Attendance Correction with Audit Trail
  const updateSingleAttendance = (
    sessionId: string,
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string
  ) => {
    const existingRecord = attendanceRecords.find(
      (r) => r.classId === sessionId && r.studentId === studentId
    );
    const session = sessions.find((s) => s.id === sessionId);
    const subject = subjects.find((sub) => sub.id === session?.subjectId);
    const student = students.find((st) => st.id === studentId);

    const oldStatus = existingRecord ? existingRecord.status : 'absent';

    // Update or add record
    if (existingRecord) {
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.id === existingRecord.id
            ? { ...r, status: newStatus, markedAt: new Date().toISOString() }
            : r
        )
      );
    } else {
      setAttendanceRecords((prev) => [
        ...prev,
        {
          id: `att-${sessionId}-${studentId}-${Date.now()}`,
          classId: sessionId,
          studentId,
          status: newStatus,
          markedAt: new Date().toISOString()
        }
      ]);
    }

    // Append to Audit Logs
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      classId: sessionId,
      studentId,
      studentName: student?.name || 'Unknown Student',
      subjectName: subject?.name || 'Subject',
      date: session?.date || new Date().toISOString().split('T')[0],
      changedBy: currentUser.name,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString(),
      reason: reason || 'Manual correction by faculty'
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Updated ${student?.name} to ${newStatus.toUpperCase()}. Audit entry recorded.`);

    if (isSupabaseConn) {
      saveAttendanceToSupabase(sessionId, [{ studentId, status: newStatus }]);
      recordAuditLogToSupabase(newLog);
    }
  };

  // Subject Management
  const createSubject = (newSub: Omit<Subject, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const colors = ['#4F46E5', '#0D9488', '#2563EB', '#7C3AED', '#D97706', '#E11D48'];
    const randomColor = colors[subjects.length % colors.length];
    const created: Subject = { ...newSub, id, color: randomColor };
    setSubjects((prev) => [...prev, created]);
    showToast(`Subject "${created.name}" created successfully.`);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Subject updated.');
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast('Subject deleted.');
  };

  // Student Management
  const createStudent = (newStu: Omit<Student, 'id'>) => {
    const id = `student-${Date.now()}`;
    const created: Student = { ...newStu, id };
    setStudents((prev) => [...prev, created]);
    showToast(`Student ${created.name} added.`);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Student updated.');
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('Student removed.');
  };

  // CSV Import
  const importStudentsFromCSV = (
    parsed: { name: string; rollNumber: string; email: string; section: string }[]
  ) => {
    if (!parsed.length) {
      return { count: 0, error: 'No valid rows found in CSV' };
    }
    const allSubjectIds = subjects.map((s) => s.id);
    const newStudents: Student[] = parsed.map((item, idx) => ({
      id: `student-csv-${Date.now()}-${idx}`,
      userId: `user-csv-${Date.now()}-${idx}`,
      rollNumber: item.rollNumber || `${students.length + idx + 1}`,
      name: item.name,
      email: item.email || `${item.name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
      class: 'B.Tech CSE',
      section: item.section || 'CSE-A',
      semester: '5th Sem',
      enrolledSubjectIds: allSubjectIds
    }));

    setStudents((prev) => [...prev, ...newStudents]);
    showToast(`Imported ${newStudents.length} students from CSV.`);
    return { count: newStudents.length };
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    const { sessions: initSessions, records: initRecords } = generateInitialAttendance();
    setSubjects(INITIAL_SUBJECTS);
    setStudents(INITIAL_STUDENTS);
    setSessions(initSessions);
    setAttendanceRecords(initRecords);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    showToast('Reset system to initial demonstration dataset.');
  };

  // Calculate Student Subject Stats + "Can I Skip?"
  const getStudentSubjectStats = (studentId: string, subjectId: string): StudentSubjectStats => {
    const subject = subjects.find((s) => s.id === subjectId);
    const req = subject?.attendanceRequirement || 75;

    // Find all completed sessions for this subject
    const subjectSessions = sessions.filter(
      (s) => s.subjectId === subjectId && s.isMarked
    );
    const sessionIds = new Set(subjectSessions.map((s) => s.id));

    // Find attendance records for this student in these sessions
    const records = attendanceRecords.filter(
      (r) => r.studentId === studentId && sessionIds.has(r.classId)
    );

    const totalClasses = subjectSessions.length;
    let presentClasses = 0;
    let absentClasses = 0;
    let lateClasses = 0;

    records.forEach((r) => {
      if (r.status === 'present') presentClasses++;
      else if (r.status === 'absent') absentClasses++;
      else if (r.status === 'late') lateClasses++;
    });

    // Unrecorded sessions count as absent or present? In marked sessions, if not recorded, count as absent
    if (records.length < totalClasses) {
      absentClasses += totalClasses - records.length;
    }

    const percentage =
      totalClasses === 0 ? 100 : Number(((presentClasses / totalClasses) * 100).toFixed(1));

    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (percentage < 65) {
      status = 'critical';
    } else if (percentage < req) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    // "Can I Skip?" Logic
    const R = req / 100;
    let maxSkippable = 0;
    let classesToAttend = 0;

    if (totalClasses === 0) {
      maxSkippable = 0;
      classesToAttend = 0;
    } else if (percentage >= req) {
      // Safe: calculate how many classes can be missed while remaining >= R
      // Formula: (P - R * T) / R
      const val = (presentClasses - R * totalClasses) / R;
      maxSkippable = Math.max(0, Math.floor(val));
    } else {
      // Below threshold: calculate how many consecutive classes must be attended to reach >= R
      // Formula: (R * T - P) / (1 - R)
      const val = (R * totalClasses - presentClasses) / (1 - R);
      classesToAttend = Math.max(1, Math.ceil(val));
    }

    return {
      subjectId,
      subjectName: subject?.name || 'Unknown Subject',
      subjectCode: subject?.code || 'N/A',
      teacherName: subject?.teacherName || 'Faculty',
      requirement: req,
      totalClasses,
      presentClasses,
      absentClasses,
      lateClasses,
      percentage,
      status,
      maxSkippable,
      classesToAttend
    };
  };

  // Get All Subject Stats for a Student
  const getAllStudentSubjectStats = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const studentSubIds = student?.enrolledSubjectIds || subjects.map((s) => s.id);

    const subjectsStats = studentSubIds
      .map((subId) => getStudentSubjectStats(studentId, subId))
      .filter(Boolean);

    let totalClassesAll = 0;
    let totalPresentAll = 0;

    subjectsStats.forEach((st) => {
      totalClassesAll += st.totalClasses;
      totalPresentAll += st.presentClasses;
    });

    const overallPercentage =
      totalClassesAll === 0
        ? 100
        : Number(((totalPresentAll / totalClassesAll) * 100).toFixed(1));

    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (overallPercentage < 65) {
      status = 'critical';
    } else if (overallPercentage < 75) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    return {
      overallPercentage,
      totalClassesAll,
      totalPresentAll,
      status,
      subjectsStats
    };
  };

  // Get Subject-Level Analytics
  const getSubjectStats = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return null;

    const req = subject.attendanceRequirement || 75;
    const enrolledStudents = students.filter((st) =>
      st.enrolledSubjectIds.includes(subjectId)
    );

    const subjectSessions = sessions.filter(
      (s) => s.subjectId === subjectId && s.isMarked
    );
    const sessionIds = new Set(subjectSessions.map((s) => s.id));

    let totalPercentageSum = 0;
    let above75Count = 0;
    let below75Count = 0;

    const studentBreakdown = enrolledStudents.map((student) => {
      const records = attendanceRecords.filter(
        (r) => r.studentId === student.id && sessionIds.has(r.classId)
      );

      const presentCount = records.filter((r) => r.status === 'present').length;
      const absentCount = records.filter((r) => r.status === 'absent').length;
      const lateCount = records.filter((r) => r.status === 'late').length;
      const totalCount = subjectSessions.length;

      const percentage =
        totalCount === 0 ? 100 : Number(((presentCount / totalCount) * 100).toFixed(1));

      totalPercentageSum += percentage;

      if (percentage >= req) {
        above75Count++;
      } else {
        below75Count++;
      }

      let status: 'safe' | 'warning' | 'critical' = 'safe';
      if (percentage < 65) {
        status = 'critical';
      } else if (percentage < req) {
        status = 'warning';
      } else {
        status = 'safe';
      }

      return {
        student,
        presentCount,
        absentCount,
        lateCount,
        totalCount,
        percentage,
        status
      };
    });

    const averageAttendance =
      enrolledStudents.length === 0
        ? 0
        : Number((totalPercentageSum / enrolledStudents.length).toFixed(1));

    return {
      subject,
      totalStudents: enrolledStudents.length,
      totalClasses: subjectSessions.length,
      averageAttendance,
      above75Count,
      below75Count,
      studentBreakdown
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        subjects,
        students,
        sessions,
        attendanceRecords,
        auditLogs,
        notifications,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedSessionId,
        setSelectedSessionId,
        toastMessage,
        showToast,
        quickMarkSession,
        markSessionAttendance,
        updateSingleAttendance,
        createSubject,
        updateSubject,
        deleteSubject,
        createStudent,
        updateStudent,
        deleteStudent,
        importStudentsFromCSV,
        markNotificationAsRead,
        clearAllNotifications,
        resetToDemoData,
        isSupabaseConfigured: isSupabaseCfg,
        isSupabaseConnected: isSupabaseConn,
        supabaseStatusMessage: supabaseStatusMsg,
        testSupabaseConnection,
        saveSupabaseConfig,
        syncLocalToSupabase,
        pullFromSupabase,
        getSubjectStats,
        getStudentSubjectStats,
        getAllStudentSubjectStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
