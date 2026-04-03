import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/lib/theme';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthSummary } from '@/hooks/useMonthSummary';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryBreakdown } from '@/hooks/useCategoryBreakdown';
import { useMonthlyComparison } from '@/hooks/useMonthlyComparison';
import { useSpendingInsights } from '@/hooks/useSpendingInsights';
import { TransactionCard } from '@/components/TransactionCard';
import { DonutChart } from '@/components/DonutChart';
import { BarChart } from '@/components/BarChart';

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

function formatAmount(n: number): string {
  return `฿${n.toLocaleString()}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { selectedMonth, setSelectedMonth } = useFinanceStore();
  const { data: summary } = useMonthSummary(selectedMonth);
  const { transactions, isLoading, refetch, remove } = useTransactions(selectedMonth);
  const { categories } = useCategories();
  const categoryBreakdown = useCategoryBreakdown(transactions, categories);
  const { data: monthlyData } = useMonthlyComparison(selectedMonth);
  const { data: insights } = useSpendingInsights(selectedMonth);

  const recentTransactions = transactions.slice(0, 5);
  const totalExpense = summary?.expense ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Header */}
        <Text style={styles.greeting}>สวัสดี 👋</Text>
        <Text style={styles.name}>Dashboard</Text>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.arrow}
            onPress={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthLabel(selectedMonth)}</Text>
          <TouchableOpacity
            style={styles.arrow}
            onPress={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>รายรับ</Text>
            <Text style={[styles.summaryAmount, styles.income]}>
              {formatAmount(summary?.income ?? 0)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>รายจ่าย</Text>
            <Text style={[styles.summaryAmount, styles.expense]}>
              {formatAmount(summary?.expense ?? 0)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>คงเหลือ</Text>
            <Text style={[styles.summaryAmount, styles.balance]}>
              {formatAmount(summary?.balance ?? 0)}
            </Text>
          </View>
        </View>

        {/* Donut Chart */}
        {categoryBreakdown.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>สัดส่วนรายจ่าย</Text>
            </View>
            <DonutChart data={categoryBreakdown} total={totalExpense} />
          </>
        )}

        {/* Bar Chart */}
        {monthlyData && monthlyData.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <BarChart data={monthlyData} />
          </View>
        )}

        {/* Spending Insights */}
        {insights && insights.length > 0 && (
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>วิเคราะห์การใช้เงิน</Text>
            {insights.map((insight, i) => (
              <View key={i} style={styles.insightItem}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={styles.insightText}>{insight.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.sectionLink}>ดูทั้งหมด ›</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ยังไม่มีรายการ</Text>
            <Text style={styles.emptySubtext}>กด + เพื่อเพิ่มรายการแรก</Text>
          </View>
        ) : (
          recentTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              categories={categories}
              onDelete={remove}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-transaction')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 20 },
  greeting: { fontSize: 15, color: colors.textSecondary, marginTop: 8 },
  name: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  arrow: {
    width: 32,
    height: 32,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { color: colors.primary, fontSize: 18, fontWeight: '300' },
  monthText: { fontSize: 16, fontWeight: '600', color: colors.text },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  summaryAmount: { fontSize: 16, fontWeight: '700' },
  income: { color: colors.income },
  expense: { color: colors.expense },
  balance: { color: colors.primary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionLink: { fontSize: 13, color: colors.primary },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300' },
  insightsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  insightIcon: { fontSize: 18 },
  insightText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
});
