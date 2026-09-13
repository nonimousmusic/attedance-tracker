import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw
} from 'lucide-react';

export const CanISkipCalculator: React.FC = () => {
  const {
    currentUser,
    subjects,
    getStudentSubjectStats,
    selectedSubjectId,
    setSelectedSubjectId
  } = useApp();

  const studentId = currentUser.studentId || 'student-101';
  const activeSubjectId = selectedSubjectId || subjects[0]?.id;

  const currentStats = getStudentSubjectStats(studentId, activeSubjectId);

  // Interactive "What-If" Simulation State
  const [futureMissed, setFutureMissed] = useState<number>(0);
  const [futureAttended, setFutureAttended] = useState<number>(0);

  // Calculate simulated numbers
  const simulatedPresent = currentStats.presentClasses + futureAttended;
  const simulatedTotal = currentStats.totalClasses + futureAttended + futureMissed;
  const simulatedPercent =
    simulatedTotal === 0
      ? 100
      : Number(((simulatedPresent / simulatedTotal) * 100).toFixed(1));

  let simulatedStatus: 'safe' | 'warning' | 'critical' = 'safe';
  if (simulatedPercent < 65) {
    simulatedStatus = 'critical';
  } else if (simulatedPercent < currentStats.requirement) {
    simulatedStatus = 'warning';
  } else {
    simulatedStatus = 'safe';
  }

  const resetSimulator = () => {
    setFutureMissed(0);
    setFutureAttended(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>"Can I Skip?" Calculator</h1>
            <span className="brand-badge">Smart Prediction</span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Real-time projection engine to calculate maximum safe absences or required class recovery.
          </p>
        </div>

        {/* Subject Select */}
        <select
          value={activeSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            resetSimulator();
          }}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '13.5px',
            fontWeight: 600
          }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Analysis Card (PRD Section 12 Specification) */}
      <div
        className="card"
        style={{
          padding: '28px',
          borderLeft: `5px solid ${
            currentStats.status === 'safe'
              ? 'var(--safe-indicator)'
              : currentStats.status === 'warning'
              ? 'var(--warning-indicator)'
              : 'var(--critical-indicator)'
          }`,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {currentStats.subjectCode} · Required Threshold: {currentStats.requirement}%
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>
              {currentStats.subjectName}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Current Standing: <strong>{currentStats.presentClasses} attended</strong> out of{' '}
              <strong>{currentStats.totalClasses} total lectures</strong> conducted.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color:
                  currentStats.status === 'safe'
                    ? 'var(--safe-indicator)'
                    : currentStats.status === 'warning'
                    ? 'var(--warning-indicator)'
                    : 'var(--critical-indicator)'
              }}
            >
              {currentStats.percentage}%
            </div>
            <span className={`status-badge ${currentStats.status}`}>
              <span className="status-dot" />
              <span style={{ textTransform: 'capitalize' }}>{currentStats.status} Status</span>
            </span>
          </div>
        </div>

        {/* Prediction Verdict Callout (PRD Section 12 Exact UX) */}
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor:
              currentStats.status === 'safe'
                ? 'var(--safe-bg)'
                : currentStats.status === 'warning'
                ? 'var(--warning-bg)'
                : 'var(--critical-bg)',
            border: `1px solid ${
              currentStats.status === 'safe'
                ? 'var(--safe-border)'
                : currentStats.status === 'warning'
                ? 'var(--warning-border)'
                : 'var(--critical-border)'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: '18px'
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {currentStats.status === 'safe' ? (
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--safe-indicator)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800
                }}
              >
                {currentStats.maxSkippable}
              </div>
            ) : (
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--warning-indicator)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800
                }}
              >
                {currentStats.classesToAttend}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            {currentStats.status === 'safe' ? (
              <div>
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--safe-text)',
                    marginBottom: '2px'
                  }}
                >
                  You can miss {currentStats.maxSkippable} more {currentStats.maxSkippable === 1 ? 'class' : 'classes'}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--safe-text)', opacity: 0.9 }}>
                  and remain above the mandatory {currentStats.requirement}% attendance threshold.
                </p>
              </div>
            ) : (
              <div>
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--warning-text)',
                    marginBottom: '2px'
                  }}
                >
                  You need to attend {currentStats.classesToAttend} more consecutive{' '}
                  {currentStats.classesToAttend === 1 ? 'class' : 'classes'}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--warning-text)', opacity: 0.9 }}>
                  without any absence to restore your attendance safely above {currentStats.requirement}%.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Simulation Engine */}
      <div className="card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Interactive What-If Scenario Simulator</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Test hypothetical upcoming attendance decisions to visualize future outcomes before taking leave.
            </p>
          </div>

          {(futureMissed > 0 || futureAttended > 0) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={resetSimulator}
              style={{ color: 'var(--accent-text)' }}
            >
              <RotateCcw size={13} />
              <span>Reset Simulator</span>
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}
        >
          {/* Controls: Classes to Miss */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-muted)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--critical-text)' }}>
                What if I miss upcoming classes?
              </label>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>+{futureMissed}</span>
            </div>

            <input
              type="range"
              min="0"
              max="15"
              value={futureMissed}
              onChange={(e) => setFutureMissed(parseInt(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--critical-indicator)', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <span>0 classes</span>
              <span>15 classes</span>
            </div>
          </div>

          {/* Controls: Classes to Attend */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-muted)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--safe-text)' }}>
                What if I attend upcoming classes?
              </label>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>+{futureAttended}</span>
            </div>

            <input
              type="range"
              min="0"
              max="15"
              value={futureAttended}
              onChange={(e) => setFutureAttended(parseInt(e.target.value) || 0)}
              style={{ width: '100%', accentColor: 'var(--safe-indicator)', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <span>0 classes</span>
              <span>15 classes</span>
            </div>
          </div>
        </div>

        {/* Projected Outcome */}
        <div
          style={{
            padding: '18px 22px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Simulated Future Result
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color:
                    simulatedStatus === 'safe'
                      ? 'var(--safe-indicator)'
                      : simulatedStatus === 'warning'
                      ? 'var(--warning-indicator)'
                      : 'var(--critical-indicator)'
                }}
              >
                {simulatedPercent}%
              </span>

              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                ({simulatedPresent} of {simulatedTotal} classes)
              </span>

              <span className={`status-badge ${simulatedStatus}`}>
                <span className="status-dot" />
                <span style={{ textTransform: 'capitalize' }}>{simulatedStatus}</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Diff from current:
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color:
                  simulatedPercent >= currentStats.percentage
                    ? 'var(--safe-text)'
                    : 'var(--critical-text)'
              }}
            >
              {simulatedPercent >= currentStats.percentage ? '+' : ''}
              {(simulatedPercent - currentStats.percentage).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
