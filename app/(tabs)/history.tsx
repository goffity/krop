import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { TransactionCard } from '@/components/TransactionCard';

const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function getMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const { selectedMonth, setSelectedMonth } = useFinanceStore();
  const { transactions, isLoading, refetch, remove } = useTransactions(selectedMonth);
  const { categories } = useCategories();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = transactions;
    if (filterCategory) {
      result = result.filter((t) => t.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.note?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactions, filterCategory, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const existing = groups.get(tx.date) ?? [];
      existing.push(tx);
      groups.set(tx.date, existing);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>ประวัติรายการ</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="ค้นหารายการ..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
            onPress={() => setFilterCategory(null)}
          >
            <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>
              ทั้งหมด
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, filterCategory === cat.key && styles.filterChipActive]}
              onPress={() => setFilterCategory(filterCategory === cat.key ? null : cat.key)}
            >
              <Text style={[styles.filterChipText, filterCategory === cat.key && styles.filterChipTextActive]}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthLabel(selectedMonth)}</Text>
          <TouchableOpacity onPress={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        {grouped.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ไม่พบรายการ</Text>
          </View>
        ) : (
          grouped.map(([date, txs]) => (
            <View key={date}>
              <Text style={styles.dateGroup}>{date}</Text>
              {txs.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  categories={categories}
                  onDelete={remove}
                />
              ))}
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    marginVertical: 12,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  filterRow: { marginBottom: 12 },
  filterChip: {
    height: 32,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    justifyContent: 'center',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderColor: colors.primary,
  },
  filterChipText: { fontSize: 12, color: colors.textMuted },
  filterChipTextActive: { color: colors.primaryLight },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  arrow: { color: colors.primary, fontSize: 20, fontWeight: '300', paddingHorizontal: 8 },
  monthText: { fontSize: 14, fontWeight: '600', color: colors.text },
  dateGroup: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
