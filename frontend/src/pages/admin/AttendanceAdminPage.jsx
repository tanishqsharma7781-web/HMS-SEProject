import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Calendar, CheckCircle2, AlertCircle, Save, Check } from 'lucide-react';
import api from '../../api/client';
import { StatCard } from '../../components/common/StatCard';

export const AttendanceAdminPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    fetchDailySheet();
  }, [selectedDate]);

  const fetchDailySheet = async () => {
    setLoading(true);
    try {
      const [stuRes, attRes, statRes] = await Promise.all([
        api.get('/users/students/'),
        api.get(`/attendance/?date=${selectedDate}`),
        api.get(`/attendance/stats/?date=${selectedDate}`)
      ]);

      const stuList = stuRes.data.results || stuRes.data || [];
      const attList = attRes.data.results || attRes.data || [];
      setStudents(stuList);
      setStats(statRes.data);

      const aMap = {};
      const rMap = {};

      stuList.forEach((s) => {
        const found = attList.find((a) => a.student === s.id);
        aMap[s.id] = found ? found.status : 'PRESENT';
        rMap[s.id] = found ? found.remarks : '';
      });

      setAttendanceMap(aMap);
      setRemarksMap(rMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (statusVal) => {
    const updated = { ...attendanceMap };
    students.forEach((s) => {
      updated[s.id] = statusVal;
    });
    setAttendanceMap(updated);
  };

  const handleStatusChange = (studentId, statusVal) => {
    setAttendanceMap({ ...attendanceMap, [studentId]: statusVal });
  };

  const handleRemarksChange = (studentId, text) => {
    setRemarksMap({ ...remarksMap, [studentId]: text });
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id] || 'PRESENT',
        remarks: remarksMap[s.id] || '',
      }));

      await api.post('/attendance/bulk_mark/', {
        date: selectedDate,
        records: records,
      });

      setAlertMsg({ type: 'success', text: `Attendance for ${selectedDate} saved successfully!` });
      fetchDailySheet();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to record attendance.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Attendance Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Conduct daily evening roll calls, record leave permissions, and monitor residential occupancy
          </p>
        </div>
        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
          <span>Save Attendance</span>
        </button>
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

      {/* Date Bar & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Roll Call Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 border-0 border-b border-indigo-400 px-0 py-1"
            />
          </div>
        </div>

        {stats && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-xs font-medium text-slate-500">Present Today</p>
              <h4 className="text-xl font-bold text-emerald-600 mt-1">{stats.present}</h4>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-xs font-medium text-slate-500">Absent / Leave</p>
              <h4 className="text-xl font-bold text-rose-600 mt-1">{stats.absent} Abs / {stats.on_leave} Lve</h4>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-xs font-medium text-slate-500">Turnout Rate</p>
              <h4 className="text-xl font-bold text-indigo-600 mt-1">{stats.percentage}%</h4>
            </div>
          </>
        )}
      </div>

      {/* Quick Mark Toolbar */}
      <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-700">Quick Mark All Students:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold rounded-lg shadow-xs"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('ABSENT')}
            className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-semibold rounded-lg shadow-xs"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Student Name & ID</th>
              <th className="py-3 px-4">Allocated Room</th>
              <th className="py-3 px-4 text-center">Attendance Status</th>
              <th className="py-3 px-4">Remarks / Gate Pass Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-slate-500">Loading roster...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-slate-400">No students enrolled.</td></tr>
            ) : (
              students.map((s) => {
                const currentStatus = attendanceMap[s.id] || 'PRESENT';
                const alloc = s.allocated_room;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.first_name} {s.last_name}</div>
                      <div className="text-[11px] font-mono text-indigo-600">
                        {s.student_profile?.student_id || s.username}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {alloc ? `${alloc.block_code} - Rm ${alloc.room_number}` : 'Unallocated'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 space-x-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'PRESENT')}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'ABSENT')}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'ON_LEAVE')}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            currentStatus === 'ON_LEAVE'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          On Leave
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={remarksMap[s.id] || ''}
                        onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                        placeholder="Optional remarks (e.g. sick bay, home visit pass)"
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
