import React, { useState, useEffect } from 'react';
import { LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';

export const StudentComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    category: 'ELECTRICAL',
    title: '',
    description: '',
    priority: 'MEDIUM',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/');
      setComplaints(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/complaints/', formData);
      setAlertMsg({ type: 'success', text: 'Complaint registered successfully! The warden has been notified.' });
      setShowSubmitModal(false);
      setFormData(initialForm);
      fetchComplaints();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to submit complaint.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'SUBMITTED': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'ASSIGNED': return 3;
      case 'IN_PROGRESS': return 4;
      case 'RESOLVED': return 5;
      case 'REJECTED': return -1;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Maintenance & Facility Complaints</h2>
          <p className="text-xs text-slate-500 mt-1">
            File electrical, plumbing, Wi-Fi or mess complaints and monitor real-time resolution progress
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge New Complaint</span>
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

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">Loading complaint history...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Complaints Logged</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Everything seems to be running smoothly! If you face any room maintenance, electrical or food quality issues, tap the button above to report it.
            </p>
          </div>
        ) : (
          complaints.map((c) => {
            const step = getStatusStepIndex(c.status);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                {/* Title & Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">#{c.id} {c.title}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Category: <strong className="text-slate-600">{c.category.replace('_', ' ')}</strong> • Lodged on {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  {c.description}
                </p>

                {/* Lifecycle Progress Bar */}
                {c.status !== 'REJECTED' ? (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Progress</p>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div className={`p-2 rounded-lg border ${step >= 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        1. Submitted
                      </div>
                      <div className={`p-2 rounded-lg border ${step >= 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        2. Under Review
                      </div>
                      <div className={`p-2 rounded-lg border ${step >= 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        3. Assigned
                      </div>
                      <div className={`p-2 rounded-lg border ${step >= 5 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : step === 4 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        4. {step >= 5 ? 'Resolved' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>This complaint was reviewed and marked as rejected by the administration.</span>
                  </div>
                )}

                {/* Resolution Notes from Warden */}
                {c.resolution_notes && (
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-indigo-900 block">Warden Resolution Notes:</span>
                    <p className="text-slate-700 leading-relaxed">{c.resolution_notes}</p>
                    {c.assigned_to_name !== 'Unassigned' && (
                      <p className="text-[10px] text-slate-500 pt-1">Officer in charge: {c.assigned_to_name}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lodge Complaint Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Lodge Facility Complaint">
        <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Issue Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ELECTRICAL">Electrical Issues (Fan, Lights, Switchboard)</option>
              <option value="PLUMBING">Plumbing Issues (Tap, Flush, Basin, Geyser)</option>
              <option value="ROOM_MAINTENANCE">Room Maintenance (Furniture, Door, Lock)</option>
              <option value="FOOD_QUALITY">Food Quality & Mess Hygiene</option>
              <option value="CLEANLINESS">Hostel Cleanliness & Washrooms</option>
              <option value="INTERNET">Internet & Wi-Fi Access Points</option>
              <option value="OTHER">Other Issues</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Complaint Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g. Washroom tap leaking or Fan regulator broken"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Urgency / Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="LOW">Low - General improvement</option>
              <option value="MEDIUM">Medium - Normal repair needed</option>
              <option value="HIGH">High - Urgent attention requested</option>
              <option value="URGENT">Urgent - Critical issue affecting living</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed"
              placeholder="Provide exact details of the defect, location, and convenient time for technician visit..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
