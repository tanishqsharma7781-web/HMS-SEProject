import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, LogOut, ArrowRight, Clock, Plus, Users } from 'lucide-react';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/security-dashboard/');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prof = user?.security_profile || {};

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-purple-200 border border-white/15">
          Campus Security Gate Control
        </span>
        <h2 className="text-2xl font-bold mt-2">
          Officer {user?.first_name} {user?.last_name || ''}
        </h2>
        <p className="text-sm text-purple-200 mt-1">
          Assigned: <strong className="text-white">{prof.gate_number || 'Main Gate'}</strong> • Shift: <strong className="text-white">{prof.shift || 'Day'} Shift</strong>
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Currently Inside Campus"
          value={stats?.currently_inside || 0}
          subtitle="Visitors active inside premises"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Total Visitors Today"
          value={stats?.today_total || 0}
          subtitle="Entry passes issued today"
          icon={ShieldCheck}
          color="indigo"
        />
        <StatCard
          title="Departures Logged"
          value={stats?.today_exited || 0}
          subtitle="Checked out through gate"
          icon={LogOut}
          color="purple"
        />
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/security/register"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Issue New Visitor Pass</h4>
              <p className="text-xs text-slate-500 mt-0.5">Register incoming parent or guest details</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/security/visitors"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Mark Visitor Departure</h4>
              <p className="text-xs text-slate-500 mt-0.5">View active guests & record checkout</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent Activity Feed */}
      {stats?.recent_visitors && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Recent Gate Passes Logged</h3>
          <div className="divide-y divide-slate-100">
            {stats.recent_visitors.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No visitors logged today.</p>
            ) : (
              stats.recent_visitors.slice(0, 5).map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-800">{v.visitor_name}</h5>
                    <p className="text-slate-500 text-[11px]">Visiting: {v.student__username} • {v.purpose}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${v.status === 'INSIDE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                      {v.status === 'INSIDE' ? 'Inside Campus' : 'Exited'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(v.entry_time).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
