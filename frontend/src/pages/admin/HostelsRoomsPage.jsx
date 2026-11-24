import React, { useState, useEffect } from 'react';
import { Building2, BedDouble, Plus, Search, Filter, Users, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';

export const HostelsRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockFilter, setBlockFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [vacantOnly, setVacantOnly] = useState(false);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showOccupantsModal, setShowOccupantsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const initialForm = {
    block: '',
    room_number: '',
    floor: 1,
    room_type: 'DOUBLE',
    capacity: 2,
    fee_per_semester: 35000.00,
    notes: 'Standard room with study desk and wardrobe',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [blockFilter, floorFilter, vacantOnly, search]);

  const fetchBlocks = async () => {
    try {
      const res = await api.get('/hostels/blocks/');
      setBlocks(res.data.results || res.data || []);
      if (!formData.block && res.data.length > 0) {
        setFormData((prev) => ({ ...prev, block: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      let url = '/hostels/rooms/?';
      if (blockFilter) url += `block=${blockFilter}&`;
      if (floorFilter) url += `floor=${floorFilter}&`;
      if (vacantOnly) url += `vacant=true&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url);
      setRooms(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/hostels/rooms/', formData);
      setAlertMsg({ type: 'success', text: `Room ${formData.room_number} added successfully!` });
      setShowAddModal(false);
      setFormData(initialForm);
      fetchRooms();
    } catch (err) {
      const errDetail = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Failed to create room.';
      setAlertMsg({ type: 'error', text: errDetail });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewOccupants = (room) => {
    setSelectedRoom(room);
    setShowOccupantsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hostel & Room Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure room inventory, track floor capacities, and monitor live bed vacancy
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
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

      {/* Block Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {blocks.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{b.code}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {b.gender_type}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">{b.name}</h4>
            <p className="text-xs text-slate-500 mt-1">Warden: {b.warden_name}</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Rooms: {b.rooms_count}</span>
              <span className="text-indigo-600 font-semibold">{b.hostel_name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search room number or block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Blocks</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
          <label className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium px-2 py-1.5 border border-slate-200 rounded-lg cursor-pointer bg-slate-50">
            <input
              type="checkbox"
              checked={vacantOnly}
              onChange={(e) => setVacantOnly(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span>Vacant Beds Only</span>
          </label>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <th className="py-3 px-4">Room & Block</th>
              <th className="py-3 px-4">Floor</th>
              <th className="py-3 px-4">Room Type</th>
              <th className="py-3 px-4">Bed Capacity</th>
              <th className="py-3 px-4">Occupancy Status</th>
              <th className="py-3 px-4">Fee / Semester</th>
              <th className="py-3 px-4 text-right">Occupants</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading rooms...</td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">No rooms found matching filters.</td></tr>
            ) : (
              rooms.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 text-sm">Room {r.room_number}</span>
                    <div className="text-[11px] text-slate-500">{r.block_name} ({r.block_code})</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">Floor {r.floor}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {r.room_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{r.capacity} Beds</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            r.occupied_count === r.capacity ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(r.occupied_count / r.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {r.occupied_count}/{r.capacity}
                      </span>
                      {r.vacant_count > 0 ? (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {r.vacant_count} Vacant
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Full
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    ₹{parseFloat(r.fee_per_semester).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleViewOccupants(r)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>({r.occupied_count}) View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Hostel Room">
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Hostel Block *</label>
            <select
              required
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>{b.hostel_name} - {b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g. 104, 205"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Floor Level</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Room Type</label>
              <select
                value={formData.room_type}
                onChange={(e) => {
                  const t = e.target.value;
                  const c = t === 'SINGLE' ? 1 : t === 'DOUBLE' ? 2 : t === 'TRIPLE' ? 3 : 4;
                  setFormData({ ...formData, room_type: t, capacity: c });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="SINGLE">Single Occupancy</option>
                <option value="DOUBLE">Double Occupancy</option>
                <option value="TRIPLE">Triple Occupancy</option>
                <option value="QUAD">Quad Occupancy</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Capacity (Beds)</label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Fee per Semester (₹)</label>
            <input
              type="number"
              step="500"
              required
              value={formData.fee_per_semester}
              onChange={(e) => setFormData({ ...formData, fee_per_semester: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description / Notes</label>
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
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Add Room
            </button>
          </div>
        </form>
      </Modal>

      {/* View Occupants Modal */}
      {selectedRoom && (
        <Modal
          isOpen={showOccupantsModal}
          onClose={() => setShowOccupantsModal(false)}
          title={`Occupants of Room ${selectedRoom.room_number} (${selectedRoom.block_name})`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            {selectedRoom.active_allocations && selectedRoom.active_allocations.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {selectedRoom.active_allocations.map((alloc) => (
                  <div key={alloc.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-slate-800">{alloc.student_name}</h5>
                      <p className="text-slate-500 font-mono text-[11px]">{alloc.student_id}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">
                      {alloc.bed_number}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-slate-400">This room has no active student occupants.</p>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-500">
              <span>Capacity: {selectedRoom.capacity} Beds</span>
              <span className="font-semibold text-emerald-600">{selectedRoom.vacant_count} Beds Vacant</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
