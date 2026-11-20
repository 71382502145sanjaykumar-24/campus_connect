import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { AuditLog } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { History, ShieldAlert } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.audit.list({ limit: '100' });
      setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (row) => new Date(row.createdAt).toLocaleString(),
      sortable: true,
      className: 'font-mono text-xs text-slate-500',
    },
    {
      header: 'Action',
      accessor: (row) => (
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-mono">
          {row.action}
        </span>
      ),
      sortable: true,
      sortKey: 'action',
    },
    {
      header: 'Entity / Table',
      accessor: 'entity',
      sortable: true,
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Author / Role',
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.user?.name || 'System / Root'}</span>
          {row.user?.role && (
            <span className="text-[10px] text-slate-400 ml-2 font-mono">({row.user.role})</span>
          )}
        </div>
      ),
    },
    {
      header: 'Activity Details',
      accessor: 'details',
      className: 'max-w-md truncate text-xs',
    },
    {
      header: 'Client IP',
      accessor: (row) => row.ipAddress || '127.0.0.1',
      className: 'font-mono text-xs text-slate-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            System Audit & Change Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete database transaction change log with author identity, timestamps, and network origins.
          </p>
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search audit log activities, users, entities..."
        searchFields={['action', 'entity', 'details']}
      />
    </div>
  );
};
