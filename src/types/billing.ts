export type Language = 'en' | 'ta';

export type AdPlatform = 'Instagram' | 'Facebook' | 'YouTube';

export interface ServiceItem {
  id: string;
  description: string;
  platforms: AdPlatform[];
  fromDate: string;
  toDate: string;
  amount: number | '';
}

export interface CustomerDetails {
  name: string;
  street: string;
  place: string;
  district: string;
  state: string;
  pincode: string;
  contact: string;
  email: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'advance';

export interface BillData {
  id: string;
  billNumber: string;
  billDate: string;
  customer: CustomerDetails;
  items: ServiceItem[];
  paymentStatus: PaymentStatus;
  advanceAmount?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessProfile {
  nameEn: string;
  nameTa: string;
  streetEn: string;
  streetTa: string;
  placeEn: string;
  placeTa: string;
  stateEn: string;
  stateTa: string;
  contact: string;
  contactTa: string;
  email: string;
  instagram: string;
  upiId: string;
  logoUrl?: string;
  signatureTitleEn: string;
  signatureTitleTa: string;
  footerEn: string;
  footerTa: string;
}
