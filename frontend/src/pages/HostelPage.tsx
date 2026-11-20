import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { HostelRoom, Student } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Plus, Building, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HostelPage: React.FC = () => {
  const { role } = useAuth();
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    block: 'Block A',
    floor: '1',
    capacity: '2',
    roomType: 'NON_AC',
    feePerSemester: '32000',
  });

  const [studentToAssign, setStudentToAssign] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, studentsRes] = await Promise.all([
        api.hostel.rooms(),
        api.students.list(),
      ]);
      setRooms(roomsRes || []);
      setStudents(studentsRes.students || []);
      if (studentsRes.students?.length > 0 && !studentToAssign) {
        setStudentToAssign(studentsRes.students[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.hostel.createRoom(roomForm);
      setAddRoomModalOpen(false);
      setRoomForm({
        roomNumber: '',
        block: 'Block A',
        floor: '1',
        capacity: '2',
        roomType: 'NON_AC',
        feePerSemester: '32000',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !studentToAssign) return;
    setIsSubmitting(true);
    try {
      await api.hostel.assignStudent(selectedRoom.id, studentToAssign);
      setAssignModalOpen(false);
      setSelectedRoom(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStudent = async (roomId: string, studentId: string) => {
    if (!confirm('Remove student from this room?')) return;
    try {
      await api.hostel.removeStudent(roomId, studentId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove student');
    }
  };

  const columns: Column<HostelRoom>[] = [
    {
      header: 'Room No',
      accessor: 'roomNumber',
      sortable: true,
      className: 'font-mono font-bold text-slate-900',
    },
    {
      header: 'Block & Floor',
      accessor: (row) => `${row.block} (Floor ${row.floor})`,
      sortable: true,
      sortKey: 'block',
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span
          className={`font-semibold text-xs px-2 py-0.5 rounded ${
            row.roomType === 'AC' ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {row.roomType}
        </span>
      ),
      sortable: true,
      sortKey: 'roomType',
    },
    {
      header: 'Occupancy',
      accessor: (row) => (
        <span
          className={`font-mono font-bold ${
            row.occupied >= row.capacity ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {row.occupied} / {row.capacity}
        </span>
      ),
      sortable: true,
      sortKey: 'occupied',
    },
    {
      header: 'Semester Fee',
      accessor: (row) => `₹${row.feePerSemester.toLocaleString()}`,
      sortable: true,
      sortKey: 'feePerSemester',
    },
    {
      header: 'Current Residents',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {(row.students || []).map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200"
            >
              {s.user?.name}
              {(role === 'STAFF' || role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(row.id, s.id)}
                  className="text-slate-400 hover:text-rose-600 ml-1"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {(!row.students || row.students.length === 0) && (
            <span className="text-slate-400 text-xs italic">Vacant</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        (role === 'STAFF' || role === 'ADMIN') ? (
          <div className="flex items-center gap-1.5">
            {row.occupied < row.capacity && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRoom(row);
                  setAssignModalOpen(true);
                }}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Assign
              </Button>
            )}
          </div>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hostel Accommodation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Room allocations, capacity monitoring, and student residential assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'STAFF' || role === 'ADMIN') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddRoomModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Hostel Room
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={rooms}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search rooms by number, block, resident name..."
      />

      {/* Add Room Modal */}
      <Modal
        isOpen={addRoomModalOpen}
        onClose={() => setAddRoomModalOpen(false)}
        title="Add Hostel Room"
        subtitle="Create residential accommodation record in MySQL database"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                placeholder="e.g. A-103"
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Block</label>
              <select
                value={roomForm.block}
                onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Block A">Block A (Nilgiri)</option>
                <option value="Block B">Block B (Kaveri)</option>
                <option value="Block C">Block C (Everest)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
              <input
                type="number"
                min="0"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Capacity</label>
              <input
                type="number"
                min="1"
                max="6"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="NON_AC">Non-AC</option>
                <option value="AC">Air Conditioned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Per Semester (₹)</label>
            <input
              type="number"
              value={roomForm.feePerSemester}
              onChange={(e) => setRoomForm({ ...roomForm, feePerSemester: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddRoomModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Room
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Student Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Student to Room"
        subtitle={`Allocating bed in ${selectedRoom?.roomNumber} (${selectedRoom?.block})`}
        maxWidth="sm"
      >
        <form onSubmit={handleAssignStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
            <select
              required
              value={studentToAssign}
              onChange={(e) => setStudentToAssign(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNo} - {s.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
