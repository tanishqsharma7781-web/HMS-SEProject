import React, { useState, useEffect } from 'react';
import { Settings, Shield, UserX, UserCheck, Search, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { Badge } from '../../components/common/Badge';

export const SettingsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/accounts/?search=${encodeURIComponent(search)}`);
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await api.post(`/users/accounts/${user.id}/toggle_active/`);
      setAlertMsg({ type: 'success', text: res.data.message });
      fetchUsers();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Failed to toggle status.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Administration & Access Control</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage system user accounts, toggle role permissions, and view database infrastructure status
        </p>
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

      {/* System Infrastructure Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center space-x-3 mb-3">
          <Database className="w-6 h-6 text-indigo-400" />
          <h3 className="font-bold text-sm">System Database & Framework Architecture</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Database Engine:</span>
            <p className="font-semibold text-emerald-400 mt-0.5">PostgreSQL 18 (Active)</p>
          </div>
          <div>
            <span className="text-slate-400">Backend API:</span>
            <p className="font-semibold text-indigo-300 mt-0.5">Django 5 + REST Framework</p>
          </div>
          <div>
            <span className="text-slate-400">Auth Token:</span>
            <p className="font-semibold text-indigo-300 mt-0.5">SimpleJWT (Bearer)</p>
          </div>
          <div>
            <span className="text-slate-400">Frontend Stack:</span>
            <p className="font-semibold text-indigo-300 mt-0.5">React 19 + Tailwind CSS</p>
          </div>
        </div>
      </div>

      {/* User Accounts Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Registered System Accounts ({users.length})</h3>
            <p className="text-xs text-slate-400">Deactivating an account immediately revokes login access</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-2.5 px-3">Username & Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="py-6 text-center text-slate-500">Loading accounts...</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">@{u.username}</span>
                      <div className="text-[11px] text-slate-500">{u.first_name} {u.last_name || ''}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-700">
                      {u.role}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{u.email || '-'}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                            u.is_active
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
