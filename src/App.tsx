/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BillData, BusinessProfile, Language, CustomerDetails } from './types/billing';
import {
  DEFAULT_BUSINESS_PROFILE,
  DEFAULT_CUSTOMER,
  INITIAL_ITEMS,
  dateToday,
  generateBillId,
} from './constants/defaults';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { BillForm } from './components/BillForm';
import { InvoicePreview } from './components/InvoicePreview';
import { SavedBillsList } from './components/SavedBillsList';
import { BusinessSettingsModal } from './components/BusinessSettingsModal';

const LOCAL_STORAGE_BILLS = 'mugavai_saved_bills_v1';
const LOCAL_STORAGE_PROFILE = 'mugavai_business_profile_v1';
const LOCAL_STORAGE_LANG = 'mugavai_language_pref_v1';
const LOCAL_STORAGE_CURRENT_DRAFT = 'mugavai_current_draft_v1';

export default function App() {
  // 1. Language state
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LANG);
      return saved === 'ta' ? 'ta' : 'en';
    } catch {
      return 'en';
    }
  });

  // 2. Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('create');

  // 3. Business Profile
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_BUSINESS_PROFILE;
  });

  // 4. Current working bill
  const [currentBill, setCurrentBill] = useState<BillData>(() => {
    try {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_CURRENT_DRAFT);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.customer && Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      id: `bill-${Date.now()}`,
      billNumber: generateBillId(),
      billDate: dateToday(),
      customer: { ...DEFAULT_CUSTOMER },
      items: [...INITIAL_ITEMS],
      paymentStatus: 'unpaid',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  // 5. Saved Bills History (persisted in browser local storage)
  const [savedBills, setSavedBills] = useState<BillData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BILLS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // Initial sample bill if empty
    const initialSamples = [
      {
        id: 'sample-1',
        billNumber: 'MUG-2610-101',
        billDate: dateToday(),
        customer: { ...DEFAULT_CUSTOMER },
        items: [...INITIAL_ITEMS],
        paymentStatus: 'unpaid' as const,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
    ];
    try {
      localStorage.setItem(LOCAL_STORAGE_BILLS, JSON.stringify(initialSamples));
    } catch {
      // ignore
    }
    return initialSamples;
  });

  // Persist language
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LANG, language);
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  // Persist business profile
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE, JSON.stringify(businessProfile));
    } catch {
      // ignore
    }
  }, [businessProfile]);

  // Persist current draft
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_DRAFT, JSON.stringify(currentBill));
    } catch {
      // ignore
    }
  }, [currentBill]);

  // Persist saved bills
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BILLS, JSON.stringify(savedBills));
    } catch {
      // ignore
    }
  }, [savedBills]);

  // Save current bill to history and write to localStorage immediately
  const handleSaveToHistory = () => {
    const updatedBill = { ...currentBill, updatedAt: Date.now() };
    setSavedBills((prev) => {
      const index = prev.findIndex((b) => b.id === updatedBill.id || (b.billNumber && b.billNumber === updatedBill.billNumber));
      let nextBills: BillData[];
      if (index >= 0) {
        nextBills = [...prev];
        nextBills[index] = updatedBill;
      } else {
        nextBills = [updatedBill, ...prev];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_BILLS, JSON.stringify(nextBills));
      } catch {
        // ignore
      }
      return nextBills;
    });
  };

  // Generate action
  const handleGenerate = () => {
    handleSaveToHistory();
    setActiveTab('preview');
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#176b5b', '#183b36', '#48cae4', '#e29578'],
      });
    } catch {
      // ignore
    }
  };

  // Reset/Clear Form: Clears entered customer details, bill info, service rows, sets total to ₹0.00
  // Keeps default customer address values unchanged. Does NOT delete saved bills or clear localStorage saved bills.
  const handleClear = () => {
    const freshBill: BillData = {
      id: `bill-${Date.now()}`,
      billNumber: '',
      billDate: dateToday(),
      customer: {
        name: '',
        street: '',
        place: 'Rameswaram',
        district: 'Ramanathapuram',
        state: 'Tamil Nadu',
        pincode: '623526',
        contact: '',
        email: '',
      },
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
      paymentStatus: 'unpaid',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentBill(freshBill);
    try {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_DRAFT, JSON.stringify(freshBill));
    } catch {
      // ignore
    }
  };

  // New Bill (pre-generates bill ID)
  const handleNewBill = () => {
    const freshBill: BillData = {
      id: `bill-${Date.now()}`,
      billNumber: generateBillId(),
      billDate: dateToday(),
      customer: {
        name: '',
        street: '',
        place: 'Rameswaram',
        district: 'Ramanathapuram',
        state: 'Tamil Nadu',
        pincode: '623526',
        contact: '',
        email: '',
      },
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
      paymentStatus: 'unpaid',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentBill(freshBill);
    try {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_DRAFT, JSON.stringify(freshBill));
    } catch {
      // ignore
    }
    setActiveTab('create');
  };

  // Select a bill from history
  const handleSelectBill = (selected: BillData) => {
    setCurrentBill(selected);
    setActiveTab('preview');
  };

  // Delete bill from history and update local storage immediately
  const handleDeleteBill = (id: string) => {
    setSavedBills((prev) => {
      const nextBills = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_BILLS, JSON.stringify(nextBills));
      } catch {
        // ignore
      }
      return nextBills;
    });
  };

  // Compute total for header badge
  const totalAmount = currentBill.items.reduce((s, it) => {
    const v = typeof it.amount === 'number' && !isNaN(it.amount) ? it.amount : 0;
    return s + v;
  }, 0);

  // Recent customer addresses for autofill
  const recentCustomers: CustomerDetails[] = Array.from(
    new Map(
      savedBills
        .filter((b) => b.customer.name.trim())
        .map((b) => [b.customer.name.trim(), b.customer])
    ).values()
  );

  return (
    <div className={`min-h-screen bg-[#f3f6f5] flex flex-col ${language === 'ta' ? 'tamil-font' : ''}`}>
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        totalAmount={totalAmount}
        activeTab={activeTab}
        onNavigateToPreview={() => setActiveTab('preview')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 pb-12">
        {activeTab === 'create' && (
          <BillForm
            bill={currentBill}
            language={language}
            onUpdateBill={setCurrentBill}
            onGenerate={handleGenerate}
            onClear={handleClear}
            recentCustomers={recentCustomers}
          />
        )}

        {activeTab === 'preview' && (
          <InvoicePreview
            bill={currentBill}
            business={businessProfile}
            language={language}
            onBackToEdit={() => setActiveTab('create')}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {activeTab === 'history' && (
          <SavedBillsList
            bills={savedBills}
            language={language}
            onSelectBill={handleSelectBill}
            onDeleteBill={handleDeleteBill}
            onNewBill={handleNewBill}
          />
        )}

        {activeTab === 'settings' && (
          <BusinessSettingsModal
            business={businessProfile}
            language={language}
            onSave={setBusinessProfile}
            onReset={() => setBusinessProfile(DEFAULT_BUSINESS_PROFILE)}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        itemCount={currentBill.items.length}
      />
    </div>
  );
}
