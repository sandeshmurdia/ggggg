import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {hasDiscount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.originalPrice != null && (
          <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
        )}
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.rating}>★ {product.rating}</Text>
        <Text style={styles.reviews}>({product.reviewCount})</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    width: '47%',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  imageWrap: {
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: 4,
    gap: spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: 2,
  },
  rating: { fontSize: 12, color: colors.warning, fontWeight: '600' },
  reviews: { fontSize: 12, color: colors.textSecondary, marginLeft: 2 },
});
