import { useState } from 'react';
import { ChevronRight, Home, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import StaffOverviewLayer from './layers/StaffOverviewLayer';
import StaffBatchesLayer from './layers/StaffBatchesLayer';
import StaffStudentsLayer from './layers/StaffStudentsLayer';
import StaffStudentDetailLayer from './layers/StaffStudentDetailLayer';
import StaffAttendanceMarkingLayer from './layers/StaffAttendanceMarkingLayer';
import StaffStaffGridLayer from './layers/StaffStaffGridLayer.tsx';
import StaffStaffDetailLayer from './layers/StaffStaffDetailLayer.tsx';
import StaffStaffAttendanceLayer from './layers/StaffStaffAttendanceLayer.tsx';
import StaffExamManagementLayer from './layers/StaffExamManagementLayer.tsx';
import { DrillDepth } from './types';

function AccessDeniedLayer({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 sm:px-8 text-center bg-canvas border border-hairline rounded-[2.5rem] space-y-6 shadow-premium-subtle animate-fade-in">
      <div className="w-20 h-20 bg-brand-error/10 rounded-full flex items-center justify-center text-brand-error">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-ink uppercase tracking-widest">Access Restricted</h3>
        <p className="text-sm text-steel font-medium max-w-sm mx-auto leading-relaxed">
          You don't have the required permissions to access this module. Please contact your administrator for more information.
        </p>
      </div>
      <button 
        onClick={onBack}
        className="px-4 sm:px-8 py-3 bg-ink text-canvas rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-ink/90 transition-all shadow-premium"
      >
        Return to Dashboard
      </button>
    </div>
  );
}

export default function DashboardDrillDown() {
  const { hasPermission } = useAuthStore();
  const [depth, setDepth] = useState<DrillDepth>('HOME');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const navigateTo = (newDepth: DrillDepth, data?: { batchId?: string; studentId?: string; staffId?: string }) => {
    setDepth(newDepth);
    if (data?.batchId) setSelectedBatchId(data.batchId);
    if (data?.studentId) setSelectedStudentId(data.studentId);
    if (data?.staffId) setSelectedStaffId(data.staffId);
  };

  const checkAccess = (target: DrillDepth) => {
    switch (target) {
      case 'HOME': return true;
      case 'BATCHES': return hasPermission('batches.view');
      case 'STUDENTS': 
      case 'STUDENT_DETAIL': return hasPermission('students.view');
      case 'ATTENDANCE': return hasPermission('attendance.mark');
      case 'EXAMS': return hasPermission('exams.view') || hasPermission('exams.manage');
      case 'STAFF':
      case 'STAFF_DETAIL': return hasPermission('staff.view');
      case 'STAFF_ATTENDANCE': return hasPermission('staff.view');
      default: return false;
    }
  };

  const isAllowed = checkAccess(depth);

  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumb Navigation */}
      {depth !== 'HOME' && (
        <nav className="flex items-center space-x-2 text-sm">
          <button 
            onClick={() => navigateTo('HOME')}
            className="flex items-center text-steel hover:text-ink transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </button>
          
          {(depth === 'BATCHES' || depth === 'STUDENTS' || depth === 'STUDENT_DETAIL' || depth === 'EXAMS' || depth === 'ATTENDANCE') && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <button 
                onClick={() => navigateTo('BATCHES')}
                className={`transition-colors ${depth === 'BATCHES' ? 'text-ink font-medium' : 'text-steel hover:text-ink'}`}
              >
                Batches
              </button>
            </>
          )}

          {(depth === 'STUDENTS' || depth === 'STUDENT_DETAIL' || depth === 'EXAMS') && selectedBatchId && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <button 
                onClick={() => navigateTo('STUDENTS')}
                className={`transition-colors ${depth === 'STUDENTS' ? 'text-ink font-medium' : 'text-steel hover:text-ink'}`}
              >
                Students
              </button>
            </>
          )}

          {depth === 'STUDENT_DETAIL' && selectedStudentId && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <span className="text-ink font-medium">Details</span>
            </>
          )}

          {depth === 'EXAMS' && selectedBatchId && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <span className="text-ink font-medium">Exams</span>
            </>
          )}

          {(depth === 'STAFF' || depth === 'STAFF_DETAIL' || depth === 'STAFF_ATTENDANCE') && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <button 
                onClick={() => navigateTo('STAFF')}
                className={`transition-colors ${depth === 'STAFF' ? 'text-ink font-medium' : 'text-steel hover:text-ink'}`}
              >
                Staff
              </button>
            </>
          )}

          {(depth === 'STAFF_DETAIL' || depth === 'STAFF_ATTENDANCE') && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <span className="text-ink font-medium">
                {depth === 'STAFF_DETAIL' ? 'Profile' : 'Attendance'}
              </span>
            </>
          )}

          {depth === 'ATTENDANCE' && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <span className="text-ink font-medium">Mark Attendance</span>
            </>
          )}
        </nav>
      )}

      {/* Render Current Layer with Permission Check */}
      <div className="animate-fade-in relative">
        {!isAllowed ? (
          <AccessDeniedLayer onBack={() => navigateTo('HOME')} />
        ) : (
          <>
            {depth === 'HOME' && <StaffOverviewLayer onNavigate={navigateTo} />}
            {depth === 'BATCHES' && <StaffBatchesLayer onNavigate={navigateTo} />}
            {depth === 'STUDENTS' && <StaffStudentsLayer batchId={selectedBatchId} onNavigate={navigateTo} />}
            {depth === 'STUDENT_DETAIL' && <StaffStudentDetailLayer studentId={selectedStudentId!} onNavigate={navigateTo} />}
            {depth === 'ATTENDANCE' && <StaffAttendanceMarkingLayer batchId={selectedBatchId} onNavigate={navigateTo} />}
            {depth === 'EXAMS' && <StaffExamManagementLayer batchId={selectedBatchId} onNavigate={navigateTo} />}
            {depth === 'STAFF' && <StaffStaffGridLayer onNavigate={navigateTo} />}
            {depth === 'STAFF_DETAIL' && <StaffStaffDetailLayer staffId={selectedStaffId!} onNavigate={navigateTo} />}
            {depth === 'STAFF_ATTENDANCE' && <StaffStaffAttendanceLayer onNavigate={navigateTo} />}
          </>
        )}
      </div>
    </div>
  );
}
