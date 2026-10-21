import React from 'react';
import { Language } from '../types/billing';
import { translations } from '../constants/translations';
import { formatMoney } from '../constants/defaults';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  totalAmount: number;
  activeTab: string;
  onNavigateToPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  totalAmount,
  activeTab,
  onNavigateToPreview
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-[#183b36] text-white shadow-md border-b border-[#14302c] no-print">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#176b5b] flex items-center justify-center font-black text-emerald-200 text-sm shadow-inner shrink-0">
            {language === 'ta' ? 'மு' : 'M'}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate">
              {t.appTitle}
            </h1>
            <p className="text-[11px] text-[#b7ded5] truncate leading-none">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Total Pill - Tapping jumps to preview */}
          {activeTab !== 'preview' && (
            <button
              onClick={onNavigateToPreview}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#176b5b]/50 hover:bg-[#176b5b] text-emerald-100 text-xs font-semibold transition-colors border border-emerald-500/30"
              title={t.previewInvoice}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span className="tabular-nums font-mono">{formatMoney(totalAmount)}</span>
            </button>
          )}

          {/* Bilingual Switcher: English / தமிழ் */}
          <div className="flex items-center bg-[#0d2320] p-0.5 rounded-lg border border-[#176b5b]/40">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-[#176b5b] text-white shadow-sm'
                  : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all tamil-font ${
                language === 'ta'
                  ? 'bg-[#176b5b] text-white shadow-sm'
                  : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
