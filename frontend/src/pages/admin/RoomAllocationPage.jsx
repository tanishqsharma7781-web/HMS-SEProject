import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, Building2, UserMinus, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatusBadge } from '../../components/common/Badge';

export const RoomAllocationPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showVacateDialog, setShowVacateDialog] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    student: '',
    room: '',
    bed_number: 'Bed 1',
    academic_year: '2026-2027',
    notes: 'Standard room allocation',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchAllocations();
  }, [search, statusFilter]);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      let url = '/hostels/allocations/?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url);
      setAllocations(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllocate = async () => {
    setFormData(initialForm);
    // Fetch unallocated students & vacant rooms
    try {
      const [stuRes, roomRes] = await Promise.all([
        api.get('/users/students/'),
        api.get('/hostels/rooms/?vacant=true')
      ]);
      const allStudents = stuRes.data.results || stuRes.data || [];
      const vRooms = roomRes.data.results || roomRes.data || [];

      // Filter students who don't have active room allocation
      const availableStudents = allStudents.filter((s) => !s.allocated_room);
      setStudents(availableStudents);
      setVacantRooms(vRooms);

      if (availableStudents.length > 0) {
        setFormData((prev) => ({ ...prev, student: availableStudents[0].id }));
      }
      if (vRooms.length > 0) {
        setFormData((prev) => ({ ...prev, room: vRooms[0].id }));
      }

      setShowAllocateModal(true);
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to load eligible students or vacant rooms.' });
    }
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/hostels/allocations/', formData);
      setAlertMsg({ type: 'success', text: 'Room successfully allocated to student!' });
      setShowAllocateModal(false);
      fetchAllocations();
    } catch (err) {
      const errDetail = err.response?.data
        ? (Array.isArray(err.response.data) ? err.response.data.join(', ') : Object.values(err.response.data).join(', '))
        : 'Allocation failed. Ensure room has capacity.';
      setAlertMsg({ type: 'error', text: errDetail });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenVacate = (alloc) => {
    setSelectedAllocation(alloc);
    setShowVacateDialog(true);
  };

  const handleConfirmVacate = async () => {
    if (!selectedAllocation) return;
    setActionLoading(true);
    try {
      await api.post(`/hostels/allocations/${selectedAllocation.id}/vacate/`, {
        notes: 'Room vacated by administration / graduation',
      });
      setAlertMsg({ type: 'success', text: 'Student room allocation vacated.' });
      setShowVacateDialog(false);
      fetchAllocations();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to vacate room allocation.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Room Allocation & Bed Assignment</h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign students to verified vacant rooms, manage bed numbers, and process room exits
          </p>
        </div>
        <button
          onClick={handleOpenAllocate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Student to Room</span>
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

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
        >
          <option value="">All Allocations</option>
          <option value="ACTIVE">Active Allocations Only</option>
          <option value="VACATED">Vacated Records</option>
        </select>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Room & Block</th>
              <th className="py-3 px-4">Bed Assignment</th>
              <th className="py-3 px-4">Academic Year</th>
              <th className="py-3 px-4">Allocated Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading allocations...</td></tr>
            ) : allocations.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">No allocation records found.</td></tr>
            ) : (
              allocations.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{a.student_name}</div>
                    <div className="text-[11px] font-mono text-indigo-600">{a.student_id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">Room {a.room_number}</div>
                    <div className="text-[11px] text-slate-500">{a.block_name} ({a.hostel_name})</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {a.bed_number}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{a.academic_year}</td>
                  <td className="py-3.5 px-4 text-slate-600">{a.allocated_date}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {a.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleOpenVacate(a)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
                        title="Vacate Student"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Vacate</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Allocate Student Modal */}
      <Modal
        isOpen={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        title="Allocate Student to Vacant Bed"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveAllocation} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Student (Unallocated) *</label>
            {students.length === 0 ? (
              <p className="text-amber-600 p-2 rounded bg-amber-50 border border-amber-200">
                All registered students currently have active room allocations.
              </p>
            ) : (
              <select
                required
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.student_profile?.student_id || s.username}) - {s.student_profile?.course}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Room (With Vacancy) *</label>
            {vacantRooms.length === 0 ? (
              <p className="text-rose-600 p-2 rounded bg-rose-50 border border-rose-200">
                No rooms currently have vacant beds. Please add rooms or vacate occupants first.
              </p>
            ) : (
              <select
                required
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {vacantRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.block_name} - Room {r.room_number} ({r.vacant_count} beds free of {r.capacity})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Bed Number</label>
              <select
                value={formData.bed_number}
                onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Bed 1">Bed 1</option>
                <option value="Bed 2">Bed 2</option>
                <option value="Bed 3">Bed 3</option>
                <option value="Bed 4">Bed 4</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Remarks / Allocation Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAllocateModal(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || students.length === 0 || vacantRooms.length === 0}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Vacate Dialog */}
      <ConfirmDialog
        isOpen={showVacateDialog}
        onClose={() => setShowVacateDialog(false)}
        onConfirm={handleConfirmVacate}
        title="Vacate Student From Room"
        message={`Are you sure you want to vacate ${selectedAllocation?.student_name} from Room ${selectedAllocation?.room_number}? The bed will be freed for new allocations.`}
        confirmText="Confirm Vacate"
        isDanger={false}
        loading={actionLoading}
      />
    </div>
  );
};
