import { format, parseISO } from 'date-fns';

import type { Schedule, TimeOfDay, Weekday } from '@/types/domain';

const WEEKDAY_SHORT: Record<Weekday, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };

export function describeSchedule(s: Schedule): string {
  switch (s.type) {
    case 'daily':
      return 'Daily';
    case 'weekdays': {
      const days = [...s.weekdays].sort((a, b) => a - b);
      if (days.length === 7) return 'Daily';
      if (days.join() === '1,2,3,4,5') return 'Weekdays';
      if (days.join() === '6,7') return 'Weekends';
      return days.map((d) => WEEKDAY_SHORT[d]).join(', ');
    }
    case 'interval':
      return `Every ${s.intervalDays} days`;
    case 'cycle':
      return `${s.onDays} days on, ${s.offDays} off`;
  }
}

/** "08:00" → "8:00 AM" (device locale independent for now). */
export function formatTime(t: TimeOfDay): string {
  return format(parseISO(`2000-01-01T${t}:00`), 'h:mm a');
}

export function describeTimes(times: TimeOfDay[]): string {
  return [...times].sort().map(formatTime).join(', ');
}

export function weekdayLabel(d: Weekday): string {
  return WEEKDAY_SHORT[d];
}

export type Time12 = { hour: number; minute: number; pm: boolean };

/** "20:05" → { hour: 8, minute: 5, pm: true }. */
export function toTime12(t: TimeOfDay): Time12 {
  const h = Number(t.slice(0, 2));
  const minute = Number(t.slice(3, 5));
  return { hour: h % 12 === 0 ? 12 : h % 12, minute, pm: h >= 12 };
}

/** { hour: 12, minute: 0, pm: false } → "00:00". */
export function fromTime12({ hour, minute, pm }: Time12): TimeOfDay {
  const h = (hour % 12) + (pm ? 12 : 0);
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
