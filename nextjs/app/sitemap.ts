import type { MetadataRoute } from 'next';
import { COMPANY } from '@/lib/company';

// Public pages only. Admin, dashboards, auth and API routes are left out.
const paths = [
  '/',
  '/about-us',
  '/why-promex',
  '/industries',
  '/our-experience',
  '/jobs',
  '/contact',
  '/employer-inquiry',
  '/candidate/register',
  '/employer/register',
  '/en/domestic',
  '/tl/domestic',
  '/privacy-policy',
  '/terms-and-conditions',
  '/data-deletion',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({ url: `${COMPANY.siteUrl}${path}` }));
}
