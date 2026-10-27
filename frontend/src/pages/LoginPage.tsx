import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Boxes,
  Lock,
  Mail,
  User,
  Building,
  Shield,
  Briefcase,
  Truck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Activity,
  Globe,
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  initialRole = 'ADMIN',
  onBackToLanding,
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
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
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'ADMIN' as UserRole,
      title: 'Administrator',
      name: 'Alexander Vance',
      email: 'admin@supplychain.ai',
      desc: 'Overall enterprise governance, disruption mitigation & feedback audit',
      icon: Shield,
      accent: 'border-blue-500 bg-blue-50/70 text-blue-700',
    },
    {
      role: 'PROCUREMENT' as UserRole,
      title: 'Procurement Manager',
      name: 'Priya Sharma',
      email: 'procurement@supplychain.ai',
      desc: 'Bilateral negotiations, supplier quotations & CNT switching decisions',
      icon: Briefcase,
      accent: 'border-purple-500 bg-purple-50/70 text-purple-700',
    },
    {
      role: 'SUPPLIER' as UserRole,
      title: 'Supplier Partner',
      name: 'Kenji Sato (Apex)',
      email: 'apex@supplier.com',
      desc: 'RFQ fulfillment, batch quotations & dispatch tracking',
      icon: Truck,
      accent: 'border-amber-500 bg-amber-50/70 text-amber-700',
    },
    {
      role: 'CUSTOMER' as UserRole,
      title: 'Customer OEM',
      name: 'Rachel Adams (Boeing/Acme)',
      email: 'cust@acme.com',
      desc: 'Order intake, delivery SLA monitoring & transparency advisories',
      icon: UserCheck,
      accent: 'border-emerald-500 bg-emerald-50/70 text-emerald-700',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* =========================================================================
          LEFT PANE: Maximized Cinematic Brand & Enterprise Telemetry Showcase
         ========================================================================= */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#1E1B4B] p-8 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden border-r border-gray-800">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition mb-10 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Landing Page</span>
          </button>

          <div className="flex items-center gap-3.5 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 text-white">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base uppercase block text-white">
                NEXORA TWIN
              </span>
              <span className="text-xs text-blue-300/80 tracking-widest block uppercase font-medium">
                Autonomous Supply Chain Twin
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Multi-Agent Platform Active</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {mode === 'login'
              ? 'Autonomous AI Supply Chain Intelligence'
              : 'Provision Your Enterprise Supply Chain Twin Node'}
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed mb-8 max-w-lg">
            {mode === 'login'
              ? 'Authenticate to access your department-specific workspace. Role permissions, autonomous agent coordinators, and real-time twin telemetry are loaded automatically.'
              : 'Configure multi-agent decision nodes, calibrate against 180,000+ DataCo supply chain transactions, and run real-time counterfactual disruption models.'}
          </p>

          {/* Capabilities Checklist */}
          <div className="space-y-4 text-xs text-gray-200 mb-8 max-w-lg">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border border-emerald-400 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white block">Strict Role-Based Enterprise Workspaces</span>
                <span className="text-gray-400">Isolated views tailored for Administrator, Procurement Manager, Supplier, and Customer.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border border-blue-400 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white block">Bilateral Multi-Agent Negotiation</span>
                <span className="text-gray-400">Autonomous concession evaluation across unit price, batch volume, and delivery lead days.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border border-purple-400 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-semibold text-white block">1,000-Trial Monte Carlo Counterfactual Twin</span>
                <span className="text-gray-400">Simulate RETAIN, NEGOTIATE, and SWITCH decisions with live port dwell times.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Compliance & Security Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-gray-400 uppercase tracking-widest gap-2">
          <span>SOC 2 TYPE II CERTIFIED</span>
          <span>AES-256 ENCRYPTION</span>
          <span>ISO 27001 COMPLIANT</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANE: Maximized Enterprise Authentication Form & 1-Click Demo Logins
         ========================================================================= */}
      <div className="lg:w-7/12 bg-white text-gray-900 p-8 lg:p-14 flex flex-col justify-between overflow-y-auto min-h-screen">
        <div className="max-w-2xl mx-auto w-full">
          {/* Top Bar with Mode Switch */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                {mode === 'login' ? 'SECURE ENTERPRISE ACCESS' : 'NEW ENTERPRISE ONBOARDING'}
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mt-1">
                {mode === 'login' ? 'Sign In to Workspace' : 'Register Organization'}
              </h2>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-CLICK DEMO SHORTCUTS BOX (Always visible for easy testing) */}
          <div className="mb-8 p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-blue-900 tracking-tight">
                    1-CLICK VERIFIED ENTERPRISE DEMO LOGINS
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Instantly load and authenticate into any of the 4 isolated enterprise roles:
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block font-mono text-[10px] text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                Key: enterprise_pass_2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {demoAccounts.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleQuickDemo(d.role)}
                    className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition text-left cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${d.accent}`}>
                        {d.title}
                      </span>
                      <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block truncate">
                        {d.name}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono block truncate">
                        {d.email}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 block line-clamp-1">
                        {d.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AUTH FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password / Access Key
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo passwords are pre-populated via 1-click shortcuts above.')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepActive}
                    onChange={(e) => setKeepActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Keep session active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Enterprise Credentials...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Elena Rostova"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Enterprise Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Apex Dynamics Global Corp"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Corporate Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.rostova@enterprise.ai"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Assign Role Permission Tier
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'ADMIN', label: 'Administrator', icon: Shield, desc: 'Enterprise Twin governance' },
                    { id: 'PROCUREMENT', label: 'Procurement Manager', icon: Briefcase, desc: 'Sourcing & negotiation' },
                    { id: 'SUPPLIER', label: 'Supplier Partner', icon: Truck, desc: 'RFQ quotes & dispatch' },
                    { id: 'CUSTOMER', label: 'Customer OEM', icon: UserCheck, desc: 'Orders & transparency' },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSel = selectedRole === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedRole(r.id as UserRole)}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
                          isSel
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-xs block">{r.label}</span>
                          <span className="text-[10px] text-gray-500 block">{r.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Security Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Provisioning Twin Node...' : 'Create Enterprise Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="max-w-2xl mx-auto w-full pt-8 text-center text-xs text-gray-400">
          <span>Nexora Enterprise Supply Chain Management System © 2026. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  );
};
