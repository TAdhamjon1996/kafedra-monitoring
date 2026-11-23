import React, { useState } from 'react';
import { X, LogIn, Lock, Mail, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('nodir@tuit.uz');
  const [password, setPassword] = useState<string>('nodir2026');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Email yoki parol noto‘g‘ri');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tizimga kirish</h3>
              <p className="text-xs text-slate-400">Yagona monitoring tizimi portali</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Elektron pochta (Login):
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foydalanuvchi@tuit.uz"
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parol:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Kirish</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Login for Evaluation */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Test profillari (1 marta bosishda tanlash):</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => setTestAccount('nodir@tuit.uz', 'nodir2026')}
              className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                email === 'nodir@tuit.uz'
                  ? 'border-primary-500 bg-primary-50/70 text-primary-900 font-bold'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <span className="block font-semibold">👨‍🏫 Egamberdiyev Nodir (Assistent)</span>
                <span className="block text-[10px] text-slate-400">nodir@tuit.uz • 1.0 stavka (851 soat)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-primary-600 font-semibold">
                Tanlash
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTestAccount('mudir@tuit.uz', 'mudir2026')}
              className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                email === 'mudir@tuit.uz'
                  ? 'border-primary-500 bg-primary-50/70 text-primary-900 font-bold'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <span className="block font-semibold">🏛️ Dots. Aliyev S.A. (Kafedra mudiri)</span>
                <span className="block text-[10px] text-slate-400">mudir@tuit.uz • Tasdiqlash huquqi</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-primary-600 font-semibold">
                Tanlash
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTestAccount('admin@tuit.uz', 'admin2026')}
              className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                email === 'admin@tuit.uz'
                  ? 'border-primary-500 bg-primary-50/70 text-primary-900 font-bold'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <span className="block font-semibold">⚙️ Administrator (Tizim boshqaruvi)</span>
                <span className="block text-[10px] text-slate-400">admin@tuit.uz • To‘liq huquq</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-primary-600 font-semibold">
                Tanlash
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
