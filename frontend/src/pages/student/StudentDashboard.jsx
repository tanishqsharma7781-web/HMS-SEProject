import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble,
  CreditCard,
  UtensilsCrossed,
  LifeBuoy,
  Bell,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/Badge';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentHomeData();
  }, []);

  const fetchStudentHomeData = async () => {
    setLoading(true);
    try {
      const [roomRes, feeRes, menuRes, compRes, notRes] = await Promise.all([
        api.get('/hostels/allocations/my_room/').catch(() => ({ data: null })),
        api.get('/fees/records/summary/').catch(() => ({ data: null })),
        api.get('/food-menu/today/').catch(() => ({ data: null })),
        api.get('/complaints/').catch(() => ({ data: [] })),
        api.get('/notices/announcements/').catch(() => ({ data: [] }))
      ]);

      setRoomData(roomRes.data);
      setFeeSummary(feeRes.data);
      setTodayMenu(menuRes.data);
      setComplaints(compRes.data?.results || compRes.data || []);
      setNotices(notRes.data?.results || notRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prof = user?.student_profile || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/15">
              Resident Student Portal
            </span>
            <h2 className="text-2xl font-bold mt-2">
              Welcome, {user?.first_name} {user?.last_name || ''}!
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              Roll No: <span className="font-mono font-bold text-white">{prof.student_id || user?.username}</span> • {prof.course} ({prof.department})
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 text-xs text-right hidden sm:block">
            <p className="text-indigo-200">Current Academic Year</p>
            <p className="font-bold text-base text-white">2026 - 2027</p>
          </div>
        </div>
      </div>

      {/* Primary Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allocated Room Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Room Allotment</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BedDouble className="w-5 h-5" />
              </div>
            </div>
            {roomData?.allocated ? (
              <div className="space-y-2">
                <div className="text-2xl font-black text-slate-800 tracking-tight">
                  Room {roomData.room_number}
                </div>
                <p className="text-xs font-semibold text-indigo-600">
                  {roomData.block_name} ({roomData.block_code})
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>Floor: <span className="font-semibold text-slate-800">{roomData.floor}</span></div>
                  <div>Bed Number: <span className="font-semibold text-slate-800">{roomData.bed_number}</span></div>
                  <div>Room Type: <span className="font-semibold text-slate-800">{roomData.room_type}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-slate-500 text-xs">
                No active room allocated. Please contact the hostel warden.
              </div>
            )}
          </div>
          <Link
            to="/student/room"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View Room Details & Roommates</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Fee Status Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hostel & Mess Fees</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            {feeSummary ? (
              <div className="space-y-2">
                <div className="text-2xl font-black text-slate-800 tracking-tight">
                  ₹{feeSummary.total_fee.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-emerald-700 font-semibold">
                    Paid: ₹{feeSummary.paid_fee.toLocaleString('en-IN')}
                  </span>
                  <span>•</span>
                  <span className={feeSummary.pending_fee > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                    Due: ₹{feeSummary.pending_fee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                      feeSummary.pending_fee === 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {feeSummary.pending_fee === 0 ? 'All Dues Cleared' : 'Payment Outstanding'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-slate-500 text-xs">Loading fee statement...</div>
            )}
          </div>
          <Link
            to="/student/fees"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View Receipts & Pay Online</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Complaints Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Maintenance Issues</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <LifeBuoy className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {complaints.length} Logged
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {complaints.filter((c) => c.status === 'RESOLVED').length} Resolved • {complaints.filter((c) => c.status !== 'RESOLVED').length} Active
            </p>
            {complaints.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <p className="font-semibold text-slate-800 truncate">{complaints[0].title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{complaints[0].category}</span>
                  <StatusBadge status={complaints[0].status} />
                </div>
              </div>
            )}
          </div>
          <Link
            to="/student/complaints"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Submit / Track Complaints</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Today's Food Menu Widget */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">
              Today's Hostel Mess Menu ({todayMenu?.menu?.day_of_week || 'Today'})
            </h3>
          </div>
          <Link
            to="/student/food-menu"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
          >
            <span>Full Weekly Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayMenu?.found ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {todayMenu.menu.items?.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-800">{item.meal_type}</span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {item.start_time} - {item.end_time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[3rem] line-clamp-3">
                  {item.items}
                </p>
                {item.special_item && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center space-x-1 text-[11px] font-semibold text-amber-600">
                    <Sparkles className="w-3 h-3" />
                    <span>{item.special_item}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">Menu for today will be updated shortly.</p>
        )}
      </div>

      {/* Notices Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800">Official Notices & Announcements</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {notices.slice(0, 3).map((n) => (
            <div key={n.id} className="py-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                <span className="text-[10px] text-slate-400">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
