import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

interface BarData {
  label: string;
  income: number;
  expense: number;
}

interface Props {
  data: BarData[];
}

const SHORT_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export function getShortMonth(month: string): string {
  const m = parseInt(month.split('-')[1], 10);
  return SHORT_MONTHS[m - 1] ?? month;
}

export function BarChart({ data }: Props) {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const barMaxHeight = 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายรับ vs รายจ่าย (6 เดือน)</Text>

      <View style={styles.barsRow}>
        {data.map((item, i) => {
          const incomeH = (item.income / maxValue) * barMaxHeight;
          const expenseH = (item.expense / maxValue) * barMaxHeight;
          return (
            <View key={i} style={styles.barGroup}>
              <View style={styles.barPair}>
                <View style={[styles.bar, styles.incomeBar, { height: Math.max(incomeH, 2) }]} />
                <View style={[styles.bar, styles.expenseBar, { height: Math.max(expenseH, 2) }]} />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>รายรับ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>รายจ่าย</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  title: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 16 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  barGroup: { alignItems: 'center', gap: 6 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  bar: { width: 14, borderRadius: 4 },
  incomeBar: { backgroundColor: colors.income },
  expenseBar: { backgroundColor: colors.expense },
  barLabel: { fontSize: 10, color: colors.textSecondary },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.textSecondary },
});
