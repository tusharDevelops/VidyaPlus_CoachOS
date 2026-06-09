export interface PermissionModule {
  id: string;
  label: string;
  permissions: {
    id: string;
    label: string;
    description: string;
  }[];
}

export const MODULAR_DELEGATION_ENGINE: PermissionModule[] = [
  {
    id: 'students',
    label: 'Students & Inquiries',
    permissions: [
      { id: 'students.view', label: 'View student directory', description: 'Access student list and basic profiles' },
      { id: 'students.add', label: 'Enroll new students', description: 'Register new students into the system' },
      { id: 'students.edit', label: 'Modify student data', description: 'Update KYC, contact info, and status' },
      { id: 'students.delete', label: 'Remove student records', description: 'Permit removal or archiving of records' },
    ]
  },
  {
    id: 'academics',
    label: 'Academics & Attendance',
    permissions: [
      { id: 'batches.view', label: 'View batch schedules', description: 'See class schedules and assignments' },
      { id: 'batches.edit', label: 'Manage batch settings', description: 'Configure batch settings and timings' },
      { id: 'attendance.mark', label: 'Mark daily attendance', description: 'Record daily attendance for students' },
      { id: 'attendance.view', label: 'View attendance reports', description: 'Access past attendance logs' },
      { id: 'attendance.edit', label: 'Correct past attendance', description: 'Modify past attendance records' },
      { id: 'exams.view', label: 'View offline exams', description: 'See exam schedules and test records' },
      { id: 'exams.manage', label: 'Manage offline exams', description: 'Create exams and enter student marks' },
    ]
  },
  {
    id: 'finance',
    label: 'Financials & Fees',
    permissions: [
      { id: 'fees.view', label: 'Access fee dashboard', description: 'Access financial summaries and dues' },
      { id: 'fees.collect', label: 'Process fee payments', description: 'Record and verify fee collections' },
      { id: 'fees.edit', label: 'Edit fee structures', description: 'Modify fee plans and discounts' },
      { id: 'fees.delete', label: 'Void/Delete receipts', description: 'Cancel or delete payment records' },
      { id: 'wallet.view', label: 'Institute Wallet', description: 'Access wallet transactions and balance' },
    ]
  },
  {
    id: 'communications',
    label: 'Communications',
    permissions: [
      { id: 'notifications.view', label: 'View notification logs', description: 'View history of sent alerts' },
      { id: 'notifications.send', label: 'Send broadcast alerts', description: 'Send WhatsApp/Email notifications' },
      { id: 'marketing.campaigns', label: 'Marketing Campaigns', description: 'Manage promotional campaigns and offers' },
    ]
  },
  {
    id: 'system',
    label: 'System & Team',
    permissions: [
      { id: 'reports.view', label: 'View operational reports', description: 'Access institute-wide performance data' },
      { id: 'reports.export', label: 'Download data exports', description: 'Download CSV/PDF reports' },
      { id: 'staff.view', label: 'View staff members', description: 'See directory of staff members' },
      { id: 'staff.manage', label: 'Manage staff & payroll', description: 'Add/Edit team members and permissions' },
      { id: 'settings.manage', label: 'Institute settings access', description: 'Access system-wide configuration' },
    ]
  }
];

export const getPermissionGroup = (permId: string) => {
  return MODULAR_DELEGATION_ENGINE.find(m => m.permissions.some(p => p.id === permId));
};
