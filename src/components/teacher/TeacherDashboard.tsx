import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    subjects,
    students,
    sessions,
    attendanceRecords,
    quickMarkSession,
    setActiveTab
  } = useApp();

  // Find teacher's subjects
  const teacherSubjects = subjects.filter((s) => s.teacherId === currentUser.id);
  const teacherSubjectIds = new Set(teacherSubjects.map((s) => s.id));

  // Today's date in dataset
  const todayStr = '2026-09-13';
  const todaySessions = sessions.filter(
    (s) => teacherSubjectIds.has(s.subjectId) && s.date === todayStr
  );

  // Quick stats
  const pendingSessions = todaySessions.filter((s) => !s.isMarked);
  const completedTodaySessions = todaySessions.filter((s) => s.isMarked);

  // Calculate overall attendance rate for teacher's subjects
  const allTeacherCompletedSessions = sessions.filter(
    (s) => teacherSubjectIds.has(s.subjectId) && s.isMarked
  );
  const sessionIdsSet = new Set(allTeacherCompletedSessions.map((s) => s.id));
  const relevantRecords = attendanceRecords.filter((r) => sessionIdsSet.has(r.classId));
  const presentCount = relevantRecords.filter((r) => r.status === 'present').length;
  const overallTeacherAttendance =
    relevantRecords.length === 0
      ? 0
      : Number(((presentCount / relevantRecords.length) * 100).toFixed(1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Welcome */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <Calendar size={14} />
          <span>Monday, 13 September 2026</span>
          <span>·</span>
          <span>Semester 5</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Good morning, {currentUser.name.replace('Prof. ', '')}.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          You have <strong>{todaySessions.length} classes scheduled</strong> today.{' '}
          {pendingSessions.length > 0 ? (
            <span style={{ color: 'var(--warning-text)', fontWeight: 500 }}>
              {pendingSessions.length} attendance sessions pending.
            </span>
          ) : (
            <span style={{ color: 'var(--safe-text)', fontWeight: 500 }}>
              All attendance for today is up to date.
            </span>
          )}
        </p>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Today's Classes
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>
            {todaySessions.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {completedTodaySessions.length} marked · {pendingSessions.length} pending
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Managed Subjects
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>
            {teacherSubjects.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            CSE-A & B Sections
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total Enrolled Students
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>
            {students.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Active department roster
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Overall Attendance Rate
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              marginTop: '4px',
              color: overallTeacherAttendance >= 75 ? 'var(--safe-indicator)' : 'var(--warning-indicator)'
            }}
          >
            {overallTeacherAttendance}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Across all past sessions
          </div>
        </div>
      </div>

      {/* Primary Section: Today's Classes */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600 }}>Today's Classes</h2>
            <span
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}
            >
              13 September
            </span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('history')}
          >
            Past Sessions
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {todaySessions.map((session) => {
            const subject = subjects.find((s) => s.id === session.subjectId);
            const enrolled = students.filter((st) =>
              st.enrolledSubjectIds.includes(session.subjectId)
            );

            // Check if marked
            const sessionRecords = attendanceRecords.filter((r) => r.classId === session.id);
            const present = sessionRecords.filter((r) => r.status === 'present').length;
            const absent = sessionRecords.filter((r) => r.status === 'absent').length;

            return (
              <div
                key={session.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${subject?.color || 'var(--accent)'}`,
                  gap: '16px'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}
                    >
                      {subject?.code} · {subject?.section}
                    </span>

                    {session.isMarked ? (
                      <span className="status-badge safe">
                        <CheckCircle2 size={12} /> Marked
                      </span>
                    ) : (
                      <span className="status-badge warning">
                        <AlertCircle size={12} /> Pending
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                    {subject?.name}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} /> {session.startTime}
                    </span>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={14} /> {enrolled.length} Students
                    </span>
                    {session.room && (
                      <>
                        <span>·</span>
                        <span>{session.room}</span>
                      </>
                    )}
                  </div>

                  {session.topic && (
                    <div
                      style={{
                        marginTop: '10px',
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                        backgroundColor: 'var(--bg-muted)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      Topic: {session.topic}
                    </div>
                  )}

                  {session.isMarked && (
                    <div
                      style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12.5px',
                        padding: '8px 10px',
                        backgroundColor: 'var(--safe-bg)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--safe-text)',
                        fontWeight: 500
                      }}
                    >
                      <span>
                        {present} Present · {absent} Absent
                      </span>
                      <span>{enrolled.length > 0 ? ((present / enrolled.length) * 100).toFixed(0) : 0}%</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <button
                    className={`btn ${session.isMarked ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%' }}
                    onClick={() => quickMarkSession(session.id)}
                  >
                    <span>{session.isMarked ? 'View / Edit Attendance' : 'Mark Attendance'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
          marginTop: '8px'
        }}
      >
        <div
          className="card"
          style={{
            cursor: 'pointer',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
          onClick={() => setActiveTab('students')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlusCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Manage Student Roster</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Add students or import class CSV
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            cursor: 'pointer',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
          onClick={() => setActiveTab('reports')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--safe-indicator)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Download Reports</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Export CSV attendance summaries
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            cursor: 'pointer',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
          onClick={() => setActiveTab('subjects')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--warning-indicator)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Course Settings</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Adjust minimum attendance requirements
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
