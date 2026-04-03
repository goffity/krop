import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

interface Props {
  category: string;
  icon: string;
  budgetAmount: number;
  spentAmount: number;
}

export function BudgetProgressBar({ category, icon, budgetAmount, spentAmount }: Props) {
  const pct = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
  const remaining = budgetAmount - spentAmount;

  const barColor =
    pct >= 90 ? colors.expense :
    pct >= 70 ? colors.warning :
    colors.income;

  const pctColor =
    pct >= 90 ? colors.expense :
    pct >= 70 ? colors.warning :
    colors.income;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.catInfo}>
          <View style={[styles.iconBox, { backgroundColor: barColor + '22' }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <Text style={styles.catName}>{category}</Text>
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.spent, { color: barColor }]}>
            ฿{spentAmount.toLocaleString()}
          </Text>
          <Text style={styles.limit}>จาก ฿{budgetAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>

      <Text style={[styles.pctText, { color: pctColor }]}>
        {Math.round(pct)}% ใช้ไปแล้ว
      </Text>

      {pct >= 90 && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ ใช้เกิน 90% ของงบแล้ว! เหลืออีก ฿{Math.max(remaining, 0).toLocaleString()}
          </Text>
        </View>
      )}
      {pct >= 70 && pct < 90 && (
        <View style={[styles.warning, styles.warningYellow]}>
          <Text style={[styles.warningText, { color: colors.warning }]}>
            ⚠️ ใช้เกิน 70% ของงบแล้ว เหลืออีก ฿{Math.max(remaining, 0).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 18 },
  catName: { fontSize: 14, fontWeight: '600', color: colors.text },
  amounts: { alignItems: 'flex-end' },
  spent: { fontSize: 14, fontWeight: '600' },
  limit: { fontSize: 11, color: colors.textMuted },
  barBg: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  pctText: { fontSize: 11, marginTop: 4 },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  warningYellow: {
    backgroundColor: 'rgba(254,202,87,0.1)',
    borderColor: 'rgba(254,202,87,0.2)',
  },
  warningText: { fontSize: 12, color: colors.expense },
});
