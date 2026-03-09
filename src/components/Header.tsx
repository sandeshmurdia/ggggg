import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ title, right, onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  left: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  backBtn: { alignSelf: 'flex-start' },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  right: {},
});
