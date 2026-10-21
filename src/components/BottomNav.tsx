import React from 'react';
import { Language } from '../types/billing';
import { translations } from '../constants/translations';
import { PenLine, History, Settings } from 'lucide-react';

export type TabKey = 'create' | 'preview' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  language: Language;
  itemCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const t = translations[language];

  const tabs: { key: 'create' | 'history' | 'settings'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'create', label: t.tabCreate, icon: PenLine },
    { key: 'history', label: t.tabHistory, icon: History },
    { key: 'settings', label: t.tabSettings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#d7e2df] shadow-[0_-4px_16px_rgba(24,59,54,0.06)] no-print pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-3 h-16 items-center px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors select-none ${
                isActive ? 'text-[#176b5b]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'}`} />
              </div>
              <span className={`text-[11px] tracking-tight mt-1 font-medium ${isActive ? 'font-bold text-[#176b5b]' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-[#176b5b] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
