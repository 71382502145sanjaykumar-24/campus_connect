import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Student, Department } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { StatusBadge } from '../components/common/Badge';
import { Plus, Download, Upload, Eye, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentsPage: React.FC = () => {
  const { role } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailedStudent, setDetailedStudent] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNo: '',
    departmentId: '',
    semester: '1',
    batch: '2024-2028',
    cgpa: '0.0',
    address: '',
    guardianName: '',
    guardianPhone: '',
  });

  const [csvText, setCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedSemester]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, deptsRes] = await Promise.all([
        api.students.list({
          departmentId: selectedDept,
          semester: selectedSemester,
        }),
        api.departments.list(),
      ]);
      setStudents(studentsRes.students || []);
      setDepartments(deptsRes || []);
      if (deptsRes.length > 0 && !formData.departmentId) {
        setFormData(prev => ({ ...prev, departmentId: deptsRes[0].id }));
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Student@123',
      phone: '',
      rollNo: '',
      departmentId: departments[0]?.id || '',
      semester: '1',
      batch: '2024-2028',
      cgpa: '0.0',
      address: '',
      guardianName: '',
      guardianPhone: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.user.name,
      email: student.user.email,
      password: '',
      phone: student.user.phone || '',
      rollNo: student.rollNo,
      departmentId: student.departmentId,
      semester: String(student.semester),
      batch: student.batch,
      cgpa: String(student.cgpa),
      address: student.address || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
    });
    setEditModalOpen(true);
  };

  const handleOpenView = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const details = await api.students.getById(student.id);
      setDetailedStudent(details);
      setViewModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load details');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.students.create(formData);
      setAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await api.students.update(selectedStudent.id, formData);
      setEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await api.students.delete(selectedStudent.id);
      setDeleteModalOpen(false);
      setSelectedStudent(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    setIsSubmitting(true);
    try {
      const lines = csvText.trim().split('\n');
      const rows = [];
      // Expect CSV header: rollNo,name,email,departmentCode,semester,batch,cgpa,phone
      const startIndex = lines[0].toLowerCase().includes('roll') ? 1 : 0;
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 4) {
          rows.push({
            rollNo: parts[0],
            name: parts[1],
            email: parts[2],
            departmentCode: parts[3],
            semester: parts[4] || '1',
            batch: parts[5] || '2024-2028',
            cgpa: parts[6] || '0.0',
            phone: parts[7] || '',
          });
        }
      }

      const res = await api.backup.importStudents(rows);
      alert(`Import complete: ${res.imported} students added, ${res.skipped} skipped.`);
      setImportModalOpen(false);
      setCsvText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'CSV Import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Student>[] = [
    {
      header: 'Roll No',
      accessor: 'rollNo',
      sortable: true,
      className: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Student Name',
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
        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
          {row.department?.code}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Semester',
      accessor: (row) => `Sem ${row.semester}`,
      sortable: true,
    },
    {
      header: 'Batch',
      accessor: 'batch',
      sortable: true,
    },
    {
      header: 'CGPA',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-800">
          {row.cgpa ? row.cgpa.toFixed(2) : '0.00'}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenView(row)}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <Eye className="w-4 h-4" />
          </button>
          {role === 'ADMIN' && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                title="Edit Student"
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedStudent(row);
                  setDeleteModalOpen(true);
                }}
                title="Delete Student"
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of enrolled undergraduate and postgraduate students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role === 'ADMIN' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportModalOpen(true)}
                icon={<Upload className="w-4 h-4" />}
              >
                Import CSV
              </Button>
              <a
                href={api.backup.exportUrl('students')}
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
                Add Student
              </Button>
            </>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={students}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by name, roll no, email..."
        searchFields={['rollNo']}
        filters={
          <div className="flex items-center gap-2">
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

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Student"
        subtitle="Creates persistent user credentials and student academic profile"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 2024CS004"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch</label>
              <input
                type="text"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Information"
        subtitle={`Editing records for ${selectedStudent?.rollNo}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Hostel</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Profile Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Student Academic Dossier"
        subtitle={detailedStudent?.rollNo}
        maxWidth="2xl"
      >
        {detailedStudent && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detailedStudent.user?.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {detailedStudent.user?.email} • {detailedStudent.department?.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semester {detailedStudent.semester} • Batch {detailedStudent.batch}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="text-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm min-w-[90px]">
                  <div className="text-xs text-slate-400 font-semibold uppercase">CGPA</div>
                  <div className="text-xl font-black text-slate-900">
                    {detailedStudent.cgpa?.toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm min-w-[90px]">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Attendance</div>
                  <div className="text-xl font-black text-emerald-600">
                    {detailedStudent.attendancePercentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Marks */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Internal Assessment Marks
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(detailedStudent.marks || []).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{m.course?.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">({m.examType})</span>
                    </div>
                    <div className="font-bold text-blue-700">
                      {m.marksObtained} / {m.maxMarks}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Invoices */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Fee Status
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {(detailedStudent.fees || []).map((f: any) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{f.title}</span>
                      <span className="ml-2">
                        <StatusBadge status={f.status} />
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      ₹{f.paidAmount} / ₹{f.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student ${selectedStudent?.user.name} (${selectedStudent?.rollNo})? All associated marks, attendance, and fee history will be purged.`}
        isLoading={isSubmitting}
      />

      {/* CSV Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Students from CSV"
        subtitle="Validate and insert batch student records into the MySQL database"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Paste CSV rows with format: <br />
            <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-blue-600 font-mono">
              rollNo, name, email, departmentCode, semester, batch, cgpa, phone
            </code>
          </p>
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="2024CS005, Rohan Mehra, rohan@college.com, CSE, 5, 2024-2028, 8.75, +91 98765 00018"
            className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setImportModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImportCsv} isLoading={isSubmitting}>
              Validate & Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
