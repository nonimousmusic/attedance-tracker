import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    subjects,
    students,
    sessions,
    attendanceRecords,
    setActiveTab,
    setSelectedSubjectId
  } = useApp();

  // Institution stats calculation
  const totalStudents = students.length;
  const totalFaculty = users.filter((u) => u.role === 'teacher').length;
  const totalSubjects = subjects.length;

  const completedSessions = sessions.filter((s) => s.isMarked);
  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter((r) => r.status === 'present').length;
  const overallInstitutionAttendance =
    totalRecords === 0 ? 0 : Number(((presentRecords / totalRecords) * 100).toFixed(1));

  // Identify at-risk students across all subjects (< 75%)
  const atRiskList = useMemo(() => {
    const list: { student: (typeof students)[0]; subject: (typeof subjects)[0]; percentage: number }[] = [];

    subjects.forEach((sub) => {
      const subSessions = sessions.filter((s) => s.subjectId === sub.id && s.isMarked);
      const subSessionIds = new Set(subSessions.map((s) => s.id));
      if (subSessions.length === 0) return;

      students.forEach((stu) => {
        if (!stu.enrolledSubjectIds.includes(sub.id)) return;
        const records = attendanceRecords.filter(
          (r) => r.studentId === stu.id && subSessionIds.has(r.classId)
        );
        const presentCount = records.filter((r) => r.status === 'present').length;
        const pct = Number(((presentCount / subSessions.length) * 100).toFixed(1));

        if (pct < sub.attendanceRequirement) {
          list.push({ student: stu, subject: sub, percentage: pct });
        }
      });
    });

    return list.sort((a, b) => a.percentage - b.percentage);
  }, [subjects, students, sessions, attendanceRecords]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <Building2 size={14} />
          <span>Institutional Administration Panel</span>
          <span>·</span>
          <span>Fall 2026</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '4px' }}>
          Institution Overview & Compliance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          High-level metrics, regulatory compliance tracking, and cross-department attendance analytics.
        </p>
      </div>

      {/* Metric Cards (PRD Section 17) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total Registered Students
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Department of CSE
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Active Faculty Members
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
            {totalFaculty}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Teaching & Laboratory Staff
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Active Academic Subjects
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>
            {totalSubjects}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Accredited Courses
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Overall Campus Attendance
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '4px',
              color: overallInstitutionAttendance >= 75 ? 'var(--safe-indicator)' : 'var(--warning-indicator)'
            }}
          >
            {overallInstitutionAttendance}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Across {completedSessions.length} total lecture sessions
          </div>
        </div>
      </div>

      {/* At-Risk Students Requiring Intervention */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--critical-indicator)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
              Academic Attendance Warnings ({atRiskList.length} alerts)
            </h3>
          </div>
          <span className="status-badge critical">Immediate Action Required</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll #</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Threshold Req.</th>
                <th>Current %</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {atRiskList.slice(0, 8).map((item, idx) => (
                <tr key={`${item.student.id}-${item.subject.id}-${idx}`}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                    {item.student.rollNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.student.name}</td>
                  <td>{item.subject.name} ({item.subject.code})</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.subject.attendanceRequirement}%</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: item.percentage < 65 ? 'var(--critical-indicator)' : 'var(--warning-indicator)'
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedSubjectId(item.subject.id);
                        setActiveTab('reports');
                      }}
                    >
                      <span>Audit Course</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
