import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import ResetPassword from './pages/ResetPassword';
import { ThemeProvider } from 'next-themes';
import DoctorDirectory from "./components/DoctorDirectory";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MediCore Pro...</p>
        </div>
      </div>
    );
  }

  // Show authentication forms if no session
  if (!session) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-white dark:bg-gray-950">
              <BrowserRouter>
                <Routes>
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/login" element={<LoginForm onSwitchToSignup={() => setShowSignup(true)} />} />
                  <Route path="/signup" element={<SignupForm onSwitchToLogin={() => setShowSignup(false)} />} />
                  <Route path="*" element={showSignup ? <SignupForm onSwitchToLogin={() => setShowSignup(false)} /> : <LoginForm onSwitchToSignup={() => setShowSignup(true)} />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  // Show main application if authenticated
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-white dark:bg-gray-950">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/doctors" element={<DoctorDirectory />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
