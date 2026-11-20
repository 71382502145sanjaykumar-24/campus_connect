import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Course, Attendance, Mark, TimetableSlot, Note, Student } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import {
  CalendarCheck,
  Award,
  Calendar,
  FileText,
  Plus,
  Save,
  Trash2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AcademicsPage: React.FC = () => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'timetable' | 'notes'>('attendance');

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Attendance state
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, string>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Marks state
  const [marks, setMarks] = useState<Mark[]>([]);
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [markForm, setMarkForm] = useState({
    studentId: '',
    courseId: '',
    examType: 'MID_TERM_1',
    maxMarks: '50',
    marksObtained: '',
    remarks: '',
  });

  // Timetable state
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    departmentId: '',
    courseId: '',
    facultyId: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Room 301',
  });

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    courseId: '',
    fileUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') loadAttendance();
    if (activeTab === 'marks') loadMarks();
    if (activeTab === 'timetable') loadTimetable();
    if (activeTab === 'notes') loadNotes();
  }, [activeTab, selectedCourseId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coursesRes, studentsRes] = await Promise.all([
        api.courses.list(),
        api.students.list(),
      ]);
      setCourses(coursesRes || []);
      setStudents(studentsRes.students || []);

      if (coursesRes.length > 0) {
        setSelectedCourseId(coursesRes[0].id);
        setMarkForm(prev => ({ ...prev, courseId: coursesRes[0].id }));
        setNoteForm(prev => ({ ...prev, courseId: coursesRes[0].id }));
      }
      if (studentsRes.students?.length > 0) {
        setMarkForm(prev => ({ ...prev, studentId: studentsRes.students[0].id }));
      }
    } catch (err) {
      console.error('Failed to load initial academics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const res = await api.attendance.list({ courseId: selectedCourseId });
      setAttendances(res || []);

      // Initialize sheet with default PRESENT for all students
      const initSheet: Record<string, string> = {};
      students.forEach(s => {
        initSheet[s.id] = 'PRESENT';
      });
      setAttendanceSheet(initSheet);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMarks = async () => {
    try {
      const res = await api.marks.list({ courseId: selectedCourseId });
      setMarks(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTimetable = async () => {
    try {
      const res = await api.timetable.list();
      setTimetable(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNotes = async () => {
    try {
      const res = await api.notes.list({ courseId: selectedCourseId });
      setNotes(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBulkAttendance = async () => {
    if (!selectedCourseId) return;
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceSheet).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await api.attendance.mark({
        courseId: selectedCourseId,
        date: attendanceDate,
        records,
      });

      alert('Attendance saved successfully to database!');
      await loadAttendance();
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.marks.create(markForm);
      setMarkModalOpen(false);
      setMarkForm(prev => ({ ...prev, marksObtained: '', remarks: '' }));
      await loadMarks();
    } catch (err: any) {
      alert(err.message || 'Failed to save marks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.notes.upload(noteForm);
      setNoteModalOpen(false);
      setNoteForm(prev => ({ ...prev, title: '', description: '', fileUrl: '' }));
      await loadNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to upload study note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Attendance logging, continuous assessment marks, class timetables, and lecture notes.
          </p>
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="ALL">All Subjects</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Attendance Tracker
        </button>

        <button
          onClick={() => setActiveTab('marks')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'marks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Internal Marks
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'timetable'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Class Schedule
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Study Materials
        </button>
      </div>

      {/* Tab 1: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {(role === 'FACULTY' || role === 'ADMIN') && (
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mark Daily Subject Attendance</h3>
                  <p className="text-xs text-slate-400">Select date and mark student attendance status</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveBulkAttendance}
                    isLoading={savingAttendance}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save Attendance
                  </Button>
                </div>
              </div>

              {/* Student Attendance Marking Roster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                {students.map((st) => {
                  const currentStatus = attendanceSheet[st.id] || 'PRESENT';
                  return (
                    <div
                      key={st.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900">{st.user?.name}</span>
                        <div className="text-[11px] font-mono text-slate-400">{st.rollNo}</div>
                      </div>

                      <div className="flex gap-1">
                        {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((stat) => (
                          <button
                            key={stat}
                            type="button"
                            onClick={() =>
                              setAttendanceSheet((prev) => ({ ...prev, [st.id]: stat }))
                            }
                            className={`px-2 py-1 text-[10px] font-bold rounded transition ${
                              currentStatus === stat
                                ? stat === 'PRESENT'
                                  ? 'bg-emerald-600 text-white'
                                  : stat === 'ABSENT'
                                  ? 'bg-rose-600 text-white'
                                  : stat === 'LATE'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-cyan-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {stat[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historical Log */}
          <DataTable
            data={attendances}
            columns={[
              {
                header: 'Date',
                accessor: (row) => new Date(row.date).toLocaleDateString(),
                sortable: true,
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
                header: 'Course',
                accessor: (row) => `${row.course?.code} - ${row.course?.name}`,
              },
              {
                header: 'Status',
                accessor: (row) => <StatusBadge status={row.status} />,
                sortable: true,
              },
              {
                header: 'Remarks',
                accessor: (row) => row.remarks || '—',
              },
            ]}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search attendance history..."
          />
        </div>
      )}

      {/* Tab 2: Marks */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Internal Assessment & Test Marks</h3>
              <p className="text-xs text-slate-500">Continuous internal evaluation scores</p>
            </div>
            {(role === 'FACULTY' || role === 'ADMIN') && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setMarkModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Enter Marks
              </Button>
            )}
          </div>

          <DataTable
            data={marks}
            columns={[
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
                sortable: true,
              },
              {
                header: 'Course',
                accessor: (row) => `${row.course?.code} - ${row.course?.name}`,
              },
              {
                header: 'Exam Type',
                accessor: (row) => (
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                    {row.examType.replace('_', ' ')}
                  </span>
                ),
                sortable: true,
              },
              {
                header: 'Score',
                accessor: (row) => (
                  <span className="font-mono font-bold text-blue-700">
                    {row.marksObtained} <span className="text-slate-400">/ {row.maxMarks}</span>
                  </span>
                ),
                sortable: true,
              },
              {
                header: 'Remarks',
                accessor: (row) => row.remarks || '—',
              },
            ]}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search marks by student or course..."
          />
        </div>
      )}

      {/* Tab 3: Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Lecture Timetable</h3>
              <p className="text-xs text-slate-500">Day-wise classroom & laboratory schedules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => {
              const daySlots = timetable.filter((s) => s.dayOfWeek === day);
              return (
                <div key={day} className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <span className="font-black text-xs text-slate-800 tracking-wider uppercase">
                      {day}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {daySlots.length} sessions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {daySlots.length > 0 ? (
                      daySlots.map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="font-bold text-slate-900">{s.course?.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                            <span>⏰ {s.startTime} - {s.endTime}</span>
                            <span className="font-semibold text-slate-700">📍 {s.room}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No scheduled classes.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Study Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Course Notes & Resources</h3>
              <p className="text-xs text-slate-500">Download syllabus, lecture slides, and lab manuals</p>
            </div>
            {(role === 'FACULTY' || role === 'ADMIN') && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setNoteModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Upload Material
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 font-mono">
                    {n.course?.code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    By {n.faculty?.user?.name || 'Faculty'}
                  </span>
                  <a
                    href={n.fileUrl || '#'}
                    download
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enter Mark Modal */}
      <Modal
        isOpen={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
        title="Enter Assessment Marks"
        subtitle="Saved persistently in MySQL/SQLite database"
      >
        <form onSubmit={handleSaveMark} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
            <select
              required
              value={markForm.studentId}
              onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNo} - {s.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
            <select
              required
              value={markForm.courseId}
              onChange={(e) => setMarkForm({ ...markForm, courseId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
              <select
                value={markForm.examType}
                onChange={(e) => setMarkForm({ ...markForm, examType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="MID_TERM_1">Mid Term 1</option>
                <option value="MID_TERM_2">Mid Term 2</option>
                <option value="FINAL">Final Exam</option>
                <option value="ASSIGNMENT">Assignment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
              <input
                type="number"
                required
                value={markForm.maxMarks}
                onChange={(e) => setMarkForm({ ...markForm, maxMarks: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Obtained</label>
              <input
                type="number"
                step="0.5"
                required
                value={markForm.marksObtained}
                onChange={(e) => setMarkForm({ ...markForm, marksObtained: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              placeholder="e.g. Good performance in SQL queries"
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMarkModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Mark
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Upload Course Study Material"
        subtitle="Distribute notes, syllabus, or lecture slides"
      >
        <form onSubmit={handleUploadNote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="Module 1: Tree Traversals & BST"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
            <select
              required
              value={noteForm.courseId}
              onChange={(e) => setNoteForm({ ...noteForm, courseId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Summary of lecture concepts, algorithm complexity bounds, and sample questions..."
              value={noteForm.description}
              onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNoteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Upload Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
