import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  School,
  X,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();

  // Login form state
  const [email, setEmail] = useState(() => localStorage.getItem('cc_saved_email') || 'admin@college.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Backend connection status check - default to online immediately for zero wait
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'standalone'>('online');

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<'STUDENT' | 'FACULTY' | 'STAFF'>('STUDENT');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRollNo, setRegRollNo] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regDepartmentId, setRegDepartmentId] = useState('');
  const [regSemester, setRegSemester] = useState('1');
  const [regBatch, setRegBatch] = useState('2024-2028');
  const [departments, setDepartments] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotIdentification, setForgotIdentification] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Check backend server connectivity on mount and poll every 2.5s
  useEffect(() => {
    checkHealth();
    loadDepartments();
    const interval = setInterval(() => {
      checkHealth();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    // If on Vercel or cloud static host without local backend, use standalone database immediately
    if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify'))) {
      setBackendStatus('standalone');
      return;
    }

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendStatus('online');
        return;
      }
    } catch {
      try {
        const directRes = await fetch('http://127.0.0.1:5000/api/health');
        if (directRes.ok) {
          setBackendStatus('online');
          return;
        }
      } catch { }
    }
    // If local backend is unreachable, gracefully fall back to standalone database
    setBackendStatus('standalone');
  };

  const loadDepartments = async () => {
    try {
      const data = await api.auth.getPublicDepartments();
      setDepartments(data || []);
      if (data && data.length > 0) {
        setRegDepartmentId(data[0].id);
      }
    } catch {
      // Offline or error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
    setSuccessMsg('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        departmentId: regDepartmentId,
        rollNo: regRollNo,
        employeeId: regEmployeeId,
        semester: Number(regSemester),
        batch: regBatch,
      });
      setShowRegisterModal(false);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.auth.resetPassword({
        email: forgotEmail,
        identification: forgotIdentification,
        newPassword: forgotNewPassword,
      });
      setForgotSuccess(res.message || 'Password reset successfully!');
      setEmail(forgotEmail);
      setPassword(forgotNewPassword);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess('');
        setSuccessMsg('Password reset successfully! You can now click Sign In.');
      }, 1500);
    } catch (err: any) {
      setForgotError(err.message || 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative gradient glow */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-2xl shadow-blue-500/40 mb-3 ring-4 ring-white/10">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Campus<span className="text-blue-400">Connect</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Smart College Management & Student Utility Platform
        </p>

        {/* Server Status Pill */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${backendStatus === 'online' || backendStatus === 'standalone'
              ? 'bg-emerald-500 animate-pulse'
              : 'bg-amber-400'
              }`}
          />
          {backendStatus === 'online' && 'Database & Backend Online (Port 5000)'}
          {backendStatus === 'standalone' && 'Built-in Database Online (Standalone Cloud Active)'}
          {backendStatus === 'checking' && 'Initializing CampusConnect Database...'}
        </div>
      </div>

      {/* Main Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100/80">
          {/* Quick Demo Login Badges */}
          <div className="mb-6 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                1-Click Quick Demo Login:
              </span>
              <span className="text-[10px] text-slate-400">Auto-fills credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@college.com', 'Admin@123')}
                className={`px-3 py-2 rounded-xl border text-left transition flex items-center justify-between ${email === 'admin@college.com'
                  ? 'border-blue-500 bg-blue-50/80 text-blue-800 font-bold shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
              >
                <span>👑 <strong>Admin</strong></span>
                <span className="text-[10px] text-slate-400">Superuser</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('faculty@college.com', 'Faculty@123')}
                className={`px-3 py-2 rounded-xl border text-left transition flex items-center justify-between ${email === 'faculty@college.com'
                  ? 'border-blue-500 bg-blue-50/80 text-blue-800 font-bold shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
              >
                <span>🎓 <strong>Faculty</strong></span>
                <span className="text-[10px] text-slate-400">Academics</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('student@college.com', 'Student@123')}
                className={`px-3 py-2 rounded-xl border text-left transition flex items-center justify-between ${email === 'student@college.com'
                  ? 'border-blue-500 bg-blue-50/80 text-blue-800 font-bold shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
              >
                <span>🎒 <strong>Student</strong></span>
                <span className="text-[10px] text-slate-400">Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('staff@college.com', 'Staff@123')}
                className={`px-3 py-2 rounded-xl border text-left transition flex items-center justify-between ${email === 'staff@college.com'
                  ? 'border-blue-500 bg-blue-50/80 text-blue-800 font-bold shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
              >
                <span>📋 <strong>Staff</strong></span>
                <span className="text-[10px] text-slate-400">Library/Hostel</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@college.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError('');
                  setForgotSuccess('');
                  setShowForgotModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold transition"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 font-bold text-sm shadow-xl shadow-blue-500/25 rounded-xl transition"
              isLoading={isLoading}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Sign In to CampusConnect
            </Button>
          </form>

          {/* Registration Trigger */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(true);
                loadDepartments();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              New student or faculty? Register here
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Protected by JWT & Bcrypt with centralized SQL database persistence
            </p>
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative my-8">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Authorized Account Registration</h3>
                <p className="text-xs text-slate-500">Create a new student, faculty, or staff record in the database</p>
              </div>
            </div>

            {regError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('STUDENT')}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition ${regRole === 'STUDENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    🎒 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('FACULTY')}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition ${regRole === 'FACULTY'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    🎓 Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('STAFF')}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition ${regRole === 'STAFF'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    📋 Staff
                  </button>
                </div>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">College Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. ramesh@college.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              {/* Role Specific Fields */}
              {regRole === 'STUDENT' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Roll / Register No</label>
                      <input
                        type="text"
                        required
                        value={regRollNo}
                        onChange={(e) => setRegRollNo(e.target.value)}
                        placeholder="e.g. 2024CS099"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
                      <select
                        value={regDepartmentId}
                        onChange={(e) => setRegDepartmentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Current Semester</label>
                      <select
                        value={regSemester}
                        onChange={(e) => setRegSemester(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Batch</label>
                      <input
                        type="text"
                        value={regBatch}
                        onChange={(e) => setRegBatch(e.target.value)}
                        placeholder="2024-2028"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {regRole === 'FACULTY' && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Employee ID</label>
                      <input
                        type="text"
                        required
                        value={regEmployeeId}
                        onChange={(e) => setRegEmployeeId(e.target.value)}
                        placeholder="e.g. FAC-088"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
                      <select
                        value={regDepartmentId}
                        onChange={(e) => setRegDepartmentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 font-bold"
                  isLoading={regLoading}
                >
                  Create Account & Sign In Directly
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Reset Account Password</h3>
                <p className="text-xs text-slate-500">Verify your college credentials to update your password</p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Registered College Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}

                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. student@college.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />

              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Identity Verification (Roll No / Employee ID)
                </label>
                <input
                  type="text"
                  value={forgotIdentification}
                  onChange={(e) => setForgotIdentification(e.target.value)}
                  placeholder="e.g. 2024CS001 or FAC-001 (optional for admin)"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 font-bold"
                  isLoading={forgotLoading}
                >
                  Verify Identity & Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
