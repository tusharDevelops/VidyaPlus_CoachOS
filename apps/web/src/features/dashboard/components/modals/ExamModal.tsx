import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

interface ExamModalProps {
  batchId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExamModal({ batchId, onClose, onSaved }: ExamModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    maxMarks: '100',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/exams', {
        batchId,
        title: formData.title,
        date: formData.date,
        maxMarks: Number(formData.maxMarks),
        description: formData.description,
      });
      onSaved();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas rounded-2xl w-full max-w-md shadow-premium border border-hairline overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-hairline flex justify-between items-center bg-surface">
          <h2 className="text-sm font-black uppercase tracking-widest text-ink">Create Offline Exam</h2>
          <button onClick={onClose} className="text-steel hover:text-ink transition-colors p-1 rounded-md hover:bg-surface-soft">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-steel mb-2 uppercase tracking-widest">Exam Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                placeholder="e.g. Midterm Test 1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-steel mb-2 uppercase tracking-widest">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-steel mb-2 uppercase tracking-widest">Max Marks</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-steel mb-2 uppercase tracking-widest">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-sm font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all resize-none h-24"
                placeholder="Topics covered..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-steel hover:bg-surface border border-hairline transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mint-btn-brand bg-brand-blue hover:bg-brand-blue border-brand-blue flex items-center px-6 py-2.5"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
