import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LeaveRequest } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { Plus, Check, X, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LeavesPage: React.FC = () => {
  const { role } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    leaveType: 'SICK',
  });

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, [selectedStatus]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.leaves.list({ status: selectedStatus });
      setLeaves(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.leaves.apply(applyForm);
      setApplyModalOpen(false);
      setApplyForm({ reason: '', startDate: '', endDate: '', leaveType: 'SICK' });
      await loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setIsSubmitting(true);
    try {
      await api.leaves.review(selectedLeave.id, {
        status: reviewStatus,
        reviewRemarks,
      });
      setReviewModalOpen(false);
      setSelectedLeave(null);
      await loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Student',
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.student?.user?.name}</span>
          <span className="text-[10px] text-slate-400 font-mono ml-2">
            ({row.student?.rollNo})
          </span>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: (row) => (
        <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {row.leaveType}
        </span>
      ),
      sortable: true,
      sortKey: 'leaveType',
    },
    {
      header: 'Reason',
      accessor: 'reason',
      className: 'max-w-xs truncate',
    },
    {
      header: 'Duration',
      accessor: (row) => (
        <span className="text-xs">
          {new Date(row.startDate).toLocaleDateString()} to {new Date(row.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Remarks',
      accessor: (row) => row.reviewRemarks || '—',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        (role === 'FACULTY' || role === 'ADMIN') && row.status === 'PENDING' ? (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs py-1 px-2"
              onClick={() => {
                setSelectedLeave(row);
                setReviewStatus('APPROVED');
                setReviewRemarks('Approved by class advisor');
                setReviewModalOpen(true);
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs py-1 px-2"
              onClick={() => {
                setSelectedLeave(row);
                setReviewStatus('REJECTED');
                setReviewRemarks('Insufficient attendance');
                setReviewModalOpen(true);
              }}
            >
              Reject
            </Button>
          </div>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Student absence requests, medical leave approval, and compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'STUDENT' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setApplyModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Apply for Leave
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={leaves}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search leave requests..."
        filters={
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        }
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Submit Leave Application"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="SICK">Medical / Sick Leave</option>
              <option value="CASUAL">Casual Absence</option>
              <option value="ACADEMIC">Academic Event / Hackathon</option>
              <option value="EMERGENCY">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
            <textarea
              required
              rows={3}
              placeholder="State reasons and necessary details..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setApplyModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Student Leave"
        subtitle={`Applicant: ${selectedLeave?.student?.user?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handleReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Decision</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="APPROVED">Approve Leave</option>
              <option value="REJECTED">Reject Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Advisor Remarks</label>
            <input
              type="text"
              required
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReviewModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
