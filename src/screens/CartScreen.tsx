import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { CartStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<CartStackParamList, 'Cart'>;
};

export function CartScreen({ navigation }: Props) {
  const { cart, updateQuantity, removeFromCart } = useApp();
  const [errorMessage, setErrorMessage] = useState('');
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleProceedToCheckout = () => {
    try {
      // NOTE: Some product payloads (mock/local) don't include fulfillment/store data.
      // We should not block checkout or throw if this optional metadata is missing.
      const firstItem = cart[0];
      if (!firstItem) {
        setErrorMessage('Your cart is empty. Please add items before checking out.');
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            'Your cart is empty. Please add items before checking out.',
            ToastAndroid.SHORT
          );
        }
        return;
      }

      const storeName = (firstItem.product as { fulfillment?: { store?: { name?: string } } })
        .fulfillment?.store?.name;
      if (storeName) {
        console.log('Preparing checkout for store', storeName);
      } else {
        // Keep logging minimal and non-sensitive: only product id for correlation.
        console.warn('Preparing checkout without store context', { productId: firstItem.product.id });
      }
      navigation.navigate('Checkout');
    } catch (error) {
      // Surface the handled checkout exception to the user as a toast on Android,
      // while still keeping the console error for debugging/monitoring tools.
      console.error(error);
      setErrorMessage('Checkout validation failed. Please try again.');
      if (Platform.OS === 'android') {
        ToastAndroid.show('Checkout validation failed. Please try again.', ToastAndroid.SHORT);
      }
    }


  };

  if (cart.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from Home or Categories</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {cart.map((item) => (
        <View key={item.product.id} style={styles.item}>
          <Image source={{ uri: item.product.image }} style={styles.thumb} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text style={styles.itemPrice}>${item.product.price.toFixed(2)}</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <Pressable
                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            onPress={() => removeFromCart(item.product.id)}
            style={styles.removeBtn}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ))}
      <View style={styles.totals}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax (8%)</Text>
          <Text style={styles.totalsValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalsRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <PrimaryButton
        title="Proceed to Checkout"
        onPress={handleProceedToCheckout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: colors.border },
  itemInfo: { flex: 1, marginLeft: spacing.sm },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, fontWeight: '600', color: colors.text },
  qtyValue: { fontSize: 14, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  removeBtn: { padding: spacing.sm },
  removeText: { fontSize: 12, color: colors.error, fontWeight: '600' },
  totals: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalsLabel: { fontSize: 14, color: colors.textSecondary },
  totalsValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  totalRow: { marginTop: 8, marginBottom: 0, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 18, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  errorText: { fontSize: 14, color: colors.error, marginBottom: spacing.md },
});
