/** In-app copy from docs/COPY.md (T-306). Edit there first, then here. */
export const COPY = {
  onboarding: {
    welcome: {
      title: 'Track your protocol',
      subline: 'Log every dose, never miss a reminder, and master vial math—all privately on your phone.',
      button: 'Get started',
    },
    goal: {
      question: 'What brings you here?',
      options: [
        { id: 'stay-consistent', label: 'Stay consistent with doses' },
        { id: 'organize-protocols', label: 'Organize multiple peptides' },
        { id: 'master-calculations', label: 'Master vial calculations' },
        { id: 'track-sites', label: 'Track injection sites' },
      ],
    },
    experience: {
      question: 'How experienced are you with tracking?',
      options: [
        { id: 'beginner', label: 'New to peptides' },
        { id: 'intermediate', label: "I've logged before" },
        { id: 'advanced', label: "I'm detail-oriented" },
      ],
    },
    reminders: {
      title: 'Never miss a dose',
      body: 'Reminders help you stay on schedule. You can customize or turn them off anytime.',
      primaryButton: 'Enable Notifications',
      secondaryButton: 'Not now',
    },
    disclaimer: {
      title: 'Important legal notice',
      body: 'Peptify is a personal tracking and education tool. It does not provide medical advice, diagnosis, or treatment, and does not recommend any substance or dose. Always consult a licensed healthcare professional before starting, changing, or stopping any protocol.',
      checkboxLabel: 'I understand that Peptify is for tracking only and does not provide medical advice',
      acceptButton: 'I Agree',
    },
    continue: 'Continue',
    back: 'Back',
  },
} as const;
