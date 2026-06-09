import { useState, useEffect } from 'react';
import { DrillDepth } from '../DashboardDrillDown.tsx';
import api from '../../../../lib/api';
import { Loader2, Plus, Users, Save, Trash2, Calendar, Edit2, AlertCircle } from 'lucide-react';
import ExamModal from '../modals/ExamModal';

interface ExamManagementLayerProps {
  batchId: string | null;
  onNavigate: (depth: DrillDepth, data?: any) => void;
}

export default function ExamManagementLayer({ batchId, onNavigate }: ExamManagementLayerProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  
  // Results view state
  const [activeExamForResults, setActiveExamForResults] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [resultInput, setResultInput] = useState<Record<string, string>>({});
  const [savingResults, setSavingResults] = useState(false);

  const fetchExams = async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/exams/batch/${batchId}`);
      setExams(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!batchId) return;
    try {
      const { data } = await api.get(`/students`, { params: { batchId, limit: 100 } });
      setStudents(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, [batchId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam and all its results?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
      if (activeExamForResults?.id === id) setActiveExamForResults(null);
    } catch (err) {
      alert('Failed to delete exam');
    }
  };

  const openResultsView = (exam: any) => {
    setActiveExamForResults(exam);
    // Pre-fill existing results
    const initialMarks: Record<string, string> = {};
    if (exam.results) {
      exam.results.forEach((r: any) => {
        initialMarks[r.studentId] = String(r.marksObtained);
      });
    }
    setResultInput(initialMarks);
  };

  const saveResults = async () => {
    if (!activeExamForResults) return;
    setSavingResults(true);
    try {
      const payload = {
        results: Object.entries(resultInput).map(([studentId, marks]) => ({
          studentId,
          marksObtained: Number(marks),
        })).filter(r => !isNaN(r.marksObtained))
      };

      if (payload.results.length === 0) {
        alert('No valid marks entered');
        setSavingResults(false);
        return;
      }

      await api.post(`/exams/${activeExamForResults.id}/results`, payload);
      alert('Results saved successfully!');
      fetchExams();
      setActiveExamForResults(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save results');
    } finally {
      setSavingResults(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-ink uppercase tracking-widest">Exam Management</h2>
          <p className="text-xs font-bold text-steel uppercase tracking-widest mt-1">Manage offline tests and results</p>
        </div>
        <button 
          onClick={() => { setSelectedExam(null); setShowExamModal(true); }}
          className="mint-btn-brand bg-brand-blue hover:bg-brand-blue border-brand-blue py-2 px-4 text-xs flex items-center shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Exam
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Exam List */}
        <div className={`space-y-4 ${activeExamForResults ? 'lg:col-span-1 hidden lg:block' : 'lg:col-span-3'}`}>
          <h3 className="text-sm font-black text-ink uppercase tracking-widest border-b border-hairline pb-2">Past Exams</h3>
          
          {exams.length === 0 ? (
            <div className="p-8 text-center border-2 border-hairline border-dashed rounded-xl bg-surface/30">
              <p className="text-sm text-ink font-bold">No exams found</p>
              <p className="text-xs text-steel mt-1">Click Create Exam to add a new test.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${activeExamForResults ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
              {exams.map(exam => (
                <div 
                  key={exam.id} 
                  className={`bg-canvas border rounded-lg p-5 transition-all cursor-pointer ${activeExamForResults?.id === exam.id ? 'border-brand-blue shadow-md ring-1 ring-brand-blue/30' : 'border-hairline hover:border-brand-blue/30 hover:shadow-sm'}`}
                  onClick={() => openResultsView(exam)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-ink truncate pr-2">{exam.title}</h4>
                    <span className="text-xs font-black text-steel bg-surface px-2 py-1 rounded">
                      {exam.maxMarks} M
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs font-bold text-steel uppercase tracking-widest mb-4">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(exam.date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                      {exam.results?.length || 0} Results Logged
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}
                      className="text-brand-error hover:bg-brand-error/10 p-1.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Enter Results View */}
        {activeExamForResults && (
          <div className="lg:col-span-2 bg-canvas border border-hairline rounded-xl shadow-premium overflow-hidden flex flex-col h-[600px] animate-slide-up">
            <div className="p-5 border-b border-hairline bg-surface flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-ink uppercase tracking-widest flex items-center">
                  Enter Results: <span className="text-brand-blue ml-2">{activeExamForResults.title}</span>
                </h3>
                <p className="text-xs font-bold text-steel mt-1 uppercase tracking-widest">
                  Max Marks: {activeExamForResults.maxMarks}
                </p>
              </div>
              <button 
                onClick={() => setActiveExamForResults(null)}
                className="text-xs font-bold text-steel hover:text-ink uppercase tracking-widest"
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/50 border-b border-hairline sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate uppercase tracking-widest w-48">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-surface-soft transition-colors">
                      <td className="px-6 py-3 font-bold text-ink">
                        {student.name}
                        <div className="text-[10px] font-black text-steel mt-0.5">{student.profile?.studentCode}</div>
                      </td>
                      <td className="px-6 py-3">
                        <input 
                          type="number"
                          min="0"
                          max={activeExamForResults.maxMarks}
                          value={resultInput[student.id] || ''}
                          onChange={(e) => setResultInput({ ...resultInput, [student.id]: e.target.value })}
                          placeholder="—"
                          className="w-full bg-surface border border-hairline rounded px-3 py-2 text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t border-hairline bg-surface flex justify-end shrink-0">
              <button 
                onClick={saveResults}
                disabled={savingResults}
                className="mint-btn-brand bg-brand-blue hover:bg-brand-blue border-brand-blue py-2.5 px-6 text-xs flex items-center disabled:opacity-50"
              >
                {savingResults ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save All Results
              </button>
            </div>
          </div>
        )}
      </div>

      {showExamModal && (
        <ExamModal 
          batchId={batchId!}
          onClose={() => setShowExamModal(false)}
          onSaved={() => { setShowExamModal(false); fetchExams(); }}
        />
      )}
    </div>
  );
}
