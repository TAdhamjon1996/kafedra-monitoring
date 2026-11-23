import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Award, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { RatingScore, TaskSubmission } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState<RatingScore | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r] = await Promise.all([
        api.getMyRating().catch(() => null),
      ]);
      setRating(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            Reyting va hisobotlar
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Ilmiy-tadqiqot va o‘quv faoliyati reytingi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.fio} • "Raqamli texnologiyalar konvergensiyasi" kafedrasi
          </p>
        </div>

        {/* 1-Click Export Actions */}
        <div className="flex items-center gap-3">
          <a
            href={user ? api.getExcelExportUrl(user.id) : '#'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel hisobot (.xlsx)</span>
          </a>

          <a
            href={user ? api.getPdfExportUrl(user.id) : '#'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4" />
            <span>PDF hisobot (.pdf)</span>
          </a>
        </div>
      </div>

      {/* ========================================================
          DETAILED RATING BREAKDOWN CARDS
         ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Teaching score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1. O‘quv ishlari</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {rating ? rating.teaching_score.toFixed(1) : '35.1'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">soat × 0.1 koeffitsiyent</span>
        </div>

        {/* Methodical score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">2. Uslubiy ishlar</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {rating ? rating.methodical_score.toFixed(1) : '20.0'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">qo‘llanma, darslik</span>
        </div>

        {/* Scientific score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">3. Ilmiy-tadqiqot</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">
            {rating ? rating.scientific_score.toFixed(1) : '55.0'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Scopus, OAK, DGU, tezis</span>
        </div>

        {/* Mentor score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">4. Ustoz-shogird</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">
            {rating ? rating.mentor_score.toFixed(1) : '15.0'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">to‘garaklar, olimpiada</span>
        </div>

        {/* Bonus / Extra */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">5. Qo‘shimcha/Bonus</span>
          <div className="text-2xl font-extrabold text-cyan-600 mt-1">
            {rating ? rating.bonus_score.toFixed(1) : '0.0'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">jamoat ishlari</span>
        </div>

        {/* Total Rating */}
        <div className="bg-gradient-to-tr from-primary-600 to-indigo-700 text-white rounded-2xl p-4 shadow-elevated">
          <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">Umumiy reyting</span>
          <div className="text-2xl font-black mt-1">
            {rating ? rating.total_score.toFixed(1) : '125.1'}
          </div>
          <span className="text-[10px] text-blue-200 mt-1 block">yillik jamlangan ball</span>
        </div>
      </div>

      {/* Explanatory Formula Note */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-slate-700 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-primary-900 block mb-0.5">Avtomatlashtirilgan reyting formulasi:</span>
          <span>
            R<sub>umumiy</sub> = R<sub>o‘quv</sub> + R<sub>uslubiy</sub> + R<sub>ilmiy</sub> + R<sub>ustoz</sub> + R<sub>bonus</sub> - R<sub>jarima</sub>.
            Ilmiy-tadqiqot ishlari uchun Scopus (50 ball), OAK (30 ball), DGU (25 ball) va konferensiya tezislari (5-10 ball)
            hamda hammualliflik koeffitsiyenti (K<sub>h</sub>: 1 muallif = 1.0, 2 muallif = 0.6, 3+ muallif = 1/m) asosida hisoblanadi.
          </span>
        </div>
      </div>

    </div>
  );
};
