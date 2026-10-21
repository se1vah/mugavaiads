import React, { useState } from 'react';
import { BusinessProfile, Language } from '../types/billing';
import { translations } from '../constants/translations';
import { DEFAULT_BUSINESS_PROFILE } from '../constants/defaults';
import { LogoGraphic } from './LogoGraphic';
import { Building2, Save, RotateCcw, Upload, QrCode, Phone, Mail, Instagram, MapPin } from 'lucide-react';

interface BusinessSettingsModalProps {
  business: BusinessProfile;
  language: Language;
  onSave: (updated: BusinessProfile) => void;
  onReset: () => void;
}

export const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
  business,
  language,
  onSave,
  onReset,
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState<BusinessProfile>(business);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setFormData(business);
  }, [business]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-xl border border-[#d7e2df] p-4 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#176b5b]" />
            <div>
              <h2 className="text-base font-bold text-[#183b36]">
                {language === 'ta' ? 'வணிக விவரங்கள் & அமைப்புகள்' : 'Business Profile & Settings'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ta' ? 'பில்களில் தோன்றும் முகவரி மற்றும் UPI விவரங்கள்' : 'Configure address, logo, and payment UPI ID'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#176b5b] hover:bg-[#145a4d] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? (language === 'ta' ? 'சேமிக்கப்பட்டது!' : 'Saved!') : (language === 'ta' ? 'சேமி' : 'Save')}</span>
          </button>
        </div>

        {/* Logo Configuration */}
        <div className="flex items-center gap-4 p-3 bg-[#edf6f3] rounded-xl border border-[#d7e2df]">
          <LogoGraphic url={formData.logoUrl} size={64} />
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-[#183b36] block">
              {language === 'ta' ? 'வணிக லோகோ' : 'Business Logo'}
            </span>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#bacbc5] hover:border-[#176b5b] text-[#183b36] text-[11px] font-semibold rounded-lg shadow-2xs">
                <Upload className="w-3 h-3 text-[#176b5b]" />
                <span>{language === 'ta' ? 'பதிவேற்று' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                  className="text-[11px] text-rose-600 hover:underline font-medium"
                >
                  {language === 'ta' ? 'இயல்புநிலைக்கு மாற்று' : 'Reset to Emblem'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Business Names (EN & TA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Name (English)
            </label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              வணிக பெயர் (தமிழ்)
            </label>
            <input
              type="text"
              value={formData.nameTa}
              onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white font-medium tamil-font"
            />
          </div>
        </div>

        {/* UPI ID for QR code */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-amber-700" />
            <span>UPI ID for QR Code Payment (GPay / PhonePe / Paytm)</span>
          </label>
          <input
            type="text"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            placeholder="e.g. 8300023925@upi (optional)"
            className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:border-[#176b5b] bg-white"
          />
          <p className="text-[10px] text-amber-800">
            {language === 'ta'
              ? 'இந்த UPI ID விலைப்பட்டியலில் ஸ்கேன் செய்யக்கூடிய QR கோடாக மாறும்.'
              : 'A dynamic QR code will appear on the invoice for clients to pay the exact amount instantly.'}
          </p>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#176b5b]" />
              <span>Contact Number</span>
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#176b5b]" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white"
            />
          </div>
        </div>

        {/* Instagram & Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Instagram className="w-3 h-3 text-[#176b5b]" />
            <span>Instagram Page</span>
          </label>
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street Address (English)
            </label>
            <input
              type="text"
              value={formData.streetEn}
              onChange={(e) => setFormData({ ...formData, streetEn: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              தெரு முகவரி (தமிழ்)
            </label>
            <input
              type="text"
              value={formData.streetTa}
              onChange={(e) => setFormData({ ...formData, streetTa: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8d4] focus:outline-none focus:border-[#176b5b] bg-white tamil-font"
            />
          </div>
        </div>

        {/* Reset Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(language === 'ta' ? 'அனைத்து விவரங்களையும் இயல்புநிலைக்கு மீட்டமைக்கவா?' : 'Reset all business profile settings to defaults?')) {
                setFormData(DEFAULT_BUSINESS_PROFILE);
                onReset();
              }
            }}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'ta' ? 'இயல்புநிலைக்கு மீட்டமை' : 'Reset to Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#176b5b] hover:bg-[#145a4d] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            {language === 'ta' ? 'மாற்றங்களைச் சேமி' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
