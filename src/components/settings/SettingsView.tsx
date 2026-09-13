import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStoredSupabaseCredentials } from '../../lib/supabase';
import {
  Sun,
  Moon,
  RotateCcw,
  Download,
  Database,
  Cloud,
  Copy,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Check
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    theme,
    toggleTheme,
    resetToDemoData,
    subjects,
    students,
    sessions,
    attendanceRecords,
    auditLogs,
    isSupabaseConfigured,
    isSupabaseConnected,
    supabaseStatusMessage,
    saveSupabaseConfig,
    syncLocalToSupabase,
    pullFromSupabase
  } = useApp();

  const storedCreds = getStoredSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(storedCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(storedCreds.key);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Handle Save Supabase credentials
  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    await saveSupabaseConfig(supabaseUrl, supabaseKey);
    setIsTesting(false);
  };

  // Handle Copy SQL Schema
  const handleCopySchema = async () => {
    try {
      const response = await fetch('/supabase/schema.sql');
      let sqlText = '';
      if (response.ok) {
        sqlText = await response.text();
      } else {
        // Fallback schema text
        sqlText = `-- Attendly Supabase Schema\n-- View supabase/schema.sql in the project root directory.`;
      }
      await navigator.clipboard.writeText(sqlText);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      currentUser,
      subjects,
      students,
      sessions,
      attendanceRecords,
      auditLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendly_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>System Settings</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Manage your account profile, visual themes, and cloud Supabase backend connectivity.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '780px' }}>
        {/* Supabase Cloud Connection Panel */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderLeft: `4px solid ${
              isSupabaseConnected
                ? 'var(--safe-indicator)'
                : isSupabaseConfigured
                ? 'var(--warning-indicator)'
                : 'var(--border-strong)'
            }`
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--safe-indicator)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cloud size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Supabase Cloud Database</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  PostgreSQL, Row Level Security, and Realtime Sync
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={`status-badge ${
                  isSupabaseConnected ? 'safe' : isSupabaseConfigured ? 'warning' : 'critical'
                }`}
              >
                <span className="status-dot" />
                <span>{isSupabaseConnected ? 'Connected' : isSupabaseConfigured ? 'Pending Schema' : 'Not Connected'}</span>
              </span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {supabaseStatusMessage}
          </p>

          {/* Form to enter / update Supabase URL and Key */}
          <form onSubmit={handleSaveSupabase} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-ref.supabase.co"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                marginTop: '6px'
              }}
            >
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isTesting}
                style={{ gap: '6px' }}
              >
                {isTesting ? <RefreshCw size={14} className="spin" /> : <Cloud size={14} />}
                <span>{isTesting ? 'Testing Connection...' : 'Save & Test Connection'}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopySchema}
                  title="Copy full PostgreSQL table schema to paste in Supabase SQL Editor"
                >
                  {copiedSchema ? <Check size={14} style={{ color: 'var(--safe-indicator)' }} /> : <Copy size={14} />}
                  <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    setIsSyncing(true);
                    await syncLocalToSupabase();
                    setIsSyncing(false);
                  }}
                  disabled={!isSupabaseConfigured || isSyncing}
                  title="Upload all local subjects, students, and attendance records into Supabase"
                >
                  <UploadCloud size={14} />
                  <span>{isSyncing ? 'Seeding...' : 'Seed Supabase from Local'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => pullFromSupabase()}
                  disabled={!isSupabaseConfigured}
                  title="Pull latest records from Supabase"
                >
                  <RefreshCw size={14} />
                  <span>Pull</span>
                </button>
              </div>
            </div>
          </form>

          {/* Setup Guide Box */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Quick 3-Step Setup:
            </div>
            <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>
                Create a free project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-text)', textDecoration: 'underline' }}
                >
                  supabase.com <ExternalLink size={10} style={{ display: 'inline' }} />
                </a>.
              </li>
              <li>Go to <strong>Project Settings → API</strong> and paste your Project URL and anon key above.</li>
              <li>
                Click <strong>Copy SQL Schema</strong>, open Supabase's <strong>SQL Editor</strong>, run it, and then click <strong>Seed Supabase from Local</strong>!
              </li>
            </ol>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
            Active Profile
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}
            >
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {currentUser.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="status-badge safe" style={{ textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {currentUser.department || 'Department of Computer Science'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
            Visual Appearance
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Choose between crisp daylight monochrome or sleek high-contrast dark mode.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={theme === 'dark' ? toggleTheme : undefined}
              style={{ flex: 1, padding: '12px' }}
            >
              <Sun size={16} />
              <span>Light Mode</span>
            </button>

            <button
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={theme === 'light' ? toggleTheme : undefined}
              style={{ flex: 1, padding: '12px' }}
            >
              <Moon size={16} />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Data Persistence & Demo Reset Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Database size={17} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Data & State Management</h3>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            All attendance logs, student rosters, and audit entries are automatically saved to your browser's persistent LocalStorage and synced with Supabase when configured.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleExportBackup}>
              <Download size={15} />
              <span>Export Full JSON Backup</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all attendance records, courses, and students back to default college demo state?'
                  )
                ) {
                  resetToDemoData();
                }
              }}
              style={{ color: 'var(--critical-indicator)', borderColor: 'var(--critical-border)' }}
            >
              <RotateCcw size={15} />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
