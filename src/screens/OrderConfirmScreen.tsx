import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { CartStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<CartStackParamList, 'OrderConfirm'>;
};

export function OrderConfirmScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>✓</Text>
      </View>
      <Text style={styles.title}>Order placed!</Text>
      <Text style={styles.subtitle}>
        Thank you for your order. You will receive a confirmation email shortly.
      </Text>
      <PrimaryButton
        title="Continue Shopping"
        onPress={() => navigation.getParent()?.navigate('HomeTab')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 40, color: colors.white, fontWeight: '800' },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
