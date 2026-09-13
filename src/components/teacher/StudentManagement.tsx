import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Student } from '../../types';
import {
  UserPlus,
  Upload,
  Download,
  Search,
  Trash2,
  Edit2,
  FileSpreadsheet,
  AlertCircle,
  X
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { students, subjects, createStudent, updateStudent, deleteStudent, importStudentsFromCSV } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    class: 'B.Tech CSE',
    section: 'CSE-A',
    semester: '5th Sem'
  });

  // CSV Import Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);

  // Available sections
  const sections = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.section)));
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSection = selectedSection === 'all' || s.section === selectedSection;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [students, selectedSection, searchQuery]);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNumber: `${students.length + 1}`.padStart(2, '0'),
      email: '',
      class: 'B.Tech CSE',
      section: 'CSE-A',
      semester: '5th Sem'
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      class: student.class,
      section: student.section,
      semester: student.semester
    });
    setIsModalOpen(true);
  };

  // Save student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNumber.trim()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      const defaultSubjectIds = subjects.map((s) => s.id);
      createStudent({
        ...formData,
        userId: `user-${Date.now()}`,
        enrolledSubjectIds: defaultSubjectIds
      });
    }
    setIsModalOpen(false);
  };

  // Handle CSV Download Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Roll Number,Email,Section\n' +
      'Aarav Sharma,101,aarav@college.edu,CSE-A\n' +
      'Rahul Kumar,102,rahul.k@college.edu,CSE-A\n' +
      'Ananya Singh,103,ananya.s@college.edu,CSE-A\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'attendly_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process CSV Upload
  const handleProcessCsv = () => {
    setCsvError(null);
    if (!csvText.trim()) {
      setCsvError('Please paste or upload valid CSV text.');
      return;
    }

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setCsvError('CSV must include a header line and at least one student row.');
      return;
    }

    const parsed: { name: string; rollNumber: string; email: string; section: string }[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim());
      if (parts[0]) {
        parsed.push({
          name: parts[0],
          rollNumber: parts[1] || `${students.length + i}`,
          email: parts[2] || `${parts[0].toLowerCase().replace(/\s+/g, '.')}@college.edu`,
          section: parts[3] || 'CSE-A'
        });
      }
    }

    if (parsed.length === 0) {
      setCsvError('No student rows could be parsed.');
      return;
    }

    importStudentsFromCSV(parsed);
    setIsCsvModalOpen(false);
    setCsvText('');
  };

  // Handle file input for CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Students Roster</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Manage student registrations, section assignments, and batch imports.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCsvModalOpen(true)}
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <UserPlus size={14} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            padding: '6px 12px',
            width: '320px'
          }}
        >
          <Search size={15} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by name, roll # or email..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Section:</span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '13px'
            }}
          >
            <option value="all">All Sections ({students.length})</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec} ({students.filter((s) => s.section === sec).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll #</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Class / Section</th>
                <th>Semester</th>
                <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No students match your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {student.rollNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {student.email}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          backgroundColor: 'var(--bg-muted)',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 500
                        }}
                      >
                        {student.section}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {student.semester}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEdit(student)}
                          title="Edit Student"
                          style={{ padding: '5px', color: 'var(--text-secondary)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${student.name}?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          title="Delete Student"
                          style={{ padding: '5px', color: 'var(--critical-indicator)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-muted)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                    placeholder="e.g. 101"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Section
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-muted)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                    placeholder="e.g. CSE-A"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                  placeholder="e.g. aarav@college.edu"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px',
                  marginTop: '8px'
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
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal (PRD Section 15) */}
      {isCsvModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCsvModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Import Students via CSV</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsCsvModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Upload a .csv file or paste raw CSV text with columns: <code>Name,Roll Number,Email,Section</code>.
            </p>

            {csvError && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--critical-bg)',
                  border: '1px solid var(--critical-border)',
                  color: 'var(--critical-text)',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertCircle size={14} />
                <span>{csvError}</span>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Name,Roll Number,Email,Section\nAarav Sharma,101,aarav@college.edu,CSE-A\nRahul Kumar,102,rahul@college.edu,CSE-A`}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '14px'
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleDownloadTemplate}
                style={{ color: 'var(--accent-text)', gap: '4px' }}
              >
                <Download size={13} />
                <span>Download Sample Template</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCsvModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleProcessCsv}
                >
                  Import Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
