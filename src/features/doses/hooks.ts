import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { qk } from '@/db/query-keys';
import { getDose, getDoseForSlot, listSiteUses } from '@/db/repositories/doses';

export function useSiteUses() {
  const db = useSQLiteContext();
  return useQuery({ queryKey: [...qk.doses, 'siteUses'], queryFn: () => listSiteUses(db) });
}

export function useDose(id: string | undefined) {
  const db = useSQLiteContext();
  return useQuery({ queryKey: [...qk.doses, 'one', id ?? ''], queryFn: () => getDose(db, id!), enabled: !!id });
}

export function useDoseForSlot(protocolId: string | undefined, scheduledFor: string | undefined) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: [...qk.doses, 'slot', protocolId ?? '', scheduledFor ?? ''],
    queryFn: () => getDoseForSlot(db, protocolId!, scheduledFor!),
    enabled: !!protocolId && !!scheduledFor,
  });
}
