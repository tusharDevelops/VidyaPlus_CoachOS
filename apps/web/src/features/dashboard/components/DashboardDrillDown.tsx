import { useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import OverviewGridLayer from './explorer/OverviewGridLayer.tsx';
import BatchesGridLayer from './explorer/BatchesGridLayer.tsx';
import StudentsGridLayer from './explorer/StudentsGridLayer.tsx';
import StudentDetailLayer from './explorer/StudentDetailLayer.tsx';
import AttendanceMarkingLayer from './explorer/AttendanceMarkingLayer.tsx';
import StaffGridLayer from './explorer/StaffGridLayer.tsx';
import StaffDetailLayer from './explorer/StaffDetailLayer.tsx';
import StaffAttendanceLayer from './explorer/StaffAttendanceLayer';
import ExamManagementLayer from './explorer/ExamManagementLayer.tsx';

export type DrillDepth = 'HOME' | 'BATCHES' | 'STUDENTS' | 'STUDENT_DETAIL' | 'STAFF' | 'STAFF_DETAIL' | 'ATTENDANCE' | 'STAFF_ATTENDANCE' | 'EXAMS';

export default function DashboardDrillDown() {
  const [depth, setDepth] = useState<DrillDepth>('HOME');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const navigateTo = (newDepth: DrillDepth, data?: { batchId?: string; studentId?: string }) => {
    setDepth(newDepth);
    if (data?.batchId) setSelectedBatchId(data.batchId);
    if (data?.studentId) setSelectedStudentId(data.studentId);
  };

  return (
    <div className="flex flex-col min-w-0 space-y-6 w-full">
      {/* Breadcrumb Navigation */}
      {depth !== 'HOME' && (
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <button 
            onClick={() => navigateTo('HOME')}
            className="flex items-center text-steel hover:text-ink transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </button>
          
          {(depth === 'BATCHES' || depth === 'STUDENTS' || depth === 'STUDENT_DETAIL') && (
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

          {depth === 'EXAMS' && selectedBatchId && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <span className="text-ink font-medium">Exams</span>
            </>
          )}

          {depth === 'STUDENT_DETAIL' && selectedStudentId && (
            <>
              <ChevronRight className="w-4 h-4 text-hairline-dark" />
              <span className="text-ink font-medium">Details</span>
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
        </nav>
      )}

      {/* Render Current Layer */}
      <div className="animate-fade-in relative w-full min-w-0">
        {depth === 'HOME' && <OverviewGridLayer onNavigate={navigateTo} />}
        {depth === 'BATCHES' && <BatchesGridLayer onNavigate={navigateTo} />}
        {depth === 'STUDENTS' && <StudentsGridLayer batchId={selectedBatchId} onNavigate={navigateTo} />}
        {depth === 'STUDENT_DETAIL' && <StudentDetailLayer studentId={selectedStudentId} onNavigate={navigateTo} />}
        {depth === 'ATTENDANCE' && <AttendanceMarkingLayer batchId={selectedBatchId} onNavigate={navigateTo} />}
        {depth === 'EXAMS' && <ExamManagementLayer batchId={selectedBatchId} onNavigate={navigateTo} />}
        {depth === 'STAFF' && <StaffGridLayer onNavigate={navigateTo} />}
        {depth === 'STAFF_DETAIL' && <StaffDetailLayer staffId={selectedStudentId!} onNavigate={navigateTo} />}
        {depth === 'STAFF_ATTENDANCE' && <StaffAttendanceLayer onNavigate={navigateTo} />}
      </div>
    </div>
  );
}
