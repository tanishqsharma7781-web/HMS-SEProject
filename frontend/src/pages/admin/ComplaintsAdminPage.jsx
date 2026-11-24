import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, CheckCircle2, AlertCircle, Clock, UserCheck, MessageSquare, History } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';

export const ComplaintsAdminPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Assignment & status update form
  const [newStatus, setNewStatus] = useState('ASSIGNED');
  const [assignedTo, setAssignedTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchWardens();
  }, [search, statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = '/complaints/?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url);
      setComplaints(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWardens = async () => {
    try {
      const res = await api.get('/users/wardens/');
      setWardens(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssign = (c) => {
    setSelectedComplaint(c);
    setNewStatus(c.status === 'SUBMITTED' ? 'IN_PROGRESS' : c.status);
    setAssignedTo(c.assigned_to || (wardens[0]?.id || ''));
    setResolutionNotes(c.resolution_notes || '');
    setShowAssignModal(true);
  };

  const handleOpenHistory = (c) => {
    setSelectedComplaint(c);
    setShowHistoryModal(true);
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/`, {
        status: newStatus,
        assigned_to: assignedTo || null,
        resolution_notes: resolutionNotes,
      });
      setAlertMsg({ type: 'success', text: `Complaint #${selectedComplaint.id} updated to ${newStatus}!` });
      setShowAssignModal(false);
      fetchComplaints();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to update complaint status.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Complaint Management Workflow</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review resident complaints, dispatch wardens or maintenance staff, and update resolution lifecycle
          </p>
        </div>
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaint title, description, or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Categories</option>
            <option value="ELECTRICAL">Electrical Issues</option>
            <option value="PLUMBING">Plumbing Issues</option>
            <option value="ROOM_MAINTENANCE">Room Maintenance</option>
            <option value="FOOD_QUALITY">Food Quality</option>
            <option value="CLEANLINESS">Cleanliness</option>
            <option value="INTERNET">Internet Issues</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Complaint ID & Title</th>
              <th className="py-3 px-4">Student & Room</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading complaints...</td></tr>
            ) : complaints.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">No complaints found.</td></tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-800 truncate">{c.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{c.student_name}</div>
                    <div className="text-[11px] text-indigo-600 font-medium">{c.student_room}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {c.category.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {c.assigned_to_name !== 'Unassigned' ? (
                      <span className="font-semibold text-slate-800">{c.assigned_to_name}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenHistory(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="View History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenAssign(c)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                      >
                        <span>Manage</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review & Assign Complaint Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title={`Manage Complaint #${selectedComplaint.id}: ${selectedComplaint.title}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600 leading-relaxed font-normal">{selectedComplaint.description}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                <span>Filed by: {selectedComplaint.student_name} ({selectedComplaint.student_room})</span>
                <span>{new Date(selectedComplaint.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Update Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assign Warden / Staff</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Unassigned --</option>
                  {wardens.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.first_name} {w.last_name} ({w.warden_profile?.assigned_block_name || 'General'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Resolution Notes / Remarks for Student
              </label>
              <textarea
                rows={3}
                required={newStatus === 'RESOLVED' || newStatus === 'REJECTED'}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Details of action taken, technician dispatch, or reason for status update..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Save Resolution
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* History Audit Trail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title={`Complaint Audit Trail #${selectedComplaint.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            {selectedComplaint.assignment_history && selectedComplaint.assignment_history.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {selectedComplaint.assignment_history.map((h) => (
                  <div key={h.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Assigned to: {h.assigned_to_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{h.notes || 'Status changed'}</p>
                    <div className="mt-1 text-[10px] text-indigo-600">Assigned by: {h.assigned_by_name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-slate-400">No previous assignment changes recorded.</p>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
