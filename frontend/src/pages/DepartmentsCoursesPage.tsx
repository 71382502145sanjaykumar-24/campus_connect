import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Department, Course } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Plus, Edit2, Trash2, School, BookOpen } from 'lucide-react';

export const DepartmentsCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'courses'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Department Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });

  // Course Modals
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    departmentId: '',
    credits: '3',
    semester: '1',
  });

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'dept' | 'course'; id: string; name: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [depts, crs] = await Promise.all([
        api.departments.list(),
        api.courses.list(),
      ]);
      setDepartments(depts || []);
      setCourses(crs || []);
      if (depts.length > 0 && !courseForm.departmentId) {
        setCourseForm(prev => ({ ...prev, departmentId: depts[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDept = () => {
    setSelectedDept(null);
    setDeptForm({ code: '', name: '', description: '' });
    setDeptModalOpen(true);
  };

  const handleOpenEditDept = (d: Department) => {
    setSelectedDept(d);
    setDeptForm({ code: d.code, name: d.name, description: d.description || '' });
    setDeptModalOpen(true);
  };

  const handleOpenAddCourse = () => {
    setSelectedCourse(null);
    setCourseForm({
      code: '',
      name: '',
      departmentId: departments[0]?.id || '',
      credits: '3',
      semester: '1',
    });
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c: Course) => {
    setSelectedCourse(c);
    setCourseForm({
      code: c.code,
      name: c.name,
      departmentId: c.departmentId,
      credits: String(c.credits),
      semester: String(c.semester),
    });
    setCourseModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedDept) {
        await api.departments.update(selectedDept.id, deptForm);
      } else {
        await api.departments.create(deptForm);
      }
      setDeptModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedCourse) {
        await api.courses.update(selectedCourse.id, courseForm);
      } else {
        await api.courses.create(courseForm);
      }
      setCourseModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      if (itemToDelete.type === 'dept') {
        await api.departments.delete(itemToDelete.id);
      } else {
        await api.courses.delete(itemToDelete.id);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Structure</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic departments, degree branches, and accredited courses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'departments' ? (
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenAddDept}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Department
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenAddCourse}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Course
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Courses ({courses.length})
        </button>
      </div>

      {activeTab === 'departments' ? (
        <DataTable
          data={departments}
          columns={[
            {
              header: 'Code',
              accessor: 'code',
              sortable: true,
              className: 'font-mono font-bold text-blue-700',
            },
            {
              header: 'Department Name',
              accessor: 'name',
              sortable: true,
              className: 'font-bold text-slate-900',
            },
            {
              header: 'Description',
              accessor: (row) => row.description || '—',
            },
            {
              header: 'Students',
              accessor: (row) => row._count?.students || 0,
              sortable: true,
            },
            {
              header: 'Courses',
              accessor: (row) => row._count?.courses || 0,
              sortable: true,
            },
            {
              header: 'Actions',
              accessor: (row) => (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditDept(row)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ type: 'dept', id: row.id, name: row.name });
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          keyExtractor={(d) => d.id}
          searchPlaceholder="Search departments..."
        />
      ) : (
        <DataTable
          data={courses}
          columns={[
            {
              header: 'Code',
              accessor: 'code',
              sortable: true,
              className: 'font-mono font-bold text-blue-700',
            },
            {
              header: 'Course Title',
              accessor: 'name',
              sortable: true,
              className: 'font-bold text-slate-900',
            },
            {
              header: 'Department',
              accessor: (row) => (
                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {row.department?.code}
                </span>
              ),
              sortable: true,
            },
            {
              header: 'Credits',
              accessor: 'credits',
              sortable: true,
            },
            {
              header: 'Semester',
              accessor: (row) => `Sem ${row.semester}`,
              sortable: true,
            },
            {
              header: 'Actions',
              accessor: (row) => (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditCourse(row)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ type: 'course', id: row.id, name: row.name });
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search courses..."
        />
      )}

      {/* Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={selectedDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
            <input
              type="text"
              required
              placeholder="e.g. CSE"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science & Engineering"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeptModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Course Modal */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Create Course'}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
              <input
                type="text"
                required
                placeholder="CS305"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                required
                min="1"
                max="6"
                value={courseForm.credits}
                onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              required
              placeholder="Cloud Infrastructure & DevOps"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                required
                value={courseForm.departmentId}
                onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
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
                value={courseForm.semester}
                onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCourseModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Course
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${itemToDelete?.type === 'dept' ? 'Department' : 'Course'}`}
        message={`Are you sure you want to delete ${itemToDelete?.name}? All associated records will be permanently removed.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};
