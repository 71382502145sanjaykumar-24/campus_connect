import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';

// Dashboards
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { FacultyDashboard } from './pages/dashboards/FacultyDashboard';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { StaffDashboard } from './pages/dashboards/StaffDashboard';

// Module Pages
import { StudentsPage } from './pages/StudentsPage';
import { FacultyPage } from './pages/FacultyPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { DepartmentsCoursesPage } from './pages/DepartmentsCoursesPage';
import { FeesPage } from './pages/FeesPage';
import { LibraryPage } from './pages/LibraryPage';
import { HostelPage } from './pages/HostelPage';
import { LeavesPage } from './pages/LeavesPage';
import { AnnouncementsEventsPage } from './pages/AnnouncementsEventsPage';
import { DatabaseManagementPage } from './pages/DatabaseManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl animate-bounce shadow-xl shadow-blue-500/30 mb-4">
          CC
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-400">Loading CampusConnect...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboardByRole = () => {
    switch (role) {
      case 'ADMIN':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'FACULTY':
        return <FacultyDashboard onNavigate={setCurrentTab} />;
      case 'STUDENT':
        return <StudentDashboard onNavigate={setCurrentTab} />;
      case 'STAFF':
        return <StaffDashboard onNavigate={setCurrentTab} />;
      default:
        return <StudentDashboard onNavigate={setCurrentTab} />;
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'students':
        return <StudentsPage />;
      case 'faculty':
        return <FacultyPage />;
      case 'academics':
        return <AcademicsPage />;
      case 'departments':
        return <DepartmentsCoursesPage />;
      case 'fees':
        return <FeesPage />;
      case 'library':
        return <LibraryPage />;
      case 'hostel':
        return <HostelPage />;
      case 'leaves':
        return <LeavesPage />;
      case 'announcements':
        return <AnnouncementsEventsPage />;
      case 'database':
        return <DatabaseManagementPage />;
      case 'audit':
        return <AuditLogsPage />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <Layout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderTabContent()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
