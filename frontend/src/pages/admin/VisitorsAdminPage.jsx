import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, LogOut, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';

export const VisitorsAdminPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    visitor_name: '',
    visitor_phone: '',
    visitor_id_proof: '',
    student: '',
    purpose: 'Personal / Family Visit',
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchVisitors();
    fetchStats();
    fetchStudents();
  }, [search, statusFilter]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      let url = '/visitors/?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setVisitors(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/visitors/stats/');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users/students/');
      const list = res.data.results || res.data || [];
      setStudents(list);
      if (list.length > 0 && !formData.student) {
        setFormData((prev) => ({ ...prev, student: list[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/visitors/', formData);
      setAlertMsg({ type: 'success', text: `Visitor ${formData.visitor_name} registered and pass issued.` });
      setShowAddModal(false);
      setFormData(initialForm);
      fetchVisitors();
      fetchStats();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to register visitor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkExit = async (visitorId, name) => {
    try {
      await api.post(`/visitors/${visitorId}/mark_exit/`);
      setAlertMsg({ type: 'success', text: `Visitor ${name} exit time recorded.` });
      fetchVisitors();
      fetchStats();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to record visitor exit.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Campus Visitor & Guest Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Issue visitor entry passes, log contact IDs, track active visitors inside campus, and log departures
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Visitor</span>
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

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500">Currently Inside Campus</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">{stats.currently_inside}</h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500">Total Entries Today</p>
            <h4 className="text-xl font-bold text-indigo-600 mt-1">{stats.today_total}</h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500">Exited Today</p>
            <h4 className="text-xl font-bold text-slate-700 mt-1">{stats.today_exited}</h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500">All-Time Visitors</p>
            <h4 className="text-xl font-bold text-slate-700 mt-1">{stats.all_time_total}</h4>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor name, phone, student visited..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
        >
          <option value="">All Visitors</option>
          <option value="INSIDE">Currently Inside Campus</option>
          <option value="EXITED">Departed / Exited</option>
        </select>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Visitor Name & Contact</th>
              <th className="py-3 px-4">Resident Visited</th>
              <th className="py-3 px-4">Visit Purpose</th>
              <th className="py-3 px-4">Entry Timestamp</th>
              <th className="py-3 px-4">Exit Timestamp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Gate Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading visitor logs...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">No visitor records found.</td></tr>
            ) : (
              visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{v.visitor_name}</div>
                    <div className="text-[11px] text-slate-500">{v.visitor_phone}</div>
                    {v.visitor_id_proof && (
                      <div className="text-[10px] text-slate-400 font-mono">{v.visitor_id_proof}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{v.student_name}</div>
                    <div className="text-[11px] text-indigo-600 font-medium">{v.student_room}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{v.purpose}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(v.entry_time).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {v.exit_time ? new Date(v.exit_time).toLocaleString() : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {v.status === 'INSIDE' ? (
                      <button
                        onClick={() => handleMarkExit(v.id, v.visitor_name)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-white bg-slate-800 hover:bg-slate-900 rounded-lg text-xs font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Mark Exit</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Checked Out</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Visitor Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Visitor Entry Pass">
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                value={formData.visitor_name}
                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={formData.visitor_phone}
                onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Resident Student Visited *</label>
            <select
              required
              value={formData.student}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.student_profile?.student_id || s.username}) - {s.student_profile?.course}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">ID Proof (Aadhaar / DL)</label>
              <input
                type="text"
                value={formData.visitor_id_proof}
                onChange={(e) => setFormData({ ...formData, visitor_id_proof: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="ID Type & Number"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Purpose of Visit *</label>
              <input
                type="text"
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Gate Officer Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g. Verified parent identity, bag checked"
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
              Issue Entry Pass
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
