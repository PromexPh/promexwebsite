// Single source of truth for Promex's legal identity. These must match the
// DMW licence character for character (used for Meta Business Verification),
// so every footer, contact and legal page imports them from here.
// The static landing pages in public/en/domestic and public/tl/domestic can't
// import this file; keep their footers in sync by hand.

export const COMPANY = {
  legalName: 'Promex, INC.',
  fullName: 'Professional Manpower Expert, Inc.',
  address:
    '2nd Floor, Vision Building, 163 Pasig Boulevard, Brgy. Bagong Ilog, 1600 Pasig City, Philippines',
  phone: '+63 2 7746 4689',
  email: 'connect@promexph.com',
  whatsapp: '+63 917 318 9396',
  whatsappUrl: 'https://wa.me/639173189396',
  licenceNumber: 'DMW-451-LB-09242024-R',
  licence: 'DMW License No. DMW-451-LB-09242024-R',
  licenceUrl: 'https://dmw.gov.ph',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Promex%20Inc%20Vision%20Building%20163%20Pasig%20Boulevard%20Pasig%20City',
  mapEmbedUrl:
    'https://www.google.com/maps?q=Promex%20Inc%20Vision%20Building%20163%20Pasig%20Boulevard%20Pasig%20City&output=embed',
  siteUrl: 'https://www.promexph.com',
} as const;

export const COPYRIGHT = `© 2026 ${COMPANY.legalName} All rights reserved.`;
