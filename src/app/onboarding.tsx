import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Text } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { COPY } from '@/content/copy';
import { Checkbox } from '@/features/onboarding/checkbox';
import { OptionList } from '@/features/onboarding/option-list';
import { useOnboarding } from '@/features/onboarding/store';
import { requestReminderPermission } from '@/features/reminders/notifications';
import { prefs } from '@/features/settings/prefs';
import { useTheme } from '@/hooks/use-theme';
import { nowISO } from '@/lib/dates';

const C = COPY.onboarding;
const STEPS = ['welcome', 'goal', 'experience', 'reminders', 'disclaimer'] as const;

export default function OnboardingScreen() {
  const theme = useTheme();
  const finish = useOnboarding((s) => s.finish);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [asking, setAsking] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const current = STEPS[step];

  const enableReminders = async () => {
    setAsking(true);
    try {
      await requestReminderPermission();
    } finally {
      setAsking(false);
      next();
    }
  };

  const complete = () => {
    prefs.setDisclaimerAcceptedAt(nowISO());
    if (goal) prefs.setGoal(goal);
    if (experience) prefs.setExperience(experience);
    finish(); // guards in the root layout switch to the app
  };

  let body: ReactNode;
  let footer: ReactNode;
  switch (current) {
    case 'welcome':
      body = (
        <View style={styles.hero}>
          <Text variant="largeTitle" accessibilityRole="header">
            {C.welcome.title}
          </Text>
          <Text variant="title2" color="textSecondary" style={styles.subline}>
            {C.welcome.subline}
          </Text>
        </View>
      );
      footer = <Button title={C.welcome.button} onPress={next} />;
      break;
    case 'goal':
      body = (
        <>
          <Text variant="title" accessibilityRole="header">
            {C.goal.question}
          </Text>
          <OptionList label={C.goal.question} options={C.goal.options} value={goal} onChange={setGoal} />
        </>
      );
      footer = <Button title={C.continue} disabled={!goal} onPress={next} />;
      break;
    case 'experience':
      body = (
        <>
          <Text variant="title" accessibilityRole="header">
            {C.experience.question}
          </Text>
          <OptionList label={C.experience.question} options={C.experience.options} value={experience} onChange={setExperience} />
        </>
      );
      footer = <Button title={C.continue} disabled={!experience} onPress={next} />;
      break;
    case 'reminders':
      body = (
        <View style={styles.hero}>
          <Text variant="largeTitle" accessibilityRole="header">
            {C.reminders.title}
          </Text>
          <Text variant="title2" color="textSecondary" style={styles.subline}>
            {C.reminders.body}
          </Text>
        </View>
      );
      footer = (
        <>
          <Button title={C.reminders.primaryButton} loading={asking} onPress={enableReminders} />
          <Button title={C.reminders.secondaryButton} variant="ghost" disabled={asking} onPress={next} />
        </>
      );
      break;
    case 'disclaimer':
      body = (
        <>
          <Text variant="title" accessibilityRole="header">
            {C.disclaimer.title}
          </Text>
          <Card>
            <Text>{C.disclaimer.body}</Text>
          </Card>
          <Checkbox label={C.disclaimer.checkboxLabel} checked={accepted} onChange={setAccepted} />
        </>
      );
      footer = <Button title={C.disclaimer.acceptButton} disabled={!accepted} onPress={complete} />;
      break;
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={styles.top}>
        {step > 0 ? (
          <Button title={C.back} variant="ghost" size="sm" onPress={back} style={styles.backBtn} />
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.dots} accessible accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[styles.dot, { backgroundColor: i <= step ? theme.primary : theme.border }, i === step && styles.dotActive]}
            />
          ))}
        </View>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.body}>{body}</View>
      <View style={styles.footer}>{footer}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.sm },
  backBtn: { minWidth: 80 },
  dots: { flexDirection: 'row', gap: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: Radius.pill },
  dotActive: { width: 20 },
  body: { flex: 1, padding: Spacing.xl, gap: Spacing.lg, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  hero: { flex: 1, justifyContent: 'center', gap: Spacing.lg },
  subline: { fontWeight: '400' },
  footer: { padding: Spacing.xl, gap: Spacing.sm, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
});
