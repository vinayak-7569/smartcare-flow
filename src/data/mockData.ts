import { 
  Doctor, 
  Appointment, 
  WalkInPatient, 
  EmergencyPatient, 
  AIDecisionLog, 
  KPIData 
} from '@/types/healthcare';

export const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', department: 'General Medicine', shiftStart: '08:00', shiftEnd: '16:00', status: 'available', queueLength: 5 },
  { id: '2', name: 'Dr. Michael Chen', department: 'Cardiology', shiftStart: '09:00', shiftEnd: '17:00', status: 'busy', queueLength: 8 },
  { id: '3', name: 'Dr. Emily Rodriguez', department: 'Pediatrics', shiftStart: '07:00', shiftEnd: '15:00', status: 'available', queueLength: 3 },
  { id: '4', name: 'Dr. James Wilson', department: 'Orthopedics', shiftStart: '08:00', shiftEnd: '16:00', status: 'overloaded', queueLength: 12 },
  { id: '5', name: 'Dr. Lisa Park', department: 'Neurology', shiftStart: '10:00', shiftEnd: '18:00', status: 'available', queueLength: 4 },
  { id: '6', name: 'Dr. Robert Brown', department: 'Dermatology', shiftStart: '08:00', shiftEnd: '14:00', status: 'on-leave', queueLength: 0 },
  { id: '7', name: 'Dr. Amanda Foster', department: 'ENT', shiftStart: '09:00', shiftEnd: '17:00', status: 'busy', queueLength: 7 },
  { id: '8', name: 'Dr. David Kim', department: 'General Medicine', shiftStart: '12:00', shiftEnd: '20:00', status: 'available', queueLength: 2 },
];

export const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'John Smith', department: 'General Medicine', appointmentTime: '09:00', appointmentDate: '2024-01-15', appointmentType: 'new', assignedDoctor: 'Dr. Sarah Johnson', status: 'scheduled', isAIOptimized: false },
  { id: '2', patientName: 'Mary Williams', department: 'Cardiology', appointmentTime: '10:30', appointmentDate: '2024-01-15', appointmentType: 'follow-up', assignedDoctor: 'Dr. Michael Chen', status: 'rescheduled', isAIOptimized: true },
  { id: '3', patientName: 'Peter Davis', department: 'Pediatrics', appointmentTime: '11:00', appointmentDate: '2024-01-15', appointmentType: 'new', assignedDoctor: 'Dr. Emily Rodriguez', status: 'scheduled', isAIOptimized: false },
  { id: '4', patientName: 'Susan Miller', department: 'Orthopedics', appointmentTime: '14:00', appointmentDate: '2024-01-15', appointmentType: 'follow-up', assignedDoctor: 'Dr. James Wilson', status: 'delayed', isAIOptimized: true },
  { id: '5', patientName: 'Thomas Anderson', department: 'Neurology', appointmentTime: '15:30', appointmentDate: '2024-01-15', appointmentType: 'new', assignedDoctor: 'Dr. Lisa Park', status: 'scheduled', isAIOptimized: false },
];

export const mockWalkInPatients: WalkInPatient[] = [
  { id: '1', patientName: 'Alice Cooper', department: 'General Medicine', priority: 'normal', arrivalTime: '08:45', estimatedWaitTime: 25, assignedDoctor: 'Dr. Sarah Johnson' },
  { id: '2', patientName: 'Bob Martin', department: 'Orthopedics', priority: 'high', arrivalTime: '09:15', estimatedWaitTime: 15, assignedDoctor: 'Dr. James Wilson' },
  { id: '3', patientName: 'Carol White', department: 'ENT', priority: 'normal', arrivalTime: '09:30', estimatedWaitTime: 35, assignedDoctor: 'Dr. Amanda Foster' },
  { id: '4', patientName: 'Daniel Lee', department: 'General Medicine', priority: 'normal', arrivalTime: '10:00', estimatedWaitTime: 40, assignedDoctor: 'Dr. David Kim' },
];

export const mockEmergencyPatients: EmergencyPatient[] = [
  { id: '1', patientName: 'Emergency Patient 1', department: 'Cardiology', arrivalTime: '07:30', assignedDoctor: 'Dr. Michael Chen', priority: 'critical' },
  { id: '2', patientName: 'Emergency Patient 2', department: 'Neurology', arrivalTime: '08:15', assignedDoctor: 'Dr. Lisa Park', priority: 'critical' },
];

export const mockAIDecisionLogs: AIDecisionLog[] = [
  { 
    id: '1', 
    timestamp: '2024-01-15 09:15:00', 
    triggerEvent: 'Doctor Overload', 
    observation: 'Dr. Wilson queue length exceeded threshold (12 patients)', 
    recommendation: 'Redistribute 3 low-priority patients to Dr. Johnson', 
    reason: 'Same department, balanced workload distribution', 
    outcome: 'Waiting time reduced by 18 minutes',
    acceptedByStaff: true 
  },
  { 
    id: '2', 
    timestamp: '2024-01-15 10:30:00', 
    triggerEvent: 'Appointment Delay', 
    observation: 'Dr. Chen running 20 minutes behind schedule', 
    recommendation: 'Reschedule follow-up patient to 11:00 slot', 
    reason: 'Patient type is follow-up, flexible scheduling possible', 
    outcome: 'Patient notified, waiting time minimized',
    acceptedByStaff: true 
  },
  { 
    id: '3', 
    timestamp: '2024-01-15 11:45:00', 
    triggerEvent: 'Emergency Arrival', 
    observation: 'Critical case arrived at Cardiology', 
    recommendation: 'Prioritize emergency, notify next 2 scheduled patients of delay', 
    reason: 'Emergency protocol activated', 
    outcome: 'Emergency handled within 5 minutes',
    acceptedByStaff: true 
  },
  { 
    id: '4', 
    timestamp: '2024-01-15 12:00:00', 
    triggerEvent: 'Queue Optimization', 
    observation: 'ENT department queue growing faster than expected', 
    recommendation: 'Suggest additional afternoon slot opening', 
    reason: 'Predicted congestion based on historical patterns', 
    outcome: 'Suggestion noted for admin review',
    acceptedByStaff: false 
  },
];

export const mockKPIData: KPIData = {
  totalPatientsToday: 127,
  avgWaitingTimeBefore: 42,
  avgWaitingTimeAfter: 24,
  activeDoctorsToday: 7,
  emergencyCasesToday: 2,
};

export const waitingTimeChartData = [
  { time: '08:00', before: 35, after: 28 },
  { time: '09:00', before: 42, after: 25 },
  { time: '10:00', before: 48, after: 22 },
  { time: '11:00', before: 55, after: 30 },
  { time: '12:00', before: 50, after: 26 },
  { time: '13:00', before: 38, after: 20 },
  { time: '14:00', before: 45, after: 24 },
  { time: '15:00', before: 40, after: 22 },
];

export const doctorWorkloadData = [
  { name: 'Dr. Johnson', patients: 18, department: 'General Medicine' },
  { name: 'Dr. Chen', patients: 22, department: 'Cardiology' },
  { name: 'Dr. Rodriguez', patients: 15, department: 'Pediatrics' },
  { name: 'Dr. Wilson', patients: 25, department: 'Orthopedics' },
  { name: 'Dr. Park', patients: 14, department: 'Neurology' },
  { name: 'Dr. Foster', patients: 19, department: 'ENT' },
  { name: 'Dr. Kim', patients: 12, department: 'General Medicine' },
];
