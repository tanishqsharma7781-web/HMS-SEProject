import React, { useState, useEffect } from 'react';
import { FileBarChart, Download, Printer, Filter, Building2, CreditCard, Users, LifeBuoy, ClipboardCheck } from 'lucide-react';
import api from '../../api/client';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('students');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/reports/?type=${type}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;
    const headers = Object.keys(reportData.data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of reportData.data) {
      const values = headers.map((header) => {
        const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `hms_${reportType}_report.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const tabs = [
    { type: 'students', label: 'Student Directory', icon: Users },
    { type: 'occupancy', label: 'Room Occupancy', icon: Building2 },
    { type: 'fees', label: 'Fee Collections', icon: CreditCard },
    { type: 'complaints', label: 'Complaints Analysis', icon: LifeBuoy },
    { type: 'attendance', label: 'Attendance Log', icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational & Academic Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export institutional reports for residency, financial audits, and maintenance logs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCSV}
            disabled={!reportData || !reportData.data?.length}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setReportType(tab.type)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{reportData?.title || 'Report Table'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generated: {reportData?.generated_at ? new Date(reportData.generated_at).toLocaleString() : 'Live'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {reportData?.data?.length || 0} Records
          </span>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Generating report data...</div>
          ) : !reportData || !reportData.data || reportData.data.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No records available for this report.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  {Object.keys(reportData.data[0]).map((col) => (
                    <th key={col} className="py-3 px-3.5">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {reportData.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 text-slate-700">
                        {typeof val === 'number' && val > 1000
                          ? `₹${val.toLocaleString('en-IN')}`
                          : val !== null && val !== undefined
                          ? String(val)
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
