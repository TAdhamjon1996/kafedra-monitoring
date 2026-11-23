import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { MudirDashboard } from './components/dashboard/MudirDashboard';
import { AnnualPlanView } from './components/dashboard/AnnualPlanView';
import { ReportsView } from './components/dashboard/ReportsView';
import { LoginModal } from './components/modals/LoginModal';
import { SubmitReportModal } from './components/modals/SubmitReportModal';
import { ContactModal } from './components/modals/ContactModal';
import { ShirTask } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Navigation & Modals state
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<ShirTask | undefined>(undefined);
  const [tasksList, setTasksList] = useState<ShirTask[]>([]);

  // Fetch tasks for dropdown in submit modal
  const handleOpenSubmitModal = async (task?: ShirTask) => {
    setSelectedTaskForSubmit(task);
    try {
      const myTasks = await api.getMyTasks();
      setTasksList(myTasks);
    } catch {
      // fallback
    }
    setSubmitModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Tizim yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Landing page
  if (!user) {
    return (
      <>
        <LandingPage onOpenLogin={() => setLoginModalOpen(true)} />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => setLoginModalOpen(false)}
        />
        <ContactModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
        />
      </>
    );
  }

  // Head of department or Admin view
  if (user.role === 'head_of_dept' || user.role === 'admin') {
    return (
      <div className="min-h-screen bg-surface">
        {/* Navigation header for Head of Department */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold">
              RTK
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                Raqamli texnologiyalar konvergensiyasi
              </span>
              <span className="text-[10px] text-primary-600 font-semibold block">
                {user.role === 'head_of_dept' ? 'Kafedra mudiri portali' : 'Administrator portali'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <div className="font-bold text-slate-900">{user.fio}</div>
              <div className="text-[10px] text-slate-500">{user.position}</div>
            </div>
            <button
              onClick={() => api.logout().then(() => window.location.reload())}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
            >
              Chiqish
            </button>
          </div>
        </header>

        <MudirDashboard />
      </div>
    );
  }

  // Teacher View (Egamberdiyev Nodir)
  return (
    <>
      {activeSection === 'dashboard' && (
        <TeacherDashboard
          activeSection={activeSection}
          onNavigateSection={setActiveSection}
          onOpenSubmitModal={handleOpenSubmitModal}
          onOpenContactModal={() => setContactModalOpen(true)}
        />
      )}

      {activeSection === 'plan' && (
        <div className="min-h-screen bg-surface flex flex-col">
          <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
            >
              ← Bosh sahifaga qaytish
            </button>
            <span className="text-xs font-semibold text-slate-500">{user.fio}</span>
          </header>
          <AnnualPlanView onOpenSubmitModal={handleOpenSubmitModal} />
        </div>
      )}

      {activeSection === 'tasks' && (
        <div className="min-h-screen bg-surface flex flex-col">
          <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
            >
              ← Bosh sahifaga qaytish
            </button>
            <span className="text-xs font-semibold text-slate-500">Mening topshiriqlarim</span>
          </header>
          <AnnualPlanView onOpenSubmitModal={handleOpenSubmitModal} />
        </div>
      )}

      {activeSection === 'reports' && (
        <div className="min-h-screen bg-surface flex flex-col">
          <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
            >
              ← Bosh sahifaga qaytish
            </button>
            <span className="text-xs font-semibold text-slate-500">Reyting va hisobotlar</span>
          </header>
          <ReportsView />
        </div>
      )}

      {activeSection === 'announcements' && (
        <div className="min-h-screen bg-surface flex flex-col">
          <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
            >
              ← Bosh sahifaga qaytish
            </button>
            <span className="text-xs font-semibold text-slate-500">Kafedra e’lonlari</span>
          </header>
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Barcha e’lonlar</h2>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold text-primary-600 bg-blue-50 px-2 py-0.5 rounded-full">Muhim eslatma</span>
              <h3 className="text-sm font-bold text-slate-800">Yillik hisobotlarni topshirish yakuni</h3>
              <p className="text-xs text-slate-600">
                2026/2027 o‘quv yili bo‘yicha professor-o‘qituvchilar shaxsiy ish rejasining (SHIR) bajarilishi yuzasidan barcha tasdiqlovchi hujjatlarni 25-mayga qadar tizimga yuklashingiz so‘raladi.
              </p>
              <span className="text-[10px] text-slate-400 block pt-2 border-t border-slate-100">10.05.2024 • Kafedra mudirligi</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SubmitReportModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSuccess={() => {
          setActiveSection('dashboard');
        }}
        selectedTask={selectedTaskForSubmit}
        tasksList={tasksList}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
