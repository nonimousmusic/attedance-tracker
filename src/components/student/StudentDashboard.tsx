import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Calculator,
  ArrowRight
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    getAllStudentSubjectStats,
    setActiveTab,
    setSelectedSubjectId
  } = useApp();

  const studentId = currentUser.studentId || 'student-101';
  const { overallPercentage, totalClassesAll, totalPresentAll, status, subjectsStats } =
    getAllStudentSubjectStats(studentId);

  const safeCount = subjectsStats.filter((s) => s.status === 'safe').length;
  const warningCount = subjectsStats.filter((s) => s.status === 'warning').length;
  const criticalCount = subjectsStats.filter((s) => s.status === 'critical').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}
        >
          <Calendar size={14} />
          <span>Monday, 13 September 2026</span>
          <span>·</span>
          <span>B.Tech CSE (5th Semester)</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Good morning, {currentUser.name.split(' ')[0]}.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {warningCount > 0 ? (
            <span style={{ color: 'var(--warning-text)', fontWeight: 500 }}>
              ⚠ You have {warningCount} subject in warning status. Check your "Can I Skip?" calculator.
            </span>
          ) : (
            <span style={{ color: 'var(--safe-text)', fontWeight: 500 }}>
              🎉 Excellent! All your subjects are safely above the required attendance threshold.
            </span>
          )}
        </p>
      </div>

      {/* Overall Attendance Hero Card (PRD Section 10) */}
      <div
        className="card"
        style={{
          padding: '28px',
          background:
            'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-muted) 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-tertiary)'
            }}
          >
            Overall Academic Attendance
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span
              style={{
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color:
                  status === 'safe'
                    ? 'var(--safe-indicator)'
                    : status === 'warning'
                    ? 'var(--warning-indicator)'
                    : 'var(--critical-indicator)'
              }}
            >
              {overallPercentage}%
            </span>

            <span className={`status-badge ${status}`} style={{ fontSize: '13px', padding: '4px 10px' }}>
              <span className="status-dot" />
              <span style={{ textTransform: 'capitalize' }}>{status} Standing</span>
            </span>
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Attended <strong>{totalPresentAll}</strong> of <strong>{totalClassesAll}</strong> total lecture sessions across {subjectsStats.length} subjects.
          </div>
        </div>

        {/* Breakdown Badges */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--safe-text)' }}>
              {safeCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Safe (&ge;75%)</div>
          </div>

          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--warning-text)' }}>
              {warningCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Warning</div>
          </div>

          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--critical-text)' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Critical (&lt;65%)</div>
          </div>
        </div>
      </div>

      {/* Subject-wise Cards Grid */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 600 }}>Enrolled Subjects</h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={14} />
            <span>Open "Can I Skip?" Calculator</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {subjectsStats.map((stat) => (
            <div
              key={stat.subjectId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft: `4px solid ${
                  stat.status === 'safe'
                    ? 'var(--safe-indicator)'
                    : stat.status === 'warning'
                    ? 'var(--warning-indicator)'
                    : 'var(--critical-indicator)'
                }`
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
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    {stat.subjectCode}
                  </span>

                  <span className={`status-badge ${stat.status}`}>
                    <span className="status-dot" />
                    <span style={{ textTransform: 'capitalize' }}>{stat.status}</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  {stat.subjectName}
                </h3>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Faculty: {stat.teacherName} · Min req: {stat.requirement}%
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{stat.percentage}%</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {stat.presentClasses} / {stat.totalClasses} classes
                    </span>
                  </div>

                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${stat.status}`}
                      style={{ width: `${Math.min(100, stat.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* "Can I Skip?" Micro Summary */}
                <div
                  style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor:
                      stat.status === 'safe'
                        ? 'var(--safe-bg)'
                        : stat.status === 'warning'
                        ? 'var(--warning-bg)'
                        : 'var(--critical-bg)',
                    fontSize: '12.5px',
                    color:
                      stat.status === 'safe'
                        ? 'var(--safe-text)'
                        : stat.status === 'warning'
                        ? 'var(--warning-text)'
                        : 'var(--critical-text)'
                  }}
                >
                  {stat.status === 'safe' ? (
                    <div>
                      💡 You can safely miss <strong>{stat.maxSkippable} classes</strong> before falling below {stat.requirement}%.
                    </div>
                  ) : (
                    <div>
                      ⚠ Must attend next <strong>{stat.classesToAttend} consecutive classes</strong> to reach {stat.requirement}%.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={() => {
                    setSelectedSubjectId(stat.subjectId);
                    setActiveTab('calculator');
                  }}
                >
                  <span>Simulate Attendance</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
