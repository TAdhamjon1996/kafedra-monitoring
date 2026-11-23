import React from 'react';
import { X, Headphones, Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Texnik yordam va aloqa</h3>
              <p className="text-xs text-slate-400">Raqamli texnologiyalar konvergensiyasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-primary-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Telefon raqam</div>
              <div className="font-bold text-slate-800">+998 (71) 238-64-85</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Elektron pochta</div>
              <div className="font-bold text-slate-800">rtk_monitoring@tuit.uz</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Manzil</div>
              <div className="font-bold text-slate-800">Toshkent sh., Amir Temur shoh ko‘chasi, 108-uy. E-bino, 412-xona</div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Tezkor xabar yuborish:
            </label>
            <textarea
              rows={3}
              placeholder="Savolingiz yoki tizim bo‘yicha taklifingizni yozing..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              alert('Xabaringiz texnik qo‘llab-quvvatlash bo‘limiga muvaffaqiyatli yuborildi!');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Xabarni yuborish</span>
          </button>
        </div>

      </div>
    </div>
  );
};
