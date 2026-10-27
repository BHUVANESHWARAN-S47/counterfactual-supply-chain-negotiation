import React, { useState } from 'react';
import {
  Boxes,
  Cpu,
  Shield,
  Briefcase,
  Truck,
  UserCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Activity,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { UserRole } from '../types';

export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [targetRole, setTargetRole] = useState<UserRole>('ADMIN');

  const openAuth = (mode: 'login' | 'register', role: UserRole = 'ADMIN') => {
    setAuthMode(mode);
    setTargetRole(role);
    setAuthModalOpen(true);
  };

  const scrollToCapabilities = () => {
    const el = document.getElementById('capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080507] text-white font-sans selection:bg-[#8e3a59] selection:text-white">
      {/* =========================================================================
          PAGE 1: CINEMATIC DIGITAL TWIN HERO
         ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0a0508] via-[#140a10] to-[#1c0d17]">
        {/* Ambient Network Graphics & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(142,58,89,0.35),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d2b0bd_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        {/* Minimal Embedded Header (Inside Hero) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8e3a59] flex items-center justify-center shadow-lg shadow-[#8e3a59]/30 text-white">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm uppercase block text-white">
                RIMBERIO AI
              </span>
              <span className="text-[10px] text-pink-200/70 tracking-widest block uppercase">
                SUPPLY CHAIN TWIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-pink-100/80">
              <button onClick={scrollToCapabilities} className="hover:text-white transition">
                Simulation Twin
              </button>
              <button onClick={scrollToCapabilities} className="hover:text-white transition">
                Multi-Agent Engine
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuth('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-pink-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('register')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8e3a59] hover:bg-[#752d48] shadow-lg shadow-[#8e3a59]/30 transition cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-6 my-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/15 text-pink-200 backdrop-blur-md shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Multi-Agent Runtime Active</span>
          </div>

          {/* Headline with Pink/Mauve Accent */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous AI{' '}
            <span className="text-[#bb899b] block sm:inline">
              Supply Chain Twin
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-pink-100/80 max-w-2xl mx-auto font-normal leading-relaxed">
            Predictive logistics delay forecasting, bilateral multi-agent vendor negotiation, and real-time counterfactual simulation for enterprise networks.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => openAuth('register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold text-sm shadow-xl shadow-[#8e3a59]/30 transition cursor-pointer"
            >
              <span>Register Organization</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => openAuth('login')}
              className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition cursor-pointer"
            >
              Sign In to Platform
            </button>
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md py-4">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-xs text-pink-200/70 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Real-Time AIS Vessel Telemetry Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#bb899b]" />
              <span>4 Enterprise User Roles (Admin, Procurement, Supplier, Customer)</span>
            </div>
            <button
              onClick={scrollToCapabilities}
              className="flex items-center gap-1 text-white hover:text-pink-200 transition cursor-pointer font-medium"
            >
              <span>Explore Core Capabilities</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PAGE 2: PRODUCTION ARCHITECTURE & CORE PLATFORM CAPABILITIES (#capabilities)
         ========================================================================= */}
      <section id="capabilities" className="py-24 bg-[#fdf2f8] text-slate-800 border-t border-[#d2b0bd]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          {/* Section Heading */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8e3a59] text-white">
              Production Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Core Platform Capabilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Designed for enterprise operations to eliminate logistics bottlenecks, automate supplier contracts, and safeguard production schedules.
            </p>
          </div>

          {/* 4 Core Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Multi-Agent AI */}
            <div className="p-8 rounded-3xl bg-white border border-[#d2b0bd] shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8e3a59]">
                    Multi-Agent AI
                  </span>
                  <div className="p-2 rounded-xl bg-[#fdf2f8] text-[#8e3a59] border border-[#d2b0bd]">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Bilateral Automated Negotiation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Buyer and Supplier agents autonomously evaluate concession frontiers across unit cost, batch volume, and delivery schedules without manual overhead.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e8d8de] flex items-center justify-between text-xs text-[#8e3a59] font-bold">
                <span>Autonomous Concession Engine</span>
                <span>Active</span>
              </div>
            </div>

            {/* Card 2: Digital Twin */}
            <div className="p-8 rounded-3xl bg-white border border-[#d2b0bd] shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8e3a59]">
                    Digital Twin
                  </span>
                  <div className="p-2 rounded-xl bg-[#fdf2f8] text-[#8e3a59] border border-[#d2b0bd]">
                    <Cpu className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Counterfactual Disruption Sim
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  1,000-trial Monte Carlo simulations quantifying maritime bottlenecks, port wait times, and downstream inventory depletion risk.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e8d8de] flex items-center justify-between text-xs text-[#8e3a59] font-bold">
                <span>5-Branch What-If Engine</span>
                <span>Calibrated</span>
              </div>
            </div>

            {/* Card 3: Adaptive Engine */}
            <div className="p-8 rounded-3xl bg-white border border-[#d2b0bd] shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8e3a59]">
                    Adaptive Engine
                  </span>
                  <div className="p-2 rounded-xl bg-[#fdf2f8] text-[#8e3a59] border border-[#d2b0bd]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  ML Decision & Switching Policy
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Trained Random Forest classification dynamically recommending whether to Retain incumbents, Negotiate terms, or Switch suppliers.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e8d8de] flex items-center justify-between text-xs text-[#8e3a59] font-bold">
                <span>Retain • Negotiate • Switch</span>
                <span>Optimized</span>
              </div>
            </div>

            {/* Card 4: Enterprise SLA */}
            <div className="p-8 rounded-3xl bg-white border border-[#d2b0bd] shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8e3a59]">
                    Enterprise SLA
                  </span>
                  <div className="p-2 rounded-xl bg-[#fdf2f8] text-[#8e3a59] border border-[#d2b0bd]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Customer SLA Protection
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Real-time telemetry continuously computes tier-based penalty exposure, issues transparent advisories, and eliminates supply chain downtime.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e8d8de] flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>99.2% SLA Guarantee</span>
                <span>Protected</span>
              </div>
            </div>
          </div>

          {/* Console Experience Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#140a10] to-[#24131d] text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                Calibrated Enterprise Models
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Experience the Autonomous Multi-Agent Console
              </h3>
              <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed">
                Calibrated against Kaggle supply chain datasets with trained Gradient Boosting and Random Forest models.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button
                onClick={() => openAuth('register')}
                className="px-6 py-3 rounded-xl bg-[#8e3a59] hover:bg-[#752d48] text-white font-bold text-xs transition shadow-lg shadow-[#8e3a59]/30 cursor-pointer"
              >
                Register Organization
              </button>
              <button
                onClick={() => openAuth('login')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition cursor-pointer"
              >
                Sign In to Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0508] py-8 text-pink-200/60 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white">
            RIMBERIO AI / CNT PLATFORM — Enterprise Digital Supply Chain Twin
          </span>
          <div className="flex items-center gap-4">
            <button onClick={() => openAuth('login')} className="hover:text-white transition">
              Sign In
            </button>
            <button onClick={() => openAuth('register')} className="hover:text-white transition">
              Register
            </button>
            <a
              href="http://127.0.0.1:8001/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>API Specs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <span>All Systems Operational © 2026 Rimberio Platform</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={targetRole}
      />
    </div>
  );
};
