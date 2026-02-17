export type UserRole = 'staff' | 'admin';

export type DoctorStatus = 'available' | 'busy' | 'overloaded' | 'on-leave';

export type AppointmentStatus = 'scheduled' | 'rescheduled' | 'delayed' | 'completed' | 'cancelled';

export type PatientPriority = 'normal' | 'high' | 'critical';

export type AppointmentType = 'new' | 'follow-up';

export interface Doctor {
  id: string;
  name: string;
  department: string;
  shiftStart: string;
  shiftEnd: string;
  status: DoctorStatus;
  queueLength: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  department: string;
  appointmentTime: string;
  appointmentDate: string;
  appointmentType: AppointmentType;
  assignedDoctor: string;
  status: AppointmentStatus;
  isAIOptimized: boolean;
}

export interface WalkInPatient {
  id: string;
  patientName: string;
  department: string;
  priority: PatientPriority;
  arrivalTime: string;
  estimatedWaitTime: number;
  assignedDoctor?: string;
}

export interface EmergencyPatient {
  id: string;
  patientName: string;
  department: string;
  arrivalTime: string;
  assignedDoctor: string;
  priority: 'critical';
}

export interface AIDecisionLog {
  id: string;
  timestamp: string;
  triggerEvent: string;
  observation: string;
  recommendation: string;
  reason: string;
  outcome: string;
  acceptedByStaff: boolean;
}

export interface KPIData {
  totalPatientsToday: number;
  avgWaitingTimeBefore: number;
  avgWaitingTimeAfter: number;
  activeDoctorsToday: number;
  emergencyCasesToday: number;
}

export const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Dermatology',
  'ENT',
  'Ophthalmology',
  'Gynecology',
  'Psychiatry',
] as const;
