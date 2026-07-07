import type { Citizenship, EntryType, VisaLimit } from '../types';

// Правила въезда по гражданству — от них зависит лимит дней в калькуляторе
export function getDefaultDayLimit(
  citizenship: Citizenship,
  entryType: EntryType,
): VisaLimit {
  if (entryType === 'e-visa') return 30;

  switch (citizenship) {
    case 'RU':
      return 45;
    case 'DE':
      return 45;
    case 'KZ':
      return 30;
    default:
      return 30;
  }
}

export const CITIZENSHIP_LABELS: Record<Citizenship, { ru: string; en: string; vi: string }> = {
  RU: { ru: 'Россия (РФ)', en: 'Russia', vi: 'Nga' },
  DE: { ru: 'Германия', en: 'Germany', vi: 'Đức' },
  KZ: { ru: 'Казахстан', en: 'Kazakhstan', vi: 'Kazakhstan' },
};
