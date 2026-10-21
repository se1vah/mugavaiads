import { BusinessProfile, CustomerDetails, ServiceItem } from '../types/billing';

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  nameEn: "Mugavai Ads",
  nameTa: "முகவை விளம்பரம்",
  streetEn: "Sallaimalai Street",
  streetTa: "சல்லிமலை தெரு",
  placeEn: "Rameswaram, Ramanathapuram (Dt)",
  placeTa: "இராமேஸ்வரம், இராமநாதபுரம் (மா)",
  stateEn: "Tamil Nadu – 623526",
  stateTa: "தமிழ்நாடு – 623526",
  contact: "8300023925",
  contactTa: "8300023953",
  email: "murugeswin@gmail.com",
  instagram: "instagram.com/mugavaiseithigal",
  upiId: "8300023925@okhdfcbank",
  logoUrl: "https://scontent.cdninstagram.com/v/t51.82787-19/723883561_17992503407988765_4359519765508475632_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=106&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=5pytyB66OBwQ7kNvwERnt3S&_nc_oc=Ado0jcSoCj3L0mhivG2vLw5BayvqYWlHoGbD_jGO24OMHGwjygAdZez-n9Kz7RH2OZ-l6YPgGK04OCV86__EXA1G&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=zBIaTcqlL8MyYFFVmILAwg&_nc_ss=78689&oh=00_AQMigS4paLK35RE9BWE-Ym2we-MqoSoxeiyjiPLU4-q10Q&oe=6ADEC8A0",
  signatureTitleEn: "Authorized Signature",
  signatureTitleTa: "அங்கீகரிக்கப்பட்ட கையொப்பம்",
  footerEn: "Thank you for choosing Mugavai Ads – முகவை விளம்பரம்",
  footerTa: "முகவை விளம்பரத்தைத் தேர்ந்தெடுத்ததற்கு நன்றி – Mugavai Ads"
};

export const DEFAULT_CUSTOMER: CustomerDetails = {
  name: "",
  street: "",
  place: "Rameswaram",
  district: "Ramanathapuram",
  state: "Tamil Nadu",
  pincode: "623526",
  contact: "",
  email: ""
};

export const dateToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const addDays = (startDateStr: string, days: number): string => {
  const date = startDateStr ? new Date(startDateStr) : new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const formatDateDisplay = (v: string): string => {
  if (!v) return "—";
  const parts = v.split("-");
  if (parts.length !== 3) return v;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

export const formatMoney = (n: number | ''): string => {
  const num = typeof n === 'number' && !isNaN(n) ? n : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const generateBillId = (): string => {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `MUG-${year}${month}-${rand}`;
};

export const INITIAL_ITEMS: ServiceItem[] = [
  {
    id: 'item-1',
    description: '',
    platforms: ['Instagram'],
    fromDate: dateToday(),
    toDate: dateToday(),
    amount: '',
  },
];
