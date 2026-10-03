import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { qk } from '@/db/query-keys';
import { deleteDose, listDosesBetween, logDose } from '@/db/repositories/doses';
import { listProtocols } from '@/db/repositories/protocols';
import { useNow } from '@/hooks/use-now';
import { nowISO, toISODate } from '@/lib/dates';
import { buildTodaySlots, type TodaySlot } from '@/lib/today';
import type { DoseInput } from '@/types/domain';

export function useToday() {
  const db = useSQLiteContext();
  const now = useNow();
  const date = toISODate(now);

  const query = useQuery({
    queryKey: [...qk.today, date],
    queryFn: async () => {
      const tomorrow = toISODate(addDays(now, 1));
      // All protocols (not only active) so a slot logged before pausing still shows.
      const [protocols, doses] = await Promise.all([
        listProtocols(db),
        listDosesBetween(db, `${date}T00:00:00`, `${tomorrow}T00:00:00`),
      ]);
      return { protocols, doses };
    },
  });

  const slots = useMemo(
    () => (query.data ? buildTodaySlots(query.data.protocols, query.data.doses, now) : []),
    [query.data, now],
  );

  return { ...query, slots, now };
}

function useInvalidateDoses() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.today }),
      qc.invalidateQueries({ queryKey: qk.doses }),
      qc.invalidateQueries({ queryKey: qk.vials }),
    ]);
}

export function useLogDose() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateDoses();
  return useMutation({
    mutationFn: ({ input, replaceDoseId }: { input: DoseInput; replaceDoseId?: string }) =>
      logDose(db, input, replaceDoseId),
    onSuccess: invalidate,
  });
}

export function useUndoDose() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateDoses();
  return useMutation({ mutationFn: (doseId: string) => deleteDose(db, doseId), onSuccess: invalidate });
}

/** One-tap log for a Today slot using the protocol's planned dose. Site is picked in the dose sheet (T-302). */
export function quickLogInput(slot: TodaySlot, status: 'taken' | 'skipped'): DoseInput {
  return {
    protocolId: slot.protocol.id,
    scheduledFor: slot.occurrence.scheduledFor,
    takenAt: status === 'taken' ? nowISO() : null,
    status,
    amount: status === 'taken' ? slot.protocol.doseAmount : null,
    unit: status === 'taken' ? slot.protocol.doseUnit : null,
    site: null,
    notes: null,
  };
}
