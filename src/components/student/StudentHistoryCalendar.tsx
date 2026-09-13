import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const StudentHistoryCalendar: React.FC = () => {
  const { currentUser, subjects, sessions, attendanceRecords } = useApp();

  const studentId = currentUser.studentId || 'student-101';
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-11');

  // Days of September 2026
  const daysInMonth = 30;
  // 1 Sep 2026 is Tuesday (day of week: 2, 0-indexed where Mon is 0) -> offset 1
  const startDayOffset = 1; // Tuesday is 1 when Monday is 0

  // Build calendar map: Date string -> sessions & status
  const calendarData = useMemo(() => {
    const map: Record<
      string,
      {
        sessions: { session: (typeof sessions)[0]; record?: (typeof attendanceRecords)[0]; subject?: (typeof subjects)[0] }[];
        hasPresent: boolean;
        hasAbsent: boolean;
      }
    > = {};

    sessions
      .filter((s) => s.isMarked)
      .forEach((sess) => {
        if (selectedSubjectId !== 'all' && sess.subjectId !== selectedSubjectId) return;

        const sub = subjects.find((sb) => sb.id === sess.subjectId);
        const rec = attendanceRecords.find(
          (r) => r.classId === sess.id && r.studentId === studentId
        );

        if (!map[sess.date]) {
          map[sess.date] = { sessions: [], hasPresent: false, hasAbsent: false };
        }

        map[sess.date].sessions.push({ session: sess, record: rec, subject: sub });
        if (rec?.status === 'present') map[sess.date].hasPresent = true;
        if (rec?.status === 'absent') map[sess.date].hasAbsent = true;
      });

    return map;
  }, [sessions, attendanceRecords, subjects, studentId, selectedSubjectId]);

  // Selected date details
  const selectedDayInfo = calendarData[selectedDate] || { sessions: [] };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Attendance Calendar & History</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Track your daily attendance presence and review past class lectures.
          </p>
        </div>

        {/* Subject Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filter:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            <option value="all">All Courses</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Calendar Grid (PRD Section 13) */}
        <div className="card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>September 2026</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="brand-badge">Academic Term</span>
            </div>
          </div>

          {/* Days of Week Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}
          >
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>Su</div>
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Empty slots for start offset */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '42px' }} />
            ))}

            {/* 1 to 30 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
              const dayData = calendarData[dateStr];
              const isSelected = selectedDate === dateStr;

              // Determine status badge
              let dotColor = 'transparent';
              if (dayData && dayData.sessions.length > 0) {
                if (dayData.hasAbsent && !dayData.hasPresent) {
                  dotColor = 'var(--critical-indicator)';
                } else if (dayData.hasAbsent && dayData.hasPresent) {
                  dotColor = 'var(--warning-indicator)';
                } else if (dayData.hasPresent) {
                  dotColor = 'var(--safe-indicator)';
                }
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected
                      ? 'var(--accent-subtle)'
                      : dayData
                      ? 'var(--bg-surface)'
                      : 'var(--bg-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: dayData ? 'pointer' : 'default',
                    opacity: dayData ? 1 : 0.45,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)'
                    }}
                  >
                    {dayNum}
                  </span>

                  {/* Dot indicator */}
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                      marginTop: '2px'
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '20px',
              fontSize: '11.5px',
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--safe-indicator)'
                }}
              />
              <span>Present All</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--warning-indicator)'
                }}
              />
              <span>Partial</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--critical-indicator)'
                }}
              />
              <span>Absent</span>
            </div>
          </div>
        </div>

        {/* Selected Date Session Details */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '12px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {selectedDayInfo.sessions.length} classes recorded
              </span>
            </div>
          </div>

          {selectedDayInfo.sessions.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
                textAlign: 'center',
                padding: '32px'
              }}
            >
              No classes were scheduled or recorded on this date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDayInfo.sessions.map((item) => {
                const isPresent = item.record?.status === 'present';

                return (
                  <div
                    key={item.session.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: isPresent ? 'var(--bg-surface)' : 'var(--critical-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {item.subject?.name}
                        </span>
                        <span className="status-badge safe">{item.subject?.code}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          marginTop: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Clock size={12} />
                        <span>{item.session.startTime}</span>
                        {item.session.room && <span>· {item.session.room}</span>}
                      </div>
                    </div>

                    <span className={`status-badge ${isPresent ? 'safe' : 'critical'}`}>
                      {isPresent ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      <span>{isPresent ? 'Present' : 'Absent'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
