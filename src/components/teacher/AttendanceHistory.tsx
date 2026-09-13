import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { AttendanceStatus } from '../../types';
import {
  Calendar as CalendarIcon,
  FileEdit,
  ShieldAlert,
  ChevronRight,
  History
} from 'lucide-react';

export const AttendanceHistory: React.FC = () => {
  const {
    subjects,
    students,
    sessions,
    attendanceRecords,
    auditLogs,
    updateSingleAttendance,
    quickMarkSession
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'sessions' | 'audit'>('sessions');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Correction Modal State
  const [editingRecord, setEditingRecord] = useState<{
    sessionId: string;
    studentId: string;
    studentName: string;
    currentStatus: AttendanceStatus;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        if (!s.isMarked) return false;
        if (selectedSubjectId !== 'all' && s.subjectId !== selectedSubjectId) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, selectedSubjectId]);

  // Handle submit correction
  const handleSaveCorrection = () => {
    if (!editingRecord) return;
    if (!correctionReason.trim()) {
      alert('Please provide a brief reason for the attendance correction audit log.');
      return;
    }

    updateSingleAttendance(
      editingRecord.sessionId,
      editingRecord.studentId,
      newStatus,
      correctionReason
    );

    setEditingRecord(null);
    setCorrectionReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
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
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Attendance History & Audit</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Review past lecture logs and manage tamper-evident attendance corrections.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Tab buttons */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '3px'
            }}
          >
            <button
              className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('sessions')}
              style={{
                backgroundColor: activeTab === 'sessions' ? 'var(--bg-surface)' : 'transparent',
                boxShadow: activeTab === 'sessions' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <CalendarIcon size={14} />
              <span>Sessions ({filteredSessions.length})</span>
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'audit' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('audit')}
              style={{
                backgroundColor: activeTab === 'audit' ? 'var(--bg-surface)' : 'transparent',
                boxShadow: activeTab === 'audit' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <History size={14} />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>

          {/* Subject Filter */}
          {activeTab === 'sessions' && (
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
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* View 1: Past Sessions List with Accordion Breakdown */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredSessions.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No completed sessions found for the selected filter.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const subject = subjects.find((s) => s.id === session.subjectId);
              const sessionRecords = attendanceRecords.filter((r) => r.classId === session.id);
              const presentCount = sessionRecords.filter((r) => r.status === 'present').length;
              const absentCount = sessionRecords.filter((r) => r.status === 'absent').length;
              const totalCount = sessionRecords.length;
              const percent = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : '0';
              const isExpanded = expandedSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderColor: isExpanded ? 'var(--border-strong)' : 'var(--border-subtle)'
                  }}
                >
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '12px',
                      backgroundColor: isExpanded ? 'var(--bg-surface-hover)' : 'transparent',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-muted)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1 }}>
                          {new Date(session.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600 }}>{subject?.name}</span>
                          <span className="status-badge safe">{subject?.code}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {session.startTime} · {subject?.section} {session.room ? `· ${session.room}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                          {presentCount} Present · {absentCount} Absent
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {percent}% Attendance
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform var(--transition-fast)',
                          color: 'var(--text-tertiary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded Roll Call & Edit Details */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '12px'
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Student Roll Call ({sessionRecords.length} records)
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => quickMarkSession(session.id)}
                        >
                          <FileEdit size={13} />
                          <span>Re-open Full Marking</span>
                        </button>
                      </div>

                      <div
                        style={{
                          maxHeight: '320px',
                          overflowY: 'auto',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        {sessionRecords.map((rec) => {
                          const student = students.find((s) => s.id === rec.studentId);
                          const isPresent = rec.status === 'present';

                          return (
                            <div
                              key={rec.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 14px',
                                borderBottom: '1px solid var(--border-subtle)',
                                backgroundColor: isPresent ? 'transparent' : 'var(--critical-bg)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                    color: 'var(--text-tertiary)',
                                    width: '28px'
                                  }}
                                >
                                  {student?.rollNumber}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                                  {student?.name || 'Unknown Student'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`status-badge ${isPresent ? 'safe' : 'critical'}`}>
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>

                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                    setEditingRecord({
                                      sessionId: session.id,
                                      studentId: rec.studentId,
                                      studentName: student?.name || 'Student',
                                      currentStatus: rec.status
                                    });
                                    setNewStatus(isPresent ? 'absent' : 'present');
                                  }}
                                  style={{ fontSize: '11.5px', color: 'var(--accent-text)', padding: '3px 8px' }}
                                >
                                  Edit Status
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Audit Logs (PRD Section 19) */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Tamper-Evident Audit Log</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                All manual attendance overrides and corrections are permanently cataloged with reasons.
              </p>
            </div>
            <span className="status-badge warning">Immutable Trail</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Student</th>
                  <th>Subject & Date</th>
                  <th>Status Transition</th>
                  <th>Reason / Medical Note</th>
                  <th>Authorized By</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.studentName}</td>
                    <td>
                      <div>{log.subjectName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Session Date: {log.date}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`status-badge ${log.oldStatus === 'present' ? 'safe' : 'critical'}`}>
                          {log.oldStatus}
                        </span>
                        <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                        <span className={`status-badge ${log.newStatus === 'present' ? 'safe' : 'critical'}`}>
                          {log.newStatus}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', maxWidth: '240px' }}>
                      <em>"{log.reason || 'Correction requested'}"</em>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {log.changedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Correction Modal */}
      {editingRecord && (
        <div className="modal-backdrop" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldAlert size={20} style={{ color: 'var(--warning-indicator)' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Edit Attendance Record</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Student: <strong>{editingRecord.studentName}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  New Status
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn ${newStatus === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setNewStatus('present')}
                    style={{ flex: 1 }}
                  >
                    Present (●)
                  </button>
                  <button
                    type="button"
                    className={`btn ${newStatus === 'absent' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setNewStatus('absent')}
                    style={{
                      flex: 1,
                      backgroundColor: newStatus === 'absent' ? 'var(--critical-indicator)' : undefined
                    }}
                  >
                    Absent (○)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Reason for Modification (Mandatory for Audit Trail)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Medical certificate verified, technical glitch during initial marking, etc."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveCorrection}
                >
                  Confirm & Log Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
