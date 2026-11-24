import React from 'react';
import { ShieldCheck, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SecurityProfilePage = () => {
  const { user } = useAuth();
  const prof = user?.security_profile || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Security Personnel Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Official security staff identification, duty shifts, and assigned gate stations</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-purple-700 text-white font-bold flex items-center justify-center text-2xl shadow-md">
            {user?.first_name ? user.first_name[0] : 'S'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {user?.first_name} {user?.last_name || ''}
            </h3>
            <p className="text-xs text-purple-600 font-mono font-semibold">
              Employee ID: {prof.employee_id || 'SEC-STAFF'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned: {prof.gate_number || 'Main Gate 1'} ({prof.shift || 'Day'} Shift)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Username:</span>
            <span className="font-semibold text-slate-800">@{user?.username}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Email Address:</span>
            <span className="font-semibold text-slate-800">{user?.email || 'N/A'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Phone Number:</span>
            <span className="font-semibold text-slate-800">{user?.phone || 'N/A'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Shift Duty:</span>
            <span className="font-semibold text-purple-700">{prof.shift || 'Day'} Shift</span>
          </div>
        </div>
      </div>
    </div>
  );
};
