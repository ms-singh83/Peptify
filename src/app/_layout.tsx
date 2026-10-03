import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/db/migrations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Rendered only once the database is open and migrated. */
function HideSplashWhenReady() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return null;
}

function DatabaseError({ error }: { error: Error }) {
  const theme = useTheme();
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return (
    <View style={[styles.error, { backgroundColor: theme.background }]}>
      <Text variant="title2">Couldn&apos;t open your data</Text>
      <Text color="textSecondary">
        Please close and reopen Peptify. If this keeps happening, contact support and include this message:
      </Text>
      <Text variant="caption" color="textSecondary" selectable>
        {error.message}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const [dbError, setDbError] = useState<Error | null>(null);
  // SQLiteProvider calls onError during render; defer the state update.
  const onDbError = useCallback((e: Error) => queueMicrotask(() => setDbError(e)), []);

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      {dbError ? (
        <DatabaseError error={dbError} />
      ) : (
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} onError={onDbError}>
          <QueryClientProvider client={queryClient}>
            <HideSplashWhenReady />
            <Stack screenOptions={{ headerShown: false, headerTintColor: theme.primary }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="protocol/form" options={{ presentation: 'modal', headerShown: true }} />
              <Stack.Screen name="protocol/[id]" options={{ headerShown: true, title: '' }} />
              <Stack.Screen name="dose" options={{ presentation: 'modal', headerShown: true }} />
            </Stack>
          </QueryClientProvider>
        </SQLiteProvider>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
});
