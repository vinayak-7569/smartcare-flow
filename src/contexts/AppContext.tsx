import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Doctor, Appointment, WalkInPatient, EmergencyPatient, AIDecisionLog } from '@/types/healthcare';
import { mockDoctors, mockAppointments, mockWalkInPatients, mockEmergencyPatients, mockAIDecisionLogs } from '@/data/mockData';

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  walkInPatients: WalkInPatient[];
  setWalkInPatients: React.Dispatch<React.SetStateAction<WalkInPatient[]>>;
  emergencyPatients: EmergencyPatient[];
  setEmergencyPatients: React.Dispatch<React.SetStateAction<EmergencyPatient[]>>;
  aiDecisionLogs: AIDecisionLog[];
  setAIDecisionLogs: React.Dispatch<React.SetStateAction<AIDecisionLog[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [walkInPatients, setWalkInPatients] = useState<WalkInPatient[]>(mockWalkInPatients);
  const [emergencyPatients, setEmergencyPatients] = useState<EmergencyPatient[]>(mockEmergencyPatients);
  const [aiDecisionLogs, setAIDecisionLogs] = useState<AIDecisionLog[]>(mockAIDecisionLogs);

  return (
    <AppContext.Provider value={{
      userRole,
      setUserRole,
      doctors,
      setDoctors,
      appointments,
      setAppointments,
      walkInPatients,
      setWalkInPatients,
      emergencyPatients,
      setEmergencyPatients,
      aiDecisionLogs,
      setAIDecisionLogs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
