import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  Calculator,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  RotateCcw
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, resetToDemoData } = useApp();

  const getNavItems = () => {
    if (currentUser.role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="icon" /> },
        { id: 'mark', label: 'Mark Attendance', icon: <CheckSquare className="icon" />, badge: 'Fast' },
        { id: 'history', label: 'Attendance History', icon: <History className="icon" /> },
        { id: 'students', label: 'Students Roster', icon: <Users className="icon" /> },
        { id: 'subjects', label: 'Subjects', icon: <BookOpen className="icon" /> },
        { id: 'reports', label: 'Reports & Export', icon: <BarChart3 className="icon" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="icon" /> }
      ];
    } else if (currentUser.role === 'student') {
      return [
        { id: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="icon" /> },
        { id: 'calculator', label: 'Can I Skip?', icon: <Calculator className="icon" />, badge: 'Smart' },
        { id: 'history', label: 'Attendance History', icon: <History className="icon" /> },
        { id: 'subjects', label: 'Enrolled Courses', icon: <BookOpen className="icon" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="icon" /> }
      ];
    } else {
      // Admin
      return [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="icon" /> },
        { id: 'students', label: 'All Students', icon: <Users className="icon" /> },
        { id: 'subjects', label: 'All Subjects', icon: <BookOpen className="icon" /> },
        { id: 'reports', label: 'Institution Reports', icon: <BarChart3 className="icon" /> },
        { id: 'history', label: 'Audit Logs', icon: <History className="icon" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="icon" /> }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">A</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">Attendly</span>
            <span className="brand-badge">v1.0</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Minimal Attendance
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-muted)',
                    color: isActive ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Demo Reset & Info in Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (window.confirm('Reset all attendance data and courses back to fresh demo state?')) {
              resetToDemoData();
            }
          }}
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-tertiary)' }}
          title="Reset back to default college demo dataset"
        >
          <RotateCcw size={13} />
          <span style={{ fontSize: '12px' }}>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
