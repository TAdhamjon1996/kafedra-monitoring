import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User as UserIcon, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Headphones, 
  HelpCircle, 
  ChevronDown, 
  BookOpen, 
  GraduationCap, 
  FlaskConical, 
  Users, 
  Layers, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PlusCircle, 
  Upload, 
  TrendingUp, 
  Award,
  ChevronRight,
  ExternalLink,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardOverview, ShirTask, RatingScore } from '../../types';
import { CircularProgress } from '../common/CircularProgress';
import { MetricCard } from '../common/MetricCard';

interface TeacherDashboardProps {
  onOpenSubmitModal: (task?: ShirTask) => void;
  onOpenContactModal: () => void;
  onNavigateSection: (section: string) => void;
  activeSection: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenSubmitModal,
  onOpenContactModal,
  onNavigateSection,
  activeSection,
}) => {
  const { user, logout, switchUser } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [rating, setRating] = useState<RatingScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, ratingData] = await Promise.all([
        api.getDashboardOverview(),
        api.getMyRating().catch(() => null),
      ]);
      setOverview(overviewData);
      setRating(ratingData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 5 Category metadata mapping to match Image 2
  const categoryMeta = [
    {
      id: 1,
      title: "1. O‘quv ishlari",
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      color: "#1D5CE5",
      btnBg: "bg-blue-600 hover:bg-blue-700",
      total: 8,
      completed: 6,
      pct: 75,
    },
    {
      id: 2,
      title: "2. O‘quv-uslubiy",
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      color: "#10B981",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
      total: 7,
      completed: 4,
      pct: 57,
    },
    {
      id: 3,
      title: "3. Ilmiy-tadqiqot",
      icon: <FlaskConical className="w-5 h-5 text-amber-600" />,
      color: "#F59E0B",
      btnBg: "bg-amber-500 hover:bg-amber-600",
      total: 6,
      completed: 3,
      pct: 50,
    },
    {
      id: 4,
      title: "4. Ustoz-shogird ishlari",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: "#8B5CF6",
      btnBg: "bg-purple-600 hover:bg-purple-700",
      total: 5,
      completed: 4,
      pct: 80,
    },
    {
      id: 5,
      title: "5. Qo‘shimcha bajarilgan ishlar",
      icon: <Layers className="w-5 h-5 text-cyan-600" />,
      color: "#06B6D4",
      btnBg: "bg-cyan-600 hover:bg-cyan-700",
      total: 4,
      completed: 4,
      pct: 67,
    },
  ];

  // Merge live categories progress if available
  const mergedCategories = categoryMeta.map((cat) => {
    if (overview && overview.categories_progress) {
      const live = overview.categories_progress.find((c) => c.category_id === cat.id);
      if (live) {
        return {
          ...cat,
          total: live.total_tasks,
          completed: live.completed_tasks,
          pct: live.percentage,
        };
      }
    }
    return cat;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row font-sans">
      
      {/* ========================================================
          LEFT SIDEBAR (Matches Image 2)
         ======================================================== */}
      <aside className="w-full lg:w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-4 shrink-0 shadow-sm z-30">
        <div>
          {/* Logo & Department Branding */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight block">
                Raqamli texnologiyalar
              </span>
              <span className="font-semibold text-primary-500 text-[11px] block">
                konvergensiyasi kafedrasi
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => onNavigateSection('dashboard')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'dashboard'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Bosh sahifa</span>
            </button>

            <button
              onClick={() => onNavigateSection('profile')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'profile'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Mening profilim</span>
            </button>

            <button
              onClick={() => onNavigateSection('tasks')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'tasks'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Topshiriqlarim</span>
            </button>

            <button
              onClick={() => onNavigateSection('plan')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'plan'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Yillik ish rejasi</span>
            </button>

            <button
              onClick={() => onNavigateSection('reports')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'reports'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Hisobotlar</span>
            </button>

            <button
              onClick={() => onNavigateSection('announcements')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'announcements'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>E’lonlar</span>
            </button>

            <button
              onClick={() => onNavigateSection('settings')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'settings'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Sozlamalar</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </nav>
        </div>

        {/* Support Box (Bottom of Sidebar in Image 2) */}
        <div className="mt-8 bg-blue-50/70 rounded-2xl p-4 border border-blue-100/80 text-center">
          <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white mx-auto flex items-center justify-center shadow-md shadow-primary-500/20 mb-2">
            <Headphones className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Yordam kerakmi?</h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Savol va muammolaringiz bo‘yicha biz bilan bog‘laning.
          </p>
          <button
            onClick={onOpenContactModal}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition-all"
          >
            Bog‘lanish
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-slate-900">Bosh sahifa</h1>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-slate-100 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Bildirishnomalar</span>
                    <span className="text-[10px] text-primary-600 font-semibold cursor-pointer">Barchasini o‘qilgan qilish</span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div className="p-2 rounded-xl bg-blue-50 text-[11px] text-slate-700">
                      <div className="font-semibold text-primary-700">Yillik hisobot muddati</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Topshiriqlarni o‘z vaqtida yakunlang (10.05.2024)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Icon */}
            <button
              onClick={onOpenContactModal}
              className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile Badge */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">
                  {user?.fio ? user.fio.substring(0, 2).toUpperCase() : 'EN'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.fio || 'Egamberdiyev N.'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user?.position || 'O‘qituvchi'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown & Quick User Switch */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-slate-100 p-3 z-50 text-xs">
                  <div className="pb-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{user?.fio}</div>
                    <div className="text-slate-400 text-[11px]">{user?.email}</div>
                    <div className="mt-1 text-[10px] font-semibold text-primary-600 bg-primary-50 inline-block px-2 py-0.5 rounded-full">
                      {user?.department}
                    </div>
                  </div>

                  {/* Switch user demo helper */}
                  <div className="py-2 border-b border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Foydalanuvchini almashtirish
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => { switchUser('nodir@tuit.uz'); setUserMenuOpen(false); }}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 font-medium text-slate-700"
                      >
                        👨‍🏫 Egamberdiyev Nodir (Assistent)
                      </button>
                      <button
                        onClick={() => { switchUser('mudir@tuit.uz'); setUserMenuOpen(false); }}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 font-medium text-slate-700"
                      >
                        🏛️ Dots. Aliyev S.A. (Kafedra mudiri)
                      </button>
                      <button
                        onClick={() => { switchUser('admin@tuit.uz'); setUserMenuOpen(false); }}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 font-medium text-slate-700"
                      >
                        ⚙️ Administrator (Tizim boshqaruvi)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full mt-2 text-left px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Tizimdan chiqish</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
          
          {/* ========================================================
              WELCOME BANNER (Matches Image 2)
             ======================================================== */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0C3284] via-[#1548BD] to-[#1D5CE5] p-6 sm:p-8 text-white shadow-elevated overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-blue-200 text-xs sm:text-sm font-medium">Xush kelibsiz,</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {user?.fio || 'Egamberdiyev Nodir!'}
                </h2>
                <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
                  Sizning faoliyatingiz bo‘yicha vazifalarni bajaring va natijangizni kuzating.
                </p>

                {/* Rating score badge & CTA button */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Joriy reyting: {rating ? rating.total_score.toFixed(1) : '125.1'} ball</span>
                  </div>

                  <button
                    onClick={() => onOpenSubmitModal()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-primary-600 hover:bg-blue-50 text-xs font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Hisobot topshirish</span>
                  </button>
                </div>
              </div>

              {/* Banner Right Illustration (Checklist & Building Plaque) */}
              <div className="hidden md:flex items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-bold text-white">O‘quv yili: 2026/2027</div>
                    <div className="text-blue-200 text-[11px]">Reja: 851 soat (1.0 stavka)</div>
                    <div className="text-emerald-300 font-semibold text-[10px] mt-0.5">Holat: Tasdiqlangan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              4 TOP METRIC CARDS (Topshiriqlar, Bajarilgan, Jarayonda, Bajarilmagan)
             ======================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <MetricCard
              title="Topshiriqlar"
              value={overview?.total_tasks ?? 24}
              subtitle="Jami topshiriqlar"
              icon={<FileText className="w-6 h-6 text-primary-600" />}
              iconBg="bg-blue-50"
              onClick={() => onNavigateSection('tasks')}
            />

            <MetricCard
              title="Bajarilgan"
              value={overview?.completed_tasks ?? 16}
              subtitle="Bajarilgan topshiriqlar"
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-50"
              onClick={() => onNavigateSection('tasks')}
            />

            <MetricCard
              title="Jarayonda"
              value={overview?.in_progress_tasks ?? 6}
              subtitle="Jarayondagi topshiriqlar"
              icon={<Clock className="w-6 h-6 text-amber-600" />}
              iconBg="bg-amber-50"
              onClick={() => onNavigateSection('tasks')}
            />

            <MetricCard
              title="Bajarilmagan"
              value={overview?.uncompleted_tasks ?? 2}
              subtitle="Bajarilmagan topshiriqlar"
              icon={<XCircle className="w-6 h-6 text-rose-600" />}
              iconBg="bg-rose-50"
              onClick={() => onNavigateSection('tasks')}
            />
          </div>

          {/* ========================================================
              5 DIRECTION RADIAL PROGRESS CARDS (From Image 2)
             ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Yillik shaxsiy ish rejasi bo‘yicha topshiriqlar
              </h3>
              <button
                onClick={() => onNavigateSection('plan')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>To‘liq reja</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {mergedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-card flex flex-col justify-between card-hover-effect"
                >
                  {/* Card Header: Icon + Title + Task count */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {cat.icon}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate" title={cat.title}>
                        {cat.title}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-400 mb-4">
                      Jami topshiriq: {cat.total}
                    </div>
                  </div>

                  {/* Circular Progress & Fraction */}
                  <div className="flex flex-col items-center justify-center my-2">
                    <CircularProgress
                      percentage={cat.pct}
                      color={cat.color}
                      size={86}
                      strokeWidth={8}
                    />
                    <div className="mt-3 text-xs font-semibold text-slate-600">
                      {cat.completed} / {cat.total} bajarilgan
                    </div>
                  </div>

                  {/* Action button: Topshiriqlarim */}
                  <button
                    onClick={() => onNavigateSection('tasks')}
                    className={`mt-4 w-full py-2 px-3 rounded-xl text-white text-xs font-bold shadow-sm transition-all transform active:scale-95 ${cat.btnBg}`}
                  >
                    Topshiriqlarim
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              BOTTOM ROW: RECENT TASKS & ANNOUNCEMENTS
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: So'nggi topshiriqlar (Matches Image 2) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">So‘nggi topshiriqlar</h3>
                <button
                  onClick={() => onNavigateSection('tasks')}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Barchasi
                </button>
              </div>

              <div className="space-y-3">
                {/* Task 1 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Ma'ruza konspektlarini Moodle platformasiga joylash
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">O‘quv ishlari • 40 soat</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Bajarilgan
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">16.05.2024</div>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Dars ishlanmalari va slaydlarni yuklash
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">O‘quv-uslubiy • 30 soat</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Jarayonda
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Muddati: 25.05.2024</div>
                  </div>
                </div>

                {/* Task 3 (Scopus article submission sample) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Scopus bazasidagi ilmiy jurnalda maqola chop etish
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Ilmiy-tadqiqot • 100 soat • 50 ball</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <button
                      onClick={() => onOpenSubmitModal()}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
                    >
                      Yuklash
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: E'lonlar (Matches Image 2) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">E’lonlar</h3>
                  <button
                    onClick={() => onNavigateSection('announcements')}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Barchasi
                  </button>
                </div>

                {/* Announcement card */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 space-y-2">
                  <div className="flex items-center gap-2 text-primary-700 font-bold text-xs">
                    <Bell className="w-4 h-4" />
                    <span>Eslatma!</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Yillik shaxsiy ish rejasi bo‘yicha topshiriqlarni o‘z vaqtida bajarishingizni so‘raymiz.
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-blue-100/60">
                    10.05.2024 • Kafedra mudiri
                  </div>
                </div>

                {/* Secondary announcement */}
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>OAK va Scopus maqolalari</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Yillik reyting hisoblash uchun barcha nashr etilgan maqolalar DOI havolasi va PDF shakli bilan tizimga kiritilishi shart.
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    05.05.2024 • Ilmiy bo‘lim
                  </div>
                </div>
              </div>

              {/* Quick links to download reports */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">SHIR hisobotini yuklab olish:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={user ? api.getExcelExportUrl(user.id) : '#'}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Excel</span>
                  </a>
                  <a
                    href={user ? api.getPdfExportUrl(user.id) : '#'}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
