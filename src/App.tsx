import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { MarkAttendance } from './components/teacher/MarkAttendance';
import { AttendanceHistory } from './components/teacher/AttendanceHistory';
import { StudentManagement } from './components/teacher/StudentManagement';
import { SubjectManagement } from './components/teacher/SubjectManagement';
import { ReportsView } from './components/teacher/ReportsView';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { CanISkipCalculator } from './components/student/CanISkipCalculator';
import { StudentHistoryCalendar } from './components/student/StudentHistoryCalendar';

// Admin View
import { AdminDashboard } from './components/admin/AdminDashboard';

// Settings
import { SettingsView } from './components/settings/SettingsView';

const MainAppLayout: React.FC = () => {
  const { currentUser, activeTab } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Render view depending on role and activeTab
  const renderActiveView = () => {
    // Shared settings
    if (activeTab === 'settings') {
      return <SettingsView />;
    }

    if (currentUser.role === 'teacher') {
      switch (activeTab) {
        case 'dashboard':
          return <TeacherDashboard />;
        case 'mark':
          return <MarkAttendance />;
        case 'history':
          return <AttendanceHistory />;
        case 'students':
          return <StudentManagement />;
        case 'subjects':
          return <SubjectManagement />;
        case 'reports':
          return <ReportsView />;
        default:
          return <TeacherDashboard />;
      }
    } else if (currentUser.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'calculator':
          return <CanISkipCalculator />;
        case 'history':
          return <StudentHistoryCalendar />;
        case 'subjects':
          return <StudentDashboard />;
        default:
          return <StudentDashboard />;
      }
    } else {
      // Admin
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'students':
          return <StudentManagement />;
        case 'subjects':
          return <SubjectManagement />;
        case 'reports':
          return <ReportsView />;
        case 'history':
          return <AttendanceHistory />;
        default:
          return <AdminDashboard />;
      }
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="main-content">
        <Navbar onOpenNotifications={() => setNotificationsOpen(true)} />

        <main className="page-wrapper">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}

export default App;
