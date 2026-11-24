import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { PriorityBadge } from '../../components/common/Badge';

export const StudentNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Hostel Announcements & Circulars</h2>
        <p className="text-xs text-slate-500 mt-1">Official circulars, mess timings, rules, and residential campus events</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">Loading circulars...</div>
        ) : notices.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Notices</h4>
            <p className="text-xs text-slate-500">There are currently no new announcements posted.</p>
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs space-y-3 ${
                n.priority === 'URGENT' ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-bold text-base text-slate-800">{n.title}</h3>
                  <PriorityBadge priority={n.priority} />
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{n.content}</p>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Published by: <strong>{n.published_by_name}</strong></span>
                <span className="font-semibold text-indigo-600">Audience: {n.target_role}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
