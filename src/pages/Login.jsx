import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Milk, Lock, Mail, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'recovery'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setMode('recovery');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signin' && (!email || !password)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && (!email || !password || !fullName)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'forgot' && !email) {
      setError('Please fill in your email address.');
      return;
    }
    if (mode === 'recovery' && !password) {
      setError('Please fill in your new password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await base44.auth.signUp(email, password, fullName);
        setError('Signup successful! Check your email or try logging in.');
        setMode('signin');
      } else if (mode === 'signin') {
        const loggedInUser = await base44.auth.login(email, password);
        onLoginSuccess(loggedInUser);
      } else if (mode === 'forgot') {
        await base44.auth.resetPassword(email);
        setError('Password reset link sent! Check your email.');
      } else if (mode === 'recovery') {
        await base44.auth.updatePassword(password);
        setError('Password updated successfully! You can now sign in.');
        // Clean hash from URL
        window.history.replaceState(null, null, ' ');
        setMode('signin');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-3xl" />

      {/* Language Selector (Top Right) */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60"
        >
          🌐 {lang === 'en' ? 'తెలుగు' : 'English'}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative">
          
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          
          <CardHeader className="pt-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
              <img src="https://res.cloudinary.com/doxeuimhd/image/upload/v1783510673/ChatGPT_Image_Jul_8_2026_04_58_53_PM_axzmx1.png" alt="MilkBook Logo" className="w-full h-full object-cover" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
              MilkBook
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {mode === 'signup' && 'Create your manager account'}
              {mode === 'signin' && 'Sign in to manage your dairy business'}
              {mode === 'forgot' && 'Enter your email to request a reset link'}
              {mode === 'recovery' && 'Enter a new password for your account'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5"
                  >
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-white/50"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode !== 'recovery' && (
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-white/50"
                      required
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">
                      {mode === 'recovery' ? 'New Password' : 'Password'}
                    </Label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                        }}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-white/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className={`p-3 rounded-xl text-xs font-medium ${error.includes('successful') || error.includes('sent') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg shadow-indigo-500/20 py-5 mt-2 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'signup' ? (
                  'Create Account'
                ) : mode === 'forgot' ? (
                  'Send Reset Link'
                ) : mode === 'recovery' ? (
                  'Update Password'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-8 border-t border-slate-100 dark:border-slate-800/50 pt-6 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="text-xs text-center text-slate-500">
              {mode === 'signin' && (
                <>
                  Don\'t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Sign In
                  </button>
                </>
              )}
              {(mode === 'forgot' || mode === 'recovery') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
