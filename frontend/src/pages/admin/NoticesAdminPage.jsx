import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Pin } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PriorityBadge, Badge } from '../../components/common/Badge';

export const NoticesAdminPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    title: '',
    content: '',
    target_role: 'ALL',
    priority: 'NORMAL',
    is_published: true,
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices/announcements/');
      setNotices(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/notices/announcements/', formData);
      setAlertMsg({ type: 'success', text: 'Announcement published successfully!' });
      setShowAddModal(false);
      setFormData(initialForm);
      fetchNotices();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to publish announcement.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotice = async () => {
    if (!selectedNotice) return;
    setActionLoading(true);
    try {
      await api.delete(`/notices/announcements/${selectedNotice.id}/`);
      setAlertMsg({ type: 'success', text: 'Notice deleted.' });
      setShowDeleteDialog(false);
      fetchNotices();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to delete notice.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hostel Notices & Announcements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast official circulars, event schedules, and critical updates to students, wardens, or security staff
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400">No active notices published.</div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                n.priority === 'URGENT' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <PriorityBadge priority={n.priority} />
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Target: {n.target_role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNotice(n);
                      setShowDeleteDialog(true);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mt-1">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{n.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By: {n.published_by_name}</span>
                <span>{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notice Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Publish Official Circular / Notice">
        <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g. Hostel Gate Curfew Notice"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.target_role}
                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="ALL">All Users (Campus-Wide)</option>
                <option value="STUDENT">Students Only</option>
                <option value="WARDEN">Wardens Only</option>
                <option value="SECURITY">Security Personnel Only</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="NORMAL">Normal Information</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Announcement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notice Content *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed"
              placeholder="Write the full announcement message here..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteNotice}
        title="Delete Notice"
        message={`Are you sure you want to delete notice "${selectedNotice?.title}"?`}
        confirmText="Delete"
        loading={actionLoading}
      />
    </div>
  );
};
