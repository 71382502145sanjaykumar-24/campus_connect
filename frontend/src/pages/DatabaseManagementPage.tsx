import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  ShieldCheck,
  Server,
  Layers,
  History,
  FileSpreadsheet,
  BookOpen,
  PlusCircle,
  Trash2,
  Edit3,
  Search,
  Filter,
  ArrowRight,
  Code2,
  Table,
} from 'lucide-react';

export const DatabaseManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'schema-reference' | 'import-export' | 'audit'>('tables');
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // CSV Import state
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  // New Record Alteration Modal
  const [showAlterModal, setShowAlterModal] = useState(false);
  const [alterRecord, setAlterRecord] = useState<any>(null);

  useEffect(() => {
    loadDatabaseOverview();
  }, [selectedTable, activeTab]);

  const loadDatabaseOverview = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        api.dashboard.getStats(),
        api.audit.list({ limit: '50' }),
      ]);
      setStats(statsRes?.summary || {});
      setAuditLogs(logsRes?.logs || []);

      // Load active table data
      switch (selectedTable) {
        case 'users': {
          const u = await api.users.list();
          setTableData(u.users || []);
          break;
        }
        case 'students': {
          const s = await api.students.list();
          setTableData(s.students || []);
          break;
        }
        case 'faculty': {
          const f = await api.faculty.list();
          setTableData(f || []);
          break;
        }
        case 'departments': {
          const d = await api.departments.list();
          setTableData(d || []);
          break;
        }
        case 'courses': {
          const c = await api.courses.list();
          setTableData(c || []);
          break;
        }
        case 'fees': {
          const fees = await api.fees.list();
          setTableData(fees || []);
          break;
        }
        case 'attendance': {
          const att = await api.attendance.list();
          setTableData(att || []);
          break;
        }
        case 'marks': {
          const marks = await api.marks.list();
          setTableData(marks || []);
          break;
        }
        case 'library': {
          const books = await api.library.books();
          setTableData(books || []);
          break;
        }
        case 'hostel': {
          const rooms = await api.hostel.rooms();
          setTableData(rooms || []);
          break;
        }
        case 'announcements': {
          const ann = await api.announcements.list();
          setTableData(ann || []);
          break;
        }
        case 'events': {
          const ev = await api.events.list();
          setTableData(ev || []);
          break;
        }
        default: {
          const u = await api.users.list();
          setTableData(u.users || []);
        }
      }
    } catch (err) {
      console.error('Failed to load database control panel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async (entity: string) => {
    try {
      await api.backup.downloadCsv(entity);
    } catch (err: any) {
      alert(err.message || 'Download failed');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const lines = importText.trim().split('\n');
      const rows = [];
      const startIndex = lines[0].toLowerCase().includes('roll') ? 1 : 0;
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
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
      setImportResult(res);
      setImportText('');
      await loadDatabaseOverview();
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  // Filter records based on search query
  const filteredData = tableData.filter((row) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some((val) => {
      if (typeof val === 'string' || typeof val === 'number') {
        return String(val).toLowerCase().includes(q);
      }
      if (val && typeof val === 'object') {
        return Object.values(val).some(
          (subVal) =>
            (typeof subVal === 'string' || typeof subVal === 'number') &&
            String(subVal).toLowerCase().includes(q)
        );
      }
      return false;
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-600" />
            Centralized Database Control & Alteration Console
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Prisma ORM dynamic alteration engine with foreign keys, ACID transactions, and immutable audit logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadDatabaseOverview}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Sync Live Database
        </Button>
      </div>

      {/* Engine Status & Architecture Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine Status</div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              SQLite / MySQL
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-500">Persistent Disk Storage</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relational Tables</div>
            <div className="text-sm font-black text-slate-900">18 Normalized Models</div>
            <div className="text-[11px] text-slate-500">Foreign Keys & Cascades</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Isolation</div>
            <div className="text-sm font-black text-slate-900">ACID Compliant</div>
            <div className="text-[11px] text-slate-500">Parameterized SQL Safety</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Trail</div>
            <div className="text-sm font-black text-slate-900">{auditLogs.length} Alteration Records</div>
            <div className="text-[11px] text-slate-500">Immutable History</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-4 sm:gap-6">
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'tables'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          Interactive Table Controller ({filteredData.length})
        </button>

        <button
          onClick={() => setActiveTab('schema-reference')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'schema-reference'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Database Schema & Control Reference
        </button>

        <button
          onClick={() => setActiveTab('import-export')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'import-export'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Data Import & Export Center
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Immutable Change Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: Live Interactive Table Controller */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Select Table to Inspect/Alter:</label>
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  setSearchQuery('');
                }}
                className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="users">users (Authentication & Profiles)</option>
                <option value="students">students (Academic Directory)</option>
                <option value="faculty">faculty (Professors & Staff)</option>
                <option value="departments">departments (Branches)</option>
                <option value="courses">courses (Curriculum Subjects)</option>
                <option value="fees">fees (Financial Invoices)</option>
                <option value="attendance">attendance (Daily Academic Sessions)</option>
                <option value="marks">marks (Internal & Semester Grades)</option>
                <option value="library">library_books (Catalog)</option>
                <option value="hostel">hostel_rooms (Accommodations)</option>
                <option value="announcements">announcements (Circulars)</option>
                <option value="events">events (College Activities)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">UUID (PK)</th>
                    {selectedTable === 'users' && (
                      <>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {selectedTable === 'students' && (
                      <>
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Sem</th>
                        <th className="px-4 py-3">CGPA</th>
                      </>
                    )}
                    {selectedTable === 'faculty' && (
                      <>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Designation</th>
                      </>
                    )}
                    {selectedTable === 'departments' && (
                      <>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Students</th>
                        <th className="px-4 py-3">Courses</th>
                      </>
                    )}
                    {selectedTable === 'courses' && (
                      <>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Course Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Credits</th>
                      </>
                    )}
                    {selectedTable === 'fees' && (
                      <>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Paid</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {selectedTable === 'attendance' && (
                      <>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {selectedTable === 'marks' && (
                      <>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Exam Type</th>
                        <th className="px-4 py-3">Score</th>
                      </>
                    )}
                    {selectedTable === 'library' && (
                      <>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Author</th>
                        <th className="px-4 py-3">ISBN</th>
                        <th className="px-4 py-3">Available</th>
                      </>
                    )}
                    {selectedTable === 'hostel' && (
                      <>
                        <th className="px-4 py-3">Room No</th>
                        <th className="px-4 py-3">Block</th>
                        <th className="px-4 py-3">Capacity</th>
                        <th className="px-4 py-3">Occupied</th>
                      </>
                    )}
                    {selectedTable === 'announcements' && (
                      <>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Audience</th>
                        <th className="px-4 py-3">Date</th>
                      </>
                    )}
                    {selectedTable === 'events' && (
                      <>
                        <th className="px-4 py-3">Event Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Venue</th>
                      </>
                    )}
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Reading records from database table "{selectedTable}"...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No records found matching current query.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2.5 text-slate-400 font-mono text-[10px] truncate max-w-[110px]" title={row.id}>
                          {row.id}
                        </td>
                        {selectedTable === 'users' && (
                          <>
                            <td className="px-4 py-2.5 font-semibold text-slate-900">{row.email}</td>
                            <td className="px-4 py-2.5 font-sans">{row.name}</td>
                            <td className="px-4 py-2.5 font-bold text-blue-700">{row.role}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {row.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                          </>
                        )}
                        {selectedTable === 'students' && (
                          <>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{row.rollNo}</td>
                            <td className="px-4 py-2.5 font-sans">{row.user?.name}</td>
                            <td className="px-4 py-2.5 text-blue-700 font-bold">{row.department?.code}</td>
                            <td className="px-4 py-2.5">Sem {row.semester}</td>
                            <td className="px-4 py-2.5 font-bold text-emerald-600">{row.cgpa?.toFixed(2)}</td>
                          </>
                        )}
                        {selectedTable === 'faculty' && (
                          <>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{row.employeeId}</td>
                            <td className="px-4 py-2.5 font-sans">{row.user?.name}</td>
                            <td className="px-4 py-2.5 text-blue-700 font-bold">{row.department?.code}</td>
                            <td className="px-4 py-2.5 font-sans">{row.designation}</td>
                          </>
                        )}
                        {selectedTable === 'departments' && (
                          <>
                            <td className="px-4 py-2.5 font-bold text-blue-700">{row.code}</td>
                            <td className="px-4 py-2.5 font-sans">{row.name}</td>
                            <td className="px-4 py-2.5">{row._count?.students || 0}</td>
                            <td className="px-4 py-2.5">{row._count?.courses || 0}</td>
                          </>
                        )}
                        {selectedTable === 'courses' && (
                          <>
                            <td className="px-4 py-2.5 font-bold text-blue-700">{row.code}</td>
                            <td className="px-4 py-2.5 font-sans">{row.name}</td>
                            <td className="px-4 py-2.5">{row.department?.code}</td>
                            <td className="px-4 py-2.5">{row.credits} Credits</td>
                          </>
                        )}
                        {selectedTable === 'fees' && (
                          <>
                            <td className="px-4 py-2.5 font-sans">{row.title}</td>
                            <td className="px-4 py-2.5 font-sans">{row.student?.user?.name || row.studentId}</td>
                            <td className="px-4 py-2.5">₹{row.amount}</td>
                            <td className="px-4 py-2.5 text-emerald-600">₹{row.paidAmount}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {selectedTable === 'attendance' && (
                          <>
                            <td className="px-4 py-2.5 font-sans">{row.student?.user?.name || row.student?.rollNo}</td>
                            <td className="px-4 py-2.5 text-blue-700">{row.course?.code}</td>
                            <td className="px-4 py-2.5">{new Date(row.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2.5 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${row.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {selectedTable === 'marks' && (
                          <>
                            <td className="px-4 py-2.5 font-sans">{row.student?.user?.name || row.student?.rollNo}</td>
                            <td className="px-4 py-2.5 text-blue-700">{row.course?.code}</td>
                            <td className="px-4 py-2.5 font-sans">{row.examType}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{row.marksObtained} / {row.maxMarks}</td>
                          </>
                        )}
                        {selectedTable === 'library' && (
                          <>
                            <td className="px-4 py-2.5 font-sans font-bold text-slate-900">{row.title}</td>
                            <td className="px-4 py-2.5 font-sans">{row.author}</td>
                            <td className="px-4 py-2.5">{row.isbn}</td>
                            <td className="px-4 py-2.5">{row.availableCopies} / {row.totalCopies}</td>
                          </>
                        )}
                        {selectedTable === 'hostel' && (
                          <>
                            <td className="px-4 py-2.5 font-bold text-slate-900">{row.roomNumber}</td>
                            <td className="px-4 py-2.5 font-sans">{row.blockName}</td>
                            <td className="px-4 py-2.5">{row.capacity} Beds</td>
                            <td className="px-4 py-2.5">{row.occupiedBeds} Beds</td>
                          </>
                        )}
                        {selectedTable === 'announcements' && (
                          <>
                            <td className="px-4 py-2.5 font-sans font-bold text-slate-900">{row.title}</td>
                            <td className="px-4 py-2.5">{row.targetAudience}</td>
                            <td className="px-4 py-2.5">{new Date(row.createdAt).toLocaleDateString()}</td>
                          </>
                        )}
                        {selectedTable === 'events' && (
                          <>
                            <td className="px-4 py-2.5 font-sans font-bold text-slate-900">{row.title}</td>
                            <td className="px-4 py-2.5">{row.category}</td>
                            <td className="px-4 py-2.5 font-sans">{row.venue}</td>
                          </>
                        )}
                        <td className="px-4 py-2.5 text-slate-400">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Complete Database Schema & Control Reference */}
      {activeTab === 'schema-reference' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                Database Control & Alteration Architecture Blueprint
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Every mutation passes through Express REST APIs, validates role tokens via JWT, invokes Prisma ORM with parameterized SQL, ensures ACID isolation, and writes to the immutable audit log.
              </p>
            </div>

            {/* Architecture Flow Diagram in UI */}
            <div className="p-4 rounded-xl bg-slate-950 text-white font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
              <div className="text-blue-400 font-bold">// DYNAMIC DATABASE ALTERATION LIFECYCLE:</div>
              <div className="text-slate-300">
                1. [React Frontend Client] ──(HTTP JSON + Bearer Token)──► [Express REST Endpoints]
              </div>
              <div className="text-slate-300">
                2. [auth.ts Middleware]   ──(Verify JWT + Role Permissions)──► [authorizeRoles Guard]
              </div>
              <div className="text-slate-300">
                3. [Business Logic Layer]  ──(Foreign Key Check & Validation)──► [Prisma Client ORM Engine]
              </div>
              <div className="text-slate-300">
                4. [Storage Engine]        ──(Parameterized SQL + ACID Tx)────► [SQLite / MySQL 8.0 Database]
              </div>
              <div className="text-slate-300">
                5. [Audit Logger]          ──(Create AuditLog Entry)──────────► [audit_logs Table (Immutable)]
              </div>
              <div className="text-emerald-400 font-bold">
                6. [Response Payload]      ──(JSON Response Code 200/201)────► [Frontend React Re-renders]
              </div>
            </div>

            {/* Role Permissions Matrix */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Role-Based Database Alteration Permissions Matrix:
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="p-3 border-b">Role</th>
                      <th className="p-3 border-b">Permitted Table Alterations</th>
                      <th className="p-3 border-b">Restricted Actions</th>
                      <th className="p-3 border-b">Audit Logging</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="p-3 font-bold text-blue-700">ADMIN</td>
                      <td className="p-3">Full CRUD across all 18 tables: users, departments, courses, fees, timetable, hostel, backup/import</td>
                      <td className="p-3 text-emerald-600 font-semibold">None (Full System Superuser)</td>
                      <td className="p-3">All mutations logged with Admin UUID and IP</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-700">FACULTY</td>
                      <td className="p-3">attendance (create/update), marks (insert/update), notes (upload/delete), leaves (approve/reject)</td>
                      <td className="p-3 text-rose-600 font-semibold">Cannot alter users, departments, fees, hostel rooms</td>
                      <td className="p-3">All grade & attendance alterations tracked</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-emerald-700">STUDENT</td>
                      <td className="p-3">Profile phone/address, apply leave requests, register for events</td>
                      <td className="p-3 text-rose-600 font-semibold">Read-only for marks, attendance, fees, courses, users</td>
                      <td className="p-3">Leave applications & profile updates logged</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-700">STAFF</td>
                      <td className="p-3">library_books, book_issues (issue/return), hostel_rooms, fees (record payment receipts)</td>
                      <td className="p-3 text-rose-600 font-semibold">Cannot modify student marks, course syllabi, faculty</td>
                      <td className="p-3">Library circulation & fee receipts tracked</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Relational Models Reference Cards */}
            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                18 Core Normalized Database Models Reference:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>1. User</span>
                    <span className="text-[10px] text-slate-400 font-mono">auth / core</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), email (UQ), passwordHash, role, name, phone, isActive, createdAt, updatedAt
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>2. Department</span>
                    <span className="text-[10px] text-slate-400 font-mono">academic</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), code (UQ: CSE, ECE, MECH), name, description, courses, students, faculty
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>3. Course</span>
                    <span className="text-[10px] text-slate-400 font-mono">curriculum</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), code (UQ), name, departmentId (FK), credits, semester, enrollments
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>4. Student</span>
                    <span className="text-[10px] text-slate-400 font-mono">profile</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), userId (FK, UQ), rollNo (UQ), departmentId (FK), semester, batch, cgpa, hostelRoomId
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>5. Faculty</span>
                    <span className="text-[10px] text-slate-400 font-mono">profile</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), userId (FK, UQ), employeeId (UQ), departmentId (FK), designation, qualification
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>6. Attendance</span>
                    <span className="text-[10px] text-slate-400 font-mono">daily</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), studentId (FK), courseId (FK), date, status (PRESENT, ABSENT, LATE), remarks
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>7. Mark</span>
                    <span className="text-[10px] text-slate-400 font-mono">grades</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), studentId (FK), courseId (FK), examType (INTERNAL_1, SEMESTER), marksObtained, maxMarks
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>8. Timetable</span>
                    <span className="text-[10px] text-slate-400 font-mono">schedule</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), departmentId (FK), courseId (FK), facultyId (FK), dayOfWeek, startTime, endTime, room
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>9. Fee</span>
                    <span className="text-[10px] text-slate-400 font-mono">finance</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), studentId (FK), title, amount, paidAmount, dueDate, status (PENDING, PAID, OVERDUE)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>10. LibraryBook</span>
                    <span className="text-[10px] text-slate-400 font-mono">catalog</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), isbn (UQ), title, author, category, totalCopies, availableCopies
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>11. BookIssue</span>
                    <span className="text-[10px] text-slate-400 font-mono">circulation</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), bookId (FK), studentId (FK), issueDate, dueDate, returnDate, fineAmount, status
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="font-bold text-blue-700 flex items-center justify-between">
                    <span>12. AuditLog</span>
                    <span className="text-[10px] text-slate-400 font-mono">security</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    id (PK), userId (FK), action, entity, entityId, details, ipAddress, createdAt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Import & Export Center */}
      {activeTab === 'import-export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Live CSV Table Export
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download verified relational tables directly to standard CSV spreadsheets.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Student Directory & Academic Stats</div>
                  <div className="text-[11px] text-slate-500">Roll numbers, emails, departments, semesters, CGPA</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadCsv('students')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Faculty & Staff Directory</div>
                  <div className="text-[11px] text-slate-500">Employee IDs, designations, qualifications, contact phones</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadCsv('faculty')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Fee Accounts & Transaction Receipts</div>
                  <div className="text-[11px] text-slate-500">Invoices, paid amounts, payment dues, and receipts</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadCsv('fees')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Validated Batch CSV Import
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk create student accounts with duplicate prevention and foreign key resolution.
              </p>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <p className="text-[11px] text-slate-500 font-mono bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                Format: rollNo, name, email, departmentCode, semester, batch, cgpa, phone
              </p>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="2024CS009, Siddharth Rao, siddharth@college.com, CSE, 5, 2024-2028, 8.85, +91 98765 00021"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />

              {importResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                  ✅ <strong>Success:</strong> Imported {importResult.imported} records, skipped {importResult.skipped}.
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold"
                isLoading={isImporting}
                icon={<Upload className="w-4 h-4" />}
              >
                Validate & Execute Database Insert
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Immutable Audit Log History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks every creation, alteration, attendance logging, grade submission, password reset, and login action.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-blue-700">{log.action}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{log.entity}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System / Root'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-2.5 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
