import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Activity } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";
import { motion } from "framer-motion";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "doctor" as "doctor" | "admin" | "nurse",
    specialization: "",
    licenseNumber: "",
    phone: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.username || formData.username.length < 3) {
      setError("Username is required and must be at least 3 characters.");
      setLoading(false);
      return;
    }

    // Check if username is unique
    setUsernameCheckLoading(true);
    const { data: existing, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', formData.username)
      .single();
    setUsernameCheckLoading(false);
    if (existing) {
      setError('Username already taken. Please choose another.');
      setLoading(false);
      return;
    }
    if (usernameError && usernameError.code !== 'PGRST116') {
      setError('Error checking username uniqueness.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign up user:", { email: formData.email, username: formData.username, fullName: formData.fullName, role: formData.role });
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName,
            role: formData.role,
            specialization: formData.specialization,
            license_number: formData.licenseNumber,
            phone: formData.phone,
          },
        },
      });
      console.log("Supabase signup response:", { data, error });
      if (error) {
        console.error("Signup error:", error);
        setError(error.message);
      } else if (!data?.user) {
        setError("No user returned from Supabase. Check your email for a verification link.");
      } else {
        console.log("Signup successful", data);
        toast.success("Account created successfully! Please check your email to verify your account.");
        onSwitchToLogin();
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <motion.div className="relative flex items-center">
              <motion.h1
                className="text-2xl font-bold text-gray-900 flex relative z-10"
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
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>Join the advanced medical platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Dr. John Smith"
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="Cardiology, Neurology, etc."
                value={formData.specialization}
                onChange={(e) => updateFormData("specialization", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                placeholder="Medical license number"
                value={formData.licenseNumber}
                onChange={(e) => updateFormData("licenseNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Unique username"
                value={formData.username || ''}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
                minLength={3}
                className="bg-white/20 text-black focus:bg-white/30 focus:ring-2 focus:ring-black border border-white/20 rounded-xl py-3 px-4 transition-all"
              />
              {usernameCheckLoading && <div className="text-xs text-black/60">Checking username...</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full py-3 text-lg font-semibold bg-black hover:bg-white hover:text-black text-white shadow-lg rounded-xl transition-all duration-200 border border-white/20"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-blue-600"
                onClick={onSwitchToLogin}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
