import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  Shield,
  Briefcase,
  Truck,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'ADMIN',
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        role: selectedRole,
        company_name: companyName,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoRole(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'ADMIN' as UserRole,
      title: 'Admin',
      name: 'Alexander Vance',
      email: 'admin@supplychain.ai',
      icon: Shield,
    },
    {
      role: 'PROCUREMENT' as UserRole,
      title: 'Procurement Manager',
      name: 'Priya Sharma',
      email: 'procurement@supplychain.ai',
      icon: Briefcase,
    },
    {
      role: 'SUPPLIER' as UserRole,
      title: 'Supplier',
      name: 'Kenji Sato (Apex)',
      email: 'apex@supplier.com',
      icon: Truck,
    },
    {
      role: 'CUSTOMER' as UserRole,
      title: 'Customer',
      name: 'Rachel Adams (Boeing/Acme)',
      email: 'cust@acme.com',
      icon: UserCheck,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-[#d2b0bd] overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* LEFT PANE: Dark Brand Banner with Deep Berry Glow */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#120a10] via-[#24131d] to-[#3a1828] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#8e3a59]/30 blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="h-9 w-9 rounded-xl bg-[#8e3a59] flex items-center justify-center shadow-lg shadow-[#8e3a59]/30">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold tracking-wider text-xs uppercase block text-white">
                  RIMBERIO AI / CNT
                </span>
                <span className="text-[10px] text-pink-200 tracking-widest block uppercase opacity-75">
                  ENTERPRISE SUPPLY CHAIN PLATFORM
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-pink-200 border border-white/10 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {mode === 'login'
                  ? 'Multi-Tenant Enterprise Platform'
                  : 'Enterprise Onboarding & Node Provisioning'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              {mode === 'login'
                ? 'Enterprise Supply Chain Intelligence'
                : 'Provision Your Supply Chain Twin Node'}
            </h2>

            <p className="text-xs text-pink-100/80 leading-relaxed mb-6">
              {mode === 'login'
                ? "Sign in to access your department's workspace. Role-based dashboards, permissions, and AI capabilities are resolved automatically."
                : 'Configure autonomous agents, connect real-time vessel telemetry, and simulate supplier contract variations.'}
            </p>

            <div className="space-y-3 text-xs text-pink-100/90">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full border border-emerald-400 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>
                  {mode === 'login'
                    ? 'Role-specific dashboards for every department'
                    : 'Instant Buyer & Supplier Agent Node Deployment'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full border border-emerald-400 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>
                  {mode === 'login'
                    ? 'AI-powered procurement, risk analysis & negotiation'
                    : 'Pre-calibrated with 180,000+ Kaggle DataCo Trade Records'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full border border-emerald-400 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span>
                  {mode === 'login'
                    ? 'Multi-tenant isolation with enterprise-grade security'
                    : 'Continuous Maritime Chokepoint & Port Congestion Ingestion'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-[10px] text-pink-200/60 uppercase tracking-widest flex items-center justify-between">
            <span>SOC 2 TYPE II</span>
            <span>AES-256</span>
            <span>ISO 27001</span>
          </div>
        </div>

        {/* RIGHT PANE: Clean Form in Deep Berry Wine & Soft Rose styling */}
        <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between bg-white text-slate-800 overflow-y-auto max-h-[90vh]">
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8e3a59]">
                {mode === 'login' ? 'SECURE ENTERPRISE ACCESS' : 'NEW ENTERPRISE DEPLOYMENT'}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {mode === 'login' ? 'Sign In' : 'Register Organization'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Enter your credentials to access your workspace.'
                  : 'Create your corporate profile to provision the digital twin environment.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              <div className="space-y-5">
                {/* 1-Click Demo Shortcut Box */}
                <div className="p-3.5 rounded-2xl bg-[#fdf2f8] border border-[#d2b0bd] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#8e3a59] flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> DEMO LOGIN SHORTCUTS
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">Key: enterprise_pass_2026</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Click any demo account to 1-click populate verified enterprise credentials:
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {demoAccounts.map((d) => {
                      const Icon = d.icon;
                      return (
                        <button
                          key={d.role}
                          type="button"
                          onClick={() => handleQuickDemo(d.role)}
                          className="p-2 rounded-xl bg-white border border-[#d2b0bd] hover:border-[#8e3a59] hover:bg-[#f7eef3] text-left transition flex flex-col justify-between cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fdf2f8] text-[#8e3a59] border border-[#e8d8de]">
                              {d.title}
                            </span>
                            <Icon className="h-3 w-3 text-slate-400" />
                          </div>
                          <span className="text-xs font-semibold text-slate-900 mt-1 truncate">
                            {d.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono truncate">
                            {d.email}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      EMAIL
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#d2b0bd] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo passwords are pre-populated via 1-click shortcuts above.')}
                        className="text-[11px] text-[#8e3a59] hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#d2b0bd] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keepActive"
                      checked={keepActive}
                      onChange={(e) => setKeepActive(e.target.checked)}
                      className="rounded text-[#8e3a59] focus:ring-[#8e3a59]"
                    />
                    <label htmlFor="keepActive" className="text-xs text-slate-600 font-medium cursor-pointer">
                      Keep session active
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    New enterprise deployment?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError(null);
                      }}
                      className="font-bold text-[#8e3a59] hover:underline"
                    >
                      Register Organization
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Elena Rostova"
                      className="w-full px-3 py-2 rounded-xl border border-[#d2b0bd] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ENTERPRISE NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Apex Dynamics Corp"
                      className="w-full px-3 py-2 rounded-xl border border-[#d2b0bd] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CORPORATE EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.rostova@enterprise.ai"
                    className="w-full px-3 py-2 rounded-xl border border-[#d2b0bd] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ROLE PERMISSION TIER
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'ADMIN', label: 'Admin', icon: Shield },
                      { id: 'PROCUREMENT', label: 'Procurement Manager', icon: Briefcase },
                      { id: 'SUPPLIER', label: 'Supplier Partner', icon: Truck },
                      { id: 'CUSTOMER', label: 'Customer OEM', icon: UserCheck },
                    ].map((r) => {
                      const Icon = r.icon;
                      const isSel = selectedRole === r.id;
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => setSelectedRole(r.id as UserRole)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                            isSel
                              ? 'bg-[#fdf2f8] border-[#8e3a59] text-[#8e3a59] shadow-2xs'
                              : 'border-[#e8d8de] text-slate-700 hover:bg-[#fdf2f8]'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 text-[#8e3a59]" />
                          <span className="truncate">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SECURITY KEY / PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-[#d2b0bd] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#8e3a59]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Creating...' : 'Create Enterprise Account'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="font-bold text-[#8e3a59] hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
