import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { qk } from '@/db/query-keys';
import {
  createVial,
  getVial,
  linkVial,
  listAllVials,
  listVials,
  setVialStatus,
  updateVial,
} from '@/db/repositories/vials';
import type { VialInput, VialStatus } from '@/types/domain';

export function useVials() {
  const db = useSQLiteContext();
  return useQuery({ queryKey: [...qk.vials, 'all'], queryFn: () => listAllVials(db) });
}

export function useActiveVials() {
  const db = useSQLiteContext();
  return useQuery({ queryKey: [...qk.vials, 'active'], queryFn: () => listVials(db, 'active') });
}

export function useVial(id: string | undefined | null) {
  const db = useSQLiteContext();
  return useQuery({ queryKey: [...qk.vials, 'one', id ?? ''], queryFn: () => getVial(db, id!), enabled: !!id });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.vials }),
      qc.invalidateQueries({ queryKey: qk.protocols }),
      qc.invalidateQueries({ queryKey: qk.today }),
    ]);
}

export function useSaveVial() {
  const db = useSQLiteContext();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: VialInput }) =>
      id ? updateVial(db, id, input).then(() => id) : createVial(db, input),
    onSuccess: invalidate,
  });
}

export function useSetVialStatus() {
  const db = useSQLiteContext();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VialStatus }) => setVialStatus(db, id, status),
    onSuccess: invalidate,
  });
}

export function useLinkVial() {
  const db = useSQLiteContext();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ protocolId, vialId }: { protocolId: string; vialId: string | null }) =>
      linkVial(db, protocolId, vialId),
    onSuccess: invalidate,
  });
}
