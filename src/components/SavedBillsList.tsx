import React, { useState } from 'react';
import { BillData, Language } from '../types/billing';
import { translations } from '../constants/translations';
import { formatMoney, formatDateDisplay } from '../constants/defaults';
import { ConfirmModal } from './ConfirmModal';
import { Search, Eye, Trash2, Calendar, FileText } from 'lucide-react';

interface SavedBillsListProps {
  bills: BillData[];
  language: Language;
  onSelectBill: (bill: BillData) => void;
  onDeleteBill: (id: string) => void;
  onNewBill: () => void;
}

export const SavedBillsList: React.FC<SavedBillsListProps> = ({
  bills,
  language,
  onSelectBill,
  onDeleteBill,
  onNewBill,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [billToDelete, setBillToDelete] = useState<BillData | null>(null);

  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.contact.includes(searchTerm);
    return matchesSearch;
  });

  const handleConfirmDelete = () => {
    if (billToDelete) {
      onDeleteBill(billToDelete.id);
      setBillToDelete(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={billToDelete !== null}
        title={language === 'ta' ? 'பில்லை நீக்கவா?' : 'Delete Invoice?'}
        message={
          language === 'ta'
            ? `விலைப்பட்டியல் எண் ${billToDelete?.billNumber || ''} (${billToDelete?.customer.name || ''}) பில்லை நிச்சயமாக நீக்க விரும்புகிறீர்களா? இது நிரந்தரமாக நீக்கப்படும்.`
            : `Are you sure you want to delete invoice ${billToDelete?.billNumber || ''} for ${billToDelete?.customer.name || 'this customer'}? This action cannot be undone.`
        }
        confirmLabel={language === 'ta' ? 'நீக்கு' : 'Delete'}
        cancelLabel={language === 'ta' ? 'ரத்து' : 'Cancel'}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setBillToDelete(null)}
      />

      {/* Top Header & Search */}
      <div className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#183b36]">
              {t.tabHistory}
            </h2>
            <p className="text-xs text-slate-500">
              {bills.length} {bills.length === 1 ? 'saved invoice' : 'saved invoices'}
            </p>
          </div>

          <button
            type="button"
            onClick={onNewBill}
            className="px-3.5 py-2 bg-[#176b5b] hover:bg-[#145a4d] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            {t.newBill}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchBills}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white"
          />
        </div>
      </div>

      {/* Bill List */}
      <div className="space-y-3">
        {filteredBills.map((bill) => {
          const total = bill.items.reduce(
            (s, it) => s + (typeof it.amount === 'number' && !isNaN(it.amount) ? it.amount : 0),
            0
          );

          return (
            <div
              key={bill.id}
              className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-xs hover:border-[#176b5b]/50 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#183b36] bg-[#edf6f3] px-2 py-0.5 rounded">
                      {bill.billNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateDisplay(bill.billDate)}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {bill.customer.name || 'Untitled Client'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bill.customer.place}, {bill.customer.district} • {bill.customer.contact}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-base text-[#176b5b]">
                    {formatMoney(total)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {bill.items.length} {bill.items.length === 1 ? 'service' : 'services'}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Only Preview and Remove (Duplicate icon removed as requested) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  {bill.items
                    .map((i) => i.platforms.join('/'))
                    .filter(Boolean)
                    .join(', ')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectBill(bill)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#edf6f3] text-[#183b36] hover:bg-[#d5ebe4] font-semibold text-xs transition-colors min-h-[38px]"
                    title={t.preview}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.previewInvoice}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillToDelete(bill)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200/60 rounded-lg transition-colors font-medium text-xs min-h-[38px]"
                    title={t.remove}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.remove}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredBills.length === 0 && (
          <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-[#bacbc5]">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {t.noSavedBills}
            </p>
            <button
              type="button"
              onClick={onNewBill}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#176b5b] text-white text-xs font-bold rounded-lg shadow-xs"
            >
              {t.newBill}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
