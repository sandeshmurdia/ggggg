import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useApp } from '../context/AppContext';
import { HomeStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ProductDetail'>;
  route: RouteProp<HomeStackParamList, 'ProductDetail'>;
};

export function ProductDetailScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigation.getParent()?.navigate('CartTab');
  };

  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPercent =
    hasDiscount && product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {hasDiscount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{discountPercent}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice != null && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>★ {product.rating}</Text>
          <Text style={styles.reviews}>{product.reviewCount} reviews</Text>
        </View>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable onPress={() => setQuantity((q) => q + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <PrimaryButton
          title="Add to Cart"
          onPress={handleAddToCart}
          disabled={!product.inStock}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.border,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  content: { padding: spacing.lg },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  price: { fontSize: 24, fontWeight: '800', color: colors.primary },
  originalPrice: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rating: { fontSize: 14, color: colors.warning, fontWeight: '600' },
  reviews: { fontSize: 14, color: colors.textSecondary, marginLeft: 4 },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  quantityRow: { marginBottom: spacing.lg },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityValue: { fontSize: 18, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: '700', color: colors.primary },
});
