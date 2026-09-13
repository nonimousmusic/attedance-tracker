import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, CheckSquare, History, Calculator, Users, BookOpen } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  const getItems = () => {
    if (currentUser.role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> },
        { id: 'mark', label: 'Mark', icon: <CheckSquare size={18} /> },
        { id: 'history', label: 'History', icon: <History size={18} /> },
        { id: 'students', label: 'Students', icon: <Users size={18} /> }
      ];
    } else if (currentUser.role === 'student') {
      return [
        { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> },
        { id: 'calculator', label: 'Skip?', icon: <Calculator size={18} /> },
        { id: 'history', label: 'Calendar', icon: <History size={18} /> },
        { id: 'subjects', label: 'Courses', icon: <BookOpen size={18} /> }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'students', label: 'Students', icon: <Users size={18} /> },
        { id: 'subjects', label: 'Courses', icon: <BookOpen size={18} /> },
        { id: 'reports', label: 'Reports', icon: <CheckSquare size={18} /> }
      ];
    }
  };

  const items = getItems();

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
