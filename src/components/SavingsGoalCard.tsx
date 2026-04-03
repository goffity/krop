import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/lib/theme';
import { showAlert, showConfirm } from '@/lib/alert';
import type { SavingsGoal } from '@/types';

interface Props {
  goal: SavingsGoal;
  onAddSavings: (input: { id: string; amount: number }) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  isAdding: boolean;
}

function estimateMonths(current: number, target: number, monthlyAvg: number): string {
  if (current >= target) return 'ถึงเป้าแล้ว!';
  if (monthlyAvg <= 0) return 'ยังไม่มีข้อมูล';
  const remaining = target - current;
  const months = Math.ceil(remaining / monthlyAvg);
  return `ถึงเป้าอีกประมาณ ${months} เดือน`;
}

export function SavingsGoalCard({ goal, onAddSavings, onDelete, isAdding }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const current = Number(goal.current);
  const target = Number(goal.target);
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const goalColor = goal.color ?? colors.primary;
  // Rough estimate: assume average monthly saving = current / months since creation
  const createdAt = new Date(goal.created_at);
  const monthsSinceCreation = Math.max(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
    1
  );
  const monthlyAvg = current / monthsSinceCreation;

  const handleAdd = async () => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) {
      showAlert('กรุณากรอกจำนวนเงิน');
      return;
    }
    try {
      await onAddSavings({ id: goal.id, amount });
      setAddAmount('');
      setShowAddForm(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      showAlert('เพิ่มเงินไม่สำเร็จ', msg);
    }
  };

  const handleDelete = () => {
    showConfirm('ลบเป้าหมาย', `ต้องการลบ "${goal.name}" หรือไม่?`, async () => {
      try {
        await onDelete(goal.id);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
        showAlert('ลบไม่สำเร็จ', msg);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBorder, { backgroundColor: goalColor }]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: goalColor + '22' }]}>
          <Text style={styles.iconText}>{goal.icon ?? '🎯'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.eta}>{estimateMonths(current, target, monthlyAvg)}</Text>
        </View>
        <Text style={[styles.pct, { color: goalColor }]}>{Math.round(pct)}%</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: goalColor }]} />
      </View>

      {/* Amounts */}
      <View style={styles.amounts}>
        <Text style={[styles.current, { color: goalColor }]}>฿{current.toLocaleString()}</Text>
        <Text style={styles.target}>/ ฿{target.toLocaleString()}</Text>
      </View>

      {/* Add Savings */}
      {showAddForm ? (
        <View style={styles.addForm}>
          <TextInput
            style={styles.addInput}
            value={addAmount}
            onChangeText={(t) => setAddAmount(t.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            inputMode="decimal"
            placeholder="จำนวนเงิน"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.addConfirmBtn, isAdding && { opacity: 0.6 }]}
            onPress={handleAdd}
            disabled={isAdding}
          >
            <Text style={styles.addConfirmText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCancelBtn} onPress={() => setShowAddForm(false)}>
            <Text style={styles.addCancelText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(true)}>
            <Text style={styles.addBtnText}>+ เพิ่มเงินออม</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  topBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 22 },
  headerInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  eta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  pct: { fontSize: 13, fontWeight: '600' },
  progressBg: {
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: { height: 10, borderRadius: 5 },
  amounts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  current: { fontSize: 18, fontWeight: '700' },
  target: { fontSize: 14, color: colors.textMuted },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  addBtn: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: colors.primaryLight, fontSize: 14 },
  deleteBtn: { fontSize: 18, padding: 8 },
  addForm: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
  addConfirmBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.income,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addConfirmText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  addCancelBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCancelText: { color: colors.textMuted, fontSize: 16 },
});
