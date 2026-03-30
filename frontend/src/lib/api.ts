const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

const ensureApiBase = (value: string): string => {
  const cleaned = value.trim().replace(/\/+$/, '');
  if (!cleaned) return 'http://localhost:5000/api';
  if (cleaned.endsWith('/api')) return cleaned;
  return `${cleaned}/api`;
};

export const API_BASE = ensureApiBase(rawBase);
