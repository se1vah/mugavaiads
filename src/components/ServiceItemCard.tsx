import React from 'react';
import { ServiceItem, AdPlatform, Language } from '../types/billing';
import { translations } from '../constants/translations';
import { addDays } from '../constants/defaults';
import { Trash2, Copy, Calendar, Sparkles, Instagram, Facebook, Youtube } from 'lucide-react';

interface ServiceItemCardProps {
  item: ServiceItem;
  index: number;
  language: Language;
  onUpdate: (updated: ServiceItem) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export const ServiceItemCard: React.FC<ServiceItemCardProps> = ({
  item,
  index,
  language,
  onUpdate,
  onRemove,
  onDuplicate,
}) => {
  const t = translations[language];

  const handlePlatformToggle = (platform: AdPlatform) => {
    const current = item.platforms;
    const exists = current.includes(platform);
    let next: AdPlatform[];
    if (exists) {
      if (current.length === 1) return; // keep at least one
      next = current.filter((p) => p !== platform);
    } else {
      next = [...current, platform];
    }
    onUpdate({ ...item, platforms: next });
  };

  const handleApplyPreset = (days: number) => {
    const from = item.fromDate || new Date().toISOString().split('T')[0];
    const to = addDays(from, days);
    onUpdate({ ...item, fromDate: from, toDate: to });
  };

  const quickSuggestions = [
    language === 'ta' ? 'இன்ஸ்டாகிராம் ரீல்ஸ் விளம்பரம்' : 'Instagram Reels Promo',
    language === 'ta' ? 'போஸ்டர் & ஸ்டோரி விளம்பரம்' : 'Poster & Story Ad',
    language === 'ta' ? 'வீடியோ படப்பிடிப்பு & ரீல்' : 'Video Shoot & Reel Edit',
    language === 'ta' ? 'திருவிழா / பண்டிகை சலுகை விளம்பரம்' : 'Festival Offer Promo',
  ];

  return (
    <div className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-sm relative transition-all focus-within:border-[#176b5b] focus-within:ring-1 focus-within:ring-[#176b5b]/20">
      {/* Card Header: S.No + Actions */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#183b36] text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#183b36]">
            {t.services} #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 text-slate-500 hover:text-[#183b36] hover:bg-slate-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title={t.duplicate}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title={t.remove}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Description Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.description} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={item.description}
            onChange={(e) => onUpdate({ ...item, description: e.target.value })}
            placeholder={language === 'ta' ? 'எ.கா. ரீல்ஸ் வீடியோ விளம்பரம்' : 'e.g., Instagram Reels Campaign (3 Posts + 5 Stories)'}
            className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/15 bg-white"
          />

          {/* Quick suggestions pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 no-scrollbar">
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            {quickSuggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onUpdate({ ...item, description: sug })}
                className="text-[11px] bg-[#edf6f3] text-[#183b36] hover:bg-[#dbeee8] px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Ad Platform selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.platform} <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Instagram */}
            <button
              type="button"
              onClick={() => handlePlatformToggle('Instagram')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition-all min-h-[42px] ${
                item.platforms.includes('Instagram')
                  ? 'bg-gradient-to-r from-fuchsia-500/10 to-rose-500/10 border-rose-400 text-rose-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Instagram className={`w-4 h-4 ${item.platforms.includes('Instagram') ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>Instagram</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handlePlatformToggle('Facebook')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition-all min-h-[42px] ${
                item.platforms.includes('Facebook')
                  ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Facebook className={`w-4 h-4 ${item.platforms.includes('Facebook') ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Facebook</span>
            </button>

            {/* YouTube */}
            <button
              type="button"
              onClick={() => handlePlatformToggle('YouTube')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition-all min-h-[42px] ${
                item.platforms.includes('YouTube')
                  ? 'bg-red-50 border-red-400 text-red-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Youtube className={`w-4 h-4 ${item.platforms.includes('YouTube') ? 'text-red-600' : 'text-slate-400'}`} />
              <span>YouTube</span>
            </button>
          </div>
        </div>

        {/* Date Ranges & Presets */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Campaign Duration</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleApplyPreset(7)}
                className="text-[10px] font-medium text-[#176b5b] hover:bg-[#edf6f3] px-1.5 py-0.5 rounded transition-colors"
              >
                + {t.presets7d}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(15)}
                className="text-[10px] font-medium text-[#176b5b] hover:bg-[#edf6f3] px-1.5 py-0.5 rounded transition-colors"
              >
                + {t.presets15d}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                className="text-[10px] font-medium text-[#176b5b] hover:bg-[#edf6f3] px-1.5 py-0.5 rounded transition-colors"
              >
                + {t.presets30d}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{t.fromDate}</span>
              <input
                type="date"
                value={item.fromDate}
                onChange={(e) => onUpdate({ ...item, fromDate: e.target.value })}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{t.toDate}</span>
              <input
                type="date"
                value={item.toDate}
                min={item.fromDate}
                onChange={(e) => onUpdate({ ...item, toDate: e.target.value })}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Amount in ₹ */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.amount} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="50"
              inputMode="decimal"
              value={item.amount}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0);
                onUpdate({ ...item, amount: val });
              }}
              placeholder="0.00"
              className="w-full text-base font-bold text-[#183b36] pl-7 pr-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
