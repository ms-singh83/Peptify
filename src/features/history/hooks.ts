import { useQuery } from '@tanstack/react-query';
import { addDays, endOfMonth, startOfMonth } from 'date-fns';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { qk } from '@/db/query-keys';
import { listDosesBetween } from '@/db/repositories/doses';
import { listProtocols } from '@/db/repositories/protocols';
import { useNow } from '@/hooks/use-now';
import { toISODate } from '@/lib/dates';
import { currentStreak, summarizeDays } from '@/lib/history';
import type { ISODate } from '@/types/domain';

/** Day summaries for [from, to] plus the protocols involved. */
export function useHistoryRange(from: ISODate, to: ISODate) {
  const db = useSQLiteContext();
  const now = useNow();
  const query = useQuery({
    queryKey: [...qk.doses, 'history', from, to],
    queryFn: async () => {
      const next = toISODate(addDays(new Date(`${to}T00:00:00`), 1));
      const [protocols, doses] = await Promise.all([
        listProtocols(db),
        listDosesBetween(db, `${from}T00:00:00`, `${next}T00:00:00`),
      ]);
      return { protocols, doses };
    },
  });
  const days = useMemo(
    () => (query.data ? summarizeDays(query.data.protocols, query.data.doses, from, to, now) : null),
    [query.data, from, to, now],
  );
  return { ...query, days, protocols: query.data?.protocols ?? [], now };
}

export function useMonthHistory(month: Date) {
  return useHistoryRange(toISODate(startOfMonth(month)), toISODate(endOfMonth(month)));
}

/** Current streak, looking back up to a year (longer streaks display as 365). */
export function useStreak() {
  const now = useNow();
  const { days } = useHistoryRange(toISODate(addDays(now, -365)), toISODate(now));
  return days ? currentStreak(days, now) : 0;
}
