
import React, { useState } from 'react';
import { Shield, Smartphone, Mail, Lock, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      onLogin(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white animate-in fade-in duration-500">
      {/* Left side: Branding & Value Prop */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-xl">
              EP
            </div>
            <span className="text-2xl font-bold tracking-tight">EduLead Pro</span>
          </div>
          
          <h1 className="text-6xl font-extrabold leading-[1.1] mb-8">
            Empowering <br />
            <span className="text-indigo-200">Global Education</span> <br />
            Consultancies.
          </h1>
          <p className="text-xl text-indigo-100/80 max-w-md font-medium leading-relaxed">
            The intelligent lead management system that bridges the gap between students and their dreams.
          </p>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <Zap size={20} className="mb-2 text-indigo-300" />
              <h4 className="font-bold text-sm">AI Powered</h4>
              <p className="text-xs text-indigo-100/70">Automatic intent detection</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <Shield size={20} className="mb-2 text-indigo-300" />
              <h4 className="font-bold text-sm">Enterprise Grade</h4>
              <p className="text-xs text-indigo-100/70">Role-based access control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-indigo-200 text-sm bg-indigo-700/50 p-3 rounded-xl inline-flex">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span className="font-medium">All systems operational in your region</span>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium">Access your educational consultancy workspace</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-white shadow-sm text-indigo-600"
            >
              <Mail size={18} />
              Email Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Work Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    placeholder="super@edulead.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <button type="button" className="text-xs text-indigo-600 font-bold hover:underline">Forgot password?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" 
              />
              <label htmlFor="remember" className="text-xs text-slate-600 font-medium">Trust this device for 30 days (Session persistence)</label>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold 
                hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="pt-8 text-center border-t border-slate-100 space-y-2">
             <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
               <Shield size={12} />
               <span>Secured by EduLead Guard SSL</span>
             </div>
             <p className="text-[10px] text-slate-300">
               Authorized Device: Chrome 124 (macOS) <br />
               Last Login: Today, 09:12 AM from Mumbai, IN
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
