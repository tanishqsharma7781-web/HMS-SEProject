import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Filter, CheckCircle2, AlertCircle, Receipt, DollarSign, Calendar } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';

export const FeesPaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('fees');
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // New Fee Form
  const initialFeeForm = {
    student: '',
    academic_year: '2026-2027',
    semester: 'Sem 1',
    fee_type: 'TOTAL',
    amount: 35000.00,
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  };
  const [feeFormData, setFeeFormData] = useState(initialFeeForm);

  // Manual payment form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');

  useEffect(() => {
    fetchSummary();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeTab === 'fees') fetchFees();
    else fetchPayments();
  }, [activeTab, search, statusFilter]);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/fees/records/summary/');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users/students/');
      const stuList = res.data.results || res.data || [];
      setStudents(stuList);
      if (stuList.length > 0 && !feeFormData.student) {
        setFeeFormData((prev) => ({ ...prev, student: stuList[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      let url = '/fees/records/?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      const res = await api.get(url);
      setFees(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/fees/payments/?search=${encodeURIComponent(search)}`);
      setPayments(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/fees/records/', feeFormData);
      setAlertMsg({ type: 'success', text: 'Fee bill successfully assigned to student!' });
      setShowAddFeeModal(false);
      fetchFees();
      fetchSummary();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to create fee record.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPay = (fee) => {
    setSelectedFee(fee);
    setPayAmount(fee.pending_amount);
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;
    setActionLoading(true);
    try {
      await api.post('/fees/payments/checkout/', {
        fee_id: selectedFee.id,
        amount: payAmount,
        payment_method: payMethod,
        remarks: `Manual counter collection by admin/warden (${payMethod})`,
      });
      setAlertMsg({ type: 'success', text: `Payment of ₹${payAmount} recorded successfully!` });
      setShowPayModal(false);
      fetchFees();
      fetchSummary();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Payment recording failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Fee & Payment Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bill hostel and mess fees, track collection balances, and verify receipts
          </p>
        </div>
        <button
          onClick={() => setShowAddFeeModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Fee Bill</span>
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

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Fees Billed"
            value={`₹${summary.total_fee.toLocaleString('en-IN')}`}
            subtitle={`${summary.total_records} student fee records`}
            icon={CreditCard}
            color="indigo"
          />
          <StatCard
            title="Total Collected"
            value={`₹${summary.paid_fee.toLocaleString('en-IN')}`}
            subtitle={`${summary.paid_records} fully paid records`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Total Pending"
            value={`₹${summary.pending_fee.toLocaleString('en-IN')}`}
            subtitle={`${summary.pending_records} outstanding bills`}
            icon={AlertCircle}
            color="rose"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('fees')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fees'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Student Fee Bills
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Verified Payment Receipts
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'fees' ? 'Search by student name, roll number, semester...' : 'Search by transaction ID, receipt, student...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
        {activeTab === 'fees' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">Paid in Full</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PENDING">Pending Payment</option>
          </select>
        )}
      </div>

      {/* Content Table */}
      {activeTab === 'fees' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Term & Fee Type</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid / Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Collect Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading fees...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-400">No fee records found.</td></tr>
              ) : (
                fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{f.student_name}</div>
                      <div className="text-[11px] font-mono text-indigo-600">{f.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{f.fee_type}</div>
                      <div className="text-[11px] text-slate-500">{f.semester} ({f.academic_year})</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹{parseFloat(f.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-700 font-semibold">
                        Paid: ₹{parseFloat(f.paid_amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-rose-600 font-medium text-[11px]">
                        Due: ₹{parseFloat(f.pending_amount).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{f.due_date}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {f.status !== 'PAID' ? (
                        <button
                          onClick={() => handleOpenPay(f)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Receipt & Txn ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500">Loading receipts...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">No payment receipts found.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-800">{p.receipt_number}</div>
                      <div className="font-mono text-[11px] text-slate-400">{p.transaction_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.student_name}</div>
                      <div className="text-[11px] text-slate-500">{p.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(p.payment_date).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Fee Modal */}
      <Modal isOpen={showAddFeeModal} onClose={() => setShowAddFeeModal(false)} title="Assign Fee Bill to Student">
        <form onSubmit={handleCreateFee} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={feeFormData.student}
              onChange={(e) => setFeeFormData({ ...feeFormData, student: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.student_profile?.student_id || s.username}) - {s.student_profile?.course}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Fee Type</label>
              <select
                value={feeFormData.fee_type}
                onChange={(e) => setFeeFormData({ ...feeFormData, fee_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="TOTAL">Composite Fee (Room & Mess)</option>
                <option value="HOSTEL">Hostel Room Rent</option>
                <option value="MESS">Mess Boarding Charges</option>
                <option value="MAINTENANCE">Maintenance Fee</option>
                <option value="CAUTION">Caution Deposit</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Semester / Term</label>
              <select
                value={feeFormData.semester}
                onChange={(e) => setFeeFormData({ ...feeFormData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Sem 1">Semester 1</option>
                <option value="Sem 2">Semester 2</option>
                <option value="Annual">Annual Fee</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="100"
                required
                value={feeFormData.amount}
                onChange={(e) => setFeeFormData({ ...feeFormData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={feeFormData.due_date}
                onChange={(e) => setFeeFormData({ ...feeFormData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddFeeModal(false)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Counter Payment Collection Modal */}
      {selectedFee && (
        <Modal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          title={`Collect Fee Payment: ${selectedFee.student_name}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Billed:</span>
                <span className="font-semibold text-slate-800">₹{selectedFee.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-semibold text-emerald-600">₹{selectedFee.paid_amount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                <span className="text-slate-700">Remaining Balance:</span>
                <span className="text-rose-600">₹{selectedFee.pending_amount}</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Collection Amount (₹) *</label>
              <input
                type="number"
                step="100"
                max={selectedFee.pending_amount}
                min={1}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="CASH">Cash Counter</option>
                <option value="UPI">UPI / QR Payment</option>
                <option value="BANK_TRANSFER">Bank Wire / NEFT</option>
                <option value="ONLINE">POS Card Swipe</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1"
              >
                {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>Record Receipt</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
