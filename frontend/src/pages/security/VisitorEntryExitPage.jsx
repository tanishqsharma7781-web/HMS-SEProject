import React, { useState, useEffect } from 'react';
import { LogOut, Search, UserCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../../api/client';

export const VisitorEntryExitPage = () => {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    fetchActive();
  }, [search]);

  const fetchActive = async () => {
    setLoading(true);
    try {
      let url = '/visitors/?status=INSIDE&';
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      setActiveVisitors(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExit = async (v) => {
    try {
      await api.post(`/visitors/${v.id}/mark_exit/`);
      setAlertMsg({ type: 'success', text: `Exit departure logged for ${v.visitor_name}.` });
      fetchActive();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to record exit.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Active Visitors Currently Inside Campus</h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor visitors currently inside residential premises and log departures upon exit at security gate
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

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search active visitor name, phone, or resident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <span className="ml-4 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          {activeVisitors.length} Inside Premises
        </span>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Visitor Name & ID</th>
              <th className="py-3 px-4">Student Visited & Room</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Entry Time</th>
              <th className="py-3 px-4 text-right">Departure Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-500">Checking active visitor rolls...</td></tr>
            ) : activeVisitors.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-400">No visitors currently inside campus.</td></tr>
            ) : (
              activeVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{v.visitor_name}</div>
                    <div className="text-[11px] text-slate-500">{v.visitor_phone}</div>
                    {v.visitor_id_proof && <div className="text-[10px] font-mono text-slate-400">{v.visitor_id_proof}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{v.student_name}</div>
                    <div className="text-[11px] text-indigo-600 font-medium">{v.student_room}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{v.purpose}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {new Date(v.entry_time).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleMarkExit(v)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Log Exit</span>
                    </button>
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
