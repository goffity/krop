import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/lib/theme';
import { showConfirm } from '@/lib/alert';
import type { Transaction, Category } from '@/types';

interface Props {
  transaction: Transaction;
  categories: Category[];
  onDelete?: (id: string) => void;
}

export function TransactionCard({ transaction, categories, onDelete }: Props) {
  const category = categories.find((c) => c.key === transaction.category);
  const isExpense = transaction.type === 'expense';

  const handleLongPress = () => {
    if (!onDelete) return;
    showConfirm('ลบรายการ', 'ต้องการลบรายการนี้หรือไม่?', () => {
      onDelete(transaction.id);
    });
  };

  const formattedAmount = `${isExpense ? '-' : '+'}฿${Number(transaction.amount).toLocaleString()}`;

  return (
    <TouchableOpacity style={styles.container} onLongPress={handleLongPress}>
      <View style={[styles.icon, { backgroundColor: (category?.color ?? '#8888aa') + '22' }]}>
        <Text style={styles.iconText}>{category?.icon ?? '📂'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{category?.label ?? transaction.category}</Text>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
          {formattedAmount}
        </Text>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  info: { flex: 1 },
  category: { fontSize: 14, fontWeight: '600', color: colors.text },
  note: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  expense: { color: colors.expense },
  income: { color: colors.income },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
