import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Disclaimer, EmptyState, ListRow, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { CATEGORY_LABELS, describeHalfLife, RESEARCH_STATUS_LABELS } from '@/features/library/labels';
import { getPeptide } from '@/features/library/peptides';

// RN's URL polyfill doesn't implement .hostname reliably; a regex is enough here.
const hostOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

export default function PeptideDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const p = getPeptide(slug);

  if (!p) {
    return (
      <Screen safeTop={false}>
        <EmptyState title="Not found" actionTitle="Back to library" onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: p.name }} />
      <Screen safeTop={false}>
        <View style={styles.header}>
          <Text variant="title">{p.name}</Text>
          {p.aliases.length ? (
            <Text color="textSecondary">Also known as {p.aliases.join(', ')}</Text>
          ) : null}
          <Text variant="callout" color="primary">
            {CATEGORY_LABELS[p.category]} · {RESEARCH_STATUS_LABELS[p.researchStatus]}
          </Text>
        </View>

        <Card>
          <Text>{p.summary}</Text>
        </Card>

        {p.studiedFor.length ? (
          <Card>
            <Text variant="headline" accessibilityRole="header">
              Has been studied for
            </Text>
            {p.studiedFor.map((s) => (
              <Text key={s}>• {s}</Text>
            ))}
          </Card>
        ) : null}

        <Card>
          <Text variant="headline" accessibilityRole="header">
            Half-life
          </Text>
          <Text>{p.halfLifeHours !== undefined ? describeHalfLife(p.halfLifeHours) : 'Not well established'}</Text>
          {p.halfLifeNote ? (
            <Text variant="callout" color="textSecondary">
              {p.halfLifeNote}
            </Text>
          ) : null}
        </Card>

        {p.storage ? (
          <Card>
            <Text variant="headline" accessibilityRole="header">
              Storage
            </Text>
            <Text>{p.storage}</Text>
          </Card>
        ) : null}

        {p.references.length ? (
          <Card>
            <Text variant="headline" accessibilityRole="header">
              References
            </Text>
            {p.references.map((r) => (
              <ListRow
                key={r.url}
                title={r.title}
                subtitle={hostOf(r.url)}
                accessibilityHint="Opens the source in a browser"
                onPress={() => WebBrowser.openBrowserAsync(r.url)}
              />
            ))}
          </Card>
        ) : null}

        <Button
          title="Track this in a protocol"
          variant="secondary"
          onPress={() => router.push({ pathname: '/protocol/form', params: { peptideSlug: p.slug } })}
        />
        <Disclaimer />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.xs },
});
