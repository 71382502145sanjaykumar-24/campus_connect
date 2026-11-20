import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Fee, Student } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { Plus, Download, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FeesPage: React.FC = () => {
  const { role } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const [createForm, setCreateForm] = useState({
    studentId: '',
    title: 'Semester 5 Tuition & Examination Fee',
    amount: '65000',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [payAmount, setPayAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feesRes, studentsRes] = await Promise.all([
        api.fees.list({ status: selectedStatus }),
        api.students.list(),
      ]);
      setFees(feesRes || []);
      setStudents(studentsRes.students || []);
      if (studentsRes.students?.length > 0 && !createForm.studentId) {
        setCreateForm(prev => ({ ...prev, studentId: studentsRes.students[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.fees.create(createForm);
      setCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setIsSubmitting(true);
    try {
      await api.fees.pay(selectedFee.id, {
        amountPaid: payAmount ? parseFloat(payAmount) : undefined,
      });
      setPayModalOpen(false);
      setSelectedFee(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Fee>[] = [
    {
      header: 'Receipt No',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.receiptNumber || '—'}
        </span>
      ),
      sortable: true,
      sortKey: 'receiptNumber',
    },
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
      header: 'Fee Title',
      accessor: 'title',
      sortable: true,
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Amount',
      accessor: (row) => `₹${row.amount.toLocaleString()}`,
      sortable: true,
      sortKey: 'amount',
      className: 'font-mono font-bold',
    },
    {
      header: 'Paid Amount',
      accessor: (row) => (
        <span className="font-mono text-emerald-600 font-bold">
          ₹{row.paidAmount.toLocaleString()}
        </span>
      ),
      sortable: true,
      sortKey: 'paidAmount',
    },
    {
      header: 'Due Date',
      accessor: (row) => new Date(row.dueDate).toLocaleDateString(),
      sortable: true,
      sortKey: 'dueDate',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'PAID' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setSelectedFee(row);
                setPayAmount(String(row.amount - row.paidAmount));
                setPayModalOpen(true);
              }}
            >
              Record Payment
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fee Administration & Billing</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track student tuition, hostel accommodation, laboratory and examination fees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role === 'ADMIN' && (
            <a
              href={api.backup.exportUrl('fees')}
              download
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs px-2.5 py-1.5 gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
          )}
          {(role === 'ADMIN' || role === 'STAFF') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Fee Invoice
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={fees}
        columns={columns}
        keyExtractor={(f) => f.id}
        searchPlaceholder="Search by invoice title, student name, receipt..."
        filters={
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        }
      />

      {/* Create Fee Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Student Fee Invoice"
        subtitle="Generates persistent fee obligation in MySQL database"
      >
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
            <select
              required
              value={createForm.studentId}
              onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNo} - {s.user?.name} ({s.department?.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Title</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Amount (₹)</label>
              <input
                type="number"
                required
                min="100"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pay Fee Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Fee Payment"
        subtitle={`Invoice: ${selectedFee?.title}`}
        maxWidth="sm"
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-semibold uppercase">Pending Balance</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{selectedFee ? (selectedFee.amount - selectedFee.paidAmount).toLocaleString() : 0}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Record (₹)</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPayModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
