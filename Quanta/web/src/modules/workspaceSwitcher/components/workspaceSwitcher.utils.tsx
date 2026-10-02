// Shared helpers for the workspace switcher -- company color/initials are
// generated client-side since the backend doesn't (and shouldn't need to)
// store presentation data like this.

const PALETTE = [
  '#7A5C3A', '#4A7B6F', '#6B5B8A', '#B85C4F', '#7A7060', '#5C7A9A',
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
  overdue: 'text-[#B85C4F]',
  soon: 'text-[#9C7B4F] font-semibold',
  normal: 'text-[#B89B6E]',
};