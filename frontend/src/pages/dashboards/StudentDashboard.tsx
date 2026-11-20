import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import {
  GraduationCap,
  CheckCircle,
  CreditCard,
  BookOpen,
  Library,
  FileText,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveType, setLeaveType] = useState('SICK');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  // Pay Fee Modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paySubmitting, setPaySubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    try {
      await api.leaves.apply({
        reason: leaveReason,
        startDate: leaveStart,
        endDate: leaveEnd,
        leaveType,
      });
      setLeaveModalOpen(false);
      setLeaveReason('');
      setLeaveStart('');
      setLeaveEnd('');
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave request');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handlePayFee = async () => {
    if (!selectedFee) return;
    setPaySubmitting(true);
    try {
      await api.fees.pay(selectedFee.id);
      setPayModalOpen(false);
      setSelectedFee(null);
      await loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to process payment');
    } finally {
      setPaySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const student = data?.student || {};
  const summary = data?.summary || {};
  const recentMarks = data?.recentMarks || [];
  const fees = data?.fees || [];
  const activeBooks = data?.activeBooks || [];

  return (
    <div className="space-y-6">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black">
            {student.user?.name?.slice(0, 2).toUpperCase() || 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">{student.user?.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-mono font-semibold">
                {student.rollNo}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              {student.department?.name} • Semester {student.semester} • Batch {student.batch}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={() => setLeaveModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Apply Leave
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold"
            onClick={() => onNavigate('academics')}
          >
            Academic Records
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary.attendancePercentage || 0}%`}
          subtitle={summary.attendancePercentage >= 75 ? 'Eligibility cleared' : 'Below 75% requirement'}
          icon={<CheckCircle className="w-5 h-5" />}
          color={summary.attendancePercentage >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Current CGPA"
          value={summary.cgpa ? summary.cgpa.toFixed(2) : '0.00'}
          subtitle="Cumulative score"
          icon={<GraduationCap className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Outstanding Fees"
          value={`₹${(summary.totalDue || 0).toLocaleString()}`}
          subtitle={summary.totalDue > 0 ? 'Dues pending payment' : 'All clear'}
          icon={<CreditCard className="w-5 h-5" />}
          color={summary.totalDue > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Library Books"
          value={summary.booksIssuedCount || 0}
          subtitle="Currently checked out"
          icon={<Library className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assessment Marks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Assessment Marks</h3>
            <button
              onClick={() => onNavigate('academics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentMarks.length > 0 ? (
              recentMarks.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{m.course?.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{m.course?.code}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {m.examType.replace('_', ' ')} {m.remarks && `• "${m.remarks}"`}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-blue-700">
                      {m.marksObtained}
                    </span>
                    <span className="text-xs text-slate-400">/{m.maxMarks}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No marks recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Fees & Dues Overview */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Fees & Payment Invoices</h3>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {fees.length > 0 ? (
              fees.map((f: any) => {
                const balance = f.amount - f.paidAmount;
                return (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{f.title}</span>
                        <StatusBadge status={f.status} />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Due: {new Date(f.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800">
                          ₹{f.amount.toLocaleString()}
                        </div>
                        {balance > 0 && (
                          <div className="text-[10px] text-rose-600 font-semibold">
                            Due: ₹{balance.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {f.status !== 'PAID' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedFee(f);
                            setPayModalOpen(true);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No fees pending.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Borrowed Books */}
      {activeBooks.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Active Library Book Borrowed: "{activeBooks[0]?.book?.title}"
              </h4>
              <p className="text-[11px] text-amber-700">
                Due Date: {new Date(activeBooks[0]?.dueDate).toLocaleDateString()} (Return to librarian on time to avoid fines)
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('library')}>
            Library Details
          </Button>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Apply for Student Leave"
        subtitle="Submitted directly to your class advisor and department"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="SICK">Medical / Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="ACADEMIC">Academic / Competition</option>
              <option value="EMERGENCY">Family Emergency</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
            <textarea
              required
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="State clear reasons and reference relevant documents..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLeaveModalOpen(false)}
              disabled={leaveSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={leaveSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pay Fee Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Fee Payment Gateway"
        subtitle={`Invoice: ${selectedFee?.title}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-semibold uppercase">Payable Amount</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              ₹{selectedFee ? (selectedFee.amount - selectedFee.paidAmount).toLocaleString() : 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Student Portal Instant Clearance</p>
          </div>

          <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            Clicking <strong>Confirm Payment</strong> will update your database fee record to PAID and generate an official receipt number immediately.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPayModalOpen(false)}
              disabled={paySubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePayFee}
              isLoading={paySubmitting}
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
