import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  Clock, 
  Check, 
  LogIn, 
  Info, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api';
import { LandingStats } from '../../types';

interface LandingPageProps {
  onOpenLogin: () => void;
  onNavigateAbout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  const [stats, setStats] = useState<LandingStats>({
    teachers_count: 325,
    submitted_reports: 298,
    approved_reports: 276,
    in_progress_reports: 22,
    department_name: 'Raqamli texnologiyalar konvergensiyasi kafedrasi'
  });

  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'guide' | 'contact'>('home');

  useEffect(() => {
    api.getLandingStats().then(setStats).catch(() => {
      // fallback to mock stats
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F5FF] via-[#F8FAFC] to-white flex flex-col font-sans">
      {/* --- TOP NAVBAR --- */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Department Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1D5CE5] to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight block">
                Raqamli texnologiyalar
              </span>
              <span className="font-semibold text-primary-500 text-xs sm:text-sm tracking-wide block">
                konvergensiyasi kafedrasi
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'home' ? 'text-primary-600 font-semibold bg-primary-50' : 'hover:text-primary-600'
              }`}
            >
              Bosh sahifa
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'about' ? 'text-primary-600 font-semibold bg-primary-50' : 'hover:text-primary-600'
              }`}
            >
              Tizim haqida
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'guide' ? 'text-primary-600 font-semibold bg-primary-50' : 'hover:text-primary-600'
              }`}
            >
              Foydalanuvchi qo‘llanmasi
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'contact' ? 'text-primary-600 font-semibold bg-primary-50' : 'hover:text-primary-600'
              }`}
            >
              Aloqa
            </button>
          </nav>

          {/* Right actions: Lang selector + Login */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-full border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-primary-500" />
              <span>UZ</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Tizimga kirish</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-primary-600 border border-blue-200/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>O‘qituvchilar uchun axborot tizimi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              O‘qituvchilarning <br />
              <span className="text-primary-500">yillik hisobotlar tizimi</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Universitet o‘qituvchilarining yillik hisobotlarini elektron shaklda tayyorlash, topshirish va qabul qilish jarayonini avtomatlashtiruvchi axborot tizimi.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="w-5 h-5" />
                <span>Tizimga kirish</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
              >
                <Info className="w-5 h-5 text-primary-500" />
                <span>Tizim haqida</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Davlat standarti (SHIR)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-500" />
                <span>Avtomatik Reyting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>PDF & Excel eksport</span>
              </div>
            </div>
          </div>

          {/* Right Visual Graphic (Matching Image 1 Laptop & University Facade) */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none">
              
              {/* Modern Graphic Container */}
              <div className="relative rounded-3xl p-6 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-cyan-500/10 border border-blue-100 shadow-elevated overflow-hidden">
                
                {/* Background University Building Stylized Illustration */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800">
                  
                  {/* Laptop Mockup Frame */}
                  <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <div className="mx-auto text-[11px] font-mono text-slate-400 bg-slate-900/60 px-4 py-0.5 rounded-full border border-slate-700/50">
                      https://monitoring.tuit.uz/dashboard
                    </div>
                  </div>

                  {/* Screen Content inside mockup */}
                  <div className="p-5 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">Yillik hisobot</div>
                          <div className="text-[10px] text-slate-400">Egamberdiyev Nodir (Assistent)</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        851 / 851 soat (100%)
                      </span>
                    </div>

                    {/* Miniature Dashboard Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="text-[9px] text-slate-500">O‘quv ishlari</div>
                        <div className="text-sm font-bold text-primary-600">75%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-[9px] text-slate-500">Ilmiy-tadqiqot</div>
                        <div className="text-sm font-bold text-emerald-600">80%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="text-[9px] text-slate-500">Reyting ball</div>
                        <div className="text-sm font-bold text-purple-600">125.1</div>
                      </div>
                    </div>

                    {/* Progress Bar simulation */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600">
                        <span>SHIR bajarilishi</span>
                        <span className="text-primary-600 font-bold">16 / 24 topshiriq</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full w-[67%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating "Yillik hisobot" Approved Document Badge */}
                <div className="absolute -bottom-2 right-4 sm:right-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Yillik hisobot</div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span>Kafedra tasdiqlagan</span>
                    </div>
                  </div>
                </div>

                {/* Top Corner Building Plaque */}
                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl px-3 py-1.5 shadow-lg border border-white/20 text-[10px] font-semibold tracking-wide uppercase">
                  Raqamli texnologiyalar konvergensiyasi
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* --- 4 STEP PROCESS CARDS (From Image 1) --- */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Step 1: Hisobotni tayyorlash */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card card-hover-effect flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary-500 flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hisobotni tayyorlash</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Yillik ish faoliyatingiz bo‘yicha hisobotni onlayn shakllantiring
              </p>
            </div>
          </div>

          {/* Step 2: Topshirish */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card card-hover-effect flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Topshirish</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tayyor hisobotni elektron shaklda topshiring
              </p>
            </div>
          </div>

          {/* Step 3: Qabul qilish */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card card-hover-effect flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Qabul qilish</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hisobotlarni mas’ullar tomonidan ko‘rib chiqish va tasdiqlash
              </p>
            </div>
          </div>

          {/* Step 4: Monitoring va tahlil */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card card-hover-effect flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monitoring va tahlil</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hisobotlar holati va natijalarini jonli ko‘rinishda tahlil qiling
              </p>
            </div>
          </div>

        </div>

        {/* --- LIVE STATS BAR (From Image 1 bottom) --- */}
        <div className="mt-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* O'qituvchilar */}
            <div className="flex items-center gap-4 px-2 pt-2 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary-500 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">O‘qituvchilar</div>
                <div className="text-2xl font-bold text-slate-900">{stats.teachers_count}</div>
              </div>
            </div>

            {/* Topshirilgan hisobotlar */}
            <div className="flex items-center gap-4 px-2 sm:px-6 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Topshirilgan hisobotlar</div>
                <div className="text-2xl font-bold text-slate-900">{stats.submitted_reports}</div>
              </div>
            </div>

            {/* Qabul qilingan */}
            <div className="flex items-center gap-4 px-2 sm:px-6 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Qabul qilingan</div>
                <div className="text-2xl font-bold text-slate-900">{stats.approved_reports}</div>
              </div>
            </div>

            {/* Jarayonda */}
            <div className="flex items-center gap-4 px-2 sm:px-6 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Jarayonda</div>
                <div className="text-2xl font-bold text-slate-900">{stats.in_progress_reports}</div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-12 bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026-2027 Muhammad al-Xorazmiy nomidagi TATU. "Raqamli texnologiyalar konvergensiyasi" kafedrasi.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Muallif: Egamberdiyev Nodir</span>
            <span>•</span>
            <span className="text-slate-500">Ilmiy rahbar: p.f.d., prof. F.M. Zakirova</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
