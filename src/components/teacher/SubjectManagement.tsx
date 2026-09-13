import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Subject } from '../../types';
import {
  Plus,
  Users,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  Percent,
  X
} from 'lucide-react';

export const SubjectManagement: React.FC = () => {
  const {
    subjects,
    students,
    currentUser,
    createSubject,
    updateSubject,
    deleteSubject,
    quickMarkSession,
    sessions,
    setSelectedSubjectId,
    setActiveTab
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '5th Sem',
    section: 'CSE-A',
    teacherName: currentUser.name,
    attendanceRequirement: 75,
    scheduleTime: '10:00 AM',
    room: 'Hall 301'
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: 'CS' + (300 + subjects.length + 1),
      semester: '5th Sem',
      section: 'CSE-A',
      teacherName: currentUser.name,
      attendanceRequirement: 75,
      scheduleTime: '10:00 AM',
      room: 'Hall 301'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      semester: sub.semester,
      section: sub.section,
      teacherName: sub.teacherName,
      attendanceRequirement: sub.attendanceRequirement,
      scheduleTime: sub.scheduleTime || '10:00 AM',
      room: sub.room || 'Hall 301'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
    } else {
      createSubject({
        ...formData,
        teacherId: currentUser.id
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Subject Management</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Configure academic courses, classroom assignments, and mandatory attendance thresholds.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={15} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}
      >
        {subjects.map((sub) => {
          const enrolledCount = students.filter((st) =>
            st.enrolledSubjectIds.includes(sub.id)
          ).length;

          // Find today's session if any
          const todaySession = sessions.find(
            (s) => s.subjectId === sub.id && s.date === '2026-09-13'
          );

          return (
            <div
              key={sub.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                borderLeft: `4px solid ${sub.color || 'var(--accent)'}`
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
                      color: 'var(--accent-text)'
                    }}
                  >
                    {sub.code}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenEdit(sub)}
                      style={{ padding: '4px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        if (window.confirm(`Delete ${sub.name}? This will remove related sessions.`)) {
                          deleteSubject(sub.id);
                        }
                      }}
                      style={{ padding: '4px', color: 'var(--critical-indicator)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  {sub.name}
                </h3>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px'
                  }}
                >
                  Faculty: <strong>{sub.teacherName}</strong>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{enrolledCount} Students</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Percent size={13} style={{ color: 'var(--text-tertiary)' }} />
                    <span>Req: <strong>{sub.attendanceRequirement}%</strong></span>
                  </div>

                  {sub.scheduleTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{sub.scheduleTime}</span>
                    </div>
                  )}

                  {sub.room && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{sub.room}</span>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px'
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setActiveTab('reports');
                  }}
                >
                  View Reports
                </button>

                {todaySession && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => quickMarkSession(todaySession.id)}
                  >
                    Mark Attendance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Distributed Computing"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CS305"
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

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Min. Attendance Requirement (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={formData.attendanceRequirement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attendanceRequirement: parseInt(e.target.value) || 75
                      })
                    }
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Schedule Time
                  </label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
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

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Classroom / Lab
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Hall 302"
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
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
