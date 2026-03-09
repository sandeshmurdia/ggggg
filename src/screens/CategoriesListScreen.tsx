import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { categories } from '../data/categories';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { CategoriesStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<CategoriesStackParamList, 'CategoriesList'>;
};

export function CategoriesListScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Categories</Text>
      {categories.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() =>
            navigation.navigate('Category', {
              categoryId: cat.id,
              categoryName: cat.name,
            })
          }
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Image source={{ uri: cat.image }} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <Text style={styles.count}>{cat.productCount} products</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  image: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
  },
  cardContent: { flex: 1, padding: spacing.md },
  categoryName: { fontSize: 16, fontWeight: '700', color: colors.text },
  count: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textSecondary, paddingRight: spacing.md },
});
