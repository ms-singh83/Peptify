import { create } from 'zustand';

import { prefs } from '@/features/settings/prefs';

type State = { onboarded: boolean; finish: () => void };

/** Drives the Stack.Protected guards in the root layout. */
export const useOnboarding = create<State>((set) => ({
  onboarded: prefs.onboardingDone(),
  finish: () => {
    prefs.setOnboardingDone();
    set({ onboarded: true });
  },
}));
