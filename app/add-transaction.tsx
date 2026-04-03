import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/lib/theme';
import { showAlert } from '@/lib/alert';
import { suggestCategory } from '@/lib/categorizer';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import type { TransactionType } from '@/types';

export default function AddTransactionScreen() {
  const router = useRouter();
  const { create, isCreating } = useTransactions();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    setAmount(cleaned);
  };
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Auto-suggest category from note
  useEffect(() => {
    if (!note || selectedCategory) return;
    const suggested = suggestCategory(note);
    setSuggestion(suggested);
  }, [note, selectedCategory]);

  const applySuggestion = () => {
    if (suggestion) {
      setSelectedCategory(suggestion);
      setSuggestion(null);
    }
  };

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      showAlert('กรุณากรอกจำนวนเงิน');
      return;
    }
    if (!selectedCategory) {
      showAlert('กรุณาเลือกหมวดหมู่');
      return;
    }

    try {
      await create({
        type,
        amount: Number(amount),
        category: selectedCategory,
        note: note || undefined,
        date,
      });
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      showAlert('บันทึกไม่สำเร็จ', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backBtn}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>เพิ่มรายการ</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextExpense]}>
                รายจ่าย
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextIncome]}>
                รายรับ
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>฿</Text>
            <TextInput
              style={[styles.amountInput, type === 'expense' ? styles.amountExpense : styles.amountIncome]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              inputMode="decimal"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>หมวดหมู่</Text>
            {categoriesLoading ? (
              <Text style={styles.loadingText}>กำลังโหลดหมวดหมู่...</Text>
            ) : categories.length === 0 ? (
              <Text style={styles.loadingText}>ไม่พบหมวดหมู่ กรุณารีเฟรชหน้า</Text>
            ) : (
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <Text style={styles.catChipText}>
                      {cat.icon} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={styles.label}>วันที่</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Note */}
          <View style={styles.field}>
            <Text style={styles.label}>โน้ต</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="รายละเอียดเพิ่มเติม..."
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Auto-categorization suggestion */}
          {suggestion && !selectedCategory && (
            <TouchableOpacity style={styles.suggestion} onPress={applySuggestion}>
              <Text style={styles.suggestionText}>
                💡 แนะนำหมวด "{categories.find((c) => c.key === suggestion)?.label ?? suggestion}" จากโน้ต
              </Text>
            </TouchableOpacity>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, isCreating && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isCreating}
          >
            <Text style={styles.saveBtnText}>
              {isCreating ? 'กำลังบันทึก...' : 'บันทึก'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { fontSize: 28, color: colors.primary, fontWeight: '300' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBtnExpense: { backgroundColor: 'rgba(255,107,107,0.15)' },
  typeBtnIncome: { backgroundColor: 'rgba(0,184,148,0.15)' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  typeBtnTextExpense: { color: colors.expense },
  typeBtnTextIncome: { color: colors.income },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  currency: { fontSize: 24, color: colors.textMuted, marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '800', textAlign: 'center', minWidth: 100 },
  amountExpense: { color: colors.expense },
  amountIncome: { color: colors.income },
  field: { marginBottom: 20 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 14,
  },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  saveBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingText: { color: colors.textMuted, fontSize: 13, paddingVertical: 8 },
  suggestion: {
    backgroundColor: 'rgba(108,92,231,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: { fontSize: 12, color: colors.primaryLight },
});
