import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { useAuth } from '@/hooks/useAuth';

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // handled by auth state listener
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.email ?? 'ผู้ใช้'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>หน้าบัญชีจะมาเร็วๆ นี้</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: { alignItems: 'center', paddingVertical: 20 },
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
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  placeholderText: { color: colors.textMuted, fontSize: 14 },
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
});
