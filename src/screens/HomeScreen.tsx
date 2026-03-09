import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductCard } from '../components/ProductCard';
import { categories } from '../data/categories';
import { getFeaturedProducts } from '../data/products';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { HomeStackParamList } from '../navigation/types';
import { Product } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const featured = getFeaturedProducts();

  const openPDP = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const openCategory = (categoryId: string, categoryName: string) => {
    navigation.navigate('Category', { categoryId, categoryName });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Discover</Text>
        <Text style={styles.heroSubtitle}>Find your next favorite</Text>
      </View>

      <Text style={styles.sectionTitle}>Shop by category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => openCategory(cat.id, cat.name)}
            style={styles.categoryCard}
          >
            <Image source={{ uri: cat.image }} style={styles.categoryImage} />
            <Text style={styles.categoryName}>{cat.name}</Text>
            <Text style={styles.categoryCount}>{cat.productCount} items</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured products</Text>
        <View style={styles.grid}>
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => openPDP(product)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: spacing.lg + 8,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  categoryCard: {
    width: 140,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: 90,
    backgroundColor: colors.border,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    padding: spacing.sm,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  section: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
