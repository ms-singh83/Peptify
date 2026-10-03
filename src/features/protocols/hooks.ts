import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { qk } from '@/db/query-keys';
import {
  countActiveProtocols,
  createProtocol,
  deleteProtocol,
  getProtocol,
  listProtocols,
  setProtocolStatus,
  updateProtocol,
} from '@/db/repositories/protocols';
import type { ProtocolInput, ProtocolStatus } from '@/types/domain';

export function useProtocols(status?: ProtocolStatus) {
  const db = useSQLiteContext();
  return useQuery({ queryKey: qk.protocolList(status), queryFn: () => listProtocols(db, status) });
}

export function useProtocol(id: string | undefined) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: qk.protocol(id ?? ''),
    queryFn: () => getProtocol(db, id!),
    enabled: !!id,
  });
}

export function useActiveProtocolCount() {
  const db = useSQLiteContext();
  return useQuery({ queryKey: [...qk.protocols, 'activeCount'], queryFn: () => countActiveProtocols(db) });
}

/** Anything that changes protocols can change Today and history too. */
function useInvalidateProtocols() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.protocols }),
      qc.invalidateQueries({ queryKey: qk.today }),
      qc.invalidateQueries({ queryKey: qk.doses }),
    ]);
}

export function useSaveProtocol() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateProtocols();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ProtocolInput }) =>
      id ? updateProtocol(db, id, input).then(() => id) : createProtocol(db, input),
    onSuccess: invalidate,
  });
}

export function useSetProtocolStatus() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateProtocols();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProtocolStatus }) => setProtocolStatus(db, id, status),
    onSuccess: invalidate,
  });
}

export function useDeleteProtocol() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateProtocols();
  return useMutation({
    mutationFn: (id: string) => deleteProtocol(db, id),
    onSuccess: invalidate,
  });
}
