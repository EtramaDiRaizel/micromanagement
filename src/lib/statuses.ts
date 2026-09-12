import { StatusType, StatusConfig } from '../types';

export const STATUSES: StatusConfig[] = [
  {
    id: 'available',
    label: 'Available',
    emoji: '●',
    color: 'bg-[#34c759]',
    textColor: 'text-white',
    priority: true,
  },
  {
    id: 'not_available',
    label: 'Not available',
    emoji: '—',
    color: 'bg-[#8e8e93]',
    textColor: 'text-white',
    priority: true,
  },
  {
    id: 'hit_me_up',
    label: 'Hit me',
    emoji: '↗',
    color: 'bg-[#007aff]',
    textColor: 'text-white',
    priority: false,
  },
  {
    id: 'in_the_mood',
    label: 'The mood',
    emoji: '✦',
    color: 'bg-[#af52de]',
    textColor: 'text-white',
    priority: false,
  },
  {
    id: 'fancy_a_fag',
    label: 'Fancy a fag',
    emoji: '⌁',
    color: 'bg-[#ff9500]',
    textColor: 'text-white',
    priority: false,
  },
];

export const VALID_STATUSES = new Set<string>(STATUSES.map((s) => s.id));
export const DEFAULT_STATUS: StatusType = 'not_available';

export function isValidStatus(status: string): status is StatusType {
  return VALID_STATUSES.has(status);
}

export function getStatusConfig(id: StatusType): StatusConfig | undefined {
  return STATUSES.find((s) => s.id === id);
}
