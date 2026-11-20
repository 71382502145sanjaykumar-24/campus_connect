import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, KeyRound, User as UserIcon, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenChangePassword }) => {
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const roleColorMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    ADMIN: 'primary',
    FACULTY: 'info',
    STUDENT: 'success',
    STAFF: 'warning',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/20">
            CC
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
              Campus<span className="text-blue-600">Connect</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
              Smart College Platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs overflow-hidden border border-blue-200">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'CC'
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-2">
                {user?.name}
                <Badge variant={role ? roleColorMap[role] : 'primary'} size="sm">
                  {role}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{user?.email}</div>
            </div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenChangePassword();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  Change Password
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
