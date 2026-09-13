import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Role } from '../../types';
import {
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  X
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    currentUser,
    switchRole,
    users,
    theme,
    toggleTheme,
    notifications,
    toastMessage
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'teacher':
        return <UserCheck size={14} className="text-indigo-600" />;
      case 'student':
        return <GraduationCap size={14} className="text-blue-600" />;
      case 'admin':
        return <ShieldCheck size={14} className="text-emerald-600" />;
    }
  };

  return (
    <>
      <header className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
              MODE:
            </span>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className="role-pill"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                  gap: '8px',
                  padding: '5px 12px'
                }}
                title="Click to quickly switch roles (Teacher / Student / Admin)"
              >
                {getRoleIcon(currentUser.role)}
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                  ({currentUser.name.split(' ')[0]})
                </span>
                <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />
              </button>

              {roleDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    width: '240px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 100,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      fontWeight: 600,
                      padding: '6px 10px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Switch Experience
                  </div>

                  {users.map((u) => {
                    const isSelected = u.role === currentUser.role;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchRole(u.role);
                          setRoleDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                          color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px' }}>{u.avatar || '👤'}</span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.name}</div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                textTransform: 'capitalize'
                              }}
                            >
                              {u.role} · {u.department || 'Institution'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={15} style={{ color: 'var(--accent-text)' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Notifications button */}
          <button
            className="btn btn-ghost"
            onClick={onOpenNotifications}
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: 'var(--radius-full)'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--critical-indicator)',
                  borderRadius: '50%'
                }}
              />
            )}
          </button>

          {/* Theme toggle */}
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-full)'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* User profile tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '10px',
              borderLeft: '1px solid var(--border-subtle)'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  textTransform: 'capitalize'
                }}
              >
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span>{toastMessage}</span>
          <button
            onClick={() => {}}
            style={{ color: 'inherit', opacity: 0.6, marginLeft: '6px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
};
