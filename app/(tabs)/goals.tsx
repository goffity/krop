import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { showAlert } from '@/lib/alert';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { SavingsGoalCard } from '@/components/SavingsGoalCard';

const GOAL_ICONS = ['🎯', '📱', '✈️', '🏦', '🏠', '🚗', '💍', '🎓', '💻', '🎮'];
const GOAL_COLORS = ['#6c5ce7', '#0984e3', '#00b894', '#fdcb6e', '#e17055', '#fd79a8', '#a29bfe'];

export default function GoalsScreen() {
  const { goals, isLoading, create, addSavings, remove, isCreating, isAdding } = useSavingsGoals();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#6c5ce7');

  const handleCreate = async () => {
    if (!name.trim()) {
      showAlert('กรุณากรอกชื่อเป้าหมาย');
      return;
    }
    if (!target || Number(target) <= 0) {
      showAlert('กรุณากรอกจำนวนเป้าหมาย');
      return;
    }
    try {
      await create({ name: name.trim(), target: Number(target), icon: selectedIcon, color: selectedColor });
      setShowModal(false);
      setName('');
      setTarget('');
      setSelectedIcon('🎯');
      setSelectedColor('#6c5ce7');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      showAlert('สร้างเป้าหมายไม่สำเร็จ', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>เป้าหมายการออม</Text>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text style={styles.addBtn}>+ สร้างใหม่</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>ยังไม่มีเป้าหมาย</Text>
            <Text style={styles.emptySubtext}>กด "+ สร้างใหม่" เพื่อตั้งเป้าหมายแรก</Text>
          </View>
        ) : (
          goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onAddSavings={addSavings}
              onDelete={remove}
              isAdding={isAdding}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>สร้างเป้าหมายใหม่</Text>

            <Text style={styles.label}>ชื่อเป้าหมาย</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="เช่น iPhone, ทริปญี่ปุ่น, เงินสำรอง"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>จำนวนเป้าหมาย (฿)</Text>
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={(t) => setTarget(t.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              inputMode="decimal"
              placeholder="เช่น 50000"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>ไอคอน</Text>
            <View style={styles.iconGrid}>
              {GOAL_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconBtn, selectedIcon === icon && styles.iconBtnActive]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconBtnText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>สี</Text>
            <View style={styles.colorGrid}>
              {GOAL_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorBtn, { backgroundColor: c }, selectedColor === c && styles.colorBtnActive]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                <Text style={styles.saveBtnText}>
                  {isCreating ? 'กำลังสร้าง...' : 'สร้างเป้าหมาย'}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  addBtn: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
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
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 8, marginTop: 12 },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(108,92,231,0.15)' },
  iconBtnText: { fontSize: 22 },
  colorGrid: { flexDirection: 'row', gap: 10 },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnActive: { borderColor: '#fff' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
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
