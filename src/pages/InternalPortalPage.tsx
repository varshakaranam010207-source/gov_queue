import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Lock, AlertCircle, ArrowLeft, Landmark, KeyRound, CheckCircle2 } from 'lucide-react';
import { APP_NAME, DEMO_USERS } from '@shared/constants';

export const InternalPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, internalLogin, isCitizen } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If user is already authenticated as citizen and visits /internal directly:
  if (user && isCitizen) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-rose-500/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            You are logged in as a Citizen (<span className="text-emerald-400 font-mono">{user.email}</span>). Citizen accounts must use the citizen portal and cannot access internal administration consoles.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Citizen Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogin = async (portalHint: 'STAFF' | 'ADMIN') => {
    if (!email || !password) {
      setErrorMessage('Please enter both personnel email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Backend validates database role! If CITIZEN, backend returns 403 Forbidden!
      const res = await internalLogin({ email, password, portalHint });
      toastSuccess(`Authenticated as ${res.user.role}: ${res.user.full_name}`);
      navigate(res.redirectUrl);
    } catch (err: any) {
      const msg = err?.message || 'Authentication rejected.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemo = (role: 'STAFF' | 'ADMIN') => {
    if (role === 'STAFF') {
      setEmail(DEMO_USERS.STAFF.email);
      setPassword(DEMO_USERS.STAFF.password);
    } else {
      setEmail(DEMO_USERS.ADMIN.email);
      setPassword(DEMO_USERS.ADMIN.password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Security Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Main Restricted Card */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-1">
            {APP_NAME}
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Restricted Personnel Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized staff and administrators only.</p>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-6 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Access to this node is monitored and recorded in immutable audit logs. Unauthorized attempts are strictly prohibited.
          </span>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="bg-rose-950/50 border border-rose-800/80 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Access Denied</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin('STAFF'); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Personnel Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. staff@govqueue.demo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Secure Passkey / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors"
              required
            />
          </div>

          {/* Action Buttons: Staff Login & Admin Login */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLogin('STAFF')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleLogin('ADMIN')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </form>

        {/* Demo Fast Fill Buttons for Evaluator / Hackathon Demo */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Demo Personnel Quick Access
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofillDemo('STAFF')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white text-left transition-colors"
            >
              <div className="font-semibold text-amber-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Staff Officer
              </div>
              <div className="text-[10px] text-slate-500 font-mono">staff@govqueue.demo</div>
            </button>

            <button
              type="button"
              onClick={() => autofillDemo('ADMIN')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-left transition-colors"
            >
              <div className="font-semibold text-indigo-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Chief Admin
              </div>
              <div className="text-[10px] text-slate-500 font-mono">admin@govqueue.demo</div>
            </button>
          </div>
        </div>

        {/* Citizen Exit Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Public Citizen Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
