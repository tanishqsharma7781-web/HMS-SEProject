import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Search, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';

export const WardensPage = () => {
  const [wardens, setWardens] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: 'wardenpassword123',
    employee_id: '',
    qualification: '',
    emergency_contact: '',
    assigned_block: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchWardens();
    fetchBlocks();
  }, [search]);

  const fetchWardens = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/wardens/?search=${encodeURIComponent(search)}`);
      setWardens(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await api.get('/hostels/blocks/');
      setBlocks(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const handleOpenEdit = (w) => {
    setSelectedWarden(w);
    const prof = w.warden_profile || {};
    setFormData({
      username: w.username,
      email: w.email,
      first_name: w.first_name,
      last_name: w.last_name,
      phone: w.phone || '',
      password: '',
      employee_id: prof.employee_id || '',
      qualification: prof.qualification || '',
      emergency_contact: prof.emergency_contact || '',
      assigned_block: prof.assigned_block || '',
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (w) => {
    setSelectedWarden(w);
    setShowDeleteDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.assigned_block) payload.assigned_block = null;
      if (showEditModal) {
        if (!payload.password) delete payload.password;
        await api.patch(`/users/wardens/${selectedWarden.id}/`, payload);
        setAlertMsg({ type: 'success', text: `Warden updated successfully!` });
        setShowEditModal(false);
      } else {
        await api.post('/users/wardens/', payload);
        setAlertMsg({ type: 'success', text: `Warden registered successfully!` });
        setShowAddModal(false);
      }
      fetchWardens();
    } catch (err) {
      const errDetail = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Operation failed.';
      setAlertMsg({ type: 'error', text: errDetail });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWarden) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/wardens/${selectedWarden.id}/`);
      setAlertMsg({ type: 'success', text: `Warden removed successfully.` });
      setShowDeleteDialog(false);
      fetchWardens();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to delete warden.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Warden Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register hostel wardens, manage block assignments and contact credentials
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Warden</span>
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

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search warden by name, employee ID, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Wardens Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Warden Details</th>
              <th className="py-3 px-4">Employee ID</th>
              <th className="py-3 px-4">Assigned Block</th>
              <th className="py-3 px-4">Qualification</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  Loading wardens...
                </td>
              </tr>
            ) : wardens.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No warden records found.
                </td>
              </tr>
            ) : (
              wardens.map((w) => {
                const prof = w.warden_profile || {};
                return (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {w.first_name} {w.last_name || ''}
                      </div>
                      <div className="text-[11px] text-slate-400">@{w.username}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 font-medium">
                      {prof.employee_id || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {prof.assigned_block_name ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                          <Building2 className="w-3 h-3" />
                          <span>{prof.assigned_block_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{prof.qualification || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{w.email}</div>
                      <div className="text-[11px] text-slate-400">{w.phone || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(w)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Warden Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        title={showEditModal ? 'Edit Warden Profile' : 'Register New Hostel Warden'}
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
                placeholder="Dr. / Prof."
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
                disabled={showEditModal}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100"
                placeholder="warden.name"
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
                placeholder="WRD-2026-XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
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
              <label className="block font-medium text-slate-700 mb-1">Assigned Hostel Block</label>
              <select
                value={formData.assigned_block}
                onChange={(e) => setFormData({ ...formData, assigned_block: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- None / Unassigned --</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.hostel_name} - {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {showEditModal ? 'New Password (Optional)' : 'Password *'}
              </label>
              <input
                type="password"
                required={!showEditModal}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder={showEditModal ? 'Keep blank' : 'Min 6 chars'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Qualification / Degree</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="M.Sc, Ph.D, etc."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
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
              <span>{showEditModal ? 'Update Warden' : 'Register Warden'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Remove Warden Account"
        message={`Are you sure you want to remove warden "${selectedWarden?.first_name} ${selectedWarden?.last_name || ''}"?`}
        confirmText="Remove Warden"
        loading={actionLoading}
      />
    </div>
  );
};
