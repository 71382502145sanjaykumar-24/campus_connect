import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LibraryBook, BookIssue, Student } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { Plus, BookOpen, BookmarkCheck, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LibraryPage: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'issues'>('catalog');
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);
  const [issueBookModalOpen, setIssueBookModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    totalCopies: '5',
    shelfLocation: 'Floor 1, Rack CS-01',
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const [fineAmount, setFineAmount] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksRes, issuesRes, studentsRes] = await Promise.all([
        api.library.books(),
        api.library.issues(),
        api.students.list(),
      ]);
      setBooks(booksRes || []);
      setIssues(issuesRes || []);
      setStudents(studentsRes.students || []);

      if (booksRes.length > 0 && !issueForm.bookId) {
        setIssueForm(prev => ({ ...prev, bookId: booksRes[0].id }));
      }
      if (studentsRes.students?.length > 0 && !issueForm.studentId) {
        setIssueForm(prev => ({ ...prev, studentId: studentsRes.students[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.library.createBook(bookForm);
      setAddBookModalOpen(false);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        totalCopies: '5',
        shelfLocation: 'Floor 1, Rack CS-01',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.library.issueBook(issueForm);
      setIssueBookModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to issue book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setIsSubmitting(true);
    try {
      await api.library.returnBook(selectedIssue.id, { fineAmount: parseFloat(fineAmount) });
      setReturnModalOpen(false);
      setSelectedIssue(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to process return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Central Library</h2>
          <p className="text-xs text-slate-500 mt-1">
            Search book catalog, track shelf locations, and manage borrowing records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'STAFF' || role === 'ADMIN') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIssueBookModalOpen(true)}
                icon={<ArrowRightLeft className="w-4 h-4" />}
              >
                Issue Book
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddBookModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Book to Catalog
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Book Catalog ({books.length})
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'issues'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          Borrowing Transactions ({issues.length})
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <DataTable
          data={books}
          columns={[
            {
              header: 'ISBN',
              accessor: 'isbn',
              sortable: true,
              className: 'font-mono text-xs font-bold text-slate-700',
            },
            {
              header: 'Title & Author',
              accessor: (row) => (
                <div>
                  <div className="font-bold text-slate-900">{row.title}</div>
                  <div className="text-xs text-slate-400">{row.author}</div>
                </div>
              ),
              sortable: true,
              sortKey: 'title',
            },
            {
              header: 'Category',
              accessor: (row) => (
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                  {row.category}
                </span>
              ),
              sortable: true,
            },
            {
              header: 'Available Copies',
              accessor: (row) => (
                <span
                  className={`font-mono font-bold ${
                    row.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {row.availableCopies} / {row.totalCopies}
                </span>
              ),
              sortable: true,
              sortKey: 'availableCopies',
            },
            {
              header: 'Shelf Location',
              accessor: 'shelfLocation',
              sortable: true,
            },
          ]}
          keyExtractor={(b) => b.id}
          searchPlaceholder="Search catalog by title, author, ISBN..."
        />
      ) : (
        <DataTable
          data={issues}
          columns={[
            {
              header: 'Book Title',
              accessor: (row) => (
                <div>
                  <div className="font-bold text-slate-900">{row.book?.title}</div>
                  <div className="text-xs text-slate-400 font-mono">{row.book?.isbn}</div>
                </div>
              ),
            },
            {
              header: 'Borrower',
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
              header: 'Issued Date',
              accessor: (row) => new Date(row.issueDate).toLocaleDateString(),
              sortable: true,
            },
            {
              header: 'Due Date',
              accessor: (row) => new Date(row.dueDate).toLocaleDateString(),
              sortable: true,
            },
            {
              header: 'Status',
              accessor: (row) => <StatusBadge status={row.status} />,
              sortable: true,
            },
            {
              header: 'Action',
              accessor: (row) => (
                row.status === 'ISSUED' && (role === 'STAFF' || role === 'ADMIN') ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedIssue(row);
                      setFineAmount('0');
                      setReturnModalOpen(true);
                    }}
                  >
                    Process Return
                  </Button>
                ) : null
              ),
            },
          ]}
          keyExtractor={(i) => i.id}
          searchPlaceholder="Search borrowing history..."
        />
      )}

      {/* Add Book Modal */}
      <Modal
        isOpen={addBookModalOpen}
        onClose={() => setAddBookModalOpen(false)}
        title="Add Book to Library Catalog"
      >
        <form onSubmit={handleAddBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Operating Systems"
              value={bookForm.title}
              onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Author(s)</label>
              <input
                type="text"
                required
                placeholder="Andrew S. Tanenbaum"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN Number</label>
              <input
                type="text"
                required
                placeholder="978-0133806930"
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location</label>
              <input
                type="text"
                value={bookForm.shelfLocation}
                onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddBookModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add Book
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      <Modal
        isOpen={issueBookModalOpen}
        onClose={() => setIssueBookModalOpen(false)}
        title="Issue Book to Student"
        subtitle="Decrements available inventory copies automatically"
      >
        <form onSubmit={handleIssueBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Book</label>
            <select
              required
              value={issueForm.bookId}
              onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              required
              value={issueForm.studentId}
              onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Return Due Date</label>
            <input
              type="date"
              required
              value={issueForm.dueDate}
              onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIssueBookModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Issue Book
            </Button>
          </div>
        </form>
      </Modal>

      {/* Return Book Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Process Book Return"
        subtitle={`Book: ${selectedIssue?.book?.title}`}
        maxWidth="sm"
      >
        <form onSubmit={handleReturnBook} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p><strong>Student:</strong> {selectedIssue?.student?.user?.name}</p>
            <p><strong>Issued on:</strong> {selectedIssue && new Date(selectedIssue.issueDate).toLocaleDateString()}</p>
            <p><strong>Due date:</strong> {selectedIssue && new Date(selectedIssue.dueDate).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Overdue Fine (₹)</label>
            <input
              type="number"
              min="0"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReturnModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Return
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
