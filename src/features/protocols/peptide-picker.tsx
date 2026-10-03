import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, ListRow, Text, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getPeptide, searchPeptides } from '@/features/library/peptides';

type Props = {
  peptideSlug: string | null;
  customName: string;
  onChange: (v: { peptideSlug: string | null; customName: string }) => void;
  error?: string;
};

const MAX_RESULTS = 6;

export function PeptidePicker({ peptideSlug, customName, onChange, error }: Props) {
  const [query, setQuery] = useState('');
  const selectedName = getPeptide(peptideSlug)?.name ?? (customName.trim() || null);

  if (selectedName) {
    return (
      <Card style={styles.selected}>
        <View style={styles.flex}>
          <Text variant="caption" color="textSecondary">
            {peptideSlug ? 'Peptide' : 'Custom name'}
          </Text>
          <Text variant="headline">{selectedName}</Text>
        </View>
        <Button
          title="Change"
          accessibilityLabel={`Change peptide, currently ${selectedName}`}
          variant="secondary"
          size="sm"
          onPress={() => {
            setQuery('');
            onChange({ peptideSlug: null, customName: '' });
          }}
        />
      </Card>
    );
  }

  const q = query.trim();
  const results = searchPeptides(q).slice(0, MAX_RESULTS);
  const exact = results.some((p) => p.name.toLowerCase() === q.toLowerCase());

  return (
    <View style={styles.wrap}>
      <TextField
        label="Peptide"
        placeholder="Search the library or type a name"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="done"
        error={error}
      />
      <Card>
        {results.map((p) => (
          <ListRow
            key={p.slug}
            title={p.name}
            subtitle={p.aliases[0]}
            onPress={() => onChange({ peptideSlug: p.slug, customName: '' })}
          />
        ))}
        {q && !exact ? (
          <ListRow
            title={`Use “${q}”`}
            subtitle="Custom name (not in the library)"
            onPress={() => onChange({ peptideSlug: null, customName: q })}
          />
        ) : null}
        {!q ? (
          <Text variant="caption" color="textSecondary">
            Showing {MAX_RESULTS} of {searchPeptides('').length}. Type to search.
          </Text>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  selected: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flex: { flex: 1, gap: 2 },
});
