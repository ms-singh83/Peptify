import { addMonths, format, isSameMonth } from 'date-fns';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { DayDetail } from '@/features/history/day-detail';
import { useMonthHistory } from '@/features/history/hooks';
import { Legend, MonthCalendar } from '@/features/history/month-calendar';
import { toISODate } from '@/lib/dates';
import type { ISODate } from '@/types/domain';

export default function HistoryScreen() {
  const [month, setMonth] = useState(() => new Date());
  const { days, protocols, now, isLoading, isError, refetch } = useMonthHistory(month);
  const today = toISODate(now);
  const [selected, setSelected] = useState<ISODate | null>(today);

  const selectedDay = selected ? days?.get(selected) : undefined;
  const changeMonth = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(next);
    setSelected(isSameMonth(next, now) ? today : null);
  };
  const totals = days ? [...days.values()].reduce((n, d) => n + d.taken, 0) : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'History' }} />
      <Screen safeTop={false}>
        <View style={styles.nav}>
          <Button title="‹" accessibilityLabel="Previous month" variant="ghost" size="sm" onPress={() => changeMonth(-1)} />
          <Text variant="title2" accessibilityRole="header">
            {format(month, 'MMMM yyyy')}
          </Text>
          <Button
            title="›"
            accessibilityLabel="Next month"
            variant="ghost"
            size="sm"
            disabled={isSameMonth(month, now)}
            onPress={() => changeMonth(1)}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : isError ? (
          <EmptyState title="Something went wrong" body="Please try again." actionTitle="Retry" onAction={() => refetch()} />
        ) : (
          <>
            <Card>
              <MonthCalendar month={month} days={days} selected={selected} today={today} onSelect={setSelected} />
              <Legend />
            </Card>
            <Text variant="callout" color="textSecondary">
              {totals} {totals === 1 ? 'dose' : 'doses'} taken in {format(month, 'MMMM')}
            </Text>
            {selectedDay ? (
              <DayDetail day={selectedDay} protocols={protocols} />
            ) : totals === 0 ? (
              <EmptyState title="No doses logged yet" body="Log your first dose from Today to see your history." />
            ) : null}
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
});
