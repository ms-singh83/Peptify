import { format, isToday, isTomorrow, parseISO } from 'date-fns';

/** "Today 3:43 PM" / "Tomorrow 8:00 AM" / "Mon 6 Oct, 8:00 AM". */
export function describeNext(at: string): string {
  const d = parseISO(at);
  const time = format(d, 'h:mm a');
  if (isToday(d)) return `Today ${time}`;
  if (isTomorrow(d)) return `Tomorrow ${time}`;
  return `${format(d, 'EEE d MMM')}, ${time}`;
}
