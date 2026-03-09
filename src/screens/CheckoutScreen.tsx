import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../components/Input';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { CartStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<CartStackParamList, 'Checkout'>;
};

export function CheckoutScreen({ navigation }: Props) {
  const { cart, clearCart } = useApp();
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    setError('');
    if (!line1.trim()) {
      setError('Please enter address');
      return;
    }
    if (!city.trim()) {
      setError('Please enter city');
      return;
    }
    if (!state.trim()) {
      setError('Please enter state');
      return;
    }
    if (!zip.trim()) {
      setError('Please enter ZIP code');
      return;
    }
    clearCart();
    navigation.replace('OrderConfirm');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Shipping address</Text>
      <Input
        label="Address line 1"
        value={line1}
        onChangeText={setLine1}
        placeholder="Street address"
      />
      <Input
        label="Address line 2 (optional)"
        value={line2}
        onChangeText={setLine2}
        placeholder="Apt, suite, etc."
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <Input
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="City"
          />
        </View>
        <View style={styles.half}>
          <Input
            label="State"
            value={state}
            onChangeText={setState}
            placeholder="State"
          />
        </View>
      </View>
      <Input
        label="ZIP code"
        value={zip}
        onChangeText={setZip}
        placeholder="ZIP"
        keyboardType="numeric"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Order summary</Text>
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <PrimaryButton title="Place Order" onPress={handlePlaceOrder} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  error: { color: colors.error, fontSize: 14, marginBottom: spacing.sm },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
});
