import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CreditCard,
  Library,
  Building,
  FileText,
  Megaphone,
  Database,
  History,
  School,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { role } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FACULTY', 'STUDENT', 'STAFF'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['ADMIN', 'FACULTY', 'STAFF'] },
    { id: 'faculty', label: 'Faculty', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { id: 'academics', label: 'Academics', icon: BookOpen, roles: ['ADMIN', 'FACULTY', 'STUDENT', 'STAFF'] },
    { id: 'departments', label: 'Departments & Courses', icon: School, roles: ['ADMIN'] },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard, roles: ['ADMIN', 'STUDENT', 'STAFF'] },
    { id: 'library', label: 'Library', icon: Library, roles: ['ADMIN', 'STUDENT', 'STAFF'] },
    { id: 'hostel', label: 'Hostel Rooms', icon: Building, roles: ['ADMIN', 'STAFF', 'STUDENT'] },
    { id: 'leaves', label: 'Leave Requests', icon: FileText, roles: ['ADMIN', 'FACULTY', 'STUDENT'] },
    { id: 'announcements', label: 'Announcements & Events', icon: Megaphone, roles: ['ADMIN', 'FACULTY', 'STUDENT', 'STAFF'] },
    { id: 'database', label: 'Database Center', icon: Database, roles: ['ADMIN'] },
    { id: 'audit', label: 'System Audit Logs', icon: History, roles: ['ADMIN'] },
  ];

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } h-[calc(100vh-4rem)] overflow-y-auto`}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SQLite DB Connected</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Persistent local storage active via Prisma ORM.
          </p>
        </div>
      </aside>
    </>
  );
};
