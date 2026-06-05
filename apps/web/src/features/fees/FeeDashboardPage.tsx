import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Wallet, TrendingUp, AlertCircle, FileText, ChevronRight,
  Loader2, Search, CheckCircle2, User,
  PlusCircle, CreditCard, ArrowUpRight, ArrowDownRight,
  Users, UserCheck, Banknote, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeeCollectionDrawer from './components/FeeCollectionDrawer';
import PayrollDrawer from './components/PayrollDrawer';

interface FinanceKPIs {
  revenue: {
    totalCollected: number;
    totalOutstanding: number;
    defaulters: number;
  };
  expense: {
    totalPaid: number;
    totalPending: number;
  };
}

interface SearchResult {
  id: string;
  name: string;
  type: 'student' | 'staff';
  subtext: string;
  code: string;
}

interface OverdueRecord {
  id: string;
  studentId: string;
  studentName: string;
  planName: string;
  dueDate: string;
  periodLabel: string;
  amount: number;
  balance: number;
}

interface StaffRecord {
  id: string;
  name: string;
  role: string;
  baseSalary: number;
  status: string;
}

export default function FeeDashboardPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null);
  const [overdueList, setOverdueList] = useState<OverdueRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const fetchFinanceData = async () => {
    try {
      const [feeRes, payrollRes, staffRes] = await Promise.all([
        api.get('/fees/dashboard'),
        api.get('/staff/payroll'),
        api.get('/staff')
      ]);

      const feeData = feeRes.data.data;
      const payrollData = payrollRes.data.data;
      const staffData = staffRes.data.data;

      setKpis({
        revenue: {
          totalCollected: feeData.kpis.totalCollected,
          totalOutstanding: feeData.kpis.totalOutstanding,
          defaulters: feeData.kpis.overdueRecordsCount
        },
        expense: {
          totalPaid: payrollData.totalPaid || 0,
          totalPending: 0 // Will implement logic for pending salaries if needed
        }
      });

      setOverdueList(feeData.overdueList || []);
      setStaffList(staffData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const [studentRes, staffRes] = await Promise.all([
          api.get('/students', { params: { search: searchQuery, limit: 3 } }),
          api.get('/staff', { params: { search: searchQuery, limit: 2 } }).catch(() => ({ data: { data: [] } }))
        ]);

        const students = studentRes.data.data.map((s: any) => ({
          id: s.id, name: s.name, type: 'student', code: s.studentProfile?.studentCode || 'STU', subtext: 'Collect Fee'
        }));
        
        const staff = (staffRes.data?.data || []).map((s: any) => ({
          id: s.id, name: s.name, type: 'staff', code: s.employeeId || 'STAFF', subtext: 'Pay Salary'
        }));

        setSearchResults([...students, ...staff]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading && !kpis) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest mt-6">Loading Money Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20 max-w-[1400px] mx-auto px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 pt-8">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Money & Salaries</h1>
          <p className="text-sm text-slate font-medium">Track your earnings from students and payments to staff.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isSearching ? <Loader2 className="w-3.5 h-3.5 text-brand-green animate-spin" /> : <Search className="w-3.5 h-3.5 text-steel group-focus-within:text-brand-green transition-colors" />}
            </div>
            <input
              type="text"
              placeholder="Search Student or Staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-5 bg-surface border border-hairline rounded-xl text-sm font-medium focus:border-brand-green transition-all outline-none"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-canvas rounded-xl shadow-premium border border-hairline overflow-hidden z-[100] p-1.5 animate-slide-up">
                {searchResults.map(s => (
                  <button key={s.id} 
                    onClick={() => { 
                      if (s.type === 'student') setSelectedStudentId(s.id);
                      else setSelectedStaffId(s.id);
                      setSearchQuery(''); 
                      setSearchResults([]); 
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-surface flex items-center gap-4 rounded-lg transition-all group/item">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${s.type === 'student' ? 'bg-brand-green-soft text-brand-green-deep' : 'bg-brand-tag/10 text-brand-tag'}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink group-hover/item:text-brand-green transition-colors">{s.name}</p>
                      <span className="text-[10px] text-steel font-medium uppercase tracking-widest">{s.subtext}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted group-hover/item:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface p-1 rounded-xl border border-hairline flex gap-1">
             <button onClick={() => setActiveTab('students')}
               className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'students' ? 'bg-primary text-on-primary shadow-sm' : 'text-steel hover:text-ink'}`}>
               Student Fees
             </button>
             <button onClick={() => setActiveTab('staff')}
               className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'staff' ? 'bg-primary text-on-primary shadow-sm' : 'text-steel hover:text-ink'}`}>
               Staff Salaries
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
         <div className="lg:col-span-1 bg-brand-green/5 rounded-2xl p-3 sm:p-8 border border-brand-green/10 flex flex-col justify-between">
            <div>
               <div className="w-10 h-10 rounded-xl bg-brand-green text-primary flex items-center justify-center mb-6">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <p className="text-[11px] font-bold text-steel uppercase tracking-widest mb-1">Total Earnings</p>
               <h2 className="text-4xl font-bold text-ink font-mono tracking-tight">₹{kpis?.revenue.totalCollected.toLocaleString()}</h2>
               <p className="text-[10px] text-brand-green-deep font-bold mt-2 uppercase tracking-widest">On Track</p>
            </div>
         </div>

         <div className="mint-card p-3 sm:p-8 flex flex-col justify-between">
            <div>
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${activeTab === 'students' ? 'bg-rose-50 text-brand-error' : 'bg-brand-tag/10 text-brand-tag'}`}>
                  {activeTab === 'students' ? <AlertCircle className="w-5 h-5" /> : <Users className="w-5 h-5" />}
               </div>
               <p className="text-[11px] font-bold text-steel uppercase tracking-widest mb-1">{activeTab === 'students' ? 'Students with Pending Fees' : 'Staff Salaries Owed'}</p>
               <h3 className="text-4xl font-bold text-ink font-mono tracking-tight">
                  {activeTab === 'students' ? kpis?.revenue.defaulters : '₹0'}
               </h3>
            </div>
            <div className="mt-8">
               <button className="text-xs font-bold text-ink hover:text-brand-green transition-colors flex items-center gap-2">
                  View Detail List <ChevronRight className="w-3.5 h-3.5" />
               </button>
            </div>
         </div>

         <div className="mint-card p-3 sm:p-8 flex flex-col justify-between border-brand-green/20">
            <div>
               <div className="w-10 h-10 rounded-xl bg-surface text-ink border border-hairline flex items-center justify-center mb-6">
                  <CreditCard className="w-5 h-5" />
               </div>
               <p className="text-[11px] font-bold text-steel uppercase tracking-widest mb-1">{activeTab === 'students' ? 'Total Pending Fees' : 'Salaries Paid Overall'}</p>
               <h3 className="text-4xl font-bold text-ink font-mono tracking-tight">₹{activeTab === 'students' ? kpis?.revenue.totalOutstanding.toLocaleString() : kpis?.expense.totalPaid.toLocaleString()}</h3>
            </div>
            <div className="mt-8">
               <button 
                  onClick={() => setActiveTab(activeTab === 'students' ? 'staff' : 'students')}
                  className="mint-btn-primary w-full text-[10px] uppercase tracking-widest py-3"
               >
                  {activeTab === 'students' ? 'Switch to Staff' : 'Switch to Students'}
               </button>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest">{activeTab === 'students' ? 'Upcoming Fee Collections' : 'Staff Salary List'}</h2>
            <button onClick={fetchFinanceData} className="p-1.5 text-steel hover:text-ink transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
               Refresh <Banknote className="w-3 h-3" />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'students' ? (
              overdueList.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-surface/30 rounded-2xl border border-dashed border-hairline">
                  <p className="text-xs font-bold text-slate uppercase tracking-widest">No pending collections found</p>
                </div>
              ) : (
                overdueList.map((d) => (
                  <div key={d.id} className="mint-card p-5 hover:border-brand-green transition-all group cursor-pointer"
                    onClick={() => setSelectedStudentId(d.studentId)}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-hairline text-ink flex items-center justify-center font-bold">
                              {d.studentName.charAt(0)}
                          </div>
                          <div>
                              <p className="text-sm font-bold text-ink">{d.studentName}</p>
                              <p className="text-[10px] font-medium text-slate uppercase tracking-widest mt-0.5">{d.planName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink font-mono">₹{d.balance.toLocaleString()}</p>
                          <p className="text-[9px] font-bold uppercase mt-1 text-brand-error">LATE</p>
                        </div>
                    </div>
                    <button className="w-full mt-5 py-2 rounded-lg bg-surface text-[10px] font-bold uppercase tracking-widest text-ink group-hover:bg-brand-green group-hover:text-primary transition-all">
                        Collect Fee
                    </button>
                  </div>
                ))
              )
            ) : (
              staffList.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-surface/30 rounded-2xl border border-dashed border-hairline">
                  <p className="text-xs font-bold text-slate uppercase tracking-widest">No staff members found</p>
                </div>
              ) : (
                staffList.map((s) => (
                  <div key={s.id} className="mint-card p-5 hover:border-brand-tag transition-all group cursor-pointer"
                    onClick={() => setSelectedStaffId(s.id)}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-hairline text-ink flex items-center justify-center font-bold">
                              {s.name.charAt(0)}
                          </div>
                          <div>
                              <p className="text-sm font-bold text-ink">{s.name}</p>
                              <p className="text-[10px] font-medium text-slate uppercase tracking-widest mt-0.5">{s.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink font-mono">₹{Number(s.baseSalary).toLocaleString()}</p>
                          <p className="text-[9px] font-bold uppercase mt-1 text-brand-tag">Monthly</p>
                        </div>
                    </div>
                    <button className="w-full mt-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-brand-tag text-white hover:opacity-90">
                        Pay Salary
                    </button>
                  </div>
                ))
              )
            )}
         </div>
      </div>

      <FeeCollectionDrawer 
        studentId={selectedStudentId} 
        onClose={() => setSelectedStudentId(null)}
        onSuccess={fetchFinanceData}
      />

      <PayrollDrawer
        staffId={selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
        onSuccess={fetchFinanceData}
      />
    </div>
  );
}
