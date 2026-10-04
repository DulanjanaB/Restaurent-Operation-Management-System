import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ApiError, type BatchDetail, fetchBatch } from '../../lib/api';

const STATUS_STYLE: Record<BatchDetail['status'], { label: string; bg: string; fg: string }> = {
  active: { label: 'In storage', bg: '#dcfce7', fg: '#166534' },
  expired: { label: 'Past expiry', bg: '#fee2e2', fg: '#991b1b' },
  consumed: { label: 'Used up', bg: '#e0e7ff', fg: '#3730a3' },
  disposed: { label: 'Disposed', bg: '#f3f4f6', fg: '#374151' },
};

export default function BatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatch(id)
      .then(setBatch)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login');
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          setError('Your account does not have permission to view batches.');
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setError('This batch no longer exists.');
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load this batch.');
      });
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Scan another</Text>
        </Pressable>
      </View>
    );
  }

  if (!batch) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const status = STATUS_STYLE[batch.status];
  const color = batch.day_color?.hex ?? '#9ca3af';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.band, { backgroundColor: color }]}>
        <Text style={styles.bandText}>
          {batch.production_day ? `Made on ${batch.production_day}` : 'Made on'}
        </Text>
        {batch.day_color && <Text style={styles.bandColor}>{batch.day_color.name}</Text>}
      </View>

      <Text style={styles.code}>{batch.batch_code}</Text>
      <Text style={styles.item}>{batch.preserved_item?.name ?? 'Preserved item'}</Text>

      <View style={[styles.badge, { backgroundColor: status.bg }]}>
        <Text style={[styles.badgeText, { color: status.fg }]}>{status.label}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Quantity" value={`${batch.quantity} ${batch.unit}`} />
        <Row label="Storage" value={batch.storage_location?.name ?? '—'} />
        <Row label="Production date" value={batch.production_date} />
        <Row label="Use by" value={batch.expiry_date} />
        {batch.notes ? <Row label="Notes" value={batch.notes} /> : null}
      </View>

      <Pressable style={styles.button} onPress={() => router.push('/scan')}>
        <Text style={styles.buttonText}>Scan another batch</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbf5' },
  content: { padding: 20, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  band: { borderRadius: 16, padding: 16 },
  bandText: { color: '#111827', fontWeight: '700', fontSize: 16 },
  bandColor: { color: '#111827', opacity: 0.7 },
  code: { fontSize: 28, fontWeight: '800', color: '#111827' },
  item: { fontSize: 18, color: '#374151' },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: '#6b7280' },
  rowValue: { color: '#111827', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  error: { color: '#b91c1c', fontSize: 16, textAlign: 'center' },
  button: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
