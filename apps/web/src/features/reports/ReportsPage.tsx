import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  TrendingUp, IndianRupee, Calendar, BarChart2, CheckCircle2,
  AlertCircle, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface FeeSummary {
  totalDues: number;
  totalCollected: number;
  totalOutstanding: number;
  batchSummary: {
    batchId: string;
    batchName: string;
    collected: number;
    outstanding: number;
    total: number;
  }[];
  monthSummary: {
    month: string;
    collected: number;
    outstanding: number;
  }[];
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
  batchSummary: {
    batchId: string;
    batchName: string;
    attendanceRate: number;
    total: number;
    present: number;
    absent: number;
    late: number;
  }[];
}

export default function ReportsPage() {
  const [feeData, setFeeData] = useState<FeeSummary | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'financial' | 'attendance'>('financial');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [fRes, aRes] = await Promise.all([
        api.get('/reports/fee-summary'),
        api.get('/reports/attendance-summary'),
      ]);
      setFeeData(fRes.data.data);
      setAttendanceData(aRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-500" /> Institute Analytics Hub
          </h1>
          <p className="text-sm text-surface-500 mt-1">Cross-module operational and financial breakdown reports</p>
        </div>
        <button onClick={fetchReports}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-surface-50 text-surface-700 rounded-2xl border border-surface-200 text-sm font-bold transition-all shadow-sm active:scale-[0.98]">
          <RefreshCw className="w-5 h-5" /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-surface-100 border border-surface-200 rounded-2xl mb-8 max-w-sm">
        <button onClick={() => setActiveTab('financial')}
          className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${activeTab === 'financial' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-800'}`}>
          Financial Overview
        </button>
        <button onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-800'}`}>
          Attendance Trends
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!loading && activeTab === 'financial' && feeData && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Total Dues Generated</p>
                <h3 className="text-3xl font-black text-surface-900 mt-2">₹{feeData.totalDues.toLocaleString()}</h3>
                <span className="text-[11px] text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">All Billing Periods</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                <IndianRupee className="w-7 h-7" />
              </div>
            </div>

            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Total Fees Collected</p>
                <h3 className="text-3xl font-black text-accent-700 mt-2">₹{feeData.totalCollected.toLocaleString()}</h3>
                <span className="text-[11px] text-accent-700 bg-accent-50 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">Received</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600">
                <ArrowUpRight className="w-7 h-7" />
              </div>
            </div>

            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Total Outstanding</p>
                <h3 className="text-3xl font-black text-danger-600 mt-2">₹{feeData.totalOutstanding.toLocaleString()}</h3>
                <span className="text-[11px] text-danger-700 bg-danger-50 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">Awaiting Payment</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center text-danger-600">
                <ArrowDownRight className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Batch Performance Breakdown */}
          <div className="bg-white rounded-3xl shadow-card border border-surface-100 overflow-hidden">
            <div className="px-3 sm:px-8 py-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
              <h3 className="font-bold text-surface-900 text-xl">Breakdown by Batch</h3>
              <span className="text-[11px] font-bold text-primary-700 bg-primary-50/50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-primary-100/50">Financial Performance</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50/50 text-[11px] uppercase tracking-widest text-surface-400 font-bold border-b border-surface-100">
                    <th className="px-3 sm:px-8 py-5">Batch Name</th>
                    <th className="px-3 sm:px-8 py-5">Paid Collections</th>
                    <th className="px-3 sm:px-8 py-5">Pending Balances</th>
                    <th className="px-3 sm:px-8 py-5">Total Billings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {feeData.batchSummary.length === 0 ? (
                    <tr><td colSpan={4} className="px-3 sm:px-8 py-10 text-center text-surface-400">No batch records found.</td></tr>
                  ) : (
                    feeData.batchSummary.map(b => (
                      <tr key={b.batchId} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-3 sm:px-8 py-5 font-bold text-surface-900">{b.batchName}</td>
                        <td className="px-3 sm:px-8 py-5 font-bold text-accent-700">₹{b.collected.toLocaleString()}</td>
                        <td className="px-3 sm:px-8 py-5 font-bold text-danger-600">₹{b.outstanding.toLocaleString()}</td>
                        <td className="px-3 sm:px-8 py-5 font-bold text-surface-700">₹{b.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'attendance' && attendanceData && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Attendance Rate</p>
                <h3 className="text-3xl font-black text-surface-900 mt-2">{attendanceData.attendanceRate}%</h3>
                <span className="text-[11px] text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">Cumulative</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                <BarChart2 className="w-7 h-7" />
              </div>
            </div>

            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Present Checkins</p>
                <h3 className="text-3xl font-black text-accent-700 mt-2">{attendanceData.present}</h3>
                <span className="text-[11px] text-accent-700 bg-accent-50 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">Sessions</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>

            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Absences Logged</p>
                <h3 className="text-3xl font-black text-danger-600 mt-2">{attendanceData.absent}</h3>
                <span className="text-[11px] text-danger-700 bg-danger-50 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">Missed</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center text-danger-600">
                <AlertCircle className="w-7 h-7" />
              </div>
            </div>

            <div className="p-3 sm:p-8 bg-white border border-surface-100 rounded-3xl shadow-card flex items-center justify-between hover:shadow-premium transition-shadow duration-300">
              <div>
                <p className="text-sm text-surface-500 font-bold uppercase tracking-wider">Late Entries</p>
                <h3 className="text-3xl font-black text-surface-700 mt-2">{attendanceData.late}</h3>
                <span className="text-[11px] text-surface-600 bg-surface-100 px-2.5 py-1 rounded-lg font-bold inline-block mt-3 uppercase tracking-widest">Delayed</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-600">
                <Calendar className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Attendance breakdown by batch */}
          <div className="bg-white rounded-3xl shadow-card border border-surface-100 overflow-hidden">
            <div className="px-3 sm:px-8 py-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
              <h3 className="font-bold text-surface-900 text-xl">Attendance by Batch</h3>
              <span className="text-[11px] font-bold text-primary-700 bg-primary-50/50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-primary-100/50">Student Matrix</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50/50 text-[11px] uppercase tracking-widest text-surface-400 font-bold border-b border-surface-100">
                    <th className="px-3 sm:px-8 py-5">Batch Name</th>
                    <th className="px-3 sm:px-8 py-5">Attendance Rate</th>
                    <th className="px-3 sm:px-8 py-5">Present</th>
                    <th className="px-3 sm:px-8 py-5">Absent</th>
                    <th className="px-3 sm:px-8 py-5">Total Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {attendanceData.batchSummary.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 sm:px-8 py-10 text-center text-surface-400">No attendance trends found.</td></tr>
                  ) : (
                    attendanceData.batchSummary.map(b => (
                      <tr key={b.batchId} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-3 sm:px-8 py-5 font-bold text-surface-900">{b.batchName}</td>
                        <td className="px-3 sm:px-8 py-5">
                          <span className={`px-3 py-1 text-sm font-bold rounded-xl ${b.attendanceRate >= 75 ? 'bg-accent-50 text-accent-700 border border-accent-100' : 'bg-danger-50 text-danger-700 border border-danger-100'}`}>
                            {b.attendanceRate}%
                          </span>
                        </td>
                        <td className="px-3 sm:px-8 py-5 font-bold text-accent-700">{b.present}</td>
                        <td className="px-3 sm:px-8 py-5 font-bold text-danger-600">{b.absent}</td>
                        <td className="px-3 sm:px-8 py-5 font-bold text-surface-600">{b.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
