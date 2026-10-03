import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';

import { Card, ListRow, Text } from '@/components/ui';
import { displayName } from '@/features/library/peptides';
import type { DaySummary } from '@/lib/history';
import { SITE_LABELS } from '@/lib/sites';
import { formatAmount } from '@/lib/units';
import type { Protocol } from '@/types/domain';

type Props = { day: DaySummary; protocols: Protocol[] };

export function DayDetail({ day, protocols }: Props) {
  const byId = new Map(protocols.map((p) => [p.id, p]));
  const title = format(parseISO(day.date), 'EEEE d MMMM');

  return (
    <Card>
      <Text variant="headline">{title}</Text>
      {day.missed ? (
        <Text variant="callout" color="danger">
          {day.missed} scheduled {day.missed === 1 ? 'dose' : 'doses'} not logged
        </Text>
      ) : null}
      {day.doses.length === 0 && !day.missed ? (
        <Text color="textSecondary">{day.open ? 'Scheduled, nothing logged yet.' : 'Nothing logged this day.'}</Text>
      ) : null}
      {day.doses.map((d) => {
        const p = d.protocolId ? byId.get(d.protocolId) : undefined;
        const when = d.takenAt ? format(parseISO(d.takenAt), 'h:mm a') : '';
        const details =
          d.status === 'taken'
            ? [d.amount !== null && d.unit ? formatAmount(d.amount, d.unit) : null, when, d.site ? SITE_LABELS[d.site] : null]
                .filter(Boolean)
                .join(' · ')
            : 'Skipped';
        return (
          <ListRow
            key={d.id}
            title={p ? displayName(p) : 'Deleted protocol'}
            subtitle={details}
            onPress={
              p
                ? () =>
                    router.push({
                      pathname: '/dose',
                      params: d.scheduledFor
                        ? { protocolId: p.id, scheduledFor: d.scheduledFor }
                        : { protocolId: p.id, doseId: d.id },
                    })
                : undefined
            }
          />
        );
      })}
    </Card>
  );
}
