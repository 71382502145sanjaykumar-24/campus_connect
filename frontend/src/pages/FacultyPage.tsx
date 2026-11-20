import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Faculty, Department } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FacultyPage: React.FC = () => {
  const { role } = useAuth();
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Faculty@123',
    phone: '',
    employeeId: '',
    departmentId: '',
    designation: 'Associate Professor',
    qualification: 'Ph.D',
    cabinLocation: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, deptsRes] = await Promise.all([
        api.faculty.list({ departmentId: selectedDept }),
        api.departments.list(),
      ]);
      setFacultyList(facRes || []);
      setDepartments(deptsRes || []);
      if (deptsRes.length > 0 && !formData.departmentId) {
        setFormData(prev => ({ ...prev, departmentId: deptsRes[0].id }));
      }
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Faculty@123',
      phone: '',
      employeeId: '',
      departmentId: departments[0]?.id || '',
      designation: 'Associate Professor',
      qualification: 'Ph.D',
      cabinLocation: 'Block 3, Room 304',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setSelectedFaculty(fac);
    setFormData({
      name: fac.user.name,
      email: fac.user.email,
      password: '',
      phone: fac.user.phone || '',
      employeeId: fac.employeeId,
      departmentId: fac.departmentId,
      designation: fac.designation,
      qualification: fac.qualification || '',
      cabinLocation: fac.cabinLocation || '',
    });
    setEditModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.faculty.create(formData);
      setAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    setIsSubmitting(true);
    try {
      await api.faculty.update(selectedFaculty.id, formData);
      setEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFaculty) return;
    setIsSubmitting(true);
    try {
      await api.faculty.delete(selectedFaculty.id);
      setDeleteModalOpen(false);
      setSelectedFaculty(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Faculty>[] = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      sortable: true,
      className: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Faculty Name',
      accessor: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.user.name}</div>
          <div className="text-xs text-slate-400">{row.user.email}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'userId',
    },
    {
      header: 'Department',
      accessor: (row) => (
        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
          {row.department?.code}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Designation',
      accessor: 'designation',
      sortable: true,
    },
    {
      header: 'Qualification',
      accessor: 'qualification',
      sortable: true,
    },
    {
      header: 'Cabin / Office',
      accessor: 'cabinLocation',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {role === 'ADMIN' && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Faculty"
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedFaculty(row);
                  setDeleteModalOpen(true);
                }}
                title="Delete Faculty"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Professors, lecturers, and academic departmental coordinators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role === 'ADMIN' && (
            <>
              <a
                href={api.backup.exportUrl('faculty')}
                download
                className="inline-flex items-center justify-center font-medium rounded-lg transition-all border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs px-2.5 py-1.5 gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </a>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAdd}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Faculty
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable
        data={facultyList}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search faculty by name, ID, qualification..."
        filters={
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Add Faculty Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Create faculty login credentials and department profile"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Alan Turing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="turing@college.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                required
                placeholder="FAC-003"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                placeholder="Ph.D, M.Tech"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cabin / Office Location</label>
              <input
                type="text"
                placeholder="Block 3, Room 304"
                value={formData.cabinLocation}
                onChange={(e) => setFormData({ ...formData, cabinLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add Faculty
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Faculty Member"
        subtitle={selectedFaculty?.employeeId}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Faculty Record"
        message={`Are you sure you want to delete ${selectedFaculty?.user.name} (${selectedFaculty?.employeeId})?`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
