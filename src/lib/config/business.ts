export interface BusinessConfig {
  name: string;
  legalEntity: string;
  tagline: string;
  supportEmail: string;
  businessEmail: string;
  phoneNumber: string; // e.g. +912067890123
  phoneDisplayNumber: string; // e.g. +91 (020) 6789 0123
  mobileNumber: string; // e.g. +919876543210
  mobileDisplayNumber: string; // e.g. +91 98765 43210
  whatsappNumber: string; // e.g. +919876543210
  whatsappDisplayNumber: string; // e.g. +91 98765 43210
  upiId: string;
  upiDisplayName: string;
  supportHours: string;
  officeHours: string;
  regionalOffice: string;
  registeredAddress: string;
  officialWebsite: string;
  gstNumber?: string;
  llpin?: string;
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: 'ScoreEdge',
  legalEntity: 'ScoreEdge Academic Technologies LLP',
  tagline: 'SPPU Engineering Exam Intelligence & Solved PYQ Repository',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@scoreedge.in',
  businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'contact@scoreedge.in',
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER || '+912067890123',
  phoneDisplayNumber: process.env.NEXT_PUBLIC_PHONE_DISPLAY || '+91 (020) 6789-0123',
  mobileNumber: process.env.NEXT_PUBLIC_MOBILE_NUMBER || '+919876543210',
  mobileDisplayNumber: process.env.NEXT_PUBLIC_MOBILE_DISPLAY || '+91 98765 43210',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919876543210',
  whatsappDisplayNumber: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '+91 98765 43210',
  upiId: process.env.NEXT_PUBLIC_UPI_ID || 'scoreedge@okhdfcbank',
  upiDisplayName: 'ScoreEdge Educational Services',
  supportHours: 'Monday – Saturday: 9:00 AM – 9:00 PM IST (Exam Season: 24/7 Priority Support)',
  officeHours: 'Monday – Friday: 10:00 AM – 6:00 PM IST',
  regionalOffice: 'ScoreEdge Academic Hub, FC Road, Shivaji Nagar, Pune, Maharashtra 411005 (Opposite Ferguson College Main Gate)',
  registeredAddress: 'ScoreEdge Academic Technologies LLP, Survey No. 42/1, Senapati Bapat Road, Pune, Maharashtra 411016, India',
  officialWebsite: process.env.NEXT_PUBLIC_APP_URL || 'https://scoreedge.in',
  gstNumber: '27AAMCS1234F1Z8',
  llpin: 'AAV-9876',
};

export interface WhatsAppPurchaseParams {
  productName: string;
  productCode?: string;
  priceInr: number;
  selectedPlan: string;
  subjectName?: string | null;
  subjectCode?: string | null;
  customerIntent?: string;
  userName?: string | null;
  userEmail?: string | null;
  orderId?: string | null;
}

/**
 * Builds a dynamic, highly structured, professional WhatsApp prefilled purchase URL.
 * Never hardcodes phone numbers or messages in components.
 */
export function formatWhatsAppPurchaseUrl(params: WhatsAppPurchaseParams): string {
  const cleanPhone = BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');

  const lines = [
    `🎓 *ScoreEdge Academic Purchase Inquiry*`,
    `----------------------------------------`,
    `• *Product:* ${params.productName}`,
    `• *Plan:* ${params.selectedPlan}`,
    `• *Price:* ₹${params.priceInr}`,
  ];

  if (params.subjectName) {
    lines.push(`• *Subject:* ${params.subjectName}${params.subjectCode ? ` (${params.subjectCode})` : ''}`);
  }

  lines.push(`• *Customer Intent:* ${params.customerIntent || 'Direct UPI Payment & Instant Activation'}`);

  if (params.userEmail) {
    lines.push(`• *Student Account:* ${params.userEmail}${params.userName ? ` (${params.userName})` : ''}`);
  }

  if (params.orderId) {
    lines.push(`• *Reference Order ID:* ${params.orderId}`);
  }

  lines.push(
    `----------------------------------------`,
    `Hello ScoreEdge Academic Support, please share the official QR code / payment confirmation details to activate this pass on my account.`
  );

  const encodedMessage = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
