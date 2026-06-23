import { useState, useEffect } from 'react';
import { Award, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function MyExamsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get('/exams/my-results');
        setResults(data.data || []);
      } catch (err) {
        console.error('Failed to fetch exam results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-surface text-ink-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">My Exams</h1>
          <p className="text-xs text-steel">View your academic performance</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
          <p className="text-[10px] font-bold text-steel uppercase tracking-widest">Loading results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="mint-card p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-stone" />
          </div>
          <p className="text-sm font-bold text-ink">No exam results found</p>
          <p className="text-xs text-steel mt-1">Your scores will appear here once published by your institute.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((result: any) => {
            const percentage = Math.round((result.marksObtained / result.exam.maxMarks) * 100);
            const isPass = percentage >= 40; // Assuming 40% is passing threshold
            
            return (
              <div key={result.id} className="mint-card p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isPass ? 'bg-brand-green-soft' : 'bg-rose-50'
                  }`}>
                    <Award className={`w-5 h-5 ${isPass ? 'text-brand-green-deep' : 'text-brand-error'}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{result.exam.title}</h3>
                    <p className="text-[11px] text-steel mt-0.5">
                      {new Date(result.exam.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className={`text-xl font-black font-mono ${isPass ? 'text-brand-green-deep' : 'text-brand-error'}`}>
                      {result.marksObtained}
                    </span>
                    <span className="text-xs font-bold text-stone">/ {result.exam.maxMarks}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isPass ? 'text-brand-green' : 'text-brand-warn'}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
