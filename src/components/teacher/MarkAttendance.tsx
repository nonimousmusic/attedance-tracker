import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { AttendanceStatus } from '../../types';
import confetti from 'canvas-confetti';
import {
  Search,
  CheckCheck,
  XCircle,
  Calendar,
  ArrowLeft,
  Save
} from 'lucide-react';

export const MarkAttendance: React.FC = () => {
  const {
    currentUser,
    subjects,
    students,
    sessions,
    attendanceRecords,
    selectedSessionId,
    setSelectedSessionId,
    selectedSubjectId,
    setSelectedSubjectId,
    markSessionAttendance,
    setActiveTab
  } = useApp();

  // Pick active subject (default to teacher's first subject or selected)
  const teacherSubjects = subjects.filter((s) => s.teacherId === currentUser.id);
  const activeSubjectId =
    selectedSubjectId || (teacherSubjects.length > 0 ? teacherSubjects[0].id : subjects[0]?.id);

  // Find or create session for selected subject and date
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-13');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active subject object
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  // Filter students enrolled in this subject
  const enrolledStudents = useMemo(() => {
    return students.filter((st) => st.enrolledSubjectIds.includes(activeSubjectId));
  }, [students, activeSubjectId]);

  // Find session for this subject & date
  const currentSession = useMemo(() => {
    if (selectedSessionId) {
      const found = sessions.find((s) => s.id === selectedSessionId);
      if (found && found.subjectId === activeSubjectId) return found;
    }
    return sessions.find(
      (s) => s.subjectId === activeSubjectId && s.date === selectedDate
    );
  }, [sessions, selectedSessionId, activeSubjectId, selectedDate]);

  // Student Attendance State Map: studentId -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  // Initialize attendance state when subject/session changes
  useEffect(() => {
    const newMap: Record<string, AttendanceStatus> = {};

    if (currentSession) {
      // Load existing records if session exists
      const existing = attendanceRecords.filter((r) => r.classId === currentSession.id);
      if (existing.length > 0) {
        existing.forEach((r) => {
          newMap[r.studentId] = r.status;
        });
      }
    }

    // Default any unset student to 'present' (speed principle: default present, mark absentees)
    enrolledStudents.forEach((st) => {
      if (!newMap[st.id]) {
        newMap[st.id] = 'present';
      }
    });

    setAttendanceMap(newMap);
  }, [currentSession, activeSubjectId, enrolledStudents, attendanceRecords]);

  // Filtered student list for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNumber.includes(q)
    );
  }, [enrolledStudents, searchQuery]);

  // Bulk Actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated = { ...attendanceMap };
    enrolledStudents.forEach((st) => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
  };

  // Toggle single student
  const toggleStudent = (studentId: string) => {
    setAttendanceMap((prev) => {
      const current = prev[studentId] || 'present';
      const next: AttendanceStatus = current === 'present' ? 'absent' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  // Calculate live counts
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;
  const totalCount = enrolledStudents.length;
  const livePercent = totalCount === 0 ? 0 : Number(((presentCount / totalCount) * 100).toFixed(1));

  // Save Attendance
  const handleSave = () => {
    let targetSessionId = currentSession?.id;

    if (!targetSessionId) {
      // Session does not exist yet for this date, create on the fly
      targetSessionId = `session-${activeSubjectId}-${selectedDate}`;
    }

    const recordsToSave = enrolledStudents.map((st) => ({
      studentId: st.id,
      status: attendanceMap[st.id] || 'present'
    }));

    markSessionAttendance(targetSessionId, recordsToSave);

    // Trigger celebratory micro-confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch (e) {
      // Ignore in environments without canvas
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      {/* Top Bar / Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('dashboard')}
            title="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Attendance Marking · {activeSubject?.section}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{activeSubject?.name}</h1>
          </div>
        </div>

        {/* Subject & Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={activeSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedSessionId(null);
            }}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <Calendar size={15} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </div>

      {/* Speed Actions & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        {/* Bulk Action Buttons (<30s Speed Core) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll('present')}
            style={{ color: 'var(--safe-text)', borderColor: 'var(--safe-border)' }}
          >
            <CheckCheck size={15} />
            <span>Mark All Present</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll('absent')}
            style={{ color: 'var(--critical-text)', borderColor: 'var(--critical-border)' }}
          >
            <XCircle size={15} />
            <span>Mark All Absent</span>
          </button>
        </div>

        {/* Fast Student Search Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 12px',
            width: '280px'
          }}
        >
          <Search size={15} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search student or roll #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              color: 'var(--text-primary)',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Instruction Tip */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>
          💡 <strong>Fast-marking tip:</strong> Tap any student's row or toggle button to flip their status.
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>
          Showing {filteredStudents.length} of {enrolledStudents.length} students
        </span>
      </div>

      {/* Student List (Clean, high-density minimal rows) */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: '80px' // Space for sticky bottom bar
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 140px',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '11.5px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase'
          }}
        >
          <span>Roll #</span>
          <span>Student Name</span>
          <span style={{ textAlign: 'right' }}>Status Toggle</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredStudents.map((student, idx) => {
            const status = attendanceMap[student.id] || 'present';
            const isPresent = status === 'present';

            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 140px',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom:
                    idx === filteredStudents.length - 1
                      ? 'none'
                      : '1px solid var(--border-subtle)',
                  backgroundColor: isPresent ? 'transparent' : 'var(--critical-bg)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                {/* Roll Number */}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)'
                  }}
                >
                  {student.rollNumber}
                </span>

                {/* Name & Email */}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {student.email}
                  </div>
                </div>

                {/* Fast Toggle Button */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStudent(student.id);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      backgroundColor: isPresent ? 'var(--safe-bg)' : 'var(--critical-bg)',
                      color: isPresent ? 'var(--safe-text)' : 'var(--critical-text)',
                      border: `1px solid ${isPresent ? 'var(--safe-border)' : 'var(--critical-border)'}`,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isPresent
                          ? 'var(--safe-indicator)'
                          : 'var(--critical-indicator)'
                      }}
                    />
                    <span>{isPresent ? 'Present' : 'Absent'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Action Bar (<30s Experience from PRD Section 8 & 25) */}
      <div className="sticky-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: 'var(--safe-text)' }}>
              ● {presentCount} Present
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>·</span>
            <span style={{ fontWeight: 600, color: 'var(--critical-text)' }}>
              ○ {absentCount} Absent
            </span>
          </div>

          <span
            style={{
              fontSize: '11.5px',
              padding: '2px 8px',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontWeight: 600
            }}
          >
            {livePercent}% Attendance
          </span>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          style={{ gap: '8px' }}
        >
          <Save size={16} />
          <span>Save Attendance</span>
        </button>
      </div>
    </div>
  );
};
