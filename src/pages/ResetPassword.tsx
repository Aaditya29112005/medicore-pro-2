import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FloatingParticles from '@/components/FloatingParticles';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        toast.success('Password updated! Redirecting to login...');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0a1833]">
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-br from-blue-500/40 to-purple-500/30 rounded-full blur-3xl z-0 animate-pulse"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-gradient-to-tr from-purple-700/30 to-blue-400/20 rounded-full blur-2xl z-0 animate-pulse"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      />
      <Card className="w-full max-w-md relative z-10 bg-white/10 dark:bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-0 overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white/90 font-semibold">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center text-green-300 text-lg font-semibold py-8">Password updated! Redirecting...</div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {error && <div className="text-center text-red-300 text-sm">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-white/20 text-white border border-white/20 rounded-xl py-3 px-4"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-white/80">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="bg-white/20 text-white border border-white/20 rounded-xl py-3 px-4"
                  placeholder="Confirm new password"
                />
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg rounded-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </motion.div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword; 