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
  WALLET_VIEW: 'wallet.view',
  MARKETING_CAMPAIGNS: 'marketing.campaigns',
  EXAMS_VIEW: 'exams.view',
  EXAMS_MANAGE: 'exams.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Default Role Permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: Object.values(PERMISSIONS),
  teacher: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.BATCHES_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.EXAMS_MANAGE,
  ],
  accountant: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.BATCHES_VIEW,
    PERMISSIONS.FEES_VIEW,
    PERMISSIONS.FEES_COLLECT,
    PERMISSIONS.FEES_EDIT,
    PERMISSIONS.FEES_DELETE,
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.STAFF_VIEW,
  ],
  staff: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_ADD,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.REPORTS_VIEW,
  ],
  admin: Object.values(PERMISSIONS),
  custom: [],
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
