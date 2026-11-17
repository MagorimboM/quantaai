// Shared helpers for the workspace switcher -- company color/initials are
// generated client-side since the backend doesn't (and shouldn't need to)
// store presentation data like this.

// Small dots, so the colours are soft and few: orange first, then neutrals
// and two muted accents.
const PALETTE = [
  '#FF6B35', '#A8A29E', '#5B8A72', '#78716C', '#E0A458', '#8B9DB0',
];

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export type DueUrgency = 'overdue' | 'soon' | 'normal';

export function formatDueDate(iso: string): { label: string; urgency: DueUrgency } {
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, urgency: 'overdue' };
  if (diffDays === 0) return { label: 'Due today', urgency: 'overdue' };
  if (diffDays <= 7) return { label: `Due in ${diffDays}d`, urgency: 'soon' };
  return {
    label: due.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    urgency: 'normal',
  };
}

export const urgencyTextClass: Record<DueUrgency, string> = {
  overdue: 'text-[#E85A26] font-medium',
  soon: 'text-[#57534E] font-medium',
  normal: 'text-[#78716C]',
};