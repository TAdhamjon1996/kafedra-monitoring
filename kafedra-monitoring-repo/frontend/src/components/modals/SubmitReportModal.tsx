import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  Calculator, 
  AlertCircle, 
  Link as LinkIcon, 
  Users, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../../services/api';
import { ShirTask, ActivityType } from '../../types';

interface SubmitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedTask?: ShirTask;
  tasksList: ShirTask[];
}

export const SubmitReportModal: React.FC<SubmitReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedTask,
  tasksList,
}) => {
  const [taskId, setTaskId] = useState<number>(selectedTask?.id || (tasksList[0]?.id || 1));
  const [activityType, setActivityType] = useState<ActivityType>('scopus');
  const [publicationTitle, setPublicationTitle] = useState<string>('');
  const [doiUrl, setDoiUrl] = useState<string>('');
  const [coAuthorsCount, setCoAuthorsCount] = useState<number>(1);
  const [actualResult, setActualResult] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Points calculation preview
  const [pointsPreview, setPointsPreview] = useState<{
    base_points: number;
    coauthor_coefficient: number;
    estimated_points: number;
  }>({
    base_points: 50,
    coauthor_coefficient: 1.0,
    estimated_points: 50,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTask) {
      setTaskId(selectedTask.id);
    } else if (tasksList.length > 0) {
      setTaskId(tasksList[0].id);
    }
  }, [selectedTask, tasksList]);

  // Recalculate points whenever activityType or coAuthorsCount changes
  useEffect(() => {
    api.previewPoints(activityType, coAuthorsCount)
      .then((res) => {
        setPointsPreview({
          base_points: res.base_points,
          coauthor_coefficient: res.coauthor_coefficient,
          estimated_points: res.estimated_points,
        });
      })
      .catch(() => {
        // local fallback calculation
        const baseMap: Record<string, number> = {
          scopus: 50,
          oak: 30,
          dgu: 25,
          tezis_xalqaro: 10,
          tezis_res: 5,
          uslubiy: 20,
          darslik: 40,
          ustoz_shogird: 15,
          manual: 10,
        };
        const base = baseMap[activityType] || 10;
        let kh = 1.0;
        if (coAuthorsCount === 2) kh = 0.6;
        else if (coAuthorsCount >= 3) kh = Number((1.0 / coAuthorsCount).toFixed(3));
        setPointsPreview({
          base_points: base,
          coauthor_coefficient: kh,
          estimated_points: Number((base * kh).toFixed(1)),
        });
      });
  }, [activityType, coAuthorsCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicationTitle.trim()) {
      setError('Iltimos, ish / nashr nomini kiriting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitReport({
        task_id: taskId,
        activity_type: activityType,
        publication_title: publicationTitle,
        doi_url: doiUrl || undefined,
        co_authors_count: coAuthorsCount,
        actual_result: actualResult || undefined,
        file: file || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Hisobotni yuborishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ilmiy faoliyat bo‘yicha hisobot topshirish</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nashr ma’lumotlari va tasdiqlovchi hujjatni tizimga yuklash
            </p>
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
          
          {/* Topshiriqni tanlash */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shaxsiy ish rejasi topshirig‘i:
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(Number(e.target.value))}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            >
              {tasksList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.task_title} ({t.planned_hours} soat)
                </option>
              ))}
            </select>
          </div>

          {/* Faoliyat turi (Scopus, OAK, DGU, ...) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ilmiy-tadqiqot ishi toifasi:
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="scopus">🌟 Scopus / Web of Science (50 ball)</option>
                <option value="oak">📚 OAK e’tirofidagi jurnal (30 ball)</option>
                <option value="dgu">📜 DGU dasturiy guvohnoma (25 ball)</option>
                <option value="tezis_xalqaro">🌍 Xalqaro konferensiya tezisi (10 ball)</option>
                <option value="tezis_res">🏛️ Respublika konferensiya tezisi (5 ball)</option>
                <option value="uslubiy">📝 Uslubiy ko‘rsatma / qo‘llanma (20 ball)</option>
                <option value="darslik">📘 Darslik / Monografiya (40 ball)</option>
                <option value="ustoz_shogird">👥 Ustoz-shogird tadbirlari (15 ball)</option>
              </select>
            </div>

            {/* Hammualliflar soni */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hammualliflar soni: ({coAuthorsCount} nafar)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={coAuthorsCount}
                  onChange={(e) => setCoAuthorsCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <span className="w-8 text-center text-xs font-bold text-primary-600 bg-primary-50 py-1 rounded-lg border border-primary-100">
                  {coAuthorsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Rating Calculation Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-primary-800 font-semibold">
              <Calculator className="w-4 h-4 text-primary-600" />
              <span>
                Bazaviy ball: <b>{pointsPreview.base_points}</b> × Koeffitsiyent (K<sub>h</sub>): <b>{pointsPreview.coauthor_coefficient}</b>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Hisoblangan ball:</span>
              <span className="text-base font-extrabold text-primary-600">
                +{pointsPreview.estimated_points} ball
              </span>
            </div>
          </div>

          {/* Publication Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ilmiy ish / maqola / guvohnoma nomi:
            </label>
            <input
              type="text"
              required
              value={publicationTitle}
              onChange={(e) => setPublicationTitle(e.target.value)}
              placeholder="Masalan: Machine Learning Approaches in Education Quality Monitoring"
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* DOI URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              DOI havolasi yoki elektron manzil (ixtiyoriy):
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={doiUrl}
                onChange={(e) => setDoiUrl(e.target.value)}
                placeholder="https://doi.org/10.1016/..."
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          {/* File Upload Drag & Drop */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tasdiqlovchi fayl (PDF, JPG, PNG - max 25MB):
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                  >
                    O‘chirish
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-primary-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-600 font-medium">
                    Faylni shu yerga tortib olib keling yoki{' '}
                    <label className="text-primary-600 font-bold hover:underline cursor-pointer">
                      faylni tanlang
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Faqat rasmiy tasdiqlangan hujjat, sertifikat yoki maqola nusxasi
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Yuklanmoqda...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Hisobotni topshirish</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
