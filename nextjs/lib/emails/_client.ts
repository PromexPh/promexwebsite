import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM = 'Promex Inc. <connect@promexph.com>';
export const ADMIN_EMAIL = 'connect@promexph.com';
export const BASE_URL = 'https://promexph.com';
