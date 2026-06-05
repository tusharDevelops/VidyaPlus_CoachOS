import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Image as ImageIcon, 
  BookOpen, 
  UserPlus, 
  Receipt,
  Trophy,
  Lock,
  ChevronRight,
  Loader2,
  Camera,
  MapPin
} from 'lucide-react';

interface SetupWizardProps {
  stats: {
    totalStudents: number;
    totalBatches: number;
    totalCollected: number;
  };
  institute: {
    logoUrl?: string | null;
    address?: string | null;
  } | null;
  onRefresh: () => void;
}

export default function SetupWizard({ stats, institute, onRefresh }: SetupWizardProps) {
  const navigate = useNavigate();
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [address, setAddress] = useState(institute?.address || '');
  const [logoUrl, setLogoUrl] = useState(institute?.logoUrl || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Sync state with props when they change (e.g. after onRefresh)
  useEffect(() => {
    if (institute) {
      setAddress(institute.address || '');
      setLogoUrl(institute.logoUrl || '');
    }
  }, [institute]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
    } catch (err) {
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please enter an address');
      return;
    }

    setBrandingLoading(true);
    try {
      await api.patch('/settings/profile', {
        address,
        logoUrl: logoUrl || null
      });
      onRefresh(); // Refresh dashboard data to move to next step
    } catch (err) {
      alert('Failed to update branding');
    } finally {
      setBrandingLoading(false);
    }
  };

  const steps = [
    {
      id: 'profile',
      title: 'Brand Your Institute',
      description: 'Upload your logo and add your address. This will appear on all your digital receipts and reports.',
      icon: ImageIcon,
      completed: !!institute?.address,
      path: '/settings',
      actionLabel: 'Save Branding',
      tip: 'Centers with logos see 40% higher parent trust.'
    },
    {
      id: 'batch',
      title: 'Create Your First Batch',
      description: 'Define a class or cohort. This is how you organize your students and schedules.',
      icon: BookOpen,
      completed: stats.totalBatches > 0,
      path: '/batches',
      actionLabel: 'Create Batch',
      tip: 'You can set specific timings and subjects for each batch.'
    },
    {
      id: 'student',
      title: 'Enroll a Student',
      description: 'Add your first student and link them to the batch you just created.',
      icon: UserPlus,
      completed: stats.totalStudents > 0,
      path: '/students',
      actionLabel: 'Add Student',
      tip: 'We automatically generate a Student ID for every enrollment.'
    },
    {
      id: 'fee',
      title: 'Collect First Fee',
      description: 'Generate a fee receipt. This will test your email/SMS alerts and branding.',
      icon: Receipt,
      completed: stats.totalCollected > 0,
      path: '/fees',
      actionLabel: 'Generate Receipt',
      tip: 'Digital receipts are sent instantly to parents via WhatsApp/Email.'
    }
  ];

  const firstIncompleteIndex = steps.findIndex(s => !s.completed);
  const isAllComplete = firstIncompleteIndex === -1;
  const activeStepIndex = isAllComplete ? -1 : firstIncompleteIndex;

  if (isAllComplete) {
    return (
      <div className="mint-card p-3 sm:p-8 bg-brand-green-soft border-brand-green/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-green border-4 border-brand-green/10">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-ink">You're all set!</h3>
            <p className="text-charcoal opacity-80 max-w-md">Your institute is now fully operational. You can start scaling your operations and managing more students.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/reports')}
          className="mint-btn-brand whitespace-nowrap h-12 px-3 sm:px-8"
        >
          Explore Analytics
        </button>
      </div>
    );
  }

  return (
    <div className="mint-card overflow-hidden animate-fade-in">
      <div className="p-6 bg-surface/50 border-b border-hairline">
        <div className="flex items-center gap-3 mb-1">
          <div className="px-2 py-0.5 rounded bg-brand-green text-[10px] font-bold text-primary uppercase tracking-widest">
            Setup Wizard
          </div>
          <h3 className="text-lg font-bold text-ink tracking-tight">Finish Setting Up Your Academy</h3>
        </div>
        <p className="text-sm text-steel">Follow these steps in order to unlock all features.</p>
      </div>

      <div className="flex flex-col">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isLocked = index > activeStepIndex && !isAllComplete;
          const isDone = step.completed;

          return (
            <div 
              key={step.id}
              className={`relative flex gap-6 p-6 transition-all duration-300 ${
                isActive ? 'bg-white' : isLocked ? 'bg-surface/30 grayscale opacity-60' : 'bg-surface/10'
              } ${index !== steps.length - 1 ? 'border-b border-hairline' : ''}`}
            >
              {/* Stepper Line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[39px] top-[70px] bottom-[-20px] w-0.5 bg-hairline z-0" />
              )}

              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone 
                    ? 'bg-brand-green border-brand-green text-primary' 
                    : isActive 
                      ? 'bg-white border-brand-green text-brand-green shadow-[0_0_15px_rgba(0,212,164,0.3)]' 
                      : 'bg-white border-hairline text-steel'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 opacity-40" />
                  ) : (
                    <span className="text-sm font-bold font-mono">{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-grow space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-grow max-w-2xl">
                    <h4 className={`text-base font-bold tracking-tight ${isDone ? 'text-steel line-through' : 'text-ink'}`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm mt-1 leading-relaxed ${isActive ? 'text-charcoal' : 'text-steel'}`}>
                      {step.description}
                    </p>

                    {/* Step 1 Inline Form */}
                    {isActive && step.id === 'profile' && (
                      <form onSubmit={handleBrandingSubmit} className="mt-6 p-5 rounded-2xl bg-surface border border-hairline space-y-4 animate-slide-up">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Logo Upload */}
                          <div className="flex-shrink-0">
                            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2">Institute Logo</label>
                            <div className="relative group">
                              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-hairline bg-white flex items-center justify-center overflow-hidden transition-colors group-hover:border-brand-green/50">
                                {logoUrl ? (
                                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-8 h-8 text-steel" />
                                )}
                                {uploadingLogo && (
                                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
                                  </div>
                                )}
                              </div>
                              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                <Camera className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                              </label>
                            </div>
                            <p className="text-[10px] text-steel mt-3 italic">Max 2MB. PNG/JPG.</p>
                          </div>

                          {/* Address Input */}
                          <div className="flex-grow space-y-4">
                            <div>
                              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2">Office Address</label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-steel" />
                                <textarea 
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  rows={3}
                                  placeholder="Complete address for invoices..."
                                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-hairline rounded-xl text-sm outline-none focus:border-brand-green transition-all"
                                  required
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={brandingLoading || uploadingLogo}
                              className="mint-btn-brand w-full h-10 gap-2"
                            >
                              {brandingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="hidden" />}
                              Complete Step 1 <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Default Action Button for other steps */}
                    {isActive && step.id !== 'profile' && (
                      <button
                        onClick={() => navigate(step.path)}
                        className="mt-6 mint-btn-primary h-10 px-6 group"
                      >
                        {step.actionLabel} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                {isActive && step.tip && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-surface border border-hairline text-[11px] font-medium text-charcoal">
                    <span className="text-brand-green font-bold uppercase tracking-widest bg-brand-green-soft px-1.5 py-0.5 rounded">Pro Tip</span>
                    {step.tip}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Save(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
