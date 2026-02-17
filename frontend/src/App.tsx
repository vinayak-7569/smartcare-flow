import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DoctorSetup from "./pages/DoctorSetup";
import OnlineAppointments from "./pages/OnlineAppointments";
import WalkInRegistration from "./pages/WalkInRegistration";
import EmergencyQueue from "./pages/EmergencyQueue";
import DoctorAvailability from "./pages/DoctorAvailability";
import AIDecisionsLogs from "./pages/AIDecisionsLogs";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/doctor-setup" element={<DoctorSetup />} />
              <Route path="/appointments" element={<OnlineAppointments />} />
              <Route path="/walk-in" element={<WalkInRegistration />} />
              <Route path="/emergency" element={<EmergencyQueue />} />
              <Route path="/availability" element={<DoctorAvailability />} />
              <Route path="/ai-logs" element={<AIDecisionsLogs />} />
              <Route path="/reports" element={<ReportsAnalytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
