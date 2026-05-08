import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LearningProvider } from "@/contexts/LearningContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModuleProgressProvider } from "@/contexts/ModuleProgressContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Learn from "./pages/Learn";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import CodingPractice from "./pages/CodingPractice";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LearningProvider>
          <ModuleProgressProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Admin routes — outside AppLayout (own layout) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />

                {/* Student routes — inside AppLayout */}
                <Route path="/*" element={
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/learn" element={
                        <ProtectedRoute>
                          <Learn />
                        </ProtectedRoute>
                      } />
                      <Route path="/quiz" element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/practice" element={
                        <ProtectedRoute>
                          <CodingPractice />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                } />
              </Routes>
            </BrowserRouter>
          </ModuleProgressProvider>
        </LearningProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

