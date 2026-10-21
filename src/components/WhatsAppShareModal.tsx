import React from 'react';
import { Language } from '../types/billing';
import { Share2, Download, ExternalLink, X, FileCheck, Paperclip, MessageSquare } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  clientName: string;
  contactNumber: string;
  whatsappUrl: string;
  language: Language;
  onDownloadAgain: () => void;
  onTryDirectShare?: () => void;
  canDirectShare?: boolean;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  fileName,
  clientName,
  contactNumber,
  whatsappUrl,
  language,
  onDownloadAgain,
  onTryDirectShare,
  canDirectShare = false,
}) => {
  if (!isOpen) return null;

  const isTa = language === 'ta';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {isTa ? 'WhatsApp-ல் பில் PDF பகிரவும்' : 'Share Bill PDF via WhatsApp'}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {clientName ? `${clientName} (${contactNumber || 'No phone'})` : fileName}
            </p>
          </div>
        </div>

        {/* PDF Ready Card */}
        <div className="p-3 bg-[#edf6f3] border border-[#d7e2df] rounded-xl mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCheck className="w-5 h-5 text-[#176b5b] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#183b36] block truncate">
                {fileName}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isTa ? 'A4 வடிவமைப்பு தயார்' : 'Tablet / A4 layout ready'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDownloadAgain}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#183b36] text-[11px] font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
            title="Download copy"
          >
            <Download className="w-3.5 h-3.5 text-[#176b5b]" />
            <span>{isTa ? 'பதிவிறக்கு' : 'Download'}</span>
          </button>
        </div>

        {/* Direct Web Share option if supported */}
        {canDirectShare && onTryDirectShare && (
          <div className="mb-3">
            <button
              type="button"
              onClick={onTryDirectShare}
              className="w-full py-3 px-4 rounded-xl bg-[#176b5b] hover:bg-[#145a4d] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <Share2 className="w-4 h-4" />
              <span>{isTa ? 'PDF-ஐ நேரடியாக பகிரவும் (Device Share)' : 'Send PDF Directly (Native Share)'}</span>
            </button>
          </div>
        )}

        {/* Guided Steps Box for WhatsApp */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-2">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isTa ? 'WhatsApp-ல் PDF இணைக்கும் வழிமுறை:' : 'How to send with PDF attached:'}</span>
          </div>

          <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px] pl-1">
            <li>
              {isTa
                ? 'கீழே உள்ள பட்டனை கிளிக் செய்து WhatsApp அரட்டையைத் திறக்கவும்.'
                : 'Click below to open WhatsApp chat with the customer.'}
            </li>
            <li>
              {isTa
                ? 'WhatsApp-ல் இணைப்பு (📎 / +) குறியீட்டைத் தட்டவும்.'
                : 'Tap the paperclip / attachment icon (📎 or +) in WhatsApp.'}
            </li>
            <li>
              {isTa
                ? `ஆவணம் (Document) என்பதைத் தேர்ந்தெடுத்து "${fileName}" பில்லை அனுப்பவும்.`
                : `Select "Document" and attach the downloaded "${fileName}".`}
            </li>
          </ol>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isTa ? 'WhatsApp-ஐ திறக்கவும்' : 'Open WhatsApp Chat'}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            {isTa ? 'மூடு' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
