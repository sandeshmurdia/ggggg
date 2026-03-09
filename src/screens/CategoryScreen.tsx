import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProductCard } from '../components/ProductCard';
import { getProductsByCategory } from '../data/products';
import { HomeStackParamList } from '../navigation/types';
import { Product } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Category'>;
  route: RouteProp<HomeStackParamList, 'Category'>;
};

export function CategoryScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const products = getProductsByCategory(categoryId);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.cardWrap}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  cardWrap: { width: '47%' },
});
