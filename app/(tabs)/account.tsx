import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { showAlert } from '@/lib/alert';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { exportTransactionsCsv } from '@/lib/exportCsv';

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // handled by auth state listener
    }
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      showAlert('ไม่มีข้อมูล', 'ยังไม่มีรายการที่จะ export');
      return;
    }
    try {
      const labelMap = new Map(categories.map((c) => [c.key, c.label]));
      await exportTransactionsCsv(transactions, labelMap);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      showAlert('Export ไม่สำเร็จ', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.email?.split('@')[0] ?? 'ผู้ใช้'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูล</Text>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
              <Text style={styles.menuIcon}>📤</Text>
              <Text style={styles.menuLabel}>Export ข้อมูล (CSV)</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>แอพ</Text>
          <View style={styles.menu}>
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>💱</Text>
              <Text style={styles.menuLabel}>สกุลเงิน</Text>
              <Text style={styles.menuValue}>THB (฿)</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuIcon}>🌙</Text>
              <Text style={styles.menuLabel}>ธีม</Text>
              <Text style={styles.menuValue}>Dark</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Krop v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 36 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  menu: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text },
  menuValue: { fontSize: 13, color: colors.textMuted },
  menuArrow: { color: colors.textMuted, fontSize: 16 },
  logoutBtn: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: { color: colors.expense, fontSize: 15, fontWeight: '600' },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 20,
  },
});
