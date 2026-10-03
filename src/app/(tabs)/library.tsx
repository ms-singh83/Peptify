import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Card, Chip, Disclaimer, EmptyState, ListRow, ProBadge, Screen, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/features/library/labels';
import { searchPeptides } from '@/features/library/peptides';
import { PEPTIDE_CATEGORIES, type PeptideCategory } from '@/types/domain';

export default function LibraryScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PeptideCategory | null>(null);

  const results = useMemo(
    () => searchPeptides(query).filter((p) => !category || p.category === category),
    [query, category],
  );

  return (
    <Screen title="Library" subtitle="What peptides are and what has been studied">
      <TextField
        placeholder="Search peptides"
        accessibilityLabel="Search peptides"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" selected={category === null} onPress={() => setCategory(null)} />
        {PEPTIDE_CATEGORIES.map((c) => (
          <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {results.length ? (
        <Card>
          {results.map((p) => (
            <ListRow
              key={p.slug}
              title={p.name}
              subtitle={`${CATEGORY_LABELS[p.category]}${p.aliases[0] ? ` · ${p.aliases[0]}` : ''}`}
              onPress={() => router.push({ pathname: '/library/[slug]', params: { slug: p.slug } })}
              right={p.free ? null : <ProBadge />}
            />
          ))}
        </Card>
      ) : (
        <EmptyState title="No matches" body="Try another name or clear the category filter." />
      )}
      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: Spacing.sm, paddingVertical: 2 },
});
