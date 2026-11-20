import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import {
  Library,
  BookOpen,
  Building,
  CreditCard,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StaffDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
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
      console.error('Failed to load staff stats:', err);
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
  const pendingFees = data?.pendingFees || [];
  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Operations Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage library book circulations, hostel room allocations, and fee payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('library')}
            icon={<Library className="w-4 h-4" />}
          >
            Issue / Return Book
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('fees')}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Record Fee Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Books In Catalog"
          value={summary.totalBooks || 0}
          subtitle={`${summary.availableCopies || 0} available on shelves`}
          icon={<Library className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Books Issued"
          value={summary.issuedBooks || 0}
          subtitle="Currently with students"
          icon={<BookOpen className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Hostel Occupancy"
          value={`${summary.totalHostelOccupied || 0}/${summary.totalHostelCapacity || 0}`}
          subtitle={`${Math.round(((summary.totalHostelOccupied || 0) / (summary.totalHostelCapacity || 1)) * 100)}% capacity filled`}
          icon={<Building className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending Fee Invoices"
          value={summary.pendingFeesCount || 0}
          subtitle="Awaiting student payment"
          icon={<CreditCard className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Invoices to Collect */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Pending Student Fees</h3>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Manage all fees <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingFees.length > 0 ? (
              pendingFees.map((f: any) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{f.student?.user?.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({f.student?.rollNo})</span>
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {f.title} • Due: {new Date(f.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{(f.amount - f.paidAmount).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onNavigate('fees')}
                    >
                      Record
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending fee entries.
              </div>
            )}
          </div>
        </div>

        {/* Hostel Capacity Donut Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm">Hostel Bed Allocations</h3>
          <p className="text-xs text-slate-400 mb-2">Occupied vs available room capacity</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.hostelOccupancy || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.hostelOccupancy || []).map((_: any, index: number) => (
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
    </div>
  );
};
