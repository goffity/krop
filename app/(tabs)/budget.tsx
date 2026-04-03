import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { showAlert, showConfirm } from '@/lib/alert';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { BudgetProgressBar } from '@/components/BudgetProgressBar';

export default function BudgetScreen() {
  const { selectedMonth } = useFinanceStore();
  const { budgets, isLoading, upsert, remove, isUpserting } = useBudgets(selectedMonth);
  const { transactions } = useTransactions(selectedMonth);
  const { categories } = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Calculate spent per category
  const spentByCategory = new Map<string, number>();
  for (const tx of transactions.filter((t) => t.type === 'expense')) {
    spentByCategory.set(tx.category, (spentByCategory.get(tx.category) ?? 0) + Number(tx.amount));
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (spentByCategory.get(b.category) ?? 0), 0);

  const handleSaveBudget = async () => {
    if (!selectedCategory) {
      showAlert('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!budgetAmount || Number(budgetAmount) <= 0) {
      showAlert('กรุณากรอกจำนวนงบ');
      return;
    }
    try {
      await upsert({ category: selectedCategory, amount: Number(budgetAmount), month: selectedMonth });
      setShowModal(false);
      setSelectedCategory('');
      setBudgetAmount('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      showAlert('บันทึกไม่สำเร็จ', msg);
    }
  };

  // When editing, show selected category; when adding new, show only unbudgeted ones
  const budgetedKeys = new Set(budgets.map((b) => b.category));
  const availableCategories = selectedCategory
    ? categories
    : categories.filter((c) => !budgetedKeys.has(c.key));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { /* refetch handled by React Query */ }} tintColor={colors.primary} />}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>งบประมาณเดือนนี้</Text>
          <Text style={styles.headerTotal}>฿{totalBudget.toLocaleString()}</Text>
          <Text style={styles.headerRemaining}>
            ใช้ไป ฿{totalSpent.toLocaleString()} · เหลือ ฿{Math.max(totalBudget - totalSpent, 0).toLocaleString()}
          </Text>
        </View>

        {/* Budget List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>งบแต่ละหมวด</Text>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text style={styles.addBtn}>+ ตั้งงบ</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ยังไม่ได้ตั้งงบประมาณ</Text>
            <Text style={styles.emptySubtext}>กด "+ ตั้งงบ" เพื่อเริ่มต้น</Text>
          </View>
        ) : (
          budgets.map((budget) => {
            const cat = categories.find((c) => c.key === budget.category);
            return (
              <TouchableOpacity
                key={budget.id}
                onPress={() => {
                  setSelectedCategory(budget.category);
                  setBudgetAmount(String(budget.amount));
                  setShowModal(true);
                }}
                onLongPress={() => {
                  showConfirm('ลบงบประมาณ', `ลบงบ "${cat?.label ?? budget.category}" หรือไม่?`, () => {
                    remove(budget.id);
                  });
                }}
              >
                <BudgetProgressBar
                  category={cat?.label ?? budget.category}
                  icon={cat?.icon ?? '📂'}
                  budgetAmount={Number(budget.amount)}
                  spentAmount={spentByCategory.get(budget.category) ?? 0}
                />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ตั้งงบประมาณ</Text>

            <Text style={styles.label}>หมวดหมู่</Text>
            <View style={styles.catGrid}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Text style={styles.catChipText}>{cat.icon} {cat.label}</Text>
                </TouchableOpacity>
              ))}
              {availableCategories.length === 0 && (
                <Text style={styles.noCats}>ตั้งงบครบทุกหมวดแล้ว</Text>
              )}
            </View>

            <Text style={styles.label}>จำนวนงบ (฿)</Text>
            <TextInput
              style={styles.input}
              value={budgetAmount}
              onChangeText={(t) => setBudgetAmount(t.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              inputMode="decimal"
              placeholder="เช่น 10000"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowModal(false); setSelectedCategory(''); setBudgetAmount(''); }}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isUpserting && { opacity: 0.6 }]}
                onPress={handleSaveBudget}
                disabled={isUpserting}
              >
                <Text style={styles.saveBtnText}>
                  {isUpserting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 20 },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 12,
    alignItems: 'center',
  },
  headerLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  headerTotal: { fontSize: 32, fontWeight: '800', color: '#fff', marginVertical: 8 },
  headerRemaining: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  addBtn: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: {
    height: 36,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    justifyContent: 'center',
  },
  catChipActive: {
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderColor: colors.primary,
  },
  catChipText: { fontSize: 13, color: colors.textSecondary },
  noCats: { color: colors.textMuted, fontSize: 13 },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
