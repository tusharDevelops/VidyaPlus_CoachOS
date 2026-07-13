import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, IndianRupee, CalendarCheck, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@coachos/ui';

const FEATURES = [
  {
    icon: Users,
    title: 'Student Directory',
    description: 'Manage profiles, contacts, and class history in one place.',
  },
  {
    icon: IndianRupee,
    title: 'Fee Operations',
    description: 'Collect payments, send dues reminders, and track revenue.',
  },
  {
    icon: CalendarCheck,
    title: 'Daily Attendance',
    description: 'Mark attendance instantly and spot batch-level gaps.',
  }
];

export default function MobileWelcomePage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features every 3 seconds for a dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 flex flex-col font-sans animate-fade-in relative overflow-hidden">
      
      {/* Top decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-50 dark:from-primary-900/20 to-transparent -z-10" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 pt-12 pb-32">
        
        {/* Logo / Icon */}
        <div className="mb-8 flex justify-center scale-125 transform origin-center">
          <BrandLogo />
        </div>
        
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight mb-3">
          Welcome to MANEZA
        </h1>
        <p className="text-base text-surface-600 dark:text-surface-400 mb-12 max-w-xs">
          The single operating system to manage and grow your coaching institute.
        </p>

        {/* Feature Carousel */}
        <div className="w-full max-w-sm relative min-h-[160px]">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = index === activeFeature;
            return (
              <div 
                key={index}
                className={`absolute inset-0 flex flex-col items-center transition-all duration-500 ease-in-out ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-surface-700 dark:text-surface-300" />
                </div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{feature.title}</h2>
                <p className="text-sm text-surface-600 dark:text-surface-400 px-4">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          {FEATURES.map((_, index) => (
            <div 
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeFeature ? 'w-6 bg-primary-600' : 'w-2 bg-surface-200 dark:bg-surface-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white dark:bg-surface-950 border-t border-surface-100 dark:border-surface-800 z-20">
        <div className="flex flex-col space-y-3 max-w-sm mx-auto">
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-surface-900 dark:bg-white text-white dark:text-surface-900 font-medium rounded-full hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors flex items-center justify-center shadow-md"
          >
            Log in
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="w-full py-3.5 bg-white dark:bg-surface-900 text-surface-900 dark:text-white font-medium rounded-full border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
