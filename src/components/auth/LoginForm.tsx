import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Activity } from "lucide-react";
import TestUserSetup from "../TestUserSetup";
import FloatingParticles from '@/components/FloatingParticles';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTestSetup, setShowTestSetup] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting to login user:", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Supabase login response:", { data, error });
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
      } else if (!data?.user) {
        setError("No user returned from Supabase. Check your credentials and email verification.");
      } else {
        console.log("Login successful", data);
        toast.success("Welcome back to MediCore Pro!");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (showTestSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <TestUserSetup />
          <Button 
            variant="link" 
            onClick={() => setShowTestSetup(false)}
            className="w-full mt-4"
          >
            ← Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md relative z-10 bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-0 overflow-hidden">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="inline-flex items-center justify-center rounded-full bg-white p-2 shadow-lg">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 18h7l3 8 6-20 4 12h10" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <motion.div className="relative flex items-center">
              <motion.h1
                className="text-3xl font-extrabold tracking-tight text-black dark:text-white font-sans flex relative z-10"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.07 } }
                }}
              >
                {[...'MediCore Pro'].map((char, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                    style={{
                      display: char === ' ' ? 'inline-block' : 'inline',
                      animation: char !== ' ' ? `colorCycle 2s linear infinite ${i * 0.1}s` : undefined,
                      perspective: '400px',
                    }}
                    className="animated-letter-3d text-gray-900 dark:text-white"
                    whileHover={{ rotateY: 20, scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.h1>
            </motion.div>
          </div>
          <CardTitle className="text-2xl text-black dark:text-white font-semibold">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Sign in to your medical platform account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="mb-2">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black dark:text-white text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-800 text-black dark:text-white focus:bg-white/30 focus:dark:bg-gray-700 focus:ring-2 focus:ring-black border border-white/20 rounded-xl py-3 px-4 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black dark:text-white text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white dark:bg-gray-800 text-black dark:text-white focus:bg-white/30 focus:dark:bg-gray-700 focus:ring-2 focus:ring-black border border-white/20 rounded-xl py-3 px-4 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Button
                type="button"
                variant="link"
                className="text-xs text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white p-0 h-auto"
                onClick={() => setForgotOpen(true)}
              >
                Forgot password?
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold bg-black hover:bg-white hover:text-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-lg rounded-xl transition-all duration-200 border border-white/20"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-8 space-y-3">
            <div className="text-center">
              <p className="text-sm text-black dark:text-white">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  onClick={onSwitchToSignup}
                >
                  Sign up here
                </Button>
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/10 border-white/20 text-black hover:bg-white/20"
                onClick={() => setShowTestSetup(true)}
              >
                Create Test Account
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/10 border-white/20 text-black hover:bg-white/20"
                onClick={() => {
                  setEmail("doctor@test.com");
                  setPassword("test123456");
                  toast.info("Test credentials filled. Click Sign In to test login.");
                }}
              >
                Fill Test Credentials
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/10 border-white/20 text-black hover:bg-white/20"
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.from('diseases').select('count').limit(1);
                    if (error) {
                      toast.error(`Connection error: ${error.message}`);
                    } else {
                      toast.success("Supabase connection working!");
                    }
                  } catch (err) {
                    toast.error("Failed to connect to Supabase");
                  }
                }}
              >
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">Reset your password</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setForgotLoading(true);
                setForgotMsg("");
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                    redirectTo: window.location.origin + "/reset-password"
                  });
                  if (error) {
                    setForgotMsg(error.message);
                  } else {
                    setForgotMsg("Check your email for a password reset link.");
                  }
                } catch (err) {
                  setForgotMsg("Something went wrong. Please try again.");
                } finally {
                  setForgotLoading(false);
                }
              }}
              className="space-y-4"
            >
              <Label htmlFor="forgot-email" className="text-black">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="bg-white/20 text-black placeholder-black/60 border border-white/20 rounded-xl"
              />
              {forgotMsg && <div className="text-sm text-center text-black/80">{forgotMsg}</div>}
              <Button type="submit" className="w-full bg-black text-white hover:bg-white hover:text-black" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default LoginForm;
