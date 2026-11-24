import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  BedDouble,
  CreditCard,
  LifeBuoy,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/admin-dashboard/');
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        {error || 'Unable to load statistics.'}
      </div>
    );
  }

  const { counts, recent_activities, charts } = data;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/15">
            Administrative Overview
          </span>
          <h2 className="text-2xl font-bold mt-2">Campus Hostel Management Control Center</h2>
          <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
            Live occupancy, fee collections, operational workflows, and resident lifecycle metrics across all blocks.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6 pointer-events-none">
          <Building2 className="w-64 h-64" />
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={counts.total_students}
          subtitle="Enrolled residents"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Room Occupancy"
          value={`${counts.occupancy_rate}%`}
          subtitle={`${counts.occupied_beds} occupied / ${counts.total_beds} beds`}
          icon={BedDouble}
          color="emerald"
        />
        <StatCard
          title="Fee Collected"
          value={`₹${counts.total_fee_collected.toLocaleString('en-IN')}`}
          subtitle={`₹${counts.total_fee_pending.toLocaleString('en-IN')} pending`}
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Pending Complaints"
          value={counts.pending_complaints}
          subtitle={`${counts.resolved_complaints} resolved`}
          icon={LifeBuoy}
          color="rose"
        />
      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Available Beds</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1 text-emerald-600">{counts.vacant_beds}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Hostel Wardens</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1 text-indigo-600">{counts.total_wardens}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Security Personnel</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1 text-purple-600">{counts.total_security}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Visitors Inside</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1 text-sky-600">{counts.active_visitors}</h4>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy by Block */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-1">Hostel Block Bed Capacity & Occupancy</h3>
          <p className="text-xs text-slate-500 mb-4">Total capacity vs occupied beds by residential block</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.occupancy_by_block}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="capacity" fill="#cbd5e1" name="Total Capacity" radius={[4, 4, 0, 0]} />
                <Bar dataKey="occupied" fill="#4f46e5" name="Occupied Beds" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-1">Complaints Distribution by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of reported issues across hostel facilities</p>
          <div className="h-64 flex items-center justify-center">
            {charts.complaints_by_category.length === 0 ? (
              <p className="text-xs text-slate-400">No complaints logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.complaints_by_category}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.category}: ${entry.count}`}
                    labelLine={false}
                  >
                    {charts.complaints_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center justify-between">
            <span>Recent Maintenance Complaints</span>
            <span className="text-xs font-normal text-slate-500">Live feed</span>
          </h3>
          <div className="divide-y divide-slate-100">
            {recent_activities.complaints.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No recent complaints.</p>
            ) : (
              recent_activities.complaints.map((c) => (
                <div key={c.id} className="py-3 flex items-start justify-between">
                  <div className="pr-4">
                    <p className="text-sm font-medium text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      By <span className="font-semibold text-slate-700">{c.student__username}</span> • {c.category}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end space-y-1">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Fee Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center justify-between">
            <span>Recent Fee Payments</span>
            <span className="text-xs font-normal text-slate-500">Verified transactions</span>
          </h3>
          <div className="divide-y divide-slate-100">
            {recent_activities.payments.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No recent transactions.</p>
            ) : (
              recent_activities.payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {p.transaction_id} • {p.student__username}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.payment_method}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
