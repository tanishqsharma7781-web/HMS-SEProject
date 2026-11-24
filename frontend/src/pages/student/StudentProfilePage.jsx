import React, { useState } from 'react';
import { User, Phone, Mail, Building2, MapPin, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const StudentProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const prof = user?.student_profile || {};
  const alloc = user?.allocated_room;

  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(prof.address || '');
  const [parentPhone, setParentPhone] = useState(prof.parent_phone || '');
  const [emergencyContact, setEmergencyContact] = useState(prof.emergency_contact || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/auth/profile/', {
        phone,
        address,
        parent_phone: parentPhone,
        emergency_contact: emergencyContact,
      });
      setSuccess(true);
      await refreshUser();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Student Profile</h2>
        <p className="text-xs text-slate-500 mt-1">
          Institutional identity records, academic enrolment details, and verified emergency contacts
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Contact and address updates saved successfully!</span>
        </div>
      )}

      {/* Main Profile Dossier Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-6 flex items-end">
          <div className="translate-y-10 flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg border border-slate-200">
              <div className="w-full h-full rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-2xl shadow-inner">
                {user?.first_name ? user.first_name[0] : 'S'}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="pt-12 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {user?.first_name} {user?.last_name || ''}
              </h3>
              <p className="text-xs font-mono font-semibold text-indigo-600 mt-0.5">
                Roll Number: {prof.student_id || user?.username}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {prof.course} • {prof.department} (Year {prof.year_of_study})
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Enrolled Resident
              </span>
            </div>
          </div>

          {/* Academic & Room Allocation Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Current Hostel Allocation</span>
            </h4>
            {alloc ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700">
                <div><span className="text-slate-500 block">Hostel:</span> <span className="font-semibold">{alloc.hostel_name}</span></div>
                <div><span className="text-slate-500 block">Block:</span> <span className="font-semibold">{alloc.block_name}</span></div>
                <div><span className="text-slate-500 block">Room Number:</span> <span className="font-semibold">Room {alloc.room_number}</span></div>
                <div><span className="text-slate-500 block">Bed Assignment:</span> <span className="font-semibold">{alloc.bed_number}</span></div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No room allocated yet. Please visit the warden's office.</p>
            )}
          </div>

          {/* Form for Contact Details */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider pt-2">
              Personal & Emergency Contact Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  disabled
                  value={prof.parent_name || 'Not provided'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Parent Phone Number</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Helpline Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Permanent Home Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                {saving ? 'Saving...' : 'Update Contact Info'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
