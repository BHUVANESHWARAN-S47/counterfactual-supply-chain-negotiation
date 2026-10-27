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
import { LoginPage } from './LoginPage';
import { UserRole } from '../types';

interface LandingPageProps {
  onGoToLogin?: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  const [showFullLoginPage, setShowFullLoginPage] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [targetRole, setTargetRole] = useState<UserRole>('ADMIN');

  const openAuth = (mode: 'login' | 'register', role: UserRole = 'ADMIN') => {
    if (onGoToLogin) {
      onGoToLogin(mode);
    } else {
      setAuthMode(mode);
      setTargetRole(role);
      setShowFullLoginPage(true);
    }
  };

  const scrollToCapabilities = () => {
    const el = document.getElementById('capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (showFullLoginPage) {
    return (
      <LoginPage
        initialMode={authMode}
        initialRole={targetRole}
        onBackToLanding={() => setShowFullLoginPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          PAGE 1: CINEMATIC DIGITAL TWIN HERO
         ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#1E1B4B]">
        {/* Ambient Network Graphics & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#93C5FD_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        {/* Minimal Embedded Header (Inside Hero) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm uppercase block text-white">
                NEXORA TWIN
              </span>
              <span className="text-[10px] text-blue-200/70 tracking-widest block uppercase">
                SUPPLY CHAIN DIGITAL TWIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('register')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 backdrop-blur-md shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Multi-Agent Runtime Active</span>
          </div>

          {/* Headline with Blue/Indigo Accent */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous AI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 block sm:inline">
              Supply Chain Twin
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Predictive logistics delay forecasting, bilateral multi-agent vendor negotiation, and real-time counterfactual simulation for enterprise networks.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => openAuth('register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition cursor-pointer"
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
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-xs text-blue-200/80 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Real-Time AIS Vessel Telemetry Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span>4 Enterprise User Roles (Admin, Procurement, Supplier, Customer)</span>
            </div>
            <button
              onClick={scrollToCapabilities}
              className="flex items-center gap-1 text-white hover:text-blue-200 transition cursor-pointer font-medium"
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
      <section id="capabilities" className="py-24 bg-[#F5F7FB] text-gray-800 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          {/* Section Heading */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white">
              Production Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Core Platform Capabilities
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Designed for enterprise operations to eliminate logistics bottlenecks, automate supplier contracts, and safeguard production schedules.
            </p>
          </div>

          {/* 4 Core Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Multi-Agent AI */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                    Multi-Agent AI
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Bilateral Automated Negotiation
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Buyer and Supplier agents autonomously evaluate concession frontiers across unit cost, batch volume, and delivery schedules without manual overhead.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                <span>Autonomous Concession Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Active</span>
              </div>
            </div>

            {/* Card 2: Digital Twin */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600">
                    Digital Twin
                  </span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                    <Cpu className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Counterfactual Disruption Sim
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  1,000-trial Monte Carlo simulations quantifying maritime bottlenecks, port wait times, and downstream inventory depletion risk.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-purple-600 font-bold">
                <span>5-Branch What-If Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">Calibrated</span>
              </div>
            </div>

            {/* Card 3: Adaptive Engine */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                    Adaptive Engine
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  ML Decision & Switching Policy
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Trained Random Forest classification dynamically recommending whether to Retain incumbents, Negotiate terms, or Switch suppliers.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                <span>Retain • Negotiate • Switch</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Optimized</span>
              </div>
            </div>

            {/* Card 4: Enterprise SLA */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                    Enterprise SLA
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Customer SLA Protection
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Real-time telemetry continuously computes tier-based penalty exposure, issues transparent advisories, and eliminates supply chain downtime.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                <span>99.2% SLA Guarantee</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Protected</span>
              </div>
            </div>
          </div>

          {/* Console Experience Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E1B4B] text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Calibrated Enterprise Models
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Experience the Autonomous Multi-Agent Console
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                Calibrated against Kaggle supply chain datasets with trained Gradient Boosting and Random Forest models.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button
                onClick={() => openAuth('register')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30 cursor-pointer"
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
      <footer className="border-t border-gray-800 bg-[#0B0F19] py-8 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white">
            NEXORA TWIN PLATFORM — Enterprise Digital Supply Chain Twin
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
          <span>All Systems Operational © 2026 Nexora Supply Chain Systems</span>
        </div>
      </footer>
    </div>
  );
};
