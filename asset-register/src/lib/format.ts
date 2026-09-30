import { AssetCategory, AssetStatus } from '../data/assetRegister';

export const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** One-line guidance per rating, shown when a rating is selected. */
export const RATING_HINTS = [
  'Damaged or not working. Needs repair or replacement.',
  'Works, but with clear wear or minor faults.',
  'Normal wear for its age. Fully working.',
  'Light wear only. Fully working.',
  'Like new. No visible wear.',
];

export function ratingHint(value: number): string {
  return value ? RATING_HINTS[value - 1] : 'Choose the rating that best matches what you see.';
}

export const categoryOptions = Object.entries(AssetCategory)
  .map(([value, label]) => ({ value: Number(value) as keyof typeof AssetCategory, label: splitWords(label) }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const statusOptions = Object.entries(AssetStatus).map(([value, label]) => ({
  value: Number(value) as keyof typeof AssetStatus,
  label: splitWords(label),
}));

/** 'InRepair' -> 'In Repair', 'AVEquipment' -> 'AV Equipment' */
function splitWords(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

export function categoryLabel(value?: number): string {
  return categoryOptions.find((o) => o.value === value)?.label ?? '—';
}

export function statusLabel(value?: number): string {
  return statusOptions.find((o) => o.value === value)?.label ?? 'No status';
}

export type Tone = 'ok' | 'info' | 'warn' | 'danger' | 'muted';

export function statusTone(value?: number): Tone {
  switch (value) {
    case 100000000:
      return 'ok';
    case 100000001:
      return 'info';
    case 100000002:
      return 'warn';
    default:
      return 'muted';
  }
}

/** Condition tiers: 1 danger, 2 warn, 3 neutral, 4–5 ok. */
export function conditionTone(rating?: number): Tone {
  if (rating == null) return 'muted';
  if (rating <= 1) return 'danger';
  if (rating === 2) return 'warn';
  if (rating === 3) return 'muted';
  return 'ok';
}

export function ratingLabel(rating?: number): string {
  return rating ? (RATING_LABELS[rating - 1] ?? String(rating)) : 'Not rated';
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "today", "3 days ago", "4 mo ago" – used as a secondary cue next to absolute dates. */
export function formatRelative(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 31) return `${days} days ago`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? '' : 's'} ago`;
}

/** ISO datetime -> yyyy-mm-dd for <input type="date"> */
export function toDateInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayInput(): string {
  return toDateInput(new Date().toISOString());
}

export function formatCurrency(value?: number): string {
  if (value == null) return '—';
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
