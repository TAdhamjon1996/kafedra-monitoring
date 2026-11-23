import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  FlaskConical, 
  Users, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { ShirTask } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AnnualPlanViewProps {
  onOpenSubmitModal: (task: ShirTask) => void;
}

export const AnnualPlanView: React.FC<AnnualPlanViewProps> = ({ onOpenSubmitModal }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ShirTask[]>([]);
  const [activeCategory, setActiveCategory] = useState<number>(0); // 0 = all
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTasks();
  }, [activeCategory]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getMyTasks(undefined, activeCategory === 0 ? undefined : activeCategory);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 0, name: 'Barcha yo‘nalishlar' },
    { id: 1, name: '1. O‘quv ishlari' },
    { id: 2, name: '2. O‘quv-uslubiy ishlar' },
    { id: 3, name: '3. Ilmiy-tadqiqot ishlari' },
    { id: 4, name: '4. Ustoz-shogird ishlari' },
    { id: 5, name: '5. Qo‘shimcha ishlar' },
  ];

  const totalPlannedHours = tasks.reduce((acc, t) => acc + t.planned_hours, 0);
  const totalActualHours = tasks.reduce((acc, t) => acc + (t.status === 'tasdiqlandi' ? t.actual_hours : 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            SHIR • Shaxsiy ish rejasi
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Yillik shaxsiy ish rejasi (2026/2027 o‘quv yili)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            O‘qituvchi: {user?.fio} • 1.0 stavka (Yillik me’yor: 851 soat)
          </p>
        </div>

        {/* Hours Summary Badge & Export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rejalashtirilgan / Bajarilgan</span>
            <span className="text-base font-extrabold text-slate-900">
              {totalPlannedHours} soat / <span className="text-emerald-600">{totalActualHours} soat</span>
            </span>
          </div>

          <a
            href={user ? api.getExcelExportUrl(user.id) : '#'}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 text-xs flex items-center gap-2 border border-emerald-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </a>

          <a
            href={user ? api.getPdfExportUrl(user.id) : '#'}
            className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 text-xs flex items-center gap-2 border border-rose-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF (.pdf)</span>
          </a>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">T/r</th>
                <th className="py-3.5 px-4">Topshiriq nomi</th>
                <th className="py-3.5 px-4">Guruhlar</th>
                <th className="py-3.5 px-4 text-center">Semestr</th>
                <th className="py-3.5 px-4 text-center">Reja (soat)</th>
                <th className="py-3.5 px-4 text-center">Amalda (soat)</th>
                <th className="py-3.5 px-4 text-center">Holat</th>
                <th className="py-3.5 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task, idx) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 max-w-sm">
                    {task.task_title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {task.target_groups || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {task.semester}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {task.planned_hours}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                    {task.status === 'tasdiqlandi' ? task.actual_hours : '0'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.status === 'tasdiqlandi'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.status === 'tekshiruvda'
                          ? 'bg-blue-100 text-primary-700'
                          : task.status === 'kutilmoqda'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {task.status === 'tasdiqlandi'
                        ? 'Tasdiqlangan'
                        : task.status === 'tekshiruvda'
                        ? 'Tekshiruvda'
                        : task.status === 'kutilmoqda'
                        ? 'Jarayonda'
                        : 'Bajarilmagan'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenSubmitModal(task)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white font-bold transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Yuklash</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
