import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  BedDouble,
  LifeBuoy,
  ClipboardCheck,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';

export const WardenDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/warden-dashboard/');
      setData(res.data);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/15">
          Hostel Warden Operations
        </span>
        <h2 className="text-2xl font-bold mt-2">
          Welcome back, {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
        </h2>
        <p className="text-sm text-emerald-200 mt-1">
          Managing: <strong className="text-white">{data?.managed_block || 'Assigned Block'}</strong> • Daily hostel discipline, room availability & complaint resolutions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students Under Management"
          value={data?.students_count || 0}
          subtitle={`Allocated in ${data?.managed_block}`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Available Beds"
          value={data?.available_beds || 0}
          subtitle={`${data?.occupied_beds || 0} beds occupied`}
          icon={BedDouble}
          color="indigo"
        />
        <StatCard
          title="Assigned to Me"
          value={data?.my_assigned_complaints || 0}
          subtitle={`${data?.pending_complaints || 0} total complaints in hostel`}
          icon={LifeBuoy}
          color="rose"
        />
        <StatCard
          title="Today's Attendance"
          value={`${data?.today_attendance_present || 0}`}
          subtitle={`${data?.today_attendance_total || 0} students recorded`}
          icon={ClipboardCheck}
          color="amber"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Daily Operational Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/warden/attendance"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mt-3">Mark Roll Call</h4>
            <p className="text-xs text-slate-500 mt-0.5">Take today's student evening attendance</p>
          </Link>

          <Link
            to="/warden/complaints"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mt-3">Resolve Complaints</h4>
            <p className="text-xs text-slate-500 mt-0.5">Review resident issues & technicians</p>
          </Link>

          <Link
            to="/warden/allocations"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <BedDouble className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mt-3">Room Allocations</h4>
            <p className="text-xs text-slate-500 mt-0.5">Allocate rooms or vacate students</p>
          </Link>

          <Link
            to="/warden/visitors"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mt-3">Visitor Gate Log</h4>
            <p className="text-xs text-slate-500 mt-0.5">Check guest check-ins & checkouts</p>
          </Link>
        </div>
      </div>

      {/* Recent Registrations Table */}
      {data?.recent_registrations && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Recently Enrolled Hostel Residents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_registrations.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {stu.first_name} {stu.last_name || ''}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-600">@{stu.username}</td>
                    <td className="py-2.5 px-3 text-slate-600">{stu.email}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(stu.date_joined).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
