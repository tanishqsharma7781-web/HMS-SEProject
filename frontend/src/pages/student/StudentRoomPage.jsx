import React, { useState, useEffect } from 'react';
import { BedDouble, Building2, Users, Mail, Phone, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../api/client';

export const StudentRoomPage = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hostels/allocations/my_room/');
      setRoom(res.data);
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

  if (!room || !room.allocated) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <BedDouble className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Active Room Allocation Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You are currently not allocated to a hostel room. Please approach the Hostel Warden office or Administrator to process your room allotment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Hostel Room & Accommodation Details</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review room allocation specifications, block amenities, and verified roommate profiles
        </p>
      </div>

      {/* Main Room Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/15">
              {room.block_name} ({room.block_code})
            </span>
            <h3 className="text-3xl font-black mt-2 tracking-tight">Room {room.room_number}</h3>
            <p className="text-xs text-indigo-200 mt-1">
              {room.hostel_name} • Floor {room.floor} • {room.gender_type}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 text-xs text-right">
            <span className="text-indigo-200 block">Your Allocated Bed</span>
            <span className="text-2xl font-black text-emerald-400 block mt-0.5">{room.bed_number}</span>
          </div>
        </div>
      </div>

      {/* Room Specifications Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Room Type</p>
          <h4 className="text-base font-bold text-slate-800 mt-1">{room.room_type}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Bed Capacity</p>
          <h4 className="text-base font-bold text-slate-800 mt-1">{room.capacity} Beds</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Occupied</p>
          <h4 className="text-base font-bold text-indigo-600 mt-1">{room.occupied} / {room.capacity}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-medium text-slate-500">Academic Year</p>
          <h4 className="text-base font-bold text-slate-800 mt-1">{room.academic_year}</h4>
        </div>
      </div>

      {/* Roommates Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-base">Roommates in Room {room.room_number}</h3>
        </div>

        {room.roommates && room.roommates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {room.roommates.map((rm, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{rm.name}</h4>
                  <p className="text-xs font-mono text-indigo-600 font-medium">{rm.student_id}</p>
                  <p className="text-xs text-slate-500 mt-1">{rm.department}</p>
                  <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                    {rm.email && <div className="flex items-center space-x-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{rm.email}</span></div>}
                    {rm.phone && <div className="flex items-center space-x-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{rm.phone}</span></div>}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                  {rm.bed_number}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-slate-400">
            No other roommates are currently allocated to this room.
          </p>
        )}
      </div>

      {/* Room Guidelines */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Room Maintenance & Cleanliness Rules</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Keep your allotted study desk and bed area tidy. Waste must be disposed of in designated floor bins.</li>
          <li>High-power heating coils, cooking hotplates, and electric stoves are strictly prohibited in hostel rooms.</li>
          <li>For electrical or plumbing issues, immediately log a complaint in the portal for technician assignment.</li>
        </ul>
      </div>
    </div>
  );
};
