import { QueryClient } from '@tanstack/react-query';

// Local SQLite is the source of truth: data only changes when we write it,
// and every mutation invalidates the keys it touches.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: false, networkMode: 'always' },
    mutations: { networkMode: 'always' },
  },
});
