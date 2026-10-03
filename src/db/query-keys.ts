/** Every React Query key lives here so mutations can invalidate consistently. */
export const qk = {
  protocols: ['protocols'] as const,
  protocolList: (status?: string) => ['protocols', 'list', status ?? 'all'] as const,
  protocol: (id: string) => ['protocols', 'one', id] as const,
  vials: ['vials'] as const,
  doses: ['doses'] as const,
  today: ['today'] as const,
};
