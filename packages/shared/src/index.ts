// ============================================
// CoachOS Shared Types
// ============================================

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  STAFF: 'staff',
  ADMIN: 'admin',
  STUDENT: 'student',
  PARENT: 'parent',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Entity Statuses
export const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
  ALUMNI: 'alumni',
} as const;

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

// Fee Frequencies
export const FEE_FREQUENCIES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  COURSE: 'course',
  INSTALLMENT: 'installment',
} as const;

export type FeeFrequency = (typeof FEE_FREQUENCIES)[keyof typeof FEE_FREQUENCIES];

// Fee Record Status
export const FEE_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

export type FeeStatus = (typeof FEE_STATUS)[keyof typeof FEE_STATUS];

// Payment Modes
export const PAYMENT_MODES = {
  CASH: 'cash',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
  ONLINE: 'online',
} as const;

export type PaymentMode = (typeof PAYMENT_MODES)[keyof typeof PAYMENT_MODES];

// Payment Status
export const PAYMENT_STATUS = {
  COMPLETED: 'completed',
  BOUNCED: 'bounced',
  VOIDED: 'voided',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];

// Days of Week
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Permission Keys
export const PERMISSIONS = {
  STUDENTS_VIEW: 'students.view',
  STUDENTS_ADD: 'students.add',
  STUDENTS_EDIT: 'students.edit',
  STUDENTS_DELETE: 'students.delete',
  BATCHES_VIEW: 'batches.view',
  BATCHES_EDIT: 'batches.edit',
  FEES_VIEW: 'fees.view',
  FEES_COLLECT: 'fees.collect',
  FEES_EDIT: 'fees.edit',
  FEES_DELETE: 'fees.delete',
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_MARK: 'attendance.mark',
  ATTENDANCE_EDIT: 'attendance.edit',
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_SEND: 'notifications.send',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',
  SETTINGS_MANAGE: 'settings.manage',
  EXAMS_VIEW: 'exams.view',
  EXAMS_MANAGE: 'exams.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS = [
  {
    id: 'students',
    title: 'Students & Inquiries',
    items: [
      { id: 'students.view', label: 'View student directory', description: 'Access student list and basic profiles' },
      { id: 'students.add', label: 'Enroll new students', description: 'Register new students into the system' },
      { id: 'students.edit', label: 'Modify student data', description: 'Update KYC, contact info, and status' },
      { id: 'students.delete', label: 'Remove student records', description: 'Permit removal or archiving of records' },
    ]
  },
  {
    id: 'academics',
    title: 'Academics & Attendance',
    items: [
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
    title: 'Financials & Fees',
    items: [
      { id: 'fees.view', label: 'Access fee dashboard', description: 'Access financial summaries and dues' },
      { id: 'fees.collect', label: 'Process fee payments', description: 'Record and verify fee collections' },
      { id: 'fees.edit', label: 'Edit fee structures', description: 'Modify fee plans and discounts' },
      { id: 'fees.delete', label: 'Void/Delete receipts', description: 'Cancel or delete payment records' },
    ]
  },
  {
    id: 'communications',
    title: 'Communications',
    items: [
      { id: 'notifications.view', label: 'View notification logs', description: 'View history of sent alerts' },
      { id: 'notifications.send', label: 'Send broadcast alerts', description: 'Send WhatsApp/Email notifications' },
    ]
  },
  {
    id: 'system',
    title: 'System & Team',
    items: [
      { id: 'reports.view', label: 'View operational reports', description: 'Access institute-wide performance data' },
      { id: 'reports.export', label: 'Download data exports', description: 'Download CSV/PDF reports' },
      { id: 'staff.view', label: 'View staff members', description: 'See directory of staff members' },
      { id: 'staff.manage', label: 'Manage staff & payroll', description: 'Add/Edit team members and permissions' },
      { id: 'settings.manage', label: 'Institute settings access', description: 'Access system-wide configuration' },
    ]
  }
];

export const DEFAULT_STAFF_PERMISSIONS: Record<string, string[]> = {
  teacher: ['attendance.mark', 'attendance.view', 'batches.view', 'students.view', 'notifications.view', 'exams.view', 'exams.manage'],
  accountant: ['fees.view', 'fees.collect', 'fees.edit', 'batches.view', 'students.view', 'reports.view', 'staff.view'],
  admin: PERMISSION_GROUPS.flatMap(g => g.items.map(p => p.id)),
  custom: []
};

// Default Role Permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: Object.values(PERMISSIONS),
  teacher: DEFAULT_STAFF_PERMISSIONS.teacher as Permission[],
  accountant: DEFAULT_STAFF_PERMISSIONS.accountant as Permission[],
  staff: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_ADD,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.REPORTS_VIEW,
  ],
  admin: DEFAULT_STAFF_PERMISSIONS.admin as Permission[],
  custom: DEFAULT_STAFF_PERMISSIONS.custom as Permission[],
};

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  instituteId: string | null;
  role: UserRole;
  permissions: Permission[];
}
