import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import {
  BookOpen,
  CalendarDays,
  FileCheck,
  CheckCircle,
  XCircle,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';

interface FacultyDashboardProps {
  onNavigate: (tab: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load faculty stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLeave = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(leaveId);
    try {
      await api.leaves.review(leaveId, {
        status,
        reviewRemarks: status === 'APPROVED' ? 'Approved by class advisor' : 'Insufficient attendance',
      });
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to review leave');
    } finally {
      setReviewingId(null);
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
  const schedule = data?.todaySchedule || [];
  const pendingLeaves = data?.pendingLeaves || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Workspace</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage attendance, enter assessment marks, and review student requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('academics')}
            icon={<BookOpen className="w-4 h-4" />}
          >
            Mark Attendance / Marks
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Courses"
          value={summary.coursesCount || 0}
          subtitle="Courses teaching this term"
          icon={<BookOpen className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Weekly Sessions"
          value={summary.classesCount || 0}
          subtitle="Lecture & Lab hours"
          icon={<CalendarDays className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Pending Leaves"
          value={summary.pendingLeavesCount || 0}
          subtitle="Student applications"
          icon={<FileCheck className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Assessments Handled"
          value={summary.totalMarksEntered || 0}
          subtitle="Internal score entries"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timetable / Today's Classes */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Assigned Lecture Timetable</h3>
              <p className="text-xs text-slate-400">Classroom and laboratory slot allocations</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('academics')}
            >
              Academics Tab
            </Button>
          </div>

          <div className="space-y-3">
            {schedule.length > 0 ? (
              schedule.map((slot: any) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {slot.course?.code}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{slot.course?.name}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                        <span className="font-semibold text-slate-700">{slot.dayOfWeek}</span>
                        <span>⏰ {slot.startTime} - {slot.endTime}</span>
                        <span>📍 {slot.room}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('academics')}
                  >
                    Take Attendance
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No class schedule entries found.
              </div>
            )}
          </div>
        </div>

        {/* Pending Student Leaves */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Pending Leave Requests</h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
              {pendingLeaves.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((l: any) => (
                <div key={l.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{l.student?.user?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{l.student?.rollNo}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{l.reason}</p>
                  <div className="text-[11px] text-slate-400 mb-3">
                    📅 {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1 py-1 text-xs"
                      isLoading={reviewingId === l.id}
                      onClick={() => handleReviewLeave(l.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1 py-1 text-xs"
                      disabled={reviewingId === l.id}
                      onClick={() => handleReviewLeave(l.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No pending leave requests to review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
