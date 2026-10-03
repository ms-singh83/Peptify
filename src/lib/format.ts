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
