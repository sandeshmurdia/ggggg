import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { ProfileStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

export function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useApp();

  const handleSignOut = () => {
    signOut();
    // RootNavigator will show Auth stack when user becomes null
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
        <Text style={styles.email}>{user?.email ?? 'Not signed in'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.menu}>
        <Text style={styles.menuItem}>Orders</Text>
        <Text style={styles.menuItem}>Addresses</Text>
        <Text style={styles.menuItem}>Payment methods</Text>
        <Text style={styles.menuItem}>Notifications</Text>
      </View>

      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.menu}>
        <Text style={styles.menuItem}>Help center</Text>
        <Text style={styles.menuItem}>Contact us</Text>
      </View>

      <PrimaryButton
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    fontSize: 16,
    color: colors.text,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
