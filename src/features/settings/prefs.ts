import { Storage } from 'expo-sqlite/kv-store';

/** Small synchronous key-value prefs (backed by SQLite). */
const KEYS = {
  remindersEnabled: 'prefs.remindersEnabled',
  onboardingDone: 'prefs.onboardingDone',
  disclaimerAcceptedAt: 'prefs.disclaimerAcceptedAt',
  goal: 'prefs.goal',
  experience: 'prefs.experience',
} as const;

type Key = keyof typeof KEYS;

function get(key: Key): string | null {
  try {
    return Storage.getItemSync(KEYS[key]);
  } catch {
    return null;
  }
}

function set(key: Key, value: string | null) {
  try {
    if (value === null) Storage.removeItemSync(KEYS[key]);
    else Storage.setItemSync(KEYS[key], value);
  } catch {
    // Prefs are best-effort; never crash the app over them.
  }
}

export const prefs = {
  remindersEnabled: () => get('remindersEnabled') !== 'false',
  setRemindersEnabled: (on: boolean) => set('remindersEnabled', on ? 'true' : 'false'),
  onboardingDone: () => get('onboardingDone') === 'true',
  setOnboardingDone: () => set('onboardingDone', 'true'),
  disclaimerAcceptedAt: () => get('disclaimerAcceptedAt'),
  setDisclaimerAcceptedAt: (iso: string) => set('disclaimerAcceptedAt', iso),
  setGoal: (id: string) => set('goal', id),
  setExperience: (id: string) => set('experience', id),
};
