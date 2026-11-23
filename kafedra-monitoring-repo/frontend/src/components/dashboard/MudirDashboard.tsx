import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink, 
  FileText, 
  Award, 
  Users, 
  AlertCircle, 
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { api } from '../../services/api';
import { TaskSubmission, LeaderboardItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const MudirDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'leaderboard'>('submissions');
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [selectedSub, setSelectedSub] = useState<TaskSubmission | null>(null);
  const [rejectionComment, setRejectionComment] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, board] = await Promise.all([
        api.getPendingSubmissions().catch(() => []),
        api.getDepartmentLeaderboard().catch(() => []),
      ]);
      setSubmissions(subs);
      setLeaderboard(board);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'tasdiqlandi' | 'qaytarildi') => {
    if (!selectedSub) return;
    if (status === 'qaytarildi' && !rejectionComment.trim()) {
      alert('Iltimos, qaytarish sababini yozing!');
      return;
    }

    setActionLoading(true);
    try {
      await api.reviewSubmission(selectedSub.id, status, rejectionComment || undefined);
      setReviewModalOpen(false);
      setSelectedSub(null);
      setRejectionComment('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary-600 text-xs font-bold mb-2">
            <span>Kafedra mudiri kabineti</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Kafedra professor-o‘qituvchilari faoliyatini nazorat qilish
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            "Raqamli texnologiyalar konvergensiyasi" kafedrasi • 2026/2027 o‘quv yili
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tekshirish navbati ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kafedra reyting jadvali
          </button>
        </div>
      </div>

      {/* ========================================================
          SUBMISSIONS REVIEW QUEUE
         ======================================================== */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Kelib tushgan ilmiy hisobotlar va tasdiqlovchi fayllar
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {submissions.length} ta hisobot tekshiruvda
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">Tekshirilishi kerak bo‘lgan hisobotlar mavjud emas</p>
              <p className="text-xs text-slate-400 mt-1">Barcha topshirilgan ishlar ko‘rib chiqilgan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">O‘qituvchi</th>
                    <th className="py-3.5 px-4">Topshiriq / Yo‘nalish</th>
                    <th className="py-3.5 px-4">Nashr / Ish nomi</th>
                    <th className="py-3.5 px-4">Toifa & Mualliflar</th>
                    <th className="py-3.5 px-4">Hujjat</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sub.user_fio || 'Egamberdiyev Nodir'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {sub.task_title || 'Ilmiy-tadqiqot ishi'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate" title={sub.publication_title}>
                        {sub.publication_title}
                        {sub.doi_url && (
                          <a
                            href={sub.doi_url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 text-primary-500 hover:underline inline-flex items-center"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-blue-50 text-primary-700">
                          {sub.activity_type.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sub.co_authors_count} muallif
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.attachments && sub.attachments.length > 0 ? (
                          <a
                            href={sub.attachments[0].file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 hover:underline font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ko‘rish</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">Biriktirilmagan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setReviewModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-all shadow-sm"
                        >
                          Ko‘rib chiqish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          DEPARTMENT LEADERBOARD
         ======================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kafedra professor-o‘qituvchilarining reyting ballari
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                O‘quv, o‘quv-uslubiy, ilmiy-tadqiqot, ustoz-shogird va mukofot ballari yig‘indisi
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">O‘rin</th>
                  <th className="py-3.5 px-4">O‘qituvchi</th>
                  <th className="py-3.5 px-4">Lavozim</th>
                  <th className="py-3.5 px-4">O‘quv (ball)</th>
                  <th className="py-3.5 px-4">Uslubiy (ball)</th>
                  <th className="py-3.5 px-4">Ilmiy (ball)</th>
                  <th className="py-3.5 px-4">Ustoz-shogird</th>
                  <th className="py-3.5 px-4">Jarima</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Umumiy reyting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((item, idx) => (
                  <tr key={item.user_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-50 text-amber-900' : 'text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.fio}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{item.position}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.teaching_score.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.methodical_score.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{item.scientific_score.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.mentor_score.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">
                      {item.penalty_score > 0 ? `-${item.penalty_score.toFixed(1)}` : '0.0'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-primary-600 text-sm">
                      {item.total_score.toFixed(1)} ball
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          REVIEW & VERIFICATION MODAL
         ======================================================== */}
      {reviewModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Hisobotni tekshirish va tasdiqlash</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400">O‘qituvchi:</div>
                <div className="font-bold text-slate-900 text-sm">{selectedSub.user_fio || 'Egamberdiyev Nodir'}</div>
              </div>

              <div>
                <span className="text-slate-400">Nashr / Ish nomi:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedSub.publication_title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-[10px] text-slate-500">Toifasi:</span>
                  <div className="font-bold text-primary-700 uppercase">{selectedSub.activity_type}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-slate-500">Hammualliflar soni:</span>
                  <div className="font-bold text-emerald-700">{selectedSub.co_authors_count} nafar</div>
                </div>
              </div>

              {selectedSub.doi_url && (
                <div>
                  <span className="text-slate-400">DOI / Havola:</span>
                  <a
                    href={selectedSub.doi_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-primary-600 hover:underline truncate mt-0.5"
                  >
                    {selectedSub.doi_url}
                  </a>
                </div>
              )}

              {/* Rejection comment input */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Qaytarish sababi (Agar rad etilsa to‘ldirish majburiy):
                </label>
                <textarea
                  rows={3}
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  placeholder="Masalan: Maqola tasdiqlovchi sertifikati yoki muqova nusxasi yuklanmagan..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Actions: Approve vs Reject */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReview('qaytarildi')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Qaytarish</span>
              </button>
              
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReview('tasdiqlandi')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Tasdiqlash va ball berish</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
