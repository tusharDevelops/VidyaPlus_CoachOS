import { useParams, useNavigate } from 'react-router-dom';
import StudentDetailLayer from '../dashboard/components/explorer/StudentDetailLayer';
import { ArrowLeft } from 'lucide-react';

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  if (!studentId) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center gap-4 border-b border-hairline pb-6">
        <button 
          onClick={() => navigate('/students')}
          className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center text-stone hover:bg-canvas hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest">Student Profile</h1>
          <p className="text-sm text-slate mt-1">Detailed overview of student academics, fees, and communication.</p>
        </div>
      </div>

      <div className="bg-canvas rounded-xl shadow-sm border border-hairline overflow-hidden">
        <StudentDetailLayer 
          studentId={studentId} 
          onNavigate={() => navigate('/students')} 
        />
      </div>
    </div>
  );
}
