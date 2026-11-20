import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Announcement, Event } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { Plus, Megaphone, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AnnouncementsEventsPage: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    targetRole: 'ALL',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    venue: 'Main Auditorium',
    organizer: 'Student Affairs',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [annRes, evRes] = await Promise.all([
        api.announcements.list(),
        api.events.list(),
      ]);
      setAnnouncements(annRes || []);
      setEvents(evRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.announcements.create(annForm);
      setAnnModalOpen(false);
      setAnnForm({ title: '', content: '', priority: 'NORMAL', targetRole: 'ALL' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.events.create(eventForm);
      setEventModalOpen(false);
      setEventForm({
        title: '',
        description: '',
        category: 'TECHNICAL',
        date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        venue: 'Main Auditorium',
        organizer: 'Student Affairs',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityStyles: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-700',
    NORMAL: 'bg-blue-50 text-blue-700',
    HIGH: 'bg-amber-50 text-amber-700 font-bold',
    URGENT: 'bg-rose-50 text-rose-700 font-bold animate-pulse',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Communications & Events</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional announcements, symposiums, workshops, and college activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role !== 'STUDENT' && (
            activeTab === 'announcements' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAnnModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Publish Circular
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEventModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                New Event
              </Button>
            )
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'announcements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements & Circulars ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'events'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Campus Events ({events.length})
        </button>
      </div>

      {activeTab === 'announcements' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${priorityStyles[a.priority] || priorityStyles.NORMAL}`}>
                    {a.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{a.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {a.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {a.author?.name || 'Administrator'}</span>
                <span className="font-semibold text-slate-600">Target: {a.targetRole}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {e.category}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    📅 {new Date(e.date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{e.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {e.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>📍 {e.venue}</span>
                <span className="font-semibold text-slate-700">By {e.organizer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Announcement Modal */}
      <Modal
        isOpen={annModalOpen}
        onClose={() => setAnnModalOpen(false)}
        title="Publish Official Announcement"
        subtitle="Broadcast to students, faculty, or all college members"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule for Mid-Term Assessment 2"
              value={annForm.title}
              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={annForm.priority}
                onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent / Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={annForm.targetRole}
                onChange={(e) => setAnnForm({ ...annForm, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">Everyone (College-wide)</option>
                <option value="STUDENT">Students Only</option>
                <option value="FACULTY">Faculty Only</option>
                <option value="STAFF">Staff Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
            <textarea
              required
              rows={4}
              placeholder="Write the full circular announcement here..."
              value={annForm.content}
              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAnnModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title="Schedule College Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. AI & Cloud Hackathon 2026"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="TECHNICAL">Technical Symposium</option>
                <option value="WORKSHOP">Workshop / Hands-on</option>
                <option value="CULTURAL">Cultural Fest</option>
                <option value="SPORTS">Sports Championship</option>
                <option value="SEMINAR">Guest Lecture / Seminar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
              <input
                type="text"
                required
                placeholder="Main Auditorium"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organizer</label>
              <input
                type="text"
                required
                placeholder="CSE Department"
                value={eventForm.organizer}
                onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Event highlights, eligibility, registration details..."
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEventModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
