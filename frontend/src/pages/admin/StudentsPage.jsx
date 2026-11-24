import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form State
  const initialForm = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: 'studentpassword123',
    student_id: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    year_of_study: 1,
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    parent_name: '',
    parent_phone: '',
    parent_relation: 'Father',
    emergency_contact: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchStudents();
  }, [search, deptFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = '/users/students/?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (deptFilter) url += `department=${encodeURIComponent(deptFilter)}&`;
      const res = await api.get(url);
      setStudents(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const handleOpenView = (stu) => {
    setSelectedStudent(stu);
    setShowViewModal(true);
  };

  const handleOpenEdit = (stu) => {
    setSelectedStudent(stu);
    const prof = stu.student_profile || {};
    setFormData({
      username: stu.username,
      email: stu.email,
      first_name: stu.first_name,
      last_name: stu.last_name,
      phone: stu.phone || '',
      password: '',
      student_id: prof.student_id || '',
      department: prof.department || '',
      course: prof.course || '',
      year_of_study: prof.year_of_study || 1,
      gender: prof.gender || 'Male',
      blood_group: prof.blood_group || '',
      address: prof.address || '',
      parent_name: prof.parent_name || '',
      parent_phone: prof.parent_phone || '',
      parent_relation: prof.parent_relation || 'Parent',
      emergency_contact: prof.emergency_contact || '',
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (stu) => {
    setSelectedStudent(stu);
    setShowDeleteDialog(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (showEditModal) {
        // Edit
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.patch(`/users/students/${selectedStudent.id}/`, payload);
        setAlertMsg({ type: 'success', text: `Student ${formData.first_name} updated successfully!` });
        setShowEditModal(false);
      } else {
        // Add
        await api.post('/users/students/', formData);
        setAlertMsg({ type: 'success', text: `Student ${formData.first_name} registered successfully!` });
        setShowAddModal(false);
      }
      fetchStudents();
    } catch (err) {
      const errDetail = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Failed to save student details.';
      setAlertMsg({ type: 'error', text: errDetail });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/students/${selectedStudent.id}/`);
      setAlertMsg({ type: 'success', text: `Student record deleted successfully.` });
      setShowDeleteDialog(false);
      fetchStudents();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to delete student.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register, manage profiles, track room allotments and resident details
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, username, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Information Tech">Information Technology</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Biotechnology">Biotechnology</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Department & Course</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Allocated Room</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading students directory...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No student records found matching the criteria.
                  </td>
                </tr>
              ) : (
                students.map((stu) => {
                  const prof = stu.student_profile || {};
                  const alloc = stu.allocated_room;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {stu.first_name} {stu.last_name || ''}
                        </div>
                        <div className="text-[11px] font-mono text-indigo-600 font-medium">
                          {prof.student_id || stu.username}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{prof.course || '-'}</div>
                        <div className="text-[11px] text-slate-500">
                          {prof.department || '-'} (Yr {prof.year_of_study || 1})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{stu.email}</div>
                        <div className="text-[11px] text-slate-400">{stu.phone || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {alloc ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>
                              {alloc.block_code} - Rm {alloc.room_number} ({alloc.bed_number})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={stu.is_active ? 'success' : 'danger'}>
                          {stu.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenView(stu)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(stu)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(stu)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        title={showEditModal ? 'Edit Student Details' : 'Register New Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                disabled={showEditModal}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100"
                placeholder="student.username"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student ID (Roll No) *</label>
              <input
                type="text"
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="STU-2026-XXX"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {showEditModal ? 'New Password (Optional)' : 'Password *'}
              </label>
              <input
                type="password"
                required={!showEditModal}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder={showEditModal ? 'Leave blank to keep current' : 'Min 6 chars'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="student@hms.edu"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Course</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="B.Tech"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Year of Study</label>
              <select
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
              <input
                type="text"
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g. O+, B+"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Emergency phone"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Parent's name"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Parent Phone Number</label>
              <input
                type="text"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Parent's phone"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Permanent Home Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="City, State, Postal code"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-1"
            >
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{showEditModal ? 'Update Student' : 'Register Student'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Profile Modal */}
      {selectedStudent && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Complete Student Profile"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md">
                {selectedStudent.first_name ? selectedStudent.first_name[0] : 'S'}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {selectedStudent.first_name} {selectedStudent.last_name || ''}
                </h4>
                <p className="text-indigo-600 font-mono font-semibold">
                  {selectedStudent.student_profile?.student_id || selectedStudent.username}
                </p>
                <p className="text-slate-500 mt-0.5">
                  {selectedStudent.student_profile?.department} • Year {selectedStudent.student_profile?.year_of_study}
                </p>
              </div>
            </div>

            {/* Room Allocation Card */}
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
              <h5 className="font-semibold text-indigo-900 mb-1 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Hostel & Room Assignment</span>
              </h5>
              {selectedStudent.allocated_room ? (
                <div className="grid grid-cols-2 gap-2 text-slate-700 mt-2">
                  <div><span className="text-slate-500">Hostel:</span> {selectedStudent.allocated_room.hostel_name}</div>
                  <div><span className="text-slate-500">Block:</span> {selectedStudent.allocated_room.block_name}</div>
                  <div><span className="text-slate-500">Room Number:</span> {selectedStudent.allocated_room.room_number}</div>
                  <div><span className="text-slate-500">Bed Number:</span> {selectedStudent.allocated_room.bed_number}</div>
                  <div><span className="text-slate-500">Academic Year:</span> {selectedStudent.allocated_room.academic_year}</div>
                </div>
              ) : (
                <p className="text-slate-500 italic mt-1">No active room allocated yet.</p>
              )}
            </div>

            {/* Academic & Personal info */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200">
              <div><span className="text-slate-500">Email:</span> {selectedStudent.email}</div>
              <div><span className="text-slate-500">Phone:</span> {selectedStudent.phone || '-'}</div>
              <div><span className="text-slate-500">Gender:</span> {selectedStudent.student_profile?.gender || '-'}</div>
              <div><span className="text-slate-500">Blood Group:</span> {selectedStudent.student_profile?.blood_group || '-'}</div>
              <div><span className="text-slate-500">Parent Name:</span> {selectedStudent.student_profile?.parent_name || '-'}</div>
              <div><span className="text-slate-500">Parent Phone:</span> {selectedStudent.student_profile?.parent_phone || '-'}</div>
              <div className="col-span-2"><span className="text-slate-500">Emergency Contact:</span> {selectedStudent.student_profile?.emergency_contact || '-'}</div>
              <div className="col-span-2"><span className="text-slate-500">Permanent Address:</span> {selectedStudent.student_profile?.address || '-'}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Student Record"
        message={`Are you sure you want to delete student "${selectedStudent?.first_name} ${selectedStudent?.last_name || ''}"? This will also remove associated room allocation and fee profile.`}
        confirmText="Delete Student"
        loading={actionLoading}
      />
    </div>
  );
};
