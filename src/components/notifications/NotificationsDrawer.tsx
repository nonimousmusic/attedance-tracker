import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, AlertCircle, Info, Check, ArrowRight } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveTab,
    setSelectedSubjectId
  } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning-indicator)' }} />;
      case 'critical':
        return <AlertCircle size={18} style={{ color: 'var(--critical-indicator)' }} />;
      case 'success':
        return <Check size={18} style={{ color: 'var(--safe-indicator)' }} />;
      default:
        return <Info size={18} style={{ color: 'var(--accent)' }} />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Notifications</h3>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="status-badge warning">
                {notifications.filter((n) => !n.read).length} new
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {notifications.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearAllNotifications}
                style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}
              >
                Clear all
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ padding: '4px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13.5px'
            }}
          >
            No active notifications. You are all caught up!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: n.read ? 'var(--bg-surface)' : 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '12px',
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '2px'
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      marginBottom: '8px'
                    }}
                  >
                    {n.message}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                      {new Date(n.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    {n.subjectId && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setSelectedSubjectId(n.subjectId || null);
                          setActiveTab('calculator');
                          onClose();
                        }}
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent-text)',
                          padding: '2px 6px',
                          gap: '4px'
                        }}
                      >
                        <span>Check Status</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
