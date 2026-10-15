import { z } from 'zod';

export const loginSchema = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(1024) });
export const generateSchema = z.object({ count: z.number().int().min(1).max(100) });
export const activationSchema = z.object({
  code: z.string().regex(/^RP-[A-F0-9]{10}$/),
  // New cards use four unambiguous Base32 characters; accept already-issued 12-char codes during rollout.
  activationCode: z.string().regex(/^(?:[A-HJ-NP-Z2-9]{4}|[A-Fa-f0-9]{12})$/i),
  reviewURL: z.string().url().max(2048),
});
const reviewHosts = new Set(['g.page','google.com','www.google.com','maps.google.com','maps.app.goo.gl']);
export function validReviewURL(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (url.hostname === 'search.google.com') return url.pathname === '/local/writereview' && Boolean(url.searchParams.get('placeid'));
    return reviewHosts.has(url.hostname);
  }
  catch { return false; }
}
export function safeBaseURL() {
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const u = new URL(base);
  if (process.env.NODE_ENV === 'production' && u.protocol !== 'https:') throw new Error('BASE_URL must use HTTPS in production');
  if (!['http:','https:'].includes(u.protocol) || u.username || u.password) throw new Error('Invalid BASE_URL');
  return u.origin;
}
