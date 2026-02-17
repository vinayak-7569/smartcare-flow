// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/types/healthcare";

/* ---------------- CONTEXT TYPE ---------------- */
interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

/* ---------------- CONTEXT ---------------- */
const AppContext = createContext<AppContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */
export function AppProvider({ children }: { children: ReactNode }) {
  // TEMP role until auth/JWT is added
  const [userRole, setUserRole] = useState<UserRole>("staff");

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
