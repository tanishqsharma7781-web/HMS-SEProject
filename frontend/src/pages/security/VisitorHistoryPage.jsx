import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Calendar, Filter } from 'lucide-react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/Badge';

export const VisitorHistoryPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = '/visitors/?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      setVisitors(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Visitor Pass Gate History & Archive</h2>
        <p className="text-xs text-slate-500 mt-1">Audit log of all campus entries, duration of visits, and authorized residents</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor, phone, student or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="INSIDE">Currently Inside Campus</option>
          <option value="EXITED">Exited</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Visitor & ID</th>
              <th className="py-3 px-4">Student Visited</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Entry Time</th>
              <th className="py-3 px-4">Exit Time</th>
              <th className="py-3 px-4">Gate Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Loading history...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-400">No records found.</td></tr>
            ) : (
              visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{v.visitor_name}</div>
                    <div className="text-[11px] text-slate-500">{v.visitor_phone}</div>
                    {v.visitor_id_proof && <div className="text-[10px] text-slate-400 font-mono">{v.visitor_id_proof}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{v.student_name}</div>
                    <div className="text-[11px] text-indigo-600 font-medium">{v.student_room}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{v.purpose}</td>
                  <td className="py-3 px-4 text-slate-600">{new Date(v.entry_time).toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-600">{v.exit_time ? new Date(v.exit_time).toLocaleString() : '—'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
