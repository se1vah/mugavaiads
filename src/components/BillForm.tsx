import React, { useState } from 'react';
import { BillData, CustomerDetails, ServiceItem, Language } from '../types/billing';
import { translations } from '../constants/translations';
import { formatMoney, generateBillId, dateToday } from '../constants/defaults';
import { ServiceItemCard } from './ServiceItemCard';
import { ConfirmModal } from './ConfirmModal';
import { Plus, RefreshCw, Trash2, Eye, AlertCircle, User, Receipt, Sparkles } from 'lucide-react';

interface BillFormProps {
  bill: BillData;
  language: Language;
  onUpdateBill: (updater: (prev: BillData) => BillData) => void;
  onGenerate: () => void;
  onClear: () => void;
  recentCustomers?: CustomerDetails[];
}

export const BillForm: React.FC<BillFormProps> = ({
  bill,
  language,
  onUpdateBill,
  onGenerate,
  onClear,
  recentCustomers = [],
}) => {
  const t = translations[language];
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate live total
  const total = bill.items.reduce((sum, item) => {
    const val = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0;
    return sum + val;
  }, 0);

  // Field change handlers
  const handleCustomerChange = (field: keyof CustomerDetails, value: string) => {
    onUpdateBill((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      platforms: ['Instagram'],
      fromDate: dateToday(),
      toDate: dateToday(),
      amount: '',
    };
    onUpdateBill((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (index: number, updated: ServiceItem) => {
    onUpdateBill((prev) => {
      const items = [...prev.items];
      items[index] = updated;
      return { ...prev, items };
    });
  };

  const handleRemoveItem = (index: number) => {
    if (bill.items.length <= 1) {
      // Keep at least one blank item with ₹0.00
      onUpdateBill((prev) => ({
        ...prev,
        items: [
          {
            id: `item-${Date.now()}`,
            description: '',
            platforms: ['Instagram'],
            fromDate: dateToday(),
            toDate: dateToday(),
            amount: '',
          },
        ],
      }));
      return;
    }
    onUpdateBill((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  const handleDuplicateItem = (index: number) => {
    const original = bill.items[index];
    const duplicated: ServiceItem = {
      ...original,
      id: `item-${Date.now()}`,
      description: `${original.description} (Copy)`,
    };
    onUpdateBill((prev) => {
      const items = [...prev.items];
      items.splice(index + 1, 0, duplicated);
      return { ...prev, items };
    });
  };

  const handleNewBillNumber = () => {
    onUpdateBill((prev) => ({
      ...prev,
      billNumber: generateBillId(),
    }));
  };

  const handleSelectRecentCustomer = (cust: CustomerDetails) => {
    onUpdateBill((prev) => ({
      ...prev,
      customer: { ...cust },
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const c = bill.customer;
    const errors: string[] = [];

    if (!bill.billNumber.trim()) errors.push(t.enterBill);
    if (
      !c.name.trim() ||
      !c.street.trim() ||
      !c.place.trim() ||
      !c.district.trim() ||
      !c.state.trim() ||
      !c.pincode.trim() ||
      !c.contact.trim()
    ) {
      errors.push(t.required);
    }
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
      errors.push(t.emailInvalid);
    }
    if (!/^\d{6}$/.test(c.pincode)) {
      errors.push(t.pinInvalid);
    }
    if (!/^[6-9]\d{9}$/.test(c.contact.replace(/\s+/g, ''))) {
      errors.push(t.contactInvalid);
    }
    if (!bill.items.length) {
      errors.push(t.itemRequired);
    }
    bill.items.forEach((r) => {
      if (!r.description.trim()) errors.push(t.descriptionRequired);
      if (!r.platforms.length) errors.push(t.platformRequired);
      if (r.amount === '' || isNaN(Number(r.amount)) || Number(r.amount) < 0) {
        errors.push(t.amountInvalid);
      }
      if (r.fromDate && r.toDate && r.toDate < r.fromDate) {
        errors.push(t.dateInvalid);
      }
    });

    if (errors.length > 0) {
      setErrorMessage(Array.from(new Set(errors)).join(' • '));
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleGenerateClick = () => {
    if (validateForm()) {
      onGenerate();
    }
  };

  const handleConfirmClear = () => {
    setErrorMessage(null);
    onClear();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Confirmation Modal for Clear Form */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title={language === 'ta' ? 'படிவத்தை அழிக்கவா?' : 'Clear Form?'}
        message={
          language === 'ta'
            ? 'வாடிக்கையாளர் விவரங்களையும் சேவை வரிசைகளையும் அழிக்கவா? இயல்புநிலை முகவரி மதிப்புகள் பாதுகாக்கப்படும். சேமிக்கப்பட்ட பில்கள் பாதிக்கப்படாது.'
            : 'Are you sure you want to clear all entered customer details, bill information, and advertising services? Default address values will be preserved. Your saved bills in History will not be affected.'
        }
        confirmLabel={language === 'ta' ? 'படிவத்தை அழி' : 'Clear Form'}
        cancelLabel={language === 'ta' ? 'ரத்து' : 'Cancel'}
        variant="warning"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Error alert banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 font-bold ml-1 min-h-[30px] min-w-[30px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Bill Details Section */}
      <section className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-[#183b36] flex items-center gap-1.5 uppercase tracking-wide">
            <Receipt className="w-4 h-4 text-[#176b5b]" />
            <span>{t.billDetails}</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Invoice Info</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.billNumber} <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={bill.billNumber}
                onChange={(e) => onUpdateBill((prev) => ({ ...prev, billNumber: e.target.value }))}
                placeholder="MUG-2026-01"
                className="w-full text-xs font-mono font-semibold px-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[42px]"
              />
              <button
                type="button"
                onClick={handleNewBillNumber}
                className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg min-w-[42px] min-h-[42px] flex items-center justify-center transition-colors shrink-0"
                title="Generate New ID"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.billDate} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={bill.billDate}
              onChange={(e) => onUpdateBill((prev) => ({ ...prev, billDate: e.target.value }))}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[42px]"
            />
          </div>
        </div>
      </section>

      {/* 2. Customer Details Section */}
      <section className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-[#183b36] flex items-center gap-1.5 uppercase tracking-wide">
            <User className="w-4 h-4 text-[#176b5b]" />
            <span>{t.customerDetails}</span>
          </h2>
          {recentCustomers.length > 0 && (
            <span className="text-[11px] text-[#176b5b] font-medium">{recentCustomers.length} saved</span>
          )}
        </div>

        {/* Recent client chips if available */}
        {recentCustomers.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] text-slate-500 font-semibold block mb-1">
              {t.quickClients}:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {recentCustomers.slice(0, 4).map((cust, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectRecentCustomer(cust)}
                  className="text-xs bg-[#edf6f3] text-[#183b36] hover:bg-[#d5ebe4] px-2.5 py-1 rounded-md font-medium whitespace-nowrap shrink-0 transition-colors border border-emerald-200/50 min-h-[32px]"
                >
                  {cust.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.clientName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bill.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                placeholder="e.g. Sri Krishna Textiles"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white font-medium min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.contact} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={bill.customer.contact}
                  onChange={(e) => handleCustomerChange('contact', e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full text-xs pl-11 pr-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white font-mono min-h-[42px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.street} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bill.customer.street}
                onChange={(e) => handleCustomerChange('street', e.target.value)}
                placeholder="Street or Building name"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                value={bill.customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
                placeholder="client@gmail.com"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[42px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.place} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bill.customer.place}
                onChange={(e) => handleCustomerChange('place', e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.district} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bill.customer.district}
                onChange={(e) => handleCustomerChange('district', e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.state} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bill.customer.state}
                onChange={(e) => handleCustomerChange('state', e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.pincode} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={bill.customer.pincode}
                onChange={(e) => handleCustomerChange('pincode', e.target.value.replace(/\D/g, ''))}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white font-mono min-h-[40px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Advertising Services Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#183b36] flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-[#176b5b]" />
            <span>{t.services}</span>
            <span className="text-xs text-slate-500 font-normal">({bill.items.length})</span>
          </h2>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#176b5b] hover:bg-[#145a4d] text-white text-xs font-bold rounded-lg transition-colors shadow-xs min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addItem}</span>
          </button>
        </div>

        {/* List of cards */}
        <div className="space-y-3">
          {bill.items.map((item, idx) => (
            <ServiceItemCard
              key={item.id}
              item={item}
              index={idx}
              language={language}
              onUpdate={(updated) => handleUpdateItem(idx, updated)}
              onRemove={() => handleRemoveItem(idx)}
              onDuplicate={() => handleDuplicateItem(idx)}
            />
          ))}
        </div>

        {/* Big Add Item Touch Button */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-3 border-2 border-dashed border-[#bacbc5] hover:border-[#176b5b] text-[#176b5b] hover:bg-[#edf6f3]/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[48px]"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addItem}</span>
        </button>
      </section>

      {/* 4. Total and Actions Summary */}
      <section className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
              {t.totalAmount}
            </span>
            <span className="text-[11px] text-slate-400">
              {bill.items.length} {bill.items.length === 1 ? 'campaign item' : 'campaign items'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#176b5b] font-mono tabular-nums block">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        {/* Primary Buttons */}
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleGenerateClick}
            className="w-full py-3.5 px-4 rounded-xl bg-[#176b5b] hover:bg-[#145a4d] text-white font-bold text-sm shadow-md shadow-[#176b5b]/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Eye className="w-4 h-4" />
            <span>{t.generate}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 px-4 rounded-xl border border-[#d7e2df] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.clear}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-3 leading-relaxed">
          {t.note}
        </p>
      </section>
    </div>
  );
};
