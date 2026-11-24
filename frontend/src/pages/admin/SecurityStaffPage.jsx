import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';

export const SecurityStaffPage = () => {
  const [securityStaff, setSecurityStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: 'securitypassword123',
    employee_id: '',
    shift: 'Day',
    gate_number: 'Main Campus Gate 1',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchSecurity();
  }, [search]);

  const fetchSecurity = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/security/?search=${encodeURIComponent(search)}`);
      setSecurityStaff(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const handleOpenDelete = (s) => {
    setSelectedStaff(s);
    setShowDeleteDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/users/security/', formData);
      setAlertMsg({ type: 'success', text: `Security guard registered successfully!` });
      setShowAddModal(false);
      fetchSecurity();
    } catch (err) {
      const errDetail = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Registration failed.';
      setAlertMsg({ type: 'error', text: errDetail });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/security/${selectedStaff.id}/`);
      setAlertMsg({ type: 'success', text: `Security staff record removed.` });
      setShowDeleteDialog(false);
      fetchSecurity();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to delete record.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Security Personnel Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register campus gate officers, assign patrol shifts, and monitor check-in coverage
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Security Officer</span>
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

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Officer Name</th>
              <th className="py-3 px-4">Employee ID</th>
              <th className="py-3 px-4">Assigned Gate</th>
              <th className="py-3 px-4">Shift</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  Loading security personnel...
                </td>
              </tr>
            ) : securityStaff.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No security personnel records found.
                </td>
              </tr>
            ) : (
              securityStaff.map((s) => {
                const prof = s.security_profile || {};
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {s.first_name} {s.last_name || ''}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-600 font-medium">
                      {prof.employee_id || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{prof.gate_number || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {prof.shift || 'Day'} Shift
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{s.email}</div>
                      <div className="text-[11px] text-slate-400">{s.phone || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDelete(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Register Security Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Security Personnel"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="security.officer"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="SEC-2026-XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Day">Day Shift (08:00 AM - 04:00 PM)</option>
                <option value="Night">Night Shift (08:00 PM - 08:00 AM)</option>
                <option value="Rotating">Rotating Shift</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gate Assigned</label>
              <input
                type="text"
                value={formData.gate_number}
                onChange={(e) => setFormData({ ...formData, gate_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g. Main Gate 1"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Initial Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center space-x-1"
            >
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>Register Guard</span>
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Remove Security Personnel"
        message={`Are you sure you want to remove guard "${selectedStaff?.first_name} ${selectedStaff?.last_name || ''}"?`}
        confirmText="Remove Guard"
        loading={actionLoading}
      />
    </div>
  );
};
