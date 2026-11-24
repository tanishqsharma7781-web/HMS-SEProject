import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Receipt, ArrowRight, ShieldCheck, QrCode, Lock } from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';

export const StudentFeesPage = () => {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo Payment Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('ONLINE');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    fetchFeesData();
  }, []);

  const fetchFeesData = async () => {
    setLoading(true);
    try {
      const [sumRes, feeRes, payRes] = await Promise.all([
        api.get('/fees/records/summary/'),
        api.get('/fees/records/'),
        api.get('/fees/payments/')
      ]);
      setFeeSummary(sumRes.data);
      setFees(feeRes.data.results || feeRes.data || []);
      setPayments(payRes.data.results || payRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (fee) => {
    setSelectedFee(fee);
    setPayAmount(fee.pending_amount);
    setPaymentSuccess(null);
    setShowCheckoutModal(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;
    setProcessing(true);

    try {
      // Simulate realistic network delay for demo gateway
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await api.post('/fees/payments/checkout/', {
        fee_id: selectedFee.id,
        amount: payAmount,
        payment_method: payMethod,
        remarks: 'Online portal demonstration payment checkout',
      });

      setPaymentSuccess(res.data.payment);
      setAlertMsg({ type: 'success', text: 'Payment successful! Transaction receipt generated.' });
      fetchFeesData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.error || 'Payment transaction failed.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Hostel & Mess Fee Billing</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review semester fee schedules, payment receipts, and settle dues securely via the student payment gateway
        </p>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Billed"
            value={`₹${summary.total_fee.toLocaleString('en-IN')}`}
            subtitle="Semester 1 & 2 charges"
            icon={CreditCard}
            color="indigo"
          />
          <StatCard
            title="Total Paid"
            value={`₹${summary.paid_fee.toLocaleString('en-IN')}`}
            subtitle="Verified payment transactions"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Pending Due Balance"
            value={`₹${summary.pending_fee.toLocaleString('en-IN')}`}
            subtitle={summary.pending_fee === 0 ? 'All fees settled' : 'Immediate payment required'}
            icon={AlertCircle}
            color={summary.pending_fee === 0 ? 'emerald' : 'rose'}
          />
        </div>
      )}

      {/* Fee Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Hostel Fee Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-2.5 px-3">Academic Term</th>
                <th className="py-2.5 px-3">Fee Type</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Paid Amount</th>
                <th className="py-2.5 px-3">Pending Balance</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-800">{f.semester} ({f.academic_year})</td>
                  <td className="py-3 px-3 text-slate-700">{f.fee_type}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    ₹{parseFloat(f.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600">
                    ₹{parseFloat(f.paid_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-600">
                    ₹{parseFloat(f.pending_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{f.due_date}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {f.status !== 'PAID' ? (
                      <button
                        onClick={() => handleOpenCheckout(f)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Online</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Settled</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Payment Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Verified Payment Receipts</h3>
        <div className="overflow-x-auto">
          {payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No payment receipts on record yet.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-2.5 px-3">Receipt Number</th>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Fee Type</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{p.receipt_number}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.transaction_id}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.fee_type} ({p.fee_semester})</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(p.payment_date).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Demo Online Payment Gateway Modal */}
      {selectedFee && (
        <Modal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          title="Campus Online Fee Gateway (Demonstration Checkout)"
          maxWidth="max-w-md"
        >
          {paymentSuccess ? (
            <div className="space-y-4 text-xs text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Payment Successfully Processed!</h4>
              <p className="text-slate-600">
                A verified digital receipt has been created and your pending balance is updated.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between"><span className="text-slate-500">Receipt No:</span><span className="font-bold text-indigo-700">{paymentSuccess.receipt_number}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Txn ID:</span><span className="text-slate-800">{paymentSuccess.transaction_id}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Amount Paid:</span><span className="font-bold text-emerald-600">₹{parseFloat(paymentSuccess.amount).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date:</span><span>{new Date(paymentSuccess.payment_date).toLocaleString()}</span></div>
              </div>

              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Student:</span>
                  <span className="font-semibold text-slate-800">{selectedFee.student_name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Invoice:</span>
                  <span className="font-semibold text-slate-800">{selectedFee.fee_type} ({selectedFee.semester})</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-indigo-200">
                  <span className="text-slate-700">Outstanding Balance:</span>
                  <span className="text-rose-600 font-black">₹{parseFloat(selectedFee.pending_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="100"
                  max={selectedFee.pending_amount}
                  min={1}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Payment Gateway Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ONLINE', label: 'Debit / Credit Card', icon: CreditCard },
                    { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
                    { id: 'NETBANKING', label: 'Net Banking', icon: ShieldCheck },
                    { id: 'DEMO', label: 'Instant Demo Pay', icon: CheckCircle2 },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                          payMethod === m.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2 text-[11px] text-slate-500">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulated 256-bit SSL secured demonstration payment pipeline.</span>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {processing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Authorize ₹{payAmount || 0}</span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
