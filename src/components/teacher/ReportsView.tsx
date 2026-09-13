import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Printer,
  Search
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { subjects, getSubjectStats, selectedSubjectId, setSelectedSubjectId } = useApp();

  const activeSubjectId = selectedSubjectId || subjects[0]?.id;
  const [filterThreshold, setFilterThreshold] = useState<'all' | 'above' | 'below'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    return getSubjectStats(activeSubjectId);
  }, [getSubjectStats, activeSubjectId]);

  // Filter student rows
  const filteredBreakdown = useMemo(() => {
    if (!stats) return [];
    return stats.studentBreakdown.filter((row) => {
      const matchSearch =
        row.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.student.rollNumber.includes(searchQuery);

      if (!matchSearch) return false;
      if (filterThreshold === 'above') return row.percentage >= (stats.subject.attendanceRequirement || 75);
      if (filterThreshold === 'below') return row.percentage < (stats.subject.attendanceRequirement || 75);
      return true;
    });
  }, [stats, filterThreshold, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    if (!stats) return;

    let csv = `Subject,${stats.subject.name} (${stats.subject.code})\n`;
    csv += `Section,${stats.subject.section}\n`;
    csv += `Total Enrolled,${stats.totalStudents}\n`;
    csv += `Average Attendance,${stats.averageAttendance}%\n`;
    csv += `Requirement,${stats.subject.attendanceRequirement}%\n\n`;
    csv += `Roll Number,Student Name,Email,Present,Absent,Total Sessions,Attendance %\n`;

    stats.studentBreakdown.forEach((row) => {
      csv += `"${row.student.rollNumber}","${row.student.name}","${row.student.email}",${row.presentCount},${row.absentCount},${row.totalCount},${row.percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${stats.subject.code}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!stats) {
    return <div className="card">No subject data found.</div>;
  }

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
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Subject Attendance Report</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Comprehensive performance audit and compliance reporting for institutional accreditation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Subject Dropdown */}
          <select
            value={activeSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
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

          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards (PRD Section 16) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Total Students
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {stats.subject.section} · {stats.subject.semester}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Average Attendance
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 700,
              marginTop: '4px',
              color: stats.averageAttendance >= stats.subject.attendanceRequirement ? 'var(--safe-indicator)' : 'var(--warning-indicator)'
            }}
          >
            {stats.averageAttendance}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Across {stats.totalClasses} lectures conducted
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--safe-indicator)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Compliant (≥ {stats.subject.attendanceRequirement}%)
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: 'var(--safe-text)' }}>
            {stats.above75Count}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {stats.totalStudents > 0 ? ((stats.above75Count / stats.totalStudents) * 100).toFixed(0) : 0}% of class
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--critical-indicator)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            At Risk (&lt; {stats.subject.attendanceRequirement}%)
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', color: 'var(--critical-text)' }}>
            {stats.below75Count}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Requires faculty intervention
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
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
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${filterThreshold === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterThreshold('all')}
          >
            All Students ({stats.studentBreakdown.length})
          </button>
          <button
            className={`btn btn-sm ${filterThreshold === 'above' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterThreshold('above')}
          >
            Above Requirement ({stats.above75Count})
          </button>
          <button
            className={`btn btn-sm ${filterThreshold === 'below' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterThreshold('below')}
            style={{
              color: filterThreshold === 'below' ? '#fff' : 'var(--critical-text)',
              backgroundColor: filterThreshold === 'below' ? 'var(--critical-indicator)' : undefined
            }}
          >
            At Risk ({stats.below75Count})
          </button>
        </div>
      </div>

      {/* Student Breakdown Table (PRD Section 16) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Roll #</th>
                <th>Student Name</th>
                <th style={{ textAlign: 'right' }}>Present</th>
                <th style={{ textAlign: 'right' }}>Absent</th>
                <th style={{ textAlign: 'right' }}>Total Sessions</th>
                <th style={{ width: '180px' }}>Attendance Progress</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBreakdown.map((row) => (
                  <tr key={row.student.id}>
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      {row.student.rollNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.student.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {row.student.email}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--safe-text)' }}>
                      {row.presentCount}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--critical-text)' }}>
                      {row.absentCount}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {row.totalCount}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar-track">
                          <div
                            className={`progress-bar-fill ${row.status}`}
                            style={{ width: `${Math.min(100, row.percentage)}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, minWidth: '40px' }}>
                          {row.percentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`status-badge ${row.status}`}>
                        <span className="status-dot" />
                        <span style={{ textTransform: 'capitalize' }}>{row.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
