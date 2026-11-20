import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  CheckCircle,
  Clock,
  Megaphone,
  Calendar,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Button } from '../../components/common/Button';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">College Overview</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time institutional metrics backed by persistent relational database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('database')}
            icon={<Database className="w-4 h-4 text-blue-600" />}
          >
            Database Center
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('students')}
            icon={<GraduationCap className="w-4 h-4" />}
          >
            Manage Students
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents || 0}
          subtitle="Enrolled across all depts"
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Faculty Members"
          value={summary.totalFaculty || 0}
          subtitle="Across 4 departments"
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Overall Attendance"
          value={`${summary.overallAttendance || 0}%`}
          subtitle="Campus-wide average"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Fee Collection"
          value={`${summary.feeCollectionRate || 0}%`}
          subtitle={`₹${(summary.totalFeePaid || 0).toLocaleString()} collected`}
          icon={<CreditCard className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Department Enrollment & Faculty</h3>
              <p className="text-xs text-slate-400">Students and staff distribution by engineering branch</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              Live DB Sync
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentChartData || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="courses" name="Courses" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" name="Faculty" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Status Pie Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm">Fee Collection Status</h3>
          <p className="text-xs text-slate-400 mb-2">Paid vs pending semester dues</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.feeStatusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.feeStatusBreakdown || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Announcements and Events preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Announcements</h3>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.recentAnnouncements || []).map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{a.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Campus Events</h3>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.upcomingEvents || []).map((e: any) => (
              <div key={e.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{e.title}</span>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {e.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">{e.description}</p>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                  <span>📅 {new Date(e.date).toLocaleDateString()}</span>
                  <span>📍 {e.venue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
